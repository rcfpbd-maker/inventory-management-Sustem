import express from "express";
import {
  getProfitLoss,
  getDailyLedger,
  getOrderProfitReport,
  getDailySales,
  getUserPerformance,
  getPlatformSales,
  getDueList,
  getDashboardStats,
} from "../controllers/reportController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";
import { UserRoles } from "../enums/userRoles.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN)); // Restricted to Admin

router.get("/profit-loss", getProfitLoss);
router.get("/daily-ledger", getDailyLedger);
router.get("/profit/orders", getOrderProfitReport);
router.get("/daily-sales", getDailySales);
router.get("/user-performance", getUserPerformance);
router.get("/platform-sales", getPlatformSales);
router.get("/due-list", getDueList);
router.get("/dashboard-stats", getDashboardStats);

export default router;
