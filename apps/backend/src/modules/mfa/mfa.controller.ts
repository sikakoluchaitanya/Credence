import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { MfaService } from "./mfa.service";
import { HttpStatus } from "../../config/http.config";
import { verifyMfaSchema, verifyMfaForLoginSchema } from "../../shared/validators/mfa.validator";
import { setAuthenticationCookies } from "../../shared/utils/cookie";

export class MfaController {
    private mfaservice: MfaService;

    constructor(mfaservice: MfaService) {
        this.mfaservice = mfaservice;
    }

    public generateMFASetup = asyncHandler(async (req: Request, res: Response) => {
        const { secret, qrcode, message} = await this.mfaservice.generateMFASetup(req);

        return res.status(HttpStatus.OK).json({
            message,
            secret,
            qrcode,
        })
    })

    public verifyMFASetup = asyncHandler(async (req: Request, res: Response) => {
        const { code, secretKey } = verifyMfaSchema.parse({ ...req.body });

        const { message, userPreferences } = await this.mfaservice.verifyMFASetup(req, code, secretKey);
    })

    public revokeMFASetup = asyncHandler(async (req: Request, res: Response) => {
        const { message, userPreferences } = await this.mfaservice.revokeMFASetup(req);
        return res.status(HttpStatus.OK).json({
            message,
            userPreferences,
        })
    })

    public verifyMFAForLogin = asyncHandler(async (req: Request, res: Response) => {
        const { code, email, userAgent } = verifyMfaForLoginSchema.parse({ 
            ...req.body,
            userAgent: req.headers["user-agent"],
        });

        const { user, accessToken, refreshToken } = await this.mfaservice.verifyMFAForLogin( code, email, userAgent);

        return setAuthenticationCookies({
            res, 
            accessToken, 
            refreshToken
        }).status(HttpStatus.OK).json({
            message: "",
            user,
        });
    });
}