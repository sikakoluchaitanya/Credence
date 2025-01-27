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

export const loginMutationFn = async (data: Logintype) => await API.post("/auth/login", data);

export const registerMutationFn = async (data: registerType) => await API.post("/auth/register", data);