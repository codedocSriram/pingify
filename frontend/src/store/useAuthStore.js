import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:3000";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            const { connectSocket } = get();
            connectSocket();
        } catch (err) {
            if (err.response?.status === 401) {
                return toast.error("Please login/signup first");
            } else {
                console.log(err);
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
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully!");
            const { connectSocket } = get();
            connectSocket();
        } catch (err) {
            if (err.response?.status === 400) {
                return toast.error(err.response.data.message);
            } else {
                console.log(err);
                return toast.error("Oops, something went wrong!");
            }
        } finally {
            set({ isSigningUp: false });
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
                console.log(err);
                toast.error("Oops, something went worng");
            }
        } finally {
            set({ isLoggingIn: false });
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
            console.log(err);
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
                console.log(err);
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
