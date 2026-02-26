import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { login, getMe, signUp, logout, forgotPassword, resetPassword, verifyEmail, verifyResetToken } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);

    const { user, setUser, loading, setLoading } = context;

    const handleSignUp = async (userData) => {
        try {
            const response = await signUp(userData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    const handleVerifyEmail = async (userData) => {
        try {
            const response = await verifyEmail(userData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    const handleSignIn = async (userData) => {
        try {
            const response = await login(userData);
            setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    }

    const handleForgotPassword = async (userData) => {
        try {
            const response = await forgotPassword(userData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    const handleResetPassword = async (userData) => {
        try {
            const response = await resetPassword(userData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    const handleVerifyResetToken = async (token) => {
        try {
            const response = await verifyResetToken(token);
            return response;
        } catch (error) {
            throw error;
        }
    }

    const handleLogout = async () => {
        try {
            const response = await logout();
            setUser(null);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const handleGetMe = async () => {
        try {
            setLoading(true);
            const response = await getMe();
            setUser(response.user);
            return response;
        } catch (error) {
            setUser(null);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return {
        user, loading, handleSignUp, handleSignIn, handleForgotPassword, handleResetPassword, handleVerifyResetToken, handleLogout, handleGetMe, handleVerifyEmail
    }
}