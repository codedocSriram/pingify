import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
import { Mail, Loader2 } from "lucide-react";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { isLoading, forgotPassword } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await forgotPassword(email);
        setIsSubmitted(true);
    };
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* left side of Signup page */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    {/* LOGO */}
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center gap-2 group">
                            <div
                                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
                            >
                                <img
                                    src="/pingifyLogo.svg"
                                    className="size-12 rounded-md"
                                />
                            </div>
                            <h1 className="text-2xl font-bold mt-2">
                                Reset Password
                            </h1>
                            {!isSubmitted ? (
                                <p className="text-gray-300 mb-6 text-center">
                                    Enter your email address and we'll send you
                                    a link to reset your password.
                                </p>
                            ) : (
                                <p className="text-gray-300 mb-6 text-center">
                                    If an account exists for {email}, you will
                                    receive a password reset link shortly.
                                </p>
                            )}
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-0">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">
                                    Email
                                </span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="size-5 text-base-content/40" />
                                </div>
                                <input
                                    type="email"
                                    className={`input input-bordered w-full pl-10`}
                                    placeholder="Your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <React.Fragment>
                                    <Loader2 className="size-5 animate-spin" />
                                    Loading...
                                </React.Fragment>
                            ) : (
                                "Send Email"
                            )}
                        </button>
                    </form>
                </div>
            </div>
            {/* Rigth side of the signup page */}
            <AuthImagePattern
                title="Join our community"
                subtitle="Connect with your friends, ping'em up in Pingify... "
            />
        </div>
    );
};

export default ForgotPasswordPage;
