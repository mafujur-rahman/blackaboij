"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import UserDashboardShell from "./UserDashboardShell";
import Swal from "sweetalert2";
import api from "@/lib/axios";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dwsp8rft8/";

const UserProfileHome = () => {
    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        profile_pic: null,
    });

    const [profileImage, setProfileImage] = useState("/images/profile.webp");
    const [loading, setLoading] = useState(false);

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
                if (!token) return;

                const res = await api.get("/api/user/get-my-profile/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser({
                    first_name: res.data.first_name,
                    last_name: res.data.last_name,
                    email: res.data.email,
                    phone_number: res.data.phone_number || "",
                    profile_pic: null,
                });

                setProfileImage(res.data.profile_pic ? `${CLOUDINARY_BASE}${res.data.profile_pic}` : "/images/profile.webp");

            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
            setUser({ ...user, profile_pic: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
            if (!token) throw new Error("No auth token found");

            const payload = new FormData();
            payload.append("first_name", user.first_name);
            payload.append("last_name", user.last_name);
            payload.append("phone_number", user.phone_number);
            if (user.profile_pic) payload.append("profile_pic", user.profile_pic);

            const res = await api.put("/api/user/update-my-profile/", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            Swal.fire({
                icon: "success",
                title: "Success",
                text: res.data.message || "Profile updated successfully",
                confirmButtonColor: "#000",
            });

            // Update profile image preview
            if (res.data.data?.profile_pic) {
                setProfileImage(`${CLOUDINARY_BASE}${res.data.data.profile_pic}`);
            }

            // Update sidebar immediately
            setUser(prev => ({
                ...prev,
                first_name: res.data.data.first_name,
                last_name: res.data.data.last_name,
                phone_number: res.data.data.phone_number,
                profile_pic: res.data.data.profile_pic ? `${CLOUDINARY_BASE}${res.data.data.profile_pic}` : prev.profile_pic,
            }));

        } catch (error) {
            console.error("Update failed:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.response?.data?.message || "Failed to update profile",
                confirmButtonColor: "#000",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserDashboardShell user={user} setUser={setUser}>
            <div className="bg-white rounded-md px-6 py-4 mb-6 border border-black/10">
                <h2 className="font-semibold text-lg">My Profile</h2>
            </div>

            <div className="bg-white rounded-md border border-black/10 p-6 w-full max-w-2xl">
                <div className="flex items-center gap-5 mb-8">
                    <Image
                        src={profileImage}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="rounded-full border border-black/10 object-cover"
                    />

                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-black/10 cursor-pointer hover:bg-gray-50 text-sm">
                        <Camera size={16} />
                        Change Photo
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input type="text" name="first_name" value={user.first_name} onChange={handleChange} className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input type="text" name="last_name" value={user.last_name} onChange={handleChange} className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input type="tel" name="phone_number" value={user.phone_number} onChange={handleChange} className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20" />
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-2.5 rounded-md bg-black text-white text-sm font-medium hover:bg-black/90 disabled:opacity-50">
                            {loading ? "Updating..." : "Update Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </UserDashboardShell>
    );
};

export default UserProfileHome;
