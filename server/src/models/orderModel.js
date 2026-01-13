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

    // Calculate total amount with discounts
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.quantity * item.price) - (item.discount || 0),
      0
    );

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
        customerId,
        supplierId,
        totalAmount,
        platform,
        deliveryType,
        paymentStatus,
        confirmedBy,
        confirmationStatus,
        courierId,
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
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED', 'RETURNED'],
      'DELIVERED': ['RETURNED'],
      'CANCELLED': [],
      'RETURNED': []
    };

    const [orderRows] = await pool.query(`SELECT status FROM orders WHERE id = ?`, [id]);
    if (orderRows.length === 0) return false;

    const currentStatus = orderRows[0].status;

    // Allow same status or valid transition
    if (currentStatus !== status && (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status))) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
    }

    const query = `
      UPDATE orders 
      SET status = ?, confirmed_by = IFNULL(?, confirmed_by), confirmation_status = IFNULL(?, confirmation_status)
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [status, confirmedBy, confirmationStatus, id]);
    return result.affectedRows > 0;
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
