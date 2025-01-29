import API from "./axios-client";

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

