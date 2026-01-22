import { Settings } from "../models/settingsModel.js";
import { AuditLog } from "../models/auditLogModel.js";
import { sendResponse, sendError } from "../utils/responseHandler.js";

export const getSettings = async (req, res) => {
    try {
        const settings = await Settings.get();
        sendResponse(res, 200, "Settings retrieved successfully", settings);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};

export const updateSettings = async (req, res) => {
    try {
        const result = await Settings.update(req.body);

        await AuditLog.create({
            event: "System settings updated",
            userId: req.user?.id,
            category: "SETTINGS",
            action: "UPDATE",
        });

        sendResponse(res, 200, "Settings updated successfully", result);
    } catch (error) {
        sendError(res, 500, error.message, error);
    }
};
