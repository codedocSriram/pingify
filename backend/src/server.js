import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";

import authRouter from "./routes/auth.router.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
    console.log("Server is runnin on port", PORT);
    connectDB();
});
