"use client";
import api from "@/lib/axios";
import React, { useState, Suspense } from "react";
import Swal from "sweetalert2";
import { useSearchParams } from "next/navigation";

const ForgotPasswordContent = () => {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await api.post("/api/user/forgot-password/", { email });
            setSuccess(
                res.data?.message ||
                "If an account exists with this email, a password reset link has been sent."
            );
        } catch (err) {
            const emailError = err?.response?.data?.errors?.email?.[0];
            setError(
                emailError ||
                err?.response?.data?.message ||
                "Unable to send password reset email."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputStyle =
        "peer w-full border border-gray-400 rounded-sm bg-transparent px-3 pt-5 pb-2 text-sm focus:outline-none focus:border-black";
    const labelStyle =
        "absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm z-10 transition-all duration-200 ease-in-out peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-black peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:translate-y-0";

    return (
        <div className="flex justify-center items-center h-[80vh] bg-white">
            <div className="w-full max-w-md p-8">
                <h2 className="text-3xl font-normal text-center mb-4">Forgot Password</h2>
                <p className="text-center text-sm text-gray-600 mb-8">
                    Enter the email address associated with your account. If an
                    account exists, we will send you a password reset link.
                </p>

                {success ? (
                    <div className="text-center space-y-6">
                        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-sm p-4">
                            {success}
                        </div>
                        <a href="/signin" className="text-blue-600 hover:text-blue-800 text-sm">
                            Back to Sign in
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputStyle}
                                placeholder=" "
                                required
                            />
                            <label htmlFor="email" className={labelStyle}>
                                Email Address *
                            </label>
                        </div>

                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-black text-white font-medium rounded-sm cursor-pointer disabled:opacity-60"
                        >
                            {loading ? "Sending..." : "SEND RESET LINK"}
                        </button>

                        <div className="text-center">
                            <a href="/signin" className="text-sm text-blue-600 hover:text-blue-800">
                                Back to Sign in
                            </a>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const ForgotPasswordPage = () => (
    <Suspense fallback={<div className="h-[80vh]" />}>
        <ForgotPasswordContent />
    </Suspense>
);

export default ForgotPasswordPage;