import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { Authservice } from "./auth.service";
import { HttpStatus } from "../../config/http.config";
import { changePasswordSchema, emailSchema, loginSchema, registerSchema, resetPasswordSchema, verificationEmailSchema } from "../../shared/validators/auth.validator";
import { clearAuthenticationCookies, getAccessTokenCookieOptions, getRefreshTokenCookieOptions, setAuthenticationCookies } from "../../shared/utils/cookie";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../../shared/utils/catch-errors";
import { ErrorCode } from "../../shared/enums/error-code.enum";


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
                user
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

            if(mfaRequired) {
                return res.status(HttpStatus.OK).json({
                    message: "Verify Mfa authentication",
                    mfaRequired: true,
                    user
                });
            }

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

    public refreshToken = asyncHandler(
        async(req: Request, res: Response): Promise<any> => {
            const refreshToken = req.cookies.refreshToken as string | undefined;
            if(!refreshToken) {
                throw new UnauthorizedException("Missing refresh token");
            }
            
            const { accessToken, newRefreshToken} =  await this.authService.refreshToken(refreshToken);

            if(newRefreshToken) {
                res.cookie(
                    "refreshToken",
                    newRefreshToken,
                    getRefreshTokenCookieOptions()
                )
            }
            return res
                    .status(HttpStatus.OK)
                    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
                    .json({
                        message: "Token refreshed successfully",
                    })
        }
    )

    public verifyEmail = asyncHandler(
        async(req: Request, res: Response): Promise<any> => {
            const {code} = verificationEmailSchema.parse(req.body);
            await this.authService.verifyEmail(code);
            return res.status(HttpStatus.OK).json({message: "Email verified successfully"});
        }
    )

    public forgotPassword = asyncHandler(
        async(req: Request, res: Response): Promise<any> => {
            const email = emailSchema.parse(req.body.email);
            await this.authService.forgotPassword(email);

            return res.status(HttpStatus.OK).json({message: "Password reset link sent successfully"});
        }
    )

    public resetPassword = asyncHandler(
        async(req: Request, res: Response): Promise<any> => {
            const body = resetPasswordSchema.parse(req.body);
            await this.authService.resetPassword(body);

            return clearAuthenticationCookies(res).status(HttpStatus.OK).json({
                message: "Password reset successfully",
            })
        }
    )

    public ChangePassword = asyncHandler(
        async(req: Request, res: Response): Promise<any> => {
            const user = req.user;
            if(!user){
                throw new BadRequestException("User not found",ErrorCode.AUTH_USER_NOT_FOUND);
            }
            const body = changePasswordSchema.parse(req.body);
            await this.authService.ChangePassword(user.id, body,res);

            return res.status(200).json({
                message: "Password changed successfully",
            })
        }
    )

    public ChangeEmail = asyncHandler(
        async(req: Request, res: Response): Promise<any> => {
            const user = req.user;
            if(!user){
                throw new BadRequestException("User not found",ErrorCode.AUTH_USER_NOT_FOUND);
            }
            const body = emailSchema.parse(req.body.email);
            await this.authService.ChangeEmail(user.id, body,res);

            return res.status(200).json({
                message: "Email changed successfully",
            })
        }
    )
    
    public logout = asyncHandler(
        async(req: Request, res: Response): Promise<any> => {
            const sessionId = req.sessionId;
            if(!sessionId) {
                throw new NotFoundException("session is not valid or not found");
            }
            await this.authService.logout(sessionId);

            return clearAuthenticationCookies(res).status(HttpStatus.OK).json({message: "User logged out successfully"});
        }
    )
}