import mongoose, { Document, Schema } from "mongoose";
import { thirtyDaysFromNow } from "../../shared/utils/time-date";


export interface SessionDocument extends Document{
    userId: mongoose.Types.ObjectId;
    userAgent?: string;
    expiredAt: Date
    createdAt: Date
}

const sessionSchema = new Schema<SessionDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
        index: true
    },
    userAgent: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiredAt: {
        type: Date,
        required: true,
        default: thirtyDaysFromNow
    }
}, {
    timestamps: true
})

const sessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);

export default sessionModel;