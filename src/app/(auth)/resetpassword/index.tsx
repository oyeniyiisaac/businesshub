"use client";

import { Store } from "google-material-icons/filled";
import { Visibility, VisibilityOff } from "google-material-icons/outlined";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState, useEffect } from "react";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (initialEmail && !email) {
            setEmail(initialEmail);
        }
    }, [initialEmail]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = otp.trim();

        if (!cleanEmail) {
            setFeedback({ type: "error", text: "Please enter your email address." });
            return;
        }

        if (!cleanOtp || cleanOtp.length < 6) {
            setFeedback({ type: "error", text: "Please enter the complete 6-digit verification code." });
            return;
        }

        if (newPassword.length < 8) {
            setFeedback({ type: "error", text: "New password must be at least 8 characters long." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setFeedback({ type: "error", text: "Passwords do not match." });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `
                        mutation ResetForgotPasswordWithOtp($email: String!, $otp: String!, $newPassword: String!) {
                            resetForgotPasswordWithOtp(email: $email, otp: $otp, newPassword: $newPassword) {
                                success
                                message
                            }
                        }
                    `,
                    variables: {
                        email: cleanEmail,
                        otp: cleanOtp,
                        newPassword,
                    },
                }),
            });

            const result = await response.json();

            if (result.errors?.length) {
                throw new Error(result.errors[0].message || "Failed to reset password.");
            }

            const data = result.data?.resetForgotPasswordWithOtp;
            if (data?.success) {
                setFeedback({
                    type: "success",
                    text: data.message || "Password reset successful! Redirecting to login...",
                });
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                throw new Error(data?.message || "Verification code is invalid or expired.");
            }
        } catch (err: any) {
            setFeedback({
                type: "error",
                text: err.message || "An unexpected error occurred. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            setFeedback({ type: "error", text: "Please enter your email address to resend the code." });
            return;
        }

        setResendLoading(true);
        setFeedback(null);

        try {
            const response = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `
                        mutation ForgetPassword($workEmail: String!) {
                            forgetPassword(workEmail: $workEmail) {
                                success
                                message
                            }
                        }
                    `,
                    variables: {
                        workEmail: cleanEmail,
                    },
                }),
            });

            const result = await response.json();
            if (result.errors?.length) {
                throw new Error(result.errors[0].message || "Failed to resend code.");
            }

            setFeedback({
                type: "success",
                text: "A new 6-digit verification code has been sent to your email.",
            });
        } catch (err: any) {
            setFeedback({
                type: "error",
                text: err.message || "Could not resend code. Please try again.",
            });
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-surface-bright p-4">
            <div className="w-full max-w-105 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-8 flex flex-col items-center">

                {/* Logo */}
                <div className="flex items-center gap-2 text-2xl font-bold text-primary tracking-tight mb-6">
                    <Store className="text-primary" />
                    <span>BusinessHub NG</span>
                </div>

                {/* Header */}
                <h1 className="text-xl md:text-2xl font-bold text-on-surface text-center">
                    Reset Your Password
                </h1>
                <p className="mt-1.5 text-xs text-on-surface-variant text-center max-w-75 leading-relaxed mb-6">
                    Enter the 6-digit verification code sent to your email along with your new password.
                </p>

                {/* Feedback Banner */}
                {feedback && (
                    <div
                        className={`w-full mb-5 p-3.5 rounded-lg text-xs font-medium ${
                            feedback.type === "success"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                    >
                        {feedback.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="mb-1 block text-xs font-semibold text-on-surface">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@company.com"
                            className="h-10 px-3 w-full rounded-md border border-outline bg-surface-container-low text-xs text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>

                    {/* 6-Digit OTP */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="otp" className="block text-xs font-semibold text-on-surface">
                                6-Digit Verification Code
                            </label>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resendLoading}
                                className="text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
                            >
                                {resendLoading ? "Resending..." : "Resend Code"}
                            </button>
                        </div>
                        <input
                            type="text"
                            id="otp"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            required
                            placeholder="123456"
                            className="h-11 px-3 w-full rounded-md border border-outline bg-surface-container-low text-center font-mono text-lg font-bold tracking-widest text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label htmlFor="newPassword" className="mb-1 block text-xs font-semibold text-on-surface">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="h-10 px-3 pr-10 w-full rounded-md border border-outline bg-surface-container-low text-xs text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none"
                            >
                                {showNewPassword ? <VisibilityOff className="w-4 h-4" /> : <Visibility className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-on-surface-variant mt-1">Must be at least 8 characters long.</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="mb-1 block text-xs font-semibold text-on-surface">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="h-10 px-3 pr-10 w-full rounded-md border border-outline bg-surface-container-low text-xs text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none"
                            >
                                {showConfirmPassword ? <VisibilityOff className="w-4 h-4" /> : <Visibility className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 mt-2 bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm rounded-md transition-colors shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Resetting Password...</span>
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>

                {/* Back to Sign In Link */}
                <div className="mt-6 text-center w-full">
                    <Link
                        href="/login"
                        className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1.5"
                    >
                        <span>←</span> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-surface p-4 text-sm font-medium text-on-surface-variant">
                    Loading reset form...
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
