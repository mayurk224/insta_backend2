import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import AuthPage from "./features/auth/AuthPage";
import HomePage from "./features/home/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/feeds" replace />} />
        <Route path="/feeds" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/sign-up" element={<AuthPage type="sign-up" />} />
        <Route path="/sign-in" element={<AuthPage type="sign-in" />} />
        <Route path="/forgot-password" element={<AuthPage type="forgot-password" />} />
        <Route path="/reset-password" element={<AuthPage type="reset-password" />} />
        <Route path="/verify-email" element={<AuthPage type="verify-email" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
