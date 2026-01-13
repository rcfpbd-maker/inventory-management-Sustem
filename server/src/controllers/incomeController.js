import { Income } from "../models/incomeModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";

export const getAllIncome = async (req, res) => {
    try {
        const income = await Income.findAll();
        sendResponse(res, 200, "Income records retrieved successfully", income);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const createIncome = async (req, res) => {
    try {
        const result = await Income.create(req.body);
        sendResponse(res, 201, "Income record created successfully", result);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const deleteIncome = async (req, res) => {
    try {
        const success = await Income.delete(req.params.id);
        if (!success) return sendError(res, 404, "Income record not found");
        sendResponse(res, 200, "Income record deleted successfully");
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};
