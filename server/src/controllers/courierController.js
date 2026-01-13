import { Courier } from "../models/courierModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";

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
        sendResponse(res, 201, "Courier created successfully", result);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const updateCourier = async (req, res) => {
    try {
        const success = await Courier.update(req.params.id, req.body);
        if (!success) return sendError(res, 404, "Courier not found");
        sendResponse(res, 200, "Courier updated successfully");
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const deleteCourier = async (req, res) => {
    try {
        const success = await Courier.delete(req.params.id);
        if (!success) return sendError(res, 404, "Courier not found");
        sendResponse(res, 200, "Courier deleted successfully");
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};
