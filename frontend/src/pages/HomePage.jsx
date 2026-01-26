import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
const HomePage = () => {
    const { authUser } = useAuthStore();
    const { theme } = useThemeStore();
    return (
        <div data-theme={theme} className="h-screen grid lg:grid-cols-2">
            <h1>Home page</h1>
            <h3>Welcome!</h3>
        </div>
    );
};

export default HomePage;
