import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";

import authRouter from "./routes/auth.router.js";
import messageRouter from "./routes/message.router.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

app.listen(PORT, () => {
    console.log("Server is runnin on port", PORT);
    connectDB();
});
