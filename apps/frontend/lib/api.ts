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

export const loginMutationFn = async (data: Logintype) => await API.post("/auth/login", data);
export const registerMutationFn = async (data: registerType) => await API.post("/auth/register", data);
export const forgotPasswordMutationFn = async (data: forgotPassword ) => await API.post("/auth/password/forgot", data);
export const resetPasswordMutationFn = async (data: resetPasswordType) => await API.post("/auth/password/reset", data);

