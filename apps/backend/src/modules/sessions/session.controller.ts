import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { SessionService } from "./session.service";
import { HttpStatus } from "../../config/http.config";
import { NotFoundException } from "../../shared/utils/catch-errors";
import { z } from "zod";

export class SessionController {
    private sessionService: SessionService;

    constructor(sessionService: SessionService) {
        this.sessionService = sessionService;
    }

    public getAllSession = asyncHandler(async (req:Request, res: Response) => {
        const userId = req.user?.id;
        const sessionId = req.sessionId;

        const { sessions } = await this.sessionService.getAllSession(userId);

        const modifySessions = sessions.map((session) => ({
            ...session.toObject(),
            ...(session.id === sessionId && {
                isCurrent: true,
            })
        }));

        return res.status(HttpStatus.OK).json({
            message: "Retrieved all sessions successfully",
            sessions: modifySessions,
        })
    });

    public getSession = asyncHandler(async (req: Request, res: Response) => {
        const sessionId = req.sessionId;

        if(!sessionId) {
            throw new NotFoundException("session ID not found, please login again");
        }

        const { user } = await this.sessionService.getSessionByid(sessionId);

        return res.status(HttpStatus.OK).json({
            message: "Retrieved session successfully",
        })
    });

    public deleteSession = asyncHandler(async (req: Request, res: Response) => {
        const sessionId = z.string().parse(req.params.id);
        const userId = req.user?.id;
        await this.sessionService.deleteSession(sessionId, userId);

        return res.status(HttpStatus.OK).json({
            message: "Deleted session successfully",
        })
    });
}
