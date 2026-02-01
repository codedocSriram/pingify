import mongoose from "mongoose";

const usersignupSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        verificationToken: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 120, // 2 minutes (120 seconds)
        },
    },
    { timestamps: true },
);

export const Usersignup = mongoose.model("Usersignup", usersignupSchema);
