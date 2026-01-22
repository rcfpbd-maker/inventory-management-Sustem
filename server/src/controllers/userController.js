import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { sendResponse, sendError } from "../utils/responseHandler.js";
import { AuditLog } from "../models/auditLogModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    sendResponse(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await AuditLog.create({
      event: `User created: ${username}`,
      userId: req.user?.id,
      category: "USER",
      action: "CREATE",
    });
    sendResponse(res, 201, "User created successfully", result);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const updateUser = async (req, res) => {
  try {
    const result = await User.update(req.params.id, req.body);
    if (!result) return sendError(res, 404, "User not found");
    await AuditLog.create({
      event: `User updated: ${req.params.id}`,
      userId: req.user?.id,
      category: "USER",
      action: "UPDATE",
    });
    sendResponse(res, 200, "User updated successfully", result);
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const success = await User.delete(req.params.id);
    if (!success) return sendError(res, 404, "User not found");
    await AuditLog.create({
      event: `User deleted: ${req.params.id}`,
      userId: req.user?.id,
      category: "USER",
      action: "DELETE",
    });
    sendResponse(res, 200, "User deleted successfully");
  } catch (error) {
    sendError(res, 500, error.message, error);
  }
};
