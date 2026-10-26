"use client";
import api from "@/lib/axios";
import React, { useState, Suspense } from "react";
import Swal from "sweetalert2";
import { useSearchParams, useRouter } from "next/navigation";

const ResetPasswordContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const inputStyle =
        "peer w-full border border-gray-400 rounded-sm bg-transparent px-3 pt-5 pb-2 pr-12 text-sm focus:outline-none focus:border-black";
    const labelStyle =
        "absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm z-10 transition-all duration-200 ease-in-out peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-black peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:translate-y-0";

    // Invalid link state
    if (!uid || !token) {
        return (
            <div className="flex justify-center items-center h-[80vh] bg-white">
                <div className="w-full max-w-md p-8 text-center space-y-6">
                    <h2 className="text-2xl font-normal">Invalid Reset Link</h2>
                    <p className="text-sm text-gray-600">
                        This password reset link is invalid.
                        Please request a new password reset email.
                    </p>
                    <a
                        href="/forgot-password"
                        className="inline-block w-full py-3 bg-black text-white font-medium rounded-sm"
                    >
                        REQUEST NEW RESET LINK
                    </a>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/api/user/reset-password/", {
                uid,
                token,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            // Clear any locally stored auth state (existing tokens are revoked server-side)
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_email");
            sessionStorage.removeItem("auth_token");

            await Swal.fire({
                icon: "success",
                title: "Password Reset",
                text:
                    res.data?.message ||
                    "Password reset successfully. Please log in with your new password.",
                confirmButtonColor: "#000",
            });

            router.push("/login");
        } catch (err) {
            const data = err?.response?.data;

            if (Array.isArray(data?.errors)) {
                setError(data.errors.join(" "));
            } else if (data?.errors && typeof data.errors === "object") {
                const first = Object.values(data.errors).flat().find(Boolean);
                setError(first || data?.message || "Unable to reset password.");
            } else {
                setError(data?.message || "Unable to reset password.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-[80vh] bg-white">
            <div className="w-full max-w-md p-8">
                <h2 className="text-3xl font-normal text-center mb-4">Reset Password</h2>
                <p className="text-center text-sm text-gray-600 mb-8">
                    Use at least 8 characters and avoid common or easily guessed passwords.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputStyle}
                            placeholder=" "
                            required
                        />
                        <label htmlFor="newPassword" className={labelStyle}>
                            New Password *
                        </label>
                    </div>

                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputStyle}
                            placeholder=" "
                            required
                        />
                        <label htmlFor="confirmPassword" className={labelStyle}>
                            Confirm New Password *
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                            tabIndex={-1}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-black text-white font-medium rounded-sm cursor-pointer disabled:opacity-60"
                    >
                        {loading ? "Resetting..." : "RESET PASSWORD"}
                    </button>

                    <div className="text-center">
                        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                            Request a new reset link
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ResetPasswordPage = () => (
    <Suspense fallback={<div className="h-[80vh]" />}>
        <ResetPasswordContent />
    </Suspense>
);

export default ResetPasswordPage;