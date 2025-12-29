"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import UserDashboardShell from "./UserDashboardShell";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dwsp8rft8/";

const UserProfileHome = () => {
    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        profile_pic: null,
        street_address: "",
        city: "",
        zip_code: "",
    });

    const [profileImage, setProfileImage] = useState("/images/profile.webp");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
                if (!token) return;

                const res = await api.get("/api/user/get-my-profile/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser({
                    first_name: res.data.first_name || "",
                    last_name: res.data.last_name || "",
                    email: res.data.email || "",
                    phone_number: res.data.phone_number || "",
                    profile_pic: null,
                    street_address: res.data.street_address || "",
                    city: res.data.city || "",
                    zip_code: res.data.zip_code || "",
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

    const handlePhoneChange = (value) => {
        setUser({ ...user, phone_number: value || "" });
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
            payload.append("street_address", user.street_address);
            payload.append("city", user.city);
            payload.append("zip_code", user.zip_code);
            
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

            if (res.data.data?.profile_pic) {
                setProfileImage(`${CLOUDINARY_BASE}${res.data.data.profile_pic}`);
            }

            const updatedData = res.data.data || {};
            setUser(prev => ({
                ...prev,
                first_name: updatedData.first_name || prev.first_name,
                last_name: updatedData.last_name || prev.last_name,
                phone_number: updatedData.phone_number || prev.phone_number,
                street_address: updatedData.street_address || prev.street_address,
                city: updatedData.city || prev.city,
                zip_code: updatedData.zip_code || prev.zip_code,
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
                    <div className="relative">
                        <Image
                            src={profileImage}
                            alt="Profile"
                            width={96}
                            height={96}
                            className="rounded-full border border-black/10 object-cover w-24 h-24"
                        />
                        <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 border border-black/10 cursor-pointer hover:bg-gray-50">
                            <Camera size={18} />
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                className="hidden" 
                            />
                        </label>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Click the camera icon to change your profile photo</p>
                    </div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name *</label>
                            <input 
                                type="text" 
                                name="first_name" 
                                value={user.first_name} 
                                onChange={handleChange} 
                                className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20" 
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name *</label>
                            <input 
                                type="text" 
                                name="last_name" 
                                value={user.last_name} 
                                onChange={handleChange} 
                                className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20" 
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input 
                                type="email" 
                                value={user.email} 
                                readOnly
                                className="w-full rounded-md border border-black/10 px-4 py-2 bg-gray-50 text-gray-500 cursor-not-allowed" 
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Phone Number *</label>
                            <div className="[&_.PhoneInput]:flex [&_.PhoneInput]:items-center [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border [&_.PhoneInputInput]:border-black/10 [&_.PhoneInputInput]:border-l-0 [&_.PhoneInputInput]:rounded-r-md [&_.PhoneInputInput]:px-4 [&_.PhoneInputInput]:py-2 [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:focus:outline-none [&_.PhoneInputInput]:focus:ring-1 [&_.PhoneInputInput]:focus:ring-black/20 [&_.PhoneInputCountry]:border [&_.PhoneInputCountry]:border-black/10 [&_.PhoneInputCountry]:border-r-0 [&_.PhoneInputCountry]:rounded-l-md [&_.PhoneInputCountry]:px-3 [&_.PhoneInputCountry]:py-2 [&_.PhoneInputCountry]:bg-white">
                                <PhoneInput
                                    international
                                    defaultCountry="BD"
                                    value={user.phone_number}
                                    onChange={handlePhoneChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Street Address</label>
                        <input 
                            type="text" 
                            name="street_address" 
                            value={user.street_address} 
                            onChange={handleChange} 
                            placeholder="Enter street address"
                            className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <input 
                                type="text" 
                                name="city" 
                                value={user.city} 
                                onChange={handleChange} 
                                placeholder="Enter city"
                                className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">ZIP Code</label>
                            <input 
                                type="text" 
                                name="zip_code" 
                                value={user.zip_code} 
                                onChange={handleChange} 
                                placeholder="Enter ZIP code"
                                className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20" 
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-black/10">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full md:w-auto px-8 py-3 rounded-md bg-black text-white text-sm font-medium hover:bg-black/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                "Update Profile"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </UserDashboardShell>
    );
};

export default UserProfileHome;