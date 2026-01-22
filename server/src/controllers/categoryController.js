import { Category } from "../models/categoryModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";
import { AuditLog } from "../models/auditLogModel.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    sendResponse(res, 200, "Categories retrieved successfully", categories);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    const result = await Category.create(name, description, parentId);
    await AuditLog.create({
      event: `Category created: ${name}`,
      userId: req.user?.id,
      category: "CATEGORY",
      action: "CREATE",
    });
    sendResponse(res, 201, "Category created successfully", result);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    const result = await Category.update(req.params.id, name, description, parentId);
    if (!result) return sendError(res, 404, "Category not found");
    await AuditLog.create({
      event: `Category updated: ${req.params.id}`,
      userId: req.user?.id,
      category: "CATEGORY",
      action: "UPDATE",
    });
    sendResponse(res, 200, "Category updated successfully", result);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const success = await Category.delete(req.params.id);
    if (!success) return sendError(res, 404, "Category not found");
    await AuditLog.create({
      event: `Category deleted: ${req.params.id}`,
      userId: req.user?.id,
      category: "CATEGORY",
      action: "DELETE",
    });
    sendResponse(res, 200, "Category deleted successfully");
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};
