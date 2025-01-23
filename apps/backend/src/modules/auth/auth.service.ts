import { config } from "../../config/app.config";
import sessionModel from "../../database/models/session.modal";
import userModel from "../../database/models/user.model";
import verificationCodeModel from "../../database/models/verification.modal";
import { ErrorCode } from "../../shared/enums/error-code.enum";
import VerificationEnum from "../../shared/enums/verification-code.enum";
import { LoginDto, RegisterDto } from "../../shared/interfaces/auth.interface";
import { BadRequestException, UnauthorizedException } from "../../shared/utils/catch-errors";
import { calculateExpirationDate, fortyFiveMinutesFromNow, ONE_DAY_IN_MS } from "../../shared/utils/time-date";
import { RefreshTokenPayload, refreshTokenSignOptions, signJwtToken, verifyJwtToken } from "../../shared/utils/jwt";
import { mailer_sender, sendEmail } from "../../mailers/mailer";
import { verifyEmailTemplate } from "../../mailers/templates/templates";
import { verify } from "jsonwebtoken";


export class Authservice {
    public async register(registerData: RegisterDto) {
        const { name, email, password } = registerData;
        
        const existingUser = await userModel.exists({
            email
        });

        if (existingUser) {
            throw new BadRequestException(
                "User already exists with same email", 
                ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
            );
        }

        const newUser = await userModel.create({
            name,
            email,
            password
        });

        const userId = newUser._id;

        const verification = await verificationCodeModel.create({
            userId,
            type: VerificationEnum.EMAIL_VERIFICATION,
            expiredAt: fortyFiveMinutesFromNow(),
        })

        const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
        try {
            await sendEmail({
                to: newUser.email,
                from: mailer_sender,
                ...verifyEmailTemplate(verificationUrl),
            });
        } catch (error) {
            console.error("Email sending failed:", error);
            throw new Error("Failed to send verification email");
        }
        

        return {
            user: newUser
        }
    }

    public async login(loginData: LoginDto) {
        const { email, password, userAgent } = loginData;

        const user = await userModel.findOne({
            email: email,
        })

        if(!user) {
            throw new BadRequestException(
                "Invalid email or password provided",
                ErrorCode.AUTH_USER_NOT_FOUND
            )
        }

        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            throw new BadRequestException(
                "Invalid email or password provided",
                ErrorCode.AUTH_USER_NOT_FOUND
            )
        }

        const session = await sessionModel.create({
            userId: user._id,
            userAgent
        });

        const accessToken = signJwtToken({
            userId: user._id,
            sessionId: session._id
        });

        const refreshToken = signJwtToken({
            sessionId: session._id
        },
        refreshTokenSignOptions
    );
        
        return {
            user,
            accessToken,
            refreshToken,
            mfaRequired: false
        }
    }

    public async refreshToken(refreshToken: string) {
        const { payload } = verifyJwtToken<RefreshTokenPayload>(refreshToken, { 
            secret: refreshTokenSignOptions.secret
        });

        if(!payload){
            throw new UnauthorizedException("Invalid refresh token provided");
        }

        const session = await sessionModel.findById(payload.sessionId);
        const now = Date.now();

        if(!session){
            throw new UnauthorizedException("Session does not exist");
        }

        if(session.expiredAt.getTime() <= now) {
            throw new UnauthorizedException("Session has expired");
        }

        const sessionRequireRefresh = session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

        if(sessionRequireRefresh) {
            session.expiredAt = calculateExpirationDate(
                config.JWT.EXPIRES_IN
            );
            await session.save();
        }

        const newRefreshToken = sessionRequireRefresh ? signJwtToken({
            sessionId: session._id
        },
        refreshTokenSignOptions) : undefined;

        const accessToken = signJwtToken({
            userId: session.userId,
            sessionId: session._id
        }, refreshTokenSignOptions);

        return {
            accessToken,
            newRefreshToken
        }
    }

    public async verifyEmail(code : string) {
        const validCode = await verificationCodeModel.findOne({
            code: code,
            type: VerificationEnum.EMAIL_VERIFICATION,
            expiredAt: { $gt: Date.now() }
        });

        if(!validCode) {
            throw new BadRequestException(
                "Invalid verification code provided",
                ErrorCode.VALIDATION_ERROR
            )
        }

        const updatedUser = await userModel.findOneAndUpdate(
            validCode.userId,
            {
                isEmailVerified: true,
            },
            { new: true }
        )

        if(!updatedUser) {
            throw new BadRequestException(
                "Unable to verify email address",
                ErrorCode.VALIDATION_ERROR
            );
        }

        await validCode.deleteOne();

        return {
            user: updatedUser
        }
    }
}