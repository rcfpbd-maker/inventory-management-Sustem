import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class Category {
  static async create(name, description = null, parentId = null) {
    const id = uuidv4();
    const query = `INSERT INTO categories (id, name, description, parent_id) VALUES (?, ?, ?, ?)`;
    await pool.query(query, [id, name, description, parentId]);
    return { id, name, description, parentId };
  }

  static async findAll() {
    const query = `
      SELECT c.*, p.name as parentName 
      FROM categories c 
      LEFT JOIN categories p ON c.parent_id = p.id 
      ORDER BY c.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM categories WHERE id = ?`;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, name, description = null, parentId = null) {
    const query = `UPDATE categories SET name = ?, description = ?, parent_id = ? WHERE id = ?`;
    await pool.query(query, [name, description, parentId, id]);
    return this.findById(id);
  }

  static async delete(id) {
    const query = `DELETE FROM categories WHERE id = ?`;
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }
}
