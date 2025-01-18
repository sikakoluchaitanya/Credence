import { config } from "../../config/app.config";
import sessionModel from "../../database/models/session.modal";
import userModel from "../../database/models/user.model";
import verificationCodeModel from "../../database/models/verification.modal";
import { ErrorCode } from "../../shared/enums/error-code.enum";
import VerificationEnum from "../../shared/enums/verification-code.enum";
import { LoginDto, RegisterDto } from "../../shared/interfaces/auth.interface";
import { BadRequestException } from "../../shared/utils/catch-errors";
import { fortyFiveMinutesFromNow } from "../../shared/utils/time-date";
import jwt from "jsonwebtoken";


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

        const verificationCode = await verificationCodeModel.create({
            userId,
            type: VerificationEnum.EMAIL_VERIFICATION,
            expiredAt: fortyFiveMinutesFromNow(),
        })

        // email verification link 

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

        const accessToken = jwt.sign(
            {
                sessionId: session._id
            },
            config.JWT.REFRESH_SECRET,
            {
                audience: ["user"],
                expiresIn: config.JWT.REFRESH_EXPIRES_IN
            }
        );

        const refreshToken = jwt.sign(
            {
                sessionId: session._id
            },
            config.JWT.REFRESH_SECRET,
            {
                audience: ["user"],
                expiresIn: config.JWT.REFRESH_EXPIRES_IN
            }
        );

        return {
            user,
            accessToken,
            refreshToken,
            mfaRequired: false
        }
    }
}