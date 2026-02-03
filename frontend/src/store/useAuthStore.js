import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
    import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    tempUser: null,
    error: null,
    isLoading: false,
    message: null,

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            const { connectSocket } = get();
            connectSocket();
        } catch (err) {
            if (err.response?.status === 401) {
                return toast.error("Please login/signup first");
            } else {
                toast.error("Please login/signup first");
            }
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const response = await axiosInstance.post("/auth/signup", {
                fullName: data.fullName,
                email: data.email,
                password: data.password,
            });

            set({ tempUser: response.data.tempUser });
            toast.success("Verify your email");
            return response;
        } catch (err) {
            set({
                error: err.response.data.message || "Error signing up",
                isLoading: false,
                tempUser: null,
                isSigningUp: false,
            });
            if (err.response?.status === 400) {
                return toast.error(err.response.data.message);
            } else {
                return toast.error("Oops, something went wrong!");
            }
        } finally {
            set({ isLoading: false, isSigningUp: false });
        }
    },
    verifyEmail: async (code) => {
        const email = localStorage.getItem("email");
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post("/auth/verify-email", {
                email: email,
                code: code,
            });

            set({ authUser: response.data.user });
            localStorage.removeItem("email");
            const { connectSocket } = get();
            connectSocket();
            localStorage.removeItem("email");
            set({ tempUser: null });
            return response;
        } catch (error) {
            set({
                error: error.response?.data.message || error.message,
                isLoading: false,
            });
            toast.error(error.message);
            throw error;
        } finally {
            set({ isSigningUp: false });
        }
    },
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        localStorage.setItem("email", email);
        try {
            const response = await axiosInstance.post("/auth/forgot-password", {
                email,
            });
            set({ message: response.data.message, isLoading: false });
            toast.success(response.data.message);
        } catch (error) {
            set({
                isLoading: false,
                error:
                    error.response.data.message ||
                    "Error sending reset password mail",
            });
            toast.error(error.response?.data.message);
        } finally {
            set({ isLoading: false, error: null });
        }
    },
    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        const email = localStorage.getItem("email");
        try {
            const response = await axiosInstance.post(
                `/auth/reset-password/${token}`,
                { password, email },
            );
            set({ message: response.data.message, isLoading: false });
            localStorage.removeItem("email");
        } catch (error) {
            set({
                isLoading: false,
                error:
                    error.response.data.message || "Error resetting password",
            });
            throw error;
        } finally {
            set({ isLoading: false, error: null });
        }
    },
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            const { connectSocket } = get();
            connectSocket();
        } catch (err) {
            if (err.response?.status === 400) {
                return toast.error(err.response.data.message);
            } else if (err.response?.status === 404) {
                return toast.error(err.response.data.message);
            } else {
                toast.error("Oops, something went worng");
            }
        } finally {
            set({ isLoggingIn: false, error: null });
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully!");
            const { disconnectSocket } = get();
            disconnectSocket();
        } catch (err) {
            toast.error("Something went wrong!", err);
        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.post("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile pic updated");
        } catch (err) {
            if (err.response?.data.message) {
                return toast.error(err.response.data.message);
            } else {
                return toast.error("Unable to send image, please try later");
            }
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    connectSocket: () => {
        const { authUser } = get();

        if (!authUser || get().socket?.connected) {
            return;
        }
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();

        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },
    disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
        }
    },
}));
