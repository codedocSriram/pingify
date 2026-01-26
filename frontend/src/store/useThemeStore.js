import { create } from "zustand";

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("pingify-theme"),
    setTheme: (theme) => {
        localStorage.setItem("pingify-theme", theme);
        set({ theme });
    },
}));
