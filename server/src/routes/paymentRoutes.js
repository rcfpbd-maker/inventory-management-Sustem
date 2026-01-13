import express from "express";
import { createPayment, getPaymentsByOrderId } from "../controllers/paymentController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { UserRoles } from "../enums/userRoles.js";

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Add a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post("/", authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF), createPayment);

/**
 * @swagger
 * /payments/order/{orderId}:
 *   get:
 *     summary: Get payments by order ID
 *     tags: [Payments]
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
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/order/:orderId", authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF), getPaymentsByOrderId);

export default router;
