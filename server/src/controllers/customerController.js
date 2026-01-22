import { Customer } from "../models/customerModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";
import { AuditLog } from "../models/auditLogModel.js";

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    sendResponse(res, 200, "Customers retrieved successfully", customers);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const createCustomer = async (req, res) => {
  try {
    const result = await Customer.create(req.body);
    await AuditLog.create({
      event: `Customer created: ${req.body.name}`,
      userId: req.user?.id,
      category: "CUSTOMER",
      action: "CREATE",
    });
    sendResponse(res, 201, "Customer created successfully", result);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return sendError(res, 400, "Customer with this phone number already exists");
    }
    sendError(res, 500, error.message, error);
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const result = await Customer.update(req.params.id, req.body);
    if (!result) return sendError(res, 404, "Customer not found");
    await AuditLog.create({
      event: `Customer updated: ${req.params.id}`,
      userId: req.user?.id,
      category: "CUSTOMER",
      action: "UPDATE",
    });
    sendResponse(res, 200, "Customer updated successfully", result);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const success = await Customer.delete(req.params.id);
    if (!success) return sendError(res, 404, "Customer not found");
    await AuditLog.create({
      event: `Customer deleted: ${req.params.id}`,
      userId: req.user?.id,
      category: "CUSTOMER",
      action: "DELETE",
    });
    sendResponse(res, 200, "Customer deleted successfully");
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};
