import { Payment } from "../models/paymentModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";

export const createPayment = async (req, res) => {
    try {
        const result = await Payment.create(req.body);
        sendResponse(res, 201, "Payment record created successfully", result);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const getPaymentsByOrderId = async (req, res) => {
    try {
        const payments = await Payment.findByOrderId(req.params.orderId);
        sendResponse(res, 200, "Payments retrieved successfully", payments);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};
