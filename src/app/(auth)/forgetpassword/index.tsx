"use client";

import { Store } from "google-material-icons/filled";
import Link from "next/link";
import React, { useState } from "react";

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        const cleanEmail = email.trim();
        if (!cleanEmail) {
            setFeedback({ type: "error", text: "Please enter your work email address." });
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
                throw new Error(result.errors[0].message || "Failed to send reset link.");
            }

            const data = result.data?.forgetPassword;
            if (data?.success) {
                setFeedback({
                    type: "success",
                    text: data.message || "A password reset link has been sent to your email.",
                });
            } else {
                throw new Error(data?.message || "Failed to send password reset link.");
            }
        } catch (err: any) {
            setFeedback({
                type: "error",
                text: err.message || "An unexpected error occurred. Please try again later.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-surface-bright p-4">
            <div className="w-full max-w-105 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-8 flex flex-col items-center">

                {/* Logo */}
                <div className="flex items-center gap-2 text-2xl font-bold text-primary tracking-tight mb-8">
                    <Store className="text-primary" />
                    <span>BusinessHub NG</span>
                </div>

                {/* Header */}
                <h1 className="text-xl md:text-2xl font-bold text-on-surface text-center">
                    Forgot your password?
                </h1>
                <p className="mt-2 text-xs text-on-surface-variant text-center max-w-70 leading-relaxed mb-6">
                    Enter your work email address and we will send you a link to reset your password.
                </p>

                {/* Feedback Banner */}
                {feedback && (
                    <div
                        className={`w-full mb-6 p-3.5 rounded-lg text-xs font-medium ${
                            feedback.type === "success"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                    >
                        {feedback.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-5">
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-on-surface">
                            Work Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@company.com"
                                className="pl-10 h-11 w-full rounded-md border border-outline bg-surface-container-low text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm rounded-md transition-colors shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sending link...</span>
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </button>
                </form>

                {/* Back to Login Link */}
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
};

export default ForgetPassword;