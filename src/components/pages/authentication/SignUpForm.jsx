"use client";
import React, { useState } from "react";

const SignUpForm = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Sign Up Submitted!", {
            fullName,
            email,
            password,
            acceptTerms,
        });
    };

    const inputStyle =
        "peer w-full border border-gray-400 rounded-sm bg-transparent px-3 pt-5 pb-2 text-sm focus:outline-none focus:border-black";

    const labelStyle =
        "absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-gray-500 text-sm \ z-10 transition-all duration-200 ease-in-out \ peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-black \ peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:translate-y-0";


    return (
        <div className="flex justify-center items-center h-[80vh] bg-white">
            <div className="w-full max-w-md p-8">
                <h2 className="text-3xl font-normal text-center mb-10">Sign up</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div className="relative">
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputStyle}
                            placeholder=" "
                            required
                        />
                        <label htmlFor="fullName" className={labelStyle}>
                            Full Name *
                        </label>
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <input
                            type="email"
                            id="email"
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

                    {/* Password */}
                    <div className="relative">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputStyle}
                            placeholder=" "
                            required
                        />
                        <label htmlFor="password" className={labelStyle}>
                            Password *
                        </label>
                    </div>

                    {/* Accept Terms */}
                    <div className="flex items-start">
                        <input
                            id="terms"
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-1 h-4 w-4 border-gray-300 text-black focus:ring-black"
                            required
                        />
                        <label htmlFor="terms" className="ml-2 text-md text-black">
                            Accept Terms and Conditions

                        </label>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-black text-white font-medium rounded-sm transition "
                    >
                        SIGN UP
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <a href="/signin" className="text-lg text-blue-600 hover:text-blue-800">
                        Already have an account? Sign In
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SignUpForm;
