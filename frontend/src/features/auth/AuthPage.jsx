import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "./hooks/useAuth";
import "./styles/auth.scss";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyEmail from "./components/VerifyEmail";

const AuthPage = ({ type = "sign-up" }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-content">
            <div className="brand-logo">
              <img src="https://ik.imagekit.io/m0no8ccps/Untitled%20(6).png" alt="logo" />
              <h1>Glimpes</h1>
            </div>
            <div className="auth-dynamic-form">
              {type === "sign-up" ? (
                <SignUp />
              ) : type === "sign-in" ? (
                <SignIn />
              ) : type === "forgot-password" ? (
                <ForgotPassword />
              ) : type === "reset-password" ? (
                <ResetPassword />
              ) : type === "verify-email" ? (
                <VerifyEmail />
              ) : null}
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-image-container">
            <img src="https://images.pexels.com/photos/6332437/pexels-photo-6332437.jpeg" alt="Welcome to InstaClone" />
            <div className="auth-image-overlay">
              <h2>Welcome to Glimpes</h2>
              <p>Connect with friends and the world around you. Share your best moments.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
