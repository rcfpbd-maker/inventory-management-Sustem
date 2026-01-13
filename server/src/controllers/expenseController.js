import { Expense } from "../models/expenseModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";

// Expense
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    sendResponse(res, 200, "Expense records retrieved successfully", expenses);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const createExpense = async (req, res) => {
  try {
    const result = await Expense.create(req.body);
    sendResponse(res, 201, "Expense record created successfully", result);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const success = await Expense.delete(req.params.id);
    if (!success) return sendError(res, 404, "Expense record not found");
    sendResponse(res, 200, "Expense record deleted successfully");
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};
