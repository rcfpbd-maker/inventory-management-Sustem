import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class Expense {
  static async create(data) {
    const {
      category,
      amount,
      vendor,
      notes,
      date,
      orderId = null,
      productCost = 0,
      packagingCost = 0,
      courierCost = 0,
      adCost = 0
    } = data;

    const id = uuidv4();
    const totalExpense = parseFloat(productCost) + parseFloat(packagingCost) + parseFloat(courierCost) + parseFloat(adCost) + parseFloat(amount || 0);

    const query = `
      INSERT INTO expenses (
        id, category, amount, vendor, notes, date, order_id, 
        product_cost, packaging_cost, courier_cost, ad_cost, total_expense
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      id,
      category,
      amount || totalExpense,
      vendor,
      notes,
      date || new Date(),
      orderId,
      productCost,
      packagingCost,
      courierCost,
      adCost,
      totalExpense
    ];

    await pool.query(query, values);
    return { id, ...data, totalExpense, date: values[2] };
  }

  static async findAll() {
    const query = `SELECT * FROM expenses ORDER BY date DESC`;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async delete(id) {
    const query = `DELETE FROM expenses WHERE id = ?`;
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }
}
