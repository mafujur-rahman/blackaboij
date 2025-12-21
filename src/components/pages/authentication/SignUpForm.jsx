"use client";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Swal from "sweetalert2";


const SignUpForm = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();


const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptTerms) {
        Swal.fire({
            icon: "warning",
            title: "Terms Required",
            text: "Please accept the terms and conditions",
            confirmButtonColor: "#000",
        });
        return;
    }

    try {
        setLoading(true);

        const res = await api.post("/api/user/register/", {
            username: fullName,
            email,
            password,
        });

        console.log(res.data);

        // success alert and redirect to Sign In
        Swal.fire({
            icon: "success",
            title: "Signup Successful",
            text: res.data.message || "Your account has been created!",
            confirmButtonColor: "#000",
        }).then(() => {
            router.push("/signin"); 
        });

        // reset form fields
        setFullName("");
        setEmail("");
        setPassword("");
        setAcceptTerms(false);

    } catch (error) {
        console.error(error.response?.data);
        Swal.fire({
            icon: "error",
            title: "Signup Failed",
            text:
                error?.response?.data?.message ||
                error.message ||
                "Something went wrong",
            confirmButtonColor: "#000",
        });
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
                <h2 className="text-3xl font-normal text-center mb-10">Sign up</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputStyle}
                            placeholder=" "
                            required
                        />
                        <label className={labelStyle}>Full Name *</label>
                    </div>

                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputStyle}
                            placeholder=" "
                            required
                        />
                        <label className={labelStyle}>Email Address *</label>
                    </div>

                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputStyle}
                            placeholder=" "
                            required
                        />
                        <label className={labelStyle}>Password *</label>
                    </div>

                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-1 h-4 w-4"
                        />
                        <label className="ml-2 text-md">
                            Accept Terms and Conditions
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-black text-white font-medium rounded-sm cursor-pointer"
                    >
                        {loading ? "Signing up..." : "SIGN UP"}
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
