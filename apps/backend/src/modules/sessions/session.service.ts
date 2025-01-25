import sessionModel from "../../database/models/session.modal";
import { NotFoundException } from "../../shared/utils/catch-errors";

export class SessionService {

    public async getAllSession(userId: string) {
        const sessions = await sessionModel.find({ 
            userId,
            expiredAt: { $gt: Date.now() }
        },{
            _id: 1,
            userAgent: 1,
            createdAt: 1,
            expiredAt: 1
        },{
            sort: {
                createdAt: -1,
            }
        });

        return {
            sessions,
        }
    }

    public async getSessionByid(sessionId: string) {
        const session = await sessionModel.findById(sessionId)
        .populate("userId", "email")
        .select("-expiredAt");

        if(!session) {
            throw new NotFoundException("Session not found, please login");
        }

        const { userId:user,} = session;

        return {
            user,
        }
    };

    public async deleteSession(sessionId: string, userId: string) {
        const deletedSession = await sessionModel.findByIdAndDelete({
            _id: sessionId,
            userId: userId,
        });

        if(!deletedSession) {
            throw new NotFoundException("Session not found, please login");
        }
        return;
    }

}