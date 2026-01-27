import { create } from "zustand";
import toast from "react-hot-toast";
import AlertMessage from "../components/AlertMessage";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (err) {
            toast.error("Something broke!" + err);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (err) {
            if (err.response?.data.message) {
                return toast.error(err.response?.data.message);
            }

            toast.error("Something went worng!");
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(
                `/messages/send/${selectedUser._id}`,
                messageData,
            );
            set({ messages: [...messages, res.data] });
        } catch (err) {
            if (err.response?.data.message) {
                return toast.error(err.response.data.message);
            }

            toast.error("Error occured while sending message");
        }
    },
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) {
            return;
        }
        const socket = useAuthStore.getState().socket;
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser =
                newMessage.senderId === selectedUser._id;

            if (!isMessageSentFromSelectedUser) {
                toast.success("new message recieved, check inbox");
                return;
            }
            set({
                messages: [...get().messages, newMessage],
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },
}));
