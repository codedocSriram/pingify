import express from "express";
import {
    signupController,
    loginController,
    logoutController,
    updateProfile,
    checkAuth,
    verifyEmail,
    forgotPassword,
    resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const authRouter = express.Router();

authRouter.post("/signup", signupController);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.post("/update-profile", protectRoute, updateProfile);
authRouter.get("/check", protectRoute, checkAuth);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
export default authRouter;
