import express from "express";
import { createReturn, getReturnsByOrderId, getAllReturns } from "../controllers/returnController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { UserRoles } from "../enums/userRoles.js";

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /returns:
 *   get:
 *     summary: Get all return records
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of returns
 *   post:
 *     summary: Record a return or refund
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderReturn'
 *     responses:
 *       201:
 *         description: Return processed
 */
router.get("/", authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF), getAllReturns);
router.post("/", authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF), createReturn);

/**
 * @swagger
 * /returns/order/{orderId}:
 *   get:
 *     summary: Get returns by order ID
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of returns
 */
router.get("/order/:orderId", authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF), getReturnsByOrderId);

export default router;
