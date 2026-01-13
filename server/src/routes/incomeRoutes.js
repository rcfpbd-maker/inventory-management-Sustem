import express from "express";
import {
    getAllIncome,
    createIncome,
    deleteIncome,
} from "../controllers/incomeController.js";
import {
    authenticateToken,
    authorizeRoles,
} from "../middleware/authMiddleware.js";
import { UserRoles } from "../enums/userRoles.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN));

/**
 * @swagger
 * /income:
 *   get:
 *     summary: Get all income records
 *     tags: [Income]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of income
 *   post:
 *     summary: Create new income record
 *     tags: [Income]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Income'
 *     responses:
 *       201:
 *         description: Income created
 */
router.get("/", getAllIncome);
router.post("/", createIncome);

/**
 * @swagger
 * /income/{id}:
 *   delete:
 *     summary: Delete an income record
 *     tags: [Income]
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
 *         description: Income deleted
 */
router.delete("/:id", deleteIncome);

export default router;
