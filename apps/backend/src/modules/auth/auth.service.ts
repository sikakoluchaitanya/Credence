import { config } from "../../config/app.config";
import sessionModel from "../../database/models/session.modal";
import userModel from "../../database/models/user.model";
import verificationCodeModel from "../../database/models/verification.modal";
import { ErrorCode } from "../../shared/enums/error-code.enum";
import VerificationEnum from "../../shared/enums/verification-code.enum";
import { LoginDto, RegisterDto, ResetPasswordDto } from "../../shared/interfaces/auth.interface";
import { BadRequestException, NotFoundException, UnauthorizedException, HttpException, InternalServerException } from "../../shared/utils/catch-errors";
import { anHourFromNow, calculateExpirationDate, fortyFiveMinutesFromNow, ONE_DAY_IN_MS, threeMinutesAgo } from "../../shared/utils/time-date";
import { RefreshTokenPayload, refreshTokenSignOptions, signJwtToken, verifyJwtToken } from "../../shared/utils/jwt";
import { mailer_sender, sendEmail } from "../../mailers/mailer";
import { passwordResetTemplate, verifyEmailTemplate } from "../../mailers/templates/templates";
import { verify } from "jsonwebtoken";
import { HttpStatus } from "../../config/http.config";
import { hashValue } from "../../shared/utils/bycrypt";


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

        if(user.userPreferences.enable2FA) {
            return{
                user:null,
                mfaRequired: true,
                accessToken: "",
                refreshToken: ""
            }
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

    public async forgotPassword(email: string) {
        const user = await userModel.findOne({
            email
        });

        if(!user) {
            throw new NotFoundException("User not found");
        }

        // check email rate limit
        const timeago = threeMinutesAgo();
        const maxAttempts = 2;

        const count = await verificationCodeModel.countDocuments({  // a way of counting documents
            userId: user._id,
            type: VerificationEnum.PASSWORD_RESET,
            createdAt: { $gt: timeago },
        });

        if (count >= maxAttempts) {
            throw new HttpException(
                "Too many attempts. Please try again later.",
                HttpStatus.TOO_MANY_REQUESTS,
                ErrorCode.AUTH_TOO_MANY_ATTEMPTS
            );
        }

        const expiresAt = anHourFromNow();
        const validCode = await verificationCodeModel.create({
            userId: user._id,
            type: VerificationEnum.PASSWORD_RESET,
            expiredAt: expiresAt,
        });
        
        const resetLink = `${config.APP_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;
            const { data, error } = await sendEmail({
                to: user.email,
                from: mailer_sender,
                ...passwordResetTemplate(resetLink),
            });

            if(!data){
                throw new InternalServerException(`${error?.name} ${error?.message}`);
            }

            return {
                url: resetLink,
                emailId: data.id
            }
    }

    public async resetPassword( {password, verificationCode}: ResetPasswordDto ) {
        const validCode = await verificationCodeModel.findOne({
            code: verificationCode,
            type: VerificationEnum.PASSWORD_RESET,
            expiresAt: { $gt: Date.now() }
        })

        if(!validCode) {
            throw new NotFoundException("Invalid or expired verification code");
        }

        const hashedPassword = await hashValue(password);

        const updatedUser =  await userModel.findByIdAndUpdate(
            validCode.userId,
            {
                password: hashedPassword
            }
        )

        if(!updatedUser) {
            throw new BadRequestException(
                "Unable to reset password",
            )
        }

        await validCode.deleteOne();

        await sessionModel.deleteMany({
            userId: updatedUser._id,
        })

        return {
            user: updatedUser
        }
    } 

    public async logout(sessionId: string) {
        return await sessionModel.findByIdAndDelete(sessionId);
    }
}