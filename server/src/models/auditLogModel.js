import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export class AuditLog {
  static async create(logData) {
    const { event, userId, category = "SYSTEM", action = "OTHER" } = logData;
    const id = uuidv4();
    const query = `INSERT INTO audit_logs (id, event, category, action, user_id) VALUES (?, ?, ?, ?, ?)`;
    try {
      await pool.query(query, [id, event, category, action, userId]);
    } catch (error) {
      console.error("Failed to create audit log", error);
      // We don't throw here to prevent blocking main flow if logging fails
    }
  }

  static async findAll(filters = {}) {
    const { userId, category, action, startDate, endDate, page = 1, limit = 50 } = filters;

    let query = `
      SELECT a.*, u.email as user_email, u.username 
      FROM audit_logs a 
      LEFT JOIN users u ON a.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ` AND a.user_id = ?`;
      params.push(userId);
    }

    if (category) {
      query += ` AND a.category = ?`;
      params.push(category);
    }

    if (action) {
      query += ` AND a.action = ?`;
      params.push(action);
    }

    if (startDate) {
      query += ` AND a.timestamp >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND a.timestamp <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY a.timestamp DESC`;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM audit_logs a WHERE 1=1`;
    const countParams = [];

    if (userId) {
      countQuery += ` AND a.user_id = ?`;
      countParams.push(userId);
    }
    if (category) {
      countQuery += ` AND a.category = ?`;
      countParams.push(category);
    }
    if (action) {
      countQuery += ` AND a.action = ?`;
      countParams.push(action);
    }
    if (startDate) {
      countQuery += ` AND a.timestamp >= ?`;
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ` AND a.timestamp <= ?`;
      countParams.push(endDate);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
