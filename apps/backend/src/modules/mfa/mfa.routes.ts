import { Router } from "express";
import { mfaController } from "./mfa.module";
import { authenticateJWT } from "../../shared/strats/jwt.strategy";

const mfaRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Multi-Factor Authentication (MFA)
 *   description: API endpoints for managing MFA
 */

/**
 * @swagger
 * /mfa/setup:
 *   get:
 *     summary: Generate MFA setup details
 *     tags: [Multi-Factor Authentication (MFA)]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: MFA setup details generated successfully
 */
mfaRoutes.get("/setup", authenticateJWT, mfaController.generateMFASetup);

/**
 * @swagger
 * /mfa/verify:
 *   post:
 *     summary: Verify MFA setup
 *     tags: [Multi-Factor Authentication (MFA)]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: MFA setup verified successfully
 */
mfaRoutes.post("/verify", authenticateJWT, mfaController.verifyMFASetup);

/**
 * @swagger
 * /mfa/revoke:
 *   put:
 *     summary: Revoke MFA for the user
 *     tags: [Multi-Factor Authentication (MFA)]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: MFA revoked successfully
 */
mfaRoutes.put("/revoke", authenticateJWT, mfaController.revokeMFA);

/**
 * @swagger
 * /mfa/verify-login:
 *   post:
 *     summary: Verify MFA during login
 *     tags: [Multi-Factor Authentication (MFA)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login verified successfully using MFA
 */
mfaRoutes.post("/verify-login", mfaController.verifyMFAForLogin);

export default mfaRoutes;
