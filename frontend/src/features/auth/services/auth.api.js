import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials: true,
});

export async function signUp(userData) {
    try {
        const response = await api.post("/sign-up", userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function verifyEmail(userData) {
    try {
        const response = await api.post("/verify-email", userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function login(data) {
    try {
        const response = await api.post("/sign-in", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function forgotPassword(data) {
    try {
        const response = await api.post("/forgot-password", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function resetPassword(data) {
    try {
        const response = await api.post("/reset-password", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function verifyResetToken(token) {
    try {
        const response = await api.get(`/verify-reset-token?token=${token}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function logout() {
    try {
        const response = await api.post("/logout");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export async function getMe() {
    try {
        const response = await api.get("/get-me");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}
