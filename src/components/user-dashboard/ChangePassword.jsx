"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import api from "@/lib/axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import UserDashboardShell from "./UserDashboardShell";

const ChangePassword = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleShow = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const validate = () => {
        const { current_password, new_password, confirm_password } = formData;

        if (!current_password || !new_password || !confirm_password) {
            Swal.fire("Missing Fields", "Please fill in all fields.", "warning");
            return false;
        }

        if (new_password.length < 8) {
            Swal.fire(
                "Weak Password",
                "New password must be at least 8 characters long.",
                "warning"
            );
            return false;
        }

        if (new_password !== confirm_password) {
            Swal.fire(
                "Mismatch",
                "New password and confirm password do not match.",
                "warning"
            );
            return false;
        }

        if (new_password === current_password) {
            Swal.fire(
                "Invalid Password",
                "New password must be different from your current password.",
                "warning"
            );
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const token =
                localStorage.getItem("auth_token") ||
                sessionStorage.getItem("auth_token");

            if (!token) {
                Swal.fire("Unauthorized", "Please login again.", "error");
                router.replace("/login");
                return;
            }

            const res = await api.post(
                "/api/user/change-password/",
                {
                    current_password: formData.current_password,
                    new_password: formData.new_password,
                    confirm_password: formData.confirm_password,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (res.data.success) {
                // Replace the old token with the new one returned by the API.
                // Preserve whichever storage location the user originally used.
                if (localStorage.getItem("auth_token")) {
                    localStorage.setItem("auth_token", res.data.token);
                }
                if (sessionStorage.getItem("auth_token")) {
                    sessionStorage.setItem("auth_token", res.data.token);
                }

                await Swal.fire({
                    icon: "success",
                    title: "Password Changed",
                    text: res.data.message || "Password changed successfully.",
                    confirmButtonColor: "#000",
                });

                setFormData({
                    current_password: "",
                    new_password: "",
                    confirm_password: "",
                });

                router.push("/user/dashboard");
            }
        } catch (error) {
            console.error(
                "Change password error:",
                error?.response?.data,
                error?.response?.status
            );

            const data = error?.response?.data;

            // Recursively collect every string message from the response,
            // regardless of its shape (string, array, or nested object).
            const getMessages = (d) => {
                if (!d) return [];
                if (typeof d === "string") return [d];
                if (Array.isArray(d)) return d.flatMap(getMessages);
                if (typeof d === "object") return Object.values(d).flatMap(getMessages);
                return [];
            };

            const allMessages = getMessages(data);
            const firstMessage =
                allMessages.find((m) => typeof m === "string" && m.trim()) ||
                "Something went wrong. Please try again.";

            const looksLikeWrongPassword =
                /current password|old password|incorrect password|wrong password|invalid password|password is incorrect/i.test(
                    firstMessage
                );

            if (looksLikeWrongPassword) {
                Swal.fire({
                    icon: "error",
                    title: "Incorrect Password",
                    text: "Your current password is incorrect. Please try again.",
                    confirmButtonColor: "#000",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text: firstMessage,
                    confirmButtonColor: "#000",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserDashboardShell>
            <div className="bg-white rounded-md px-6 py-4 mb-6">
                <h2 className="font-semibold text-lg">Change Password</h2>
            </div>

            <div className="bg-white rounded-md border border-black/10 p-6 max-w-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                        <ShieldCheck className="text-black" size={20} />
                    </div>
                    <div>
                        <h3 className="font-medium">Security Settings</h3>
                        <p className="text-sm text-gray-500">
                            Keep your account secure by updating your password regularly.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Current Password
                        </label>
                        <div className="relative">
                            <Lock
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                autoComplete="current-password"
                                className="w-full border border-gray-300 rounded-md pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow("current")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                                tabIndex={-1}
                            >
                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                placeholder="Enter new password (min 8 chars)"
                                autoComplete="new-password"
                                className="w-full border border-gray-300 rounded-md pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow("new")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                                tabIndex={-1}
                            >
                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Lock
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                                className="w-full border border-gray-300 rounded-md pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow("confirm")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                                tabIndex={-1}
                            >
                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-black/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </UserDashboardShell>
    );
};

export default ChangePassword;