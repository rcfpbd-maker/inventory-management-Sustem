import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class Payment {
    static async create(paymentData) {
        const { orderId, amount, paymentMethod, paymentChannel, transactionId, status = 'COMPLETED', date } = paymentData;
        const finalAmount = Number(amount);
        const id = uuidv4();

        if (isNaN(finalAmount)) throw new Error("Invalid payment amount");

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Get Order Total and Current Total Paid
            const [orderRows] = await connection.query(`SELECT total_amount FROM orders WHERE id = ?`, [orderId]);
            if (orderRows.length === 0) throw new Error("Order not found");
            const totalAmount = parseFloat(orderRows[0].total_amount);

            const [payments] = await connection.query(`SELECT SUM(amount) as currentTotalPaid FROM payments WHERE order_id = ?`, [orderId]);
            const currentTotalPaid = parseFloat(payments[0].currentTotalPaid || 0);

            // 2. Validation: Paid amount <= order total
            if (currentTotalPaid + finalAmount > totalAmount + 0.01) { // Small buffer for decimals
                throw new Error(`Payment exceeds order total. Remaining: ${totalAmount - currentTotalPaid}`);
            }

            const query = `
        INSERT INTO payments (id, order_id, amount, payment_method, payment_channel, transaction_id, status, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
            await connection.query(query, [id, orderId, finalAmount, paymentMethod || 'Cash', paymentChannel || null, transactionId || null, status, date || new Date()]);

            // 3. Update Order payment status
            const totalPaid = currentTotalPaid + finalAmount;
            let paymentStatus = 'PARTIAL';
            if (totalPaid >= totalAmount - 0.01) {
                paymentStatus = 'PAID';
            } else if (totalPaid > 0) {
                paymentStatus = 'PARTIAL';
            } else {
                paymentStatus = 'UNPAID';
            }

            await connection.query(`UPDATE orders SET payment_status = ? WHERE id = ?`, [paymentStatus, orderId]);

            await connection.commit();
            return { id, ...paymentData };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findByOrderId(orderId) {
        const query = `SELECT * FROM payments WHERE order_id = ? ORDER BY date DESC`;
        const [rows] = await pool.query(query, [orderId]);
        return rows;
    }
}
