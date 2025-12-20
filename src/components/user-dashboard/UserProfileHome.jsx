"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import UserDashboardShell from "./UserDashboardShell";

const UserProfileHome = () => {
    const [profileImage, setProfileImage] = useState("/images/profile.webp");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
        }
    };

    return (
        <UserDashboardShell>
            {/* TITLE */}
            <div className="bg-white rounded-md px-6 py-4 mb-6 border border-black/10">
                <h2 className="font-semibold text-lg">My Profile</h2>
            </div>

            {/* PROFILE FORM */}
            <div className="bg-white rounded-md border border-black/10 p-6 w-full max-w-2xl">
                {/* IMAGE UPLOAD */}
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
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* FORM */}
                <form className="space-y-5">
                    {/* FULL NAME */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20"
                        />
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20"
                        />
                    </div>

                    {/* PHONE */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            placeholder="Enter your phone number"
                            className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20"
                        />
                    </div>

                    {/* CURRENT PASSWORD */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter current password"
                            className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20"
                        />
                    </div>

                    {/* NEW PASSWORD */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            className="w-full rounded-md border border-black/10 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black/20"
                        />
                    </div>

                    {/* ACTION */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-2.5 rounded-md bg-black text-white text-sm font-medium hover:bg-black/90"
                        >
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </UserDashboardShell>
    );
};

export default UserProfileHome;
