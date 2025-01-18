import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { Authservice } from "./auth.service";
import { HttpStatus } from "../../config/http.config";
import { loginSchema, registerSchema } from "../../shared/validators/auth.validator";
import { setAuthenticationCookies } from "../../shared/utils/cookie";


export class AuthController {
    private authService: Authservice;

    constructor(authService: Authservice) {
        this.authService = authService;
    }

    public register = asyncHandler(
        async(req: Request, res: Response): Promise<any> => {
            const body = registerSchema.parse({
                ...req.body,
            });
            const {user} = await this.authService.register(body);
            return res.status(HttpStatus.CREATED).json({
                message: "User registered successfully",
            });
        }
    )

    public login = asyncHandler(
        async(req: Request, res: Response): Promise<any> => {
            const userAgent = req.headers['user-agent'];
            const body = loginSchema.parse({
                ...req.body,
                userAgent,
            });

            const { user, accessToken, refreshToken, mfaRequired } = await this.authService.login(body);

            return setAuthenticationCookies({
                res,
                accessToken,
                refreshToken,
            })
                .status(HttpStatus.OK)
                .json({
                message: "User logged in successfully",
                mfaRequired,
                user,
            });
        }
    )
}