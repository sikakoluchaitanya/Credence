import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { SessionDocument } from "../../database/models/session.modal";
import { UserDocument } from "../../database/models/user.model"
import { config } from "../../config/app.config";

export type AccessTPayload = {
    userId: UserDocument["_id"];
    sessionId: SessionDocument["_id"];
}

export type RefreshTokenPayload = {
    sessionId: SessionDocument["_id"];
}

type SignOptsAndSecret = SignOptions & {
    secret: string
}

const defaults: SignOptions = {
    audience: ["user"]
}

export const accessTokenSignOptions: SignOptsAndSecret = {
    expiresIn: config.JWT.EXPIRES_IN,
    secret: config.JWT.SECRET
}

export const refreshTokenSignOptions: SignOptsAndSecret = {
    expiresIn: config.JWT.REFRESH_EXPIRES_IN,
    secret: config.JWT.REFRESH_SECRET
}

export const signJwtToken = (
    payload: AccessTPayload | RefreshTokenPayload,
    options?:SignOptsAndSecret
) => {
    const { secret, ...opts } = options || accessTokenSignOptions;
    return jwt.sign(payload, secret, {...defaults, ...opts});
}

export const verifyJwtToken = <TPayload extends object = AccessTPayload> (
    token: string,
    options?: VerifyOptions & { secret: string }
) => {
    try {
        const { secret = config.JWT.SECRET, ...opts } = options || {};
        const payload = jwt.verify(token, secret, {
            ...defaults, 
            ...opts}) as TPayload;
        return { payload };
    } catch (error : any) {
        return {
            error: error.message
        }
    }
}