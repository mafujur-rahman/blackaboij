"use client";

import {
    FiShoppingBag,
    FiClock,
    FiCheckCircle,
    FiXCircle,
} from "react-icons/fi";
import UserDashboardShell from "./UserDashboardShell";

export default function UserDashboardHome() {
    return (
        <UserDashboardShell>

            {/* TITLE */}
            <div className="bg-white rounded-md px-6 py-4 mb-6">
                <h2 className="font-semibold text-lg">My Dashboard</h2>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                <StatCard
                    icon={<FiShoppingBag />}
                    iconBg="bg-blue-100 text-blue-600"
                    title="Total Orders"
                    value="5"
                />

                <StatCard
                    icon={<FiClock />}
                    iconBg="bg-yellow-100 text-yellow-600"
                    title="Pending Orders"
                    value="1"
                />

                <StatCard
                    icon={<FiCheckCircle />}
                    iconBg="bg-green-100 text-green-600"
                    title="Completed Orders"
                    value="3"
                />

                <StatCard
                    icon={<FiXCircle />}
                    iconBg="bg-red-100 text-red-600"
                    title="Cancelled Orders"
                    value="1"
                />

            </div>

        </UserDashboardShell>
    );
}

/* SMALL COMPONENT */

function StatCard({ icon, iconBg, title, value }) {
    return (
        <div className="bg-white rounded-md p-6 flex items-center gap-4">
            <div
                className={`w-14 h-14 flex items-center justify-center rounded-md text-xl ${iconBg}`}
            >
                {icon}
            </div>
            <div>
                <p className="text-[16px] text-gray-600">{title}</p>
                <h3 className="text-2xl font-semibold mt-1">{value}</h3>
            </div>
        </div>
    );
}
