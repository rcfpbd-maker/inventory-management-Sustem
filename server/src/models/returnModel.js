import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class OrderReturn {
    static async create(data) {
        const { orderId, type, amount, reason, date } = data;
        const id = uuidv4();

        const query = `
      INSERT INTO returns_refunds (id, order_id, type, amount, reason, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(query, [id, orderId, type, amount, reason, date || new Date()]);

            // If it's a return, update order status and adjust stock
            if (type === 'SALE_RETURN' || type === 'PURCHASE_RETURN' || type === 'RETURN') {
                await connection.query(`UPDATE orders SET status = 'RETURNED' WHERE id = ?`, [orderId]);

                // Fetch items to adjust stock
                const [items] = await connection.query(`SELECT product_id, quantity FROM order_items WHERE order_id = ?`, [orderId]);

                for (const item of items) {
                    // SALE_RETURN or 'RETURN' (assumed sale): stock INCREASES
                    // PURCHASE_RETURN: stock DECREASES
                    const stockAdjustment = (type === 'PURCHASE_RETURN') ? -item.quantity : item.quantity;

                    await connection.query(
                        `UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?`,
                        [stockAdjustment, item.product_id]
                    );
                }
            }

            await connection.commit();
            return { id, ...data };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findAll() {
        const query = `
            SELECT rr.*, o.type as order_type, c.name as customer_name, s.name as supplier_name
            FROM returns_refunds rr
            JOIN orders o ON rr.order_id = o.id
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN suppliers s ON o.supplier_id = s.id
            ORDER BY rr.date DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    static async findByOrderId(orderId) {
        const query = `SELECT * FROM returns_refunds WHERE order_id = ? ORDER BY date DESC`;
        const [rows] = await pool.query(query, [orderId]);
        return rows;
    }
}
