import { Router } from "express";
import { sessionController } from "./session.module";

const sessionRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: API endpoints for managing user sessions
 */

/**
 * @swagger
 * /session/all:
 *   get:
 *     summary: Get all active sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: List of all active sessions
 */
sessionRoutes.get("/all", sessionController.getAllSession);

/**
 * @swagger
 * /session/:
 *   get:
 *     summary: Get the current user session
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Current user session details
 */
sessionRoutes.get("/", sessionController.getSession);

/**
 * @swagger
 * /session/{id}:
 *   delete:
 *     summary: Delete a session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID to delete
 *     responses:
 *       200:
 *         description: Session deleted successfully
 */
sessionRoutes.delete("/:id", sessionController.deleteSession);

export default sessionRoutes;
