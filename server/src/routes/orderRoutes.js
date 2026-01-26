import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  assignCourierToOrder,
} from "../controllers/orderController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";
import { UserRoles } from "../enums/userRoles.js";

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "SALE"
 *                 customerId:
 *                   type: string
 *                   description: "Leave empty to create new customer"
 *                   example: ""
 *                 supplierId:
 *                   type: string
 *                   example: "supp_123"
 *                 customerName:
 *                   type: string
 *                   description: "Required if customerId is empty"
 *                   example: "Swagger Test Customer"
 *                 customerPhone:
 *                   type: string
 *                   description: "Required if customerId is empty"
 *                   example: "01711223344"
 *                 amountPaid:
 *                   type: number
 *                   description: "Initial payment amount"
 *                   example: 500
 *                 paymentMethod:
 *                   type: string
 *                   example: "Cash"
 *                 paymentReference:
 *                   type: string
 *                   example: "TXN123456"
 *                 courierCharge:
 *                   type: number
 *                   example: 60
 *                 totalAmount:
 *                   type: number
 *                   example: 500
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                         example: "prod_001"
 *                       quantity:
 *                         type: number
 *                         example: 2
 *                       price:
 *                         type: number
 *                         example: 250
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  "/",
  authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF),
  getAllOrders
);
router.post(
  "/",
  authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF),
  createOrder
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  "/:id",
  authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF),
  getOrderById
);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']
 *               confirmationStatus:
 *                 type: string
 *                 enum: ['UNCONFIRMED', 'CONFIRMED']
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put(
  "/:id/status",
  authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF),
  updateOrderStatus
);

/**
 * @swagger
 * /orders/{id}/courier:
 *   put:
 *     summary: Assign courier to order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courierId:
 *                 type: string
 *               trackingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Courier assigned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put(
  "/:id/courier",
  authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF),
  assignCourierToOrder
);

export default router;
