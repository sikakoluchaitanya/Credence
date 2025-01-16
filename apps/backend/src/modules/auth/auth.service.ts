import userModel from "../../database/models/user.model";
import verificationCodeModel from "../../database/models/verification.modal";
import { ErrorCode } from "../../shared/enums/error-code.enum";
import VerificationEnum from "../../shared/enums/verification-code.enum";
import { RegisterDto } from "../../shared/interfaces/auth.interface";
import { BadRequestException } from "../../shared/utils/catch-errors";
import { fortyFiveMinutesFromNow } from "../../shared/utils/time-date";


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
}