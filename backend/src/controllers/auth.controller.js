import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Usersignup from "../models/usersignup.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import {
    sendVerificationEmail,
    sendWelcomeMail,
    sendPasswordResetEmail,
    sendResetSuccessEmail,
} from "../mailService/email.js";
export const signupController = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields.",
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters.",
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Account with this email id already exists!",
            });
        }

        const signupUser = await Usersignup.findOne({
            email,
        });

        if (signupUser) {
            return res.status(400).json({
                success: false,
                message: "OTP already sent, try after few minutes",
            });
        }
        // const salt = await bcrypt.genSalt(10); -- passed salt directly below because this is making api slower
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(
            100000 + Math.random() * 900000,
        ).toString();
        const newSignUp = new Usersignup({
            email: email,
            fullName: fullName,
            password: hashedPassword,
            verificationToken: verificationToken,
        });
        await newSignUp.save();

        await sendVerificationEmail(email, verificationToken);
        res.status(201).json({
            success: true,
            message: "Verify email to continue",
            tempUser: {
                ...newSignUp._doc,
                verificationToken: undefined,
                password: undefined,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const signupUser = await Usersignup.findOne({
            email: email,
            verificationToken: code,
        });
        if (!signupUser) {
            return res.status(400).json({
                success: false,
                message: "Invalid/expired verifiation code",
            });
        }
        const user = new User({
            fullName: signupUser.fullName,
            password: signupUser.password,
            email: email,
            isVerified: true,
        });
        await user.save();
        await sendWelcomeMail(user.email, user.fullName);
        generateToken(user._id, res);
        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
            },
            message: "User signup successful",
        });
    } catch (error) {
        console.log("Error in code verification:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const loginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Fill in all fields to login",
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Invalid credentials" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res
                .status(404)
                .json({ success: false, message: "Invalid credentials" });
        }
        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,

            createdAt: user.createdAt,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error occured in login controller", error.message);
        res.status(500).json({
            success: false,
            message: "Error occured while logging in",
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account with mentioned Email exists",
            });
        }
        const isExpired = Date.now() > user.resetPasswordExpiresAt;
        if (isExpired) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiresAt = undefined;
        }

        if (user.resetPasswordToken) {
            return res.status(404).json({
                success: false,
                message:
                    "A reset link already sent to your email, please check your email",
            });
        }
        const resetToken = crypto.randomBytes(20).toString("hex");
        const expiresAt = Date.now() + 1 * 60 * 60 * 1000; //2 hours

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = expiresAt;
        await user.save();
        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
        );
        return res.status(200).json({
            success: true,
            message: "Reset OTP sent to registered email",
        });
    } catch (error) {
        console.log("Error in forgotPassword controller:", error.message);
        res.status(500).json({
            success: false,
            message: "internal server error",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, email } = req.body;
        const user = await User.findOne({
            email: email,
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        await sendResetSuccessEmail(user.email);
        res.status(200).json({
            success: true,
            message: "Password reset successful!",
        });
    } catch (error) {
        console.log("Error in resetPassword controller:", error.message);
        res.status(500).json({
            success: false,
            message: "Error resettign password",
        });
    }
};

export const logoutController = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({
            success: true,
            message: "Logged out successfully!",
        });
    } catch (error) {
        console.log("Error occured in logout controller", error.message);
        res.status(500).json({
            success: false,
            message: "Error logging out",
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id; //user prop added to the req because this req is cominig from auth.middleware.js (again this is just me taking notes, not written by AI)
        if (!profilePic) {
            return res
                .status(400)
                .json({ success: false, message: "Profile pic is required" });
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                profilePic: uploadResponse.secure_url,
            },
            { new: true },
        );
        res.status(200).json({
            _id: updatedUser._id,
            fullName: updatedUser._id,
            email: updatedUser.email,

            createdAt: updatedUser.createdAt,
            profilePic: updatedUser.profilePic,
        });
    } catch (error) {
        console.log("Error occured in updateProfile controller", error.message);
        res.status(500).json({
            success: false,
            message: "Error updating profilePic",
        });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error occured in checkAuth controller", error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server error",
        });
    }
};
