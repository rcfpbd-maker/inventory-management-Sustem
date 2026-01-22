import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { UserRoles } from "../enums/userRoles.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", authenticateToken, authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN), updateSettings);

export default router;
