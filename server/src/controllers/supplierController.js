import { Supplier } from "../models/supplierModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";
import { AuditLog } from "../models/auditLogModel.js";

export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    sendResponse(res, 200, "Suppliers retrieved successfully", suppliers);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const createSupplier = async (req, res) => {
  try {
    const result = await Supplier.create(req.body);
    await AuditLog.create({
      event: `Supplier created: ${req.body.name}`,
      userId: req.user?.id,
      category: "SUPPLIER",
      action: "CREATE",
    });
    sendResponse(res, 201, "Supplier created successfully", result);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const result = await Supplier.update(req.params.id, req.body);
    if (!result) return sendError(res, 404, "Supplier not found");
    await AuditLog.create({
      event: `Supplier updated: ${req.params.id}`,
      userId: req.user?.id,
      category: "SUPPLIER",
      action: "UPDATE",
    });
    sendResponse(res, 200, "Supplier updated successfully", result);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const success = await Supplier.delete(req.params.id);
    if (!success) return sendError(res, 404, "Supplier not found");
    await AuditLog.create({
      event: `Supplier deleted: ${req.params.id}`,
      userId: req.user?.id,
      category: "SUPPLIER",
      action: "DELETE",
    });
    sendResponse(res, 200, "Supplier deleted successfully");
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};
