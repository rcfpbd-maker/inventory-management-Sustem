import { OrderReturn } from "../models/returnModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";
import { AuditLog } from "../models/auditLogModel.js";

export const createReturn = async (req, res) => {
    try {
        const result = await OrderReturn.create(req.body);
        await AuditLog.create({
            event: `Return/Refund processed for order: ${req.body.order_id}`,
            userId: req.user?.id,
            category: "RETURN",
            action: "CREATE",
        });
        sendResponse(res, 201, "Return/Refund processed successfully", result);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const getAllReturns = async (req, res) => {
    try {
        const returns = await OrderReturn.findAll();
        sendResponse(res, 200, "Return records retrieved successfully", returns);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const getReturnsByOrderId = async (req, res) => {
    try {
        const returns = await OrderReturn.findByOrderId(req.params.orderId);
        sendResponse(res, 200, "Return records retrieved successfully", returns);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};
