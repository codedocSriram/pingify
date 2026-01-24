import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar } from "../controllers/message.controller.js";
const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);

export default messageRouter;
