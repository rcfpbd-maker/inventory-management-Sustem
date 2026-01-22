import { Product } from "../models/productModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";
import { AuditLog } from "../models/auditLogModel.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    sendResponse(res, 200, "Products retrieved successfully", products);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const createProduct = async (req, res) => {
  try {
    const result = await Product.create(req.body);
    await AuditLog.create({
      event: `Product created: ${req.body.name}`,
      userId: req.user?.id,
      category: "PRODUCT",
      action: "CREATE",
    });
    sendResponse(res, 201, "Product created successfully", result);
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return sendError(res, 400, "Invalid category ID provided", error);
    }
    if (error.code === "ER_BAD_NULL_ERROR") {
      return sendError(res, 400, "Missing required fields", error);
    }
    sendError(res, 500, error.message, error);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const result = await Product.update(req.params.id, req.body);
    if (!result) return sendError(res, 404, "Product not found");

    // Enhance audit log
    let event = `Product updated: ${result.name}`;
    if (Object.keys(req.body).length === 1 && req.body.stockQuantity !== undefined) {
      event = `Manual Stock Adjustment: ${result.name} set to ${result.stock}`;
    }

    await AuditLog.create({
      event,
      userId: req.user?.id,
      category: "PRODUCT",
      action: "UPDATE",
    });
    sendResponse(res, 200, "Product updated successfully", result);
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return sendError(res, 400, "Invalid category ID provided", error);
    }
    if (error.code === "ER_BAD_NULL_ERROR") {
      return sendError(res, 400, "Missing required fields", error);
    }
    sendError(res, 500, error.message, error);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const success = await Product.delete(req.params.id);
    if (!success) return sendError(res, 404, "Product not found");
    await AuditLog.create({
      event: `Product deleted: ${req.params.id}`,
      userId: req.user?.id,
      category: "PRODUCT",
      action: "DELETE",
    });
    sendResponse(res, 200, "Product deleted successfully");
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};
