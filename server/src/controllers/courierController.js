import { Courier } from "../models/courierModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";
import { AuditLog } from "../models/auditLogModel.js";

export const getAllCouriers = async (req, res) => {
    try {
        const couriers = await Courier.findAll();
        sendResponse(res, 200, "Couriers retrieved successfully", couriers);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const createCourier = async (req, res) => {
    try {
        const result = await Courier.create(req.body);
        await AuditLog.create({
            event: `Courier created: ${req.body.name}`,
            userId: req.user?.id,
            category: "COURIER",
            action: "CREATE",
        });
        sendResponse(res, 201, "Courier created successfully", result);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const updateCourier = async (req, res) => {
    try {
        const success = await Courier.update(req.params.id, req.body);
        if (!success) return sendError(res, 404, "Courier not found");
        await AuditLog.create({
            event: `Courier updated: ${req.params.id}`,
            userId: req.user?.id,
            category: "COURIER",
            action: "UPDATE",
        });
        sendResponse(res, 200, "Courier updated successfully");
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const deleteCourier = async (req, res) => {
    try {
        const success = await Courier.delete(req.params.id);
        if (!success) return sendError(res, 404, "Courier not found");
        await AuditLog.create({
            event: `Courier deleted: ${req.params.id}`,
            userId: req.user?.id,
            category: "COURIER",
            action: "DELETE",
        });
        sendResponse(res, 200, "Courier deleted successfully");
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};
