import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { Routes, Route, Navigate } from "react-router-dom";
import { axiosInstance } from "./lib/axios";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
    const { authUser, checkAuth, isCheckingAuth, onlineUsers, tempUser } =
        useAuthStore();
    const { theme } = useThemeStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth && !authUser) {
        return (
            <div
                data-theme={theme}
                className="flex items-center justify-center h-screen"
            >
                <Loader className="size-10 animate-spin" />
            </div>
        );
    }
    return (
        <div data-theme={theme} className="flex-1">
            <Navbar />
            <Routes>
                <Route
                    path="/"
                    element={authUser ? <HomePage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/verify-email"
                    element={
                        tempUser ? <EmailVerificationPage /> : <SignUpPage />
                    }
                />
                <Route
                    path="/signup"
                    element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/login"
                    element={!authUser ? <LoginPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/forgot-password"
                    element={
                        !authUser ? <ForgotPasswordPage /> : <Navigate to="/" />
                    }
                />
                <Route
                    path="/reset-password/:token"
                    element={
                        !authUser ? <ResetPasswordPage /> : <Navigate to="/" />
                    }
                />
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                    path="/profile"
                    element={
                        authUser ? <ProfilePage /> : <Navigate to="/login" />
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            <Toaster />
        </div>
    );
};

export default App;
