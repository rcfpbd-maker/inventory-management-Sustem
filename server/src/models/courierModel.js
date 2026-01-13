import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class Courier {
    static async create(data) {
        const { name, phone, email } = data;
        const id = uuidv4();
        const query = `INSERT INTO couriers (id, name, phone, email) VALUES (?, ?, ?, ?)`;
        await pool.query(query, [id, name, phone, email]);
        return { id, ...data };
    }

    static async findAll() {
        const query = `SELECT * FROM couriers ORDER BY name ASC`;
        const [rows] = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM couriers WHERE id = ?`;
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    }

    static async update(id, data) {
        const { name, phone, email } = data;
        const query = `UPDATE couriers SET name = ?, phone = ?, email = ? WHERE id = ?`;
        const [result] = await pool.query(query, [name, phone, email, id]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const query = `DELETE FROM couriers WHERE id = ?`;
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0;
    }
}
