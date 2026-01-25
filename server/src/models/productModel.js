import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class Product {
  static async create(productData) {
    const { name, categoryId, purchasePrice, salePrice, stockQuantity, minStock } =
      productData;
    const id = uuidv4();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Create Product
      const query = `
        INSERT INTO products (id, name, category_id, purchase_price, sale_price, minimum_stock) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [
        id,
        name,
        categoryId,
        purchasePrice,
        salePrice,
        minStock || 5,
      ];
      await connection.query(query, values);

      // 2. Initialize Inventory
      await connection.query(
        'INSERT INTO inventory (product_id, quantity) VALUES (?, ?)',
        [id, stockQuantity || 0]
      );

      await connection.commit();
      return { id, ...productData };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const query = `
      SELECT
        p.id, p.name, p.sku,
        p.category_id as categoryId,
        p.purchase_price as costPrice,
        p.sale_price as price,
        i.quantity as stock,
        p.minimum_stock as minStock,
        p.description, LOWER(p.status) as status, p.image_url as imageUrl,
        p.created_at as createdAt, p.updated_at as updatedAt,
        c.name as categoryName
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN inventory i ON p.id = i.product_id
      WHERE i.quantity > 0
      ORDER BY p.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows.map(row => ({
      ...row,
      costPrice: Number(row.costPrice || 0),
      price: Number(row.price || 0),
      stock: Number(row.stock || 0),
      minStock: Number(row.minStock || 0)
    }));
  }

  static async findById(id) {
    const query = `
      SELECT 
        p.id, p.name, p.sku, 
        p.category_id as categoryId, 
        p.purchase_price as costPrice, 
        p.sale_price as price, 
        i.quantity as stock,
        p.minimum_stock as minStock,
        p.description, p.status, p.image_url as imageUrl,
        p.created_at as createdAt, p.updated_at as updatedAt
      FROM products p
      JOIN inventory i ON p.id = i.product_id
      WHERE p.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      costPrice: Number(rows[0].costPrice || 0),
      price: Number(rows[0].price || 0),
      stock: Number(rows[0].stock || 0),
      minStock: Number(rows[0].minStock || 0)
    };
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];

    // Map camelCase to snake_case for DB
    const mapping = {
      name: "name",
      categoryId: "category_id",
      purchasePrice: "purchase_price",
      salePrice: "sale_price",
      stockQuantity: "stock_quantity",
      minStock: "minimum_stock",
    };

    for (const [key, value] of Object.entries(updates)) {
      if (mapping[key]) {
        fields.push(`${mapping[key]} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
    await pool.query(query, values);
    return this.findById(id);
  }

  static async delete(id) {
    const query = `DELETE FROM products WHERE id = ?`;
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }

  static async updateStock(id, quantityChange) {
    const query = `UPDATE inventory SET quantity = quantity + ? WHERE product_id = ?`;
    await pool.query(query, [quantityChange, id]);
  }
}
