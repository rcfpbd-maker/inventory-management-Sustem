import pool from "../config/db.js";
import { AuditLog } from "../models/auditLogModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";

export const getPurchases = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM purchases ORDER BY purchaseDate DESC"
    );
    sendResponse(res, 200, "Purchases retrieved successfully", rows);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const createPurchase = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const purchase = req.body;

    await conn.query(
      "INSERT INTO purchases (id, productId, productName, quantity, purchasePrice, totalCost, supplierName, purchaseDate, createdBy) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        purchase.id,
        purchase.productId,
        purchase.productName,
        purchase.quantity,
        purchase.purchasePrice,
        purchase.totalCost,
        purchase.supplierName,
        purchase.purchaseDate,
        purchase.createdBy || req.user?.id,
      ]
    );

    await conn.query(
      "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
      [purchase.quantity, purchase.productId]
    );

    // Standard audit log
    await AuditLog.create({
      event: `Stock In (Purchase): ${purchase.productName} - Qty: ${purchase.quantity}`,
      userId: purchase.createdBy || req.user?.id,
      category: "PRODUCT",
      action: "UPDATE",
    });

    await conn.commit();
    sendResponse(res, 201, "Purchase created and stock updated successfully");
  } catch (err) {
    await conn.rollback();
    sendError(res, 500, err.message, err);
  } finally {
    conn.release();
  }
};
