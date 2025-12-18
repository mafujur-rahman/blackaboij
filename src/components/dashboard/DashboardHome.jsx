
import { FiShoppingBag, FiDollarSign, FiBox, FiPackage, FiTruck, FiCheckCircle, FiArchive, FiClock, } from "react-icons/fi";
import DashboardShell from "./DashboardShell";

export default function DashboardHome() {
    return (
        <DashboardShell>

            {/* TITLE */}
            <div className="bg-white rounded-md px-6 py-4 mb-6">
                <h2 className="font-semibold text-lg">Dashboard</h2>
            </div>

            {/* TOP STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={<FiShoppingBag />}
                    iconBg="bg-blue-100 text-blue-600"
                    title="Total Sales"
                    value="3"
                />
                <StatCard
                    icon={<FiDollarSign />}
                    iconBg="bg-yellow-100 text-yellow-600"
                    title="Total Income"
                    value="306$"
                />
                <StatCard
                    icon={<FiBox />}
                    iconBg="bg-green-100 text-green-600"
                    title="Total Products"
                    value="1"
                />
            </div>

            {/* ORDERS */}
            <div className="bg-white rounded-md p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 flex flex-col gap-4">

                        {/* PURPLE CARD */}
                        <div className="bg-purple-50 rounded-md p-6 flex flex-col h-full">
                            <span className="text-3xl font-semibold text-purple-500">3</span>
                            <span className="text-[16px] mt-1">Total Order</span>

                            {/* PUSH BUTTON DOWN */}
                            <button className="mt-auto bg-purple-500 text-white py-3 text-[16px] rounded-md">
                                All Orders
                            </button>
                        </div>

                        {/* PENDING ORDER – OUTSIDE & ALIGNED */}
                        <div className="bg-pink-500 text-white text-[16px] rounded-md px-5 py-6 flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <FiClock /> Pending order
                            </span>
                            <span className="font-semibold">0</span>
                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <OrderCard icon={<FiPackage />} label="Order Placed" value="0" bg="bg-blue-50" color="text-blue-500" />
                        <OrderCard icon={<FiTruck />} label="Order Shipped" value="0" bg="bg-yellow-50" color="text-yellow-500" />
                        <OrderCard icon={<FiCheckCircle />} label="Confirmed Order" value="2" bg="bg-green-50" color="text-green-500" />
                        <OrderCard icon={<FiArchive />} label="Processed Order" value="1" bg="bg-pink-50" color="text-pink-500" />
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
                <p className="text-[16px]">{title}</p>
                <h3 className="text-2xl font-semibold mt-1">{value}</h3>
            </div>
        </div>
    );
}

function OrderCard({ icon, label, value, bg, color }) {
    return (
        <div className={`flex justify-between items-center px-5 py-6 rounded-md ${bg}`}>
            <span className="flex items-center gap-3">
                <span className={color}>{icon}</span>
                {label}
            </span>
            <span className={`font-semibold text-lg ${color}`}>{value}</span>
        </div>
    );
}
