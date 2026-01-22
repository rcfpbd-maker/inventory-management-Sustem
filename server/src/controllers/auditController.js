import { AuditLog } from "../models/auditLogModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";

export const getAllAuditLogs = async (req, res) => {
  try {
    const { userId, category, action, startDate, endDate, page, limit } = req.query;

    const filters = {
      userId,
      category,
      action,
      startDate,
      endDate,
      page: page || 1,
      limit: limit || 50,
    };

    const result = await AuditLog.findAll(filters);
    sendResponse(res, 200, "Audit logs retrieved successfully", result);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};
