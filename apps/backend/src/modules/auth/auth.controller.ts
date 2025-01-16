import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { Authservice } from "./auth.service";
import { HttpStatus } from "../../config/http.config";
import { registerSchema } from "../../shared/validators/auth.validator";


export class AuthController {
    private authService: Authservice;

    constructor(authService: Authservice) {
        this.authService = authService;
    }

    public register = asyncHandler(
        async(req: Request, res: Response): Promise<any> => {
            const userAgent = req.headers["user-agent"];
            const body = registerSchema.parse({
                ...req.body,
                userAgent,
            });
            this.authService.register(body);
            return res.status(HttpStatus.CREATED).json({
                message: "User registered successfully",
            });
        }
    )
}