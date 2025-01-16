import mongoose, { Document } from "mongoose";
import VerificationEnum  from "../../shared/enums/verification-code.enum";
import { generateUniquecode } from "../../shared/utils/uuid";


export interface VerificationCodeDocument extends Document {
    userId: mongoose.Types.ObjectId;
    code: string;
    type: VerificationEnum;
    createdAt: Date;
    expiredAt: Date;
}

const verificationCodeSchema = new mongoose.Schema<VerificationCodeDocument>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    code: {
        type: String,
        unique: true,
        required: true,
        default: generateUniquecode
    },
    type: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiredAt: {
        type: Date,
        required: true,
    }
})

const verificationCodeModel = mongoose.model<VerificationCodeDocument>("VerificationCode", verificationCodeSchema);

export default verificationCodeModel;