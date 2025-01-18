import { CookieOptions, Response } from "express";
import { config } from "../../config/app.config";
import { calculateExpirationDate } from "./time-date";

type CookiePayload = {
    res: Response,
    accessToken: string,
    refreshToken: string
};

export const REFRESH_PATH = `${config.BASE_PATH}/auth/refresh`;

const defaults: CookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production" ? true : false,
    sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
}

export const getRefreshTokenCookieOptions = (): CookieOptions => {
    const expiresIn = config.JWT.REFRESH_EXPIRES_IN;
    const expires = calculateExpirationDate(expiresIn);
    return {
        ...defaults,
        expires,
        path: REFRESH_PATH,
    };
}

export const getAccessTokenCookieOptions = (): CookieOptions => {
    const expiresIn = config.JWT.EXPIRES_IN;
    const expires = calculateExpirationDate(expiresIn);
    return {
        ...defaults,
        expires,
        path: "/",
    };
}

export const setAuthenticationCookies = ({
    res,
    accessToken,
    refreshToken,
}: CookiePayload ): Response => {
    res.cookie(
        "accessToken",
        accessToken,
        getAccessTokenCookieOptions()
    );
    res.cookie(
        "refreshToken",
        refreshToken,
        getRefreshTokenCookieOptions()
    );
    return res;
}

export const clearAuthenticationCookies = (res: Response): Response => (
    res.clearCookie("accessToken"),
    res.clearCookie("refreshToken", {
        path: REFRESH_PATH
    })
)