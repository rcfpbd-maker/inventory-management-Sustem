import pool from "../config/db.js";

export class Settings {
    static async get() {
        const [rows] = await pool.query("SELECT * FROM settings WHERE id = 1");
        return rows[0] || null;
    }

    static async update(data) {
        const { shop_name, shop_address, shop_phone, shop_email, currency_symbol, footer_text } = data;

        // Check if settings already exist
        const existing = await this.get();

        if (existing) {
            const query = `
        UPDATE settings 
        SET shop_name = ?, shop_address = ?, shop_phone = ?, shop_email = ?, 
            currency_symbol = ?, footer_text = ?
        WHERE id = ?
      `;
            await pool.query(query, [
                shop_name, shop_address, shop_phone, shop_email,
                currency_symbol, footer_text, existing.id
            ]);
            return { ...existing, ...data };
        } else {
            const query = `
        INSERT INTO settings (shop_name, shop_address, shop_phone, shop_email, currency_symbol, footer_text)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
            const [result] = await pool.query(query, [
                shop_name, shop_address, shop_phone, shop_email,
                currency_symbol, footer_text
            ]);
            return { id: result.insertId, ...data };
        }
    }
}
