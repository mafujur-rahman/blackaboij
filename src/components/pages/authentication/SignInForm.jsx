"use client";
import api from "@/lib/axios";
import React, { useState, useEffect, Suspense } from "react";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";

// Create a separate component that uses useSearchParams
const SignInFormContent = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
        if (token) {
            const role = localStorage.getItem("user_role");
            if (role === "ADMIN") {
                router.push("/dashboard");
            } else if (role === "CUSTOMER") {
                router.push("/user/dashboard");
            }
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await api.post("/api/user/login/", {
                email,
                password,
            });

            const data = res.data;

            if (!data?.token) {
                throw new Error("Invalid login credentials");
            }

            // Save token
            if (rememberMe) {
                localStorage.setItem("auth_token", data.token);
            } else {
                sessionStorage.setItem("auth_token", data.token);
            }

            // Save user role and additional info
            localStorage.setItem("user_role", data.role);
            localStorage.setItem("user_email", email);

            Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: "Welcome back!",
                confirmButtonColor: "#000",
            });

            const redirectTo = searchParams.get('redirect');

            if (redirectTo) {
                router.push(redirectTo);
            } else {
                if (data.role === "ADMIN") {
                    router.push("/dashboard");
                } else if (data.role === "CUSTOMER") {
                    router.push("/user/dashboard");
                } else {
                    router.push("/");
                }
            }

        } catch (error) {
            // Determine error type without exposing raw backend messages
            const status = error?.response?.status;
            const isAuthError = status === 401 || status === 400;

            const result = await Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: isAuthError
                    ? "The email or password you entered is incorrect. Please try again."
                    : "Something went wrong while signing you in. Please try again in a moment.",
                confirmButtonColor: "#000",
                showCancelButton: isAuthError,
                cancelButtonText: "Forgot Password?",
                cancelButtonColor: "#2563eb",
            });

            if (result.dismiss === Swal.DismissReason.cancel) {
                // Pre-fill email on the forgot-password page
                router.push(
                    `/forgot-password?email=${encodeURIComponent(email)}`
                );
            }
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
                <h2 className="text-3xl font-normal text-center mb-10">Sign in</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
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
                        <label htmlFor="email" className={labelStyle}>Email Address *</label>
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputStyle}
                            placeholder=" "
                            required
                        />
                        <label htmlFor="password" className={labelStyle}>Password *</label>
                    </div>

                    {/* Remember Me + Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <label htmlFor="rememberMe" className="ml-2 text-sm">Remember me</label>
                        </div>

                        <a
                            href="/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Forgot Password?
                        </a>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-black text-white font-medium rounded-sm cursor-pointer disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "SIGN IN"}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <a
                        href="/signUp"
                        className="text-lg text-black"
                    >
                        You don&apos;t have an account? <span className="text-blue-600 hover:text-blue-800">Sign Up</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

// Main component with Suspense boundary
const SignInForm = () => {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-[80vh] bg-white">
                <div className="w-full max-w-md p-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-10"></div>
                        <div className="space-y-6">
                            <div className="h-12 bg-gray-200 rounded"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <SignInFormContent />
        </Suspense>
    );
};

export default SignInForm;