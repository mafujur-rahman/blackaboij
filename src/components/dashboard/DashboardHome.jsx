import { FiShoppingBag, FiDollarSign, FiBox, FiPackage, FiTruck, FiCheckCircle, FiArchive, FiClock } from "react-icons/fi";
import DashboardShell from "./DashboardShell";

export default function DashboardHome() {
    return (
        <DashboardShell>

            {/* TITLE */}
            <div className="bg-white rounded-md px-6 py-4 mb-6">
                <h2 className="font-semibold text-lg text-black">Dashboard</h2>
            </div>

            {/* TOP STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={<FiShoppingBag />}
                    iconBg="bg-gray-200 text-black"
                    title="Total Sales"
                    value="3"
                />
                <StatCard
                    icon={<FiDollarSign />}
                    iconBg="bg-gray-200 text-black"
                    title="Total Income"
                    value="306$"
                />
                <StatCard
                    icon={<FiBox />}
                    iconBg="bg-gray-200 text-black"
                    title="Total Products"
                    value="1"
                />
            </div>

            {/* ORDERS */}
            <div className="bg-white rounded-md p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 flex flex-col gap-4">

                        {/* GRAY CARD */}
                        <div className="bg-gray-100 rounded-md p-6 flex flex-col h-full">
                            <span className="text-3xl font-semibold text-black">3</span>
                            <span className="text-[16px] mt-1 text-black">Total Order</span>

                            {/* PUSH BUTTON DOWN */}
                            <button className="mt-auto bg-black text-white py-3 text-[16px] rounded-md">
                                All Orders
                            </button>
                        </div>

                        {/* PENDING ORDER */}
                        <div className="bg-gray-300 text-black text-[16px] rounded-md px-5 py-6 flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <FiClock /> Pending order
                            </span>
                            <span className="font-semibold">0</span>
                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <OrderCard icon={<FiPackage />} label="Order Placed" value="0" bg="bg-gray-100" color="text-black" />
                        <OrderCard icon={<FiTruck />} label="Order Shipped" value="0" bg="bg-gray-100" color="text-black" />
                        <OrderCard icon={<FiCheckCircle />} label="Confirmed Order" value="2" bg="bg-gray-100" color="text-black" />
                        <OrderCard icon={<FiArchive />} label="Processed Order" value="1" bg="bg-gray-100" color="text-black" />
                    </div>

                </div>
            </div>

        </DashboardShell>
    );
}

/* SMALL COMPONENTS */

function StatCard({ icon, iconBg, title, value }) {
    return (
        <div className="bg-white rounded-md p-6 flex items-center gap-4">
            <div className={`w-14 h-16 flex items-center justify-center rounded-md ${iconBg}`}>
                {icon}
            </div>
            <div>
                <p className="text-[16px] text-black">{title}</p>
                <h3 className="text-2xl font-semibold mt-1 text-black">{value}</h3>
            </div>
        </div>
    );
}

function OrderCard({ icon, label, value, bg, color }) {
    return (
        <div className={`flex justify-between items-center px-5 py-6 rounded-md ${bg}`}>
            <span className="flex items-center gap-3">
                <span className={color}>{icon}</span>
                <span className="text-black">{label}</span>
            </span>
            <span className={`font-semibold text-lg ${color}`}>{value}</span>
        </div>
    );
}
