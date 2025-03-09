import { Router } from "express";
import { authController } from "./auth.module";
import { authenticateJWT } from "../../shared/strats/jwt.strategy";

const authRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
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
 *               password:
 *                 type: string
 *                 example: strongpassword
 *     responses:
 *       201:
 *         description: User registered successfully
 */
authRoutes.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
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
 *               password:
 *                 type: string
 *                 example: strongpassword
 *     responses:
 *       200:
 *         description: Successfully logged in
 */
authRoutes.post("/login", authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your-refresh-token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
authRoutes.post("/refresh", authController.refreshToken);

/**
 * @swagger
 * /auth/verify/email:
 *   post:
 *     summary: Verify email address
 *     tags: [Authentication]
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
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
authRoutes.post("/verify/email", authController.verifyEmail);

/**
 * @swagger
 * /auth/password/forgot:
 *   post:
 *     summary: Request password reset link
 *     tags: [Authentication]
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
 *     responses:
 *       200:
 *         description: Password reset link sent
 */
authRoutes.post("/password/forgot", authController.forgotPassword);

/**
 * @swagger
 * /auth/password/reset:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: reset-token
 *               newPassword:
 *                 type: string
 *                 example: strongpassword
 *     responses:
 *       200:
 *         description: Password reset successful
 */
authRoutes.post("/password/reset", authController.resetPassword);

/**
 * @swagger
 * /auth/password/change:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldpassword
 *               newPassword:
 *                 type: string
 *                 example: newpassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
authRoutes.post("/password/change", authenticateJWT, authController.ChangePassword);

/**
 * @swagger
 * /auth/ChangeEmail:
 *   post:
 *     summary: Change user email
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newEmail:
 *                 type: string
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword
 *     responses:
 *       200:
 *         description: Email changed successfully
 */
authRoutes.post("/ChangeEmail", authenticateJWT, authController.ChangeEmail);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
authRoutes.post("/logout", authenticateJWT, authController.logout);

export default authRoutes;
