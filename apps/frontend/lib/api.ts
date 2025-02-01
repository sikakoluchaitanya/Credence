import { Session } from "inspector/promises";
import API from "./axios-client";
import { userAgent } from "next/server";

type Logintype = {
    email: string;
    password: string;
}

type registerType = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

type forgotPassword = {
    email: string;
}

type resetPasswordType = {
    password: string;
    verificationCode: string;
}

export type mfaType = {
    message: string
    secret: string
    qrCode: string
}

type verifyMFAType = {
    code: string
    secret: string
}

type mfaLoginType = {
    code: string
    email: string
}

type SessionType = {
    _id: string;
    userId: string;
    userAgent: string;
    createdAt: string;
    expiresAt: string;
    isCurrent: boolean;
}

type SessionResponseType = {
    message: string;
    sessions: SessionType[];
}

export const loginMutationFn = async (data: Logintype) => await API.post("/auth/login", data);
export const registerMutationFn = async (data: registerType) => await API.post("/auth/register", data);
export const forgotPasswordMutationFn = async (data: forgotPassword ) => await API.post("/auth/password/forgot", data);
export const resetPasswordMutationFn = async (data: resetPasswordType) => await API.post("/auth/password/reset", data);
export const verifyEmailMutationFn = async (data: {code: string}) => await API.post("/auth/verify/email", data);
export const getUserSessionQueryFn = async () => await API.get("/session/");
export const mfaSetupQueryFn = async () => {
    const response = await API.get<mfaType>("/mfa/setup");
    return response.data;
}
export const verifySetupQueryFn = async (data: verifyMFAType) => 
    await API.post("/mfa/setup", data);

export const verifyMFAMutationFn = async (data: verifyMFAType) => 
    await API.post("/mfa/verify", data);

export const revokeMFAMutationFn = async () => await API.post("/mfa/revoke", {});
export const verifyMFALoginMutationFn = async (data: mfaLoginType) => 
    await API.post("/mfa/verify-login", data);

export const sessionsQueryFn = async () => {
    const response = await API.get<SessionResponseType>("/session/");
    return response.data;
};

export const sessionDeleteMutation = async(id: string) => 
    await API.delete(`/session/${id}`);

export const logoutMutationFn = async() => await API.post("/auth/logout");