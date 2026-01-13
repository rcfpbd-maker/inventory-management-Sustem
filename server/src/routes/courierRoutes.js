import express from "express";
import { getAllCouriers, createCourier, updateCourier, deleteCourier } from "../controllers/courierController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { UserRoles } from "../enums/userRoles.js";

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /couriers:
 *   get:
 *     summary: Get all couriers
 *     tags: [Couriers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of couriers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   post:
 *     summary: Create a new courier (Admin only)
 *     tags: [Couriers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Courier'
 *     responses:
 *       201:
 *         description: Courier created
 */
router.get("/", authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STAFF), getAllCouriers);
router.post("/", authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN), createCourier);

/**
 * @swagger
 * /couriers/{id}:
 *   put:
 *     summary: Update courier (Admin only)
 *     tags: [Couriers]
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
 *             $ref: '#/components/schemas/Courier'
 *     responses:
 *       200:
 *         description: Courier updated
 *   delete:
 *     summary: Delete courier (Admin only)
 *     tags: [Couriers]
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
 *         description: Courier deleted
 */
router.put("/:id", authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN), updateCourier);
router.delete("/:id", authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN), deleteCourier);

export default router;
