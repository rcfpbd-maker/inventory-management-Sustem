import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class Order {
  static async create(orderData) {
    const {
      type,
      customerId,
      supplierId,
      items,
      platform = 'Direct',
      deliveryType = 'Standard',
      paymentStatus: initialPaymentStatus = 'UNPAID',
      confirmedBy = null,
      confirmationStatus = 'UNCONFIRMED',
      courierId = null,
      trackingId = null,
      courierCharge = 0
    } = orderData;

    // Convert empty strings to null for FK consistency
    const finalCustomerId = (customerId === "" || customerId === undefined) ? null : customerId;
    const finalSupplierId = (supplierId === "" || supplierId === undefined) ? null : supplierId;
    const finalCourierId = (courierId === "" || courierId === undefined) ? null : courierId;

    const id = uuidv4();

    console.log(`OrderModel: Creating order ${id}. CourierCharge: ${courierCharge}`);

    // Calculate total amount with items + courier charge
    const itemsTotal = items.reduce(
      (sum, item) => sum + (Number(item.quantity) * Number(item.price)) - (Number(item.discount) || 0),
      0
    );
    const totalAmount = itemsTotal + (Number(courierCharge) || 0);
    console.log(`OrderModel: Total Amount: ${totalAmount} (Items: ${itemsTotal}, Courier: ${courierCharge})`);

    // COD Logic: If type is SALE and deliveryType is COD (or similar), default to DUE if unpaid
    let paymentStatus = initialPaymentStatus;
    if (type === 'SALE' && (deliveryType === 'COD' || deliveryType === 'Cash on Delivery') && paymentStatus === 'UNPAID') {
      paymentStatus = 'DUE';
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Create Order
      const orderQuery = `
          INSERT INTO orders (
            id, type, customer_id, supplier_id, total_amount, 
            platform, delivery_type, payment_status, 
            confirmed_by, confirmation_status, courier_id, tracking_id
          ) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
      await connection.query(orderQuery, [
        id,
        type,
        finalCustomerId,
        finalSupplierId,
        totalAmount,
        platform,
        deliveryType,
        paymentStatus,
        confirmedBy,
        confirmationStatus,
        finalCourierId,
        trackingId
      ]);

      // 2. Create Order Items and Update Stock
      for (const item of items) {
        const itemId = uuidv4();
        const itemQuantity = Number(item.quantity);
        const itemPrice = Number(item.price);
        const itemDiscount = Number(item.discount) || 0;
        const itemTotal = (itemQuantity * itemPrice) - itemDiscount;

        // Insert Item
        await connection.query(
          `INSERT INTO order_items (id, order_id, product_id, quantity, price, discount, total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [itemId, id, item.productId, itemQuantity, itemPrice, itemDiscount, itemTotal]
        );

        // Update Product Stock
        let stockChange = 0;
        if (type === "SALE" || type === "PURCHASE_RETURN") {
          stockChange = -item.quantity;
        } else if (type === "PURCHASE" || type === "SALE_RETURN") {
          stockChange = item.quantity;
        }

        if (stockChange !== 0) {
          await connection.query(
            `UPDATE inventory SET quantity = quantity + ? WHERE product_id = ?`,
            [stockChange, item.productId]
          );
        }
      }

      await connection.commit();
      return { id, ...orderData, totalAmount, paymentStatus };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const query = `
      SELECT o.*, c.name as customer_name, s.name as supplier_name, cr.name as courier_name
      FROM orders o 
      LEFT JOIN customers c ON o.customer_id = c.id 
      LEFT JOIN suppliers s ON o.supplier_id = s.id 
      LEFT JOIN couriers cr ON o.courier_id = cr.id
      ORDER BY o.date DESC
    `;
    const [rows] = await pool.query(query);
    return rows.map(row => ({
      ...row,
      total_amount: Number(row.total_amount)
    }));
  }

  static async findById(id) {
    const orderQuery = `
          SELECT o.*, c.name as customer_name, s.name as supplier_name, cr.name as courier_name
          FROM orders o 
          LEFT JOIN customers c ON o.customer_id = c.id 
          LEFT JOIN suppliers s ON o.supplier_id = s.id 
          LEFT JOIN couriers cr ON o.courier_id = cr.id
          WHERE o.id = ?
       `;
    const itemsQuery = `
          SELECT oi.*, p.name as product_name 
          FROM order_items oi 
          JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = ?
       `;

    const [orders] = await pool.query(orderQuery, [id]);
    if (!orders.length) return null;

    const [items] = await pool.query(itemsQuery, [id]);

    return {
      ...orders[0],
      total_amount: Number(orders[0].total_amount),
      items: items.map(item => ({
        ...item,
        price: Number(item.price),
        discount: Number(item.discount),
        total: Number(item.total)
      }))
    };
  }

  static async updateStatus(id, { status, confirmedBy, confirmationStatus }) {
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'DELIVERED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED', 'RETURNED'],
      'DELIVERED': ['RETURNED'],
      'CANCELLED': [],
      'RETURNED': []
    };

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [orderRows] = await connection.query(`SELECT status, type FROM orders WHERE id = ?`, [id]);
      if (orderRows.length === 0) {
        await connection.rollback();
        return false;
      }

      const { status: currentStatus, type: orderType } = orderRows[0];
      const normalizedStatus = status.toUpperCase();

      // Allow same status or valid transition
      if (currentStatus !== normalizedStatus && (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(normalizedStatus))) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${normalizedStatus}`);
      }

      // 1. Update status
      const query = `
        UPDATE orders 
        SET status = ?, confirmed_by = IFNULL(?, confirmed_by), confirmation_status = IFNULL(?, confirmation_status)
        WHERE id = ?
      `;
      await connection.query(query, [normalizedStatus, confirmedBy, confirmationStatus, id]);

      // 2. Handle Stock Restoration on Cancellation
      if (status === 'CANCELLED' && currentStatus !== 'CANCELLED') {
        const [items] = await connection.query(
          `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
          [id]
        );

        for (const item of items) {
          let stockAdjustment = 0;
          // RESTORE logic is reverse of Order.create logic:
          // SALE/PURCHASE_RETURN decreased stock -> RESTORE increases
          // PURCHASE/SALE_RETURN increased stock -> RESTORE decreases
          if (orderType === "SALE" || orderType === "PURCHASE_RETURN") {
            stockAdjustment = item.quantity;
          } else if (orderType === "PURCHASE" || orderType === "SALE_RETURN") {
            stockAdjustment = -item.quantity;
          }

          if (stockAdjustment !== 0) {
            await connection.query(
              `UPDATE inventory SET quantity = quantity + ? WHERE product_id = ?`,
              [stockAdjustment, item.product_id]
            );
          }
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async assignCourier(id, { courierId, trackingId }) {
    const query = `
      UPDATE orders 
      SET courier_id = ?, tracking_id = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [courierId, trackingId, id]);
    return result.affectedRows > 0;
  }
}
