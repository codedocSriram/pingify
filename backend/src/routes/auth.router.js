import express from "express";
import {
    signupController,
    loginController,
    logoutController,
    updateProfile,
    checkAuth,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const authRouter = express.Router();

authRouter.post("/signup", signupController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.post("/update-profile", protectRoute, updateProfile);
authRouter.get("/check", protectRoute, checkAuth);
export default authRouter;
