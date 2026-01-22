import { Order } from "../models/orderModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";
import { AuditLog } from "../models/auditLogModel.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    sendResponse(res, 200, "Orders retrieved successfully", orders);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, 404, "Order not found");
    sendResponse(res, 200, "Order retrieved successfully", order);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return sendError(res, 400, "Order must have at least one item");
    }
    const result = await Order.create(req.body);
    await AuditLog.create({
      event: `Order created: ${result.orderId || req.body.platform}`,
      userId: req.user?.id,
      category: "ORDER",
      action: "CREATE",
    });
    sendResponse(res, 201, "Order created successfully", result);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, confirmationStatus } = req.body;
    const confirmedBy = req.user?.id; // Assumes auth middleware sets req.user

    const success = await Order.updateStatus(req.params.id, { status, confirmedBy, confirmationStatus });
    if (!success) return sendError(res, 404, "Order not found");

    await AuditLog.create({
      event: `Order status updated: ${req.params.id} to ${status}`,
      userId: req.user?.id,
      category: "ORDER",
      action: "UPDATE",
    });

    sendResponse(res, 200, "Order status updated successfully");
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const assignCourierToOrder = async (req, res) => {
  try {
    const { courierId, trackingId } = req.body;
    const success = await Order.assignCourier(req.params.id, { courierId, trackingId });
    if (!success) return sendError(res, 404, "Order not found");

    await AuditLog.create({
      event: `Courier assigned to order: ${req.params.id}`,
      userId: req.user?.id,
      category: "ORDER",
      action: "UPDATE",
    });

    sendResponse(res, 200, "Courier assigned successfully");
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};
