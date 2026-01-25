import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class OrderReturn {
    static async create(data) {
        const { orderId, type, amount, reason, date } = data;
        const id = uuidv4();

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Validation: Check order exists and amount is valid
            const [orders] = await connection.query(`SELECT total_amount FROM orders WHERE id = ?`, [orderId]);
            if (orders.length === 0) {
                throw new Error("Order not found");
            }
            const orderTotal = parseFloat(orders[0].total_amount);

            // Calculate total previously returned/refunded
            const [existingReturns] = await connection.query(`SELECT SUM(amount) as total FROM returns_refunds WHERE order_id = ?`, [orderId]);
            const previousTotal = parseFloat(existingReturns[0].total || 0);

            // Check if amount exceeds order total minus previous returns
            if ((previousTotal + parseFloat(amount)) > orderTotal) {
                throw new Error(`Refund amount exceeds remaining balance. Total: ${orderTotal}, Paid/Refunded: ${previousTotal}, Attempt: ${amount}`);
            }

            // Check if Order is already returned (to prevent double stock restoration)
            const [orderRows] = await connection.query(`SELECT status FROM orders WHERE id = ?`, [orderId]);
            if (orderRows[0].status === 'RETURNED' && type.includes('RETURN')) {
                throw new Error("Order is already fully returned. You can only process refunds.");
            }

            // Check if previously returned amount + current amount exceeds total (Optional but recommended, for now strict per-refunc)
            // For this iteration, we just check against total as per plan

            const query = `
              INSERT INTO returns_refunds (id, order_id, type, amount, reason, date)
              VALUES (?, ?, ?, ?, ?, ?)
            `;

            await connection.query(query, [id, orderId, type, amount, reason, date || new Date()]);

            // If it's a return (implies goods back), update order status and adjust stock
            // Types: SALE_RETURN, PURCHASE_RETURN. 
            // REFUND types (SALE_REFUND, PURCHASE_REFUND) do NOT restock.
            const isReturn = type.includes('RETURN');

            if (isReturn) {
                await connection.query(`UPDATE orders SET status = 'RETURNED' WHERE id = ?`, [orderId]);

                // Fetch items to adjust stock
                const [items] = await connection.query(`SELECT product_id, quantity FROM order_items WHERE order_id = ?`, [orderId]);

                for (const item of items) {
                    // SALE_RETURN: stock INCREASES (Customer gave back item)
                    // PURCHASE_RETURN: stock DECREASES (We gave back item to supplier)
                    const stockAdjustment = (type === 'PURCHASE_RETURN') ? -item.quantity : item.quantity;

                    await connection.query(
                        `UPDATE inventory SET quantity = quantity + ? WHERE product_id = ?`,
                        [stockAdjustment, item.product_id]
                    );
                }
            } else {
                // For REFUND only, we might just update status to something else or leave it?
                // Usually partial refund doesn't change main status to RETURNED unless fully refunded.
                // For now, let's just log the refund. If it's a full refund, maybe cancel?
                // Keeping status as is for Partial Refund, or maybe 'PARTIAL_REFUND'?
                // Requirement just said "Manage... status updates".
                // Let's safe-play and NOT change status to 'RETURNED' if it's just a money refund, 
                // to avoid confusion that items came back.
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
        return rows.map(row => ({
            ...row,
            amount: Number(row.amount)
        }));
    }

    static async findByOrderId(orderId) {
        const query = `SELECT * FROM returns_refunds WHERE order_id = ? ORDER BY date DESC`;
        const [rows] = await pool.query(query, [orderId]);
        return rows.map(row => ({
            ...row,
            amount: Number(row.amount)
        }));
    }
}
