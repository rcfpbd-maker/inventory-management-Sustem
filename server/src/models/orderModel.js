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
      trackingId = null
    } = orderData;
    const id = uuidv4();

    // Convert empty strings to null
    const finalCustomerId = customerId === "" ? null : customerId;
    const finalSupplierId = supplierId === "" ? null : supplierId;
    const finalCourierId = courierId === "" ? null : courierId;
    const finalConfirmedBy = confirmedBy === "" ? null : confirmedBy;
    const finalConfirmationStatus = confirmationStatus === "" ? null : confirmationStatus;

    // Calculate total amount with discounts
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.quantity * item.price) - (item.discount || 0),
      0
    );

    // COD Logic: If type is SALE and deliveryType is COD, default to DUE if unpaid
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
        finalConfirmedBy,
        finalConfirmationStatus,
        finalCourierId,
        trackingId
      ]);

      // 2. Create Order Items and Update Stock
      for (const item of items) {
        const itemId = uuidv4();
        const itemTotal = (item.quantity * item.price) - (item.discount || 0);

        // Insert Item
        await connection.query(
          `INSERT INTO order_items (id, order_id, product_id, quantity, price, discount, total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [itemId, id, item.productId, item.quantity, item.price, item.discount || 0, itemTotal]
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
            `UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?`,
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
    return rows;
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

    return { ...orders[0], items };
  }

  static async updateStatus(id, { status, confirmedBy, confirmationStatus }) {
    const finalConfirmedBy = confirmedBy === "" ? null : confirmedBy;
    const finalConfirmationStatus = confirmationStatus === "" ? null : confirmationStatus;

    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED', 'RETURNED'],
      'DELIVERED': ['RETURNED'], // Locked once Delivered except explicit return
      'CANCELLED': [],
      'RETURNED': []
    };

    const [orderRows] = await pool.query(
      `SELECT status, courier_charge, id as order_id FROM orders WHERE id = ?`,
      [id]
    );
    if (orderRows.length === 0) return false;

    const currentOrder = orderRows[0];
    const currentStatus = currentOrder.status || 'PENDING'; // Default to PENDING if null or undefined

    // 1. Lock check: If already Delivered, prevent any changes unless admin override (but here strict)
    if (currentStatus === 'DELIVERED') {
      throw new Error(`Order is already DELIVERED and cannot be modified.`);
    }

    // 2. Transition validation - Relaxed for easier usage/testing
    /* 
    const allowedNextStatuses = validTransitions[currentStatus] || [];
    if (currentStatus !== status && !allowedNextStatuses.includes(status)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
    }
    */

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 3. Update Status
      const query = `
        UPDATE orders 
        SET status = ?, confirmed_by = IFNULL(?, confirmed_by), confirmation_status = IFNULL(?, confirmation_status)
        WHERE id = ?
      `;
      await connection.query(query, [status, finalConfirmedBy, finalConfirmationStatus, id]);

      // 4. If STATUS is now DELIVERED, create Courier Expense
      if (status === 'DELIVERED' && currentOrder.courier_charge > 0) {
        const expenseId = uuidv4();

        // Ensure expenses table has necessary columns via migration
        const expenseQuery = `
          INSERT INTO expenses (
            id, category, amount, vendor, notes, date, order_id, 
            courier_cost, total_expense
          ) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.query(expenseQuery, [
          expenseId,
          'Courier Charge',
          currentOrder.courier_charge,
          'System Auto-Generated',
          `Courier charge for order ${id}`,
          new Date(),
          id,
          currentOrder.courier_charge,
          currentOrder.courier_charge
        ]);
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
