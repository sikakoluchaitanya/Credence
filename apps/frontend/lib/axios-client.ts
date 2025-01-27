import axios from "axios";

const options = {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
    timeout: 10000,
}

const API = axios.create(options);

API.interceptors.request.use((response) => {
    return response;
}, (error) => {
    const { data, status } = error.response;
    if(data === "Unauthorized" && status === 401) {
        console.log("Unauthorized");
    }
    return Promise.reject({
        ...data,
    });
});

export default API;