import { OrderReturn } from "../models/returnModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";

export const createReturn = async (req, res) => {
    try {
        const result = await OrderReturn.create(req.body);
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
