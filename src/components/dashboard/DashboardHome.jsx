"use client";

import { useEffect, useState } from "react";
import {
    FiShoppingBag,
    FiDollarSign,
    FiBox,
    FiPackage,
    FiTruck,
    FiCheckCircle,
    FiArchive,
    FiClock
} from "react-icons/fi";
import DashboardShell from "./DashboardShell";
import api from "@/lib/axios";

export default function DashboardHome() {
    const [orders, setOrders] = useState([]);
    const [productsCount, setProductsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    /* FETCH ALL ORDERS WITHOUT TOKEN */
    const fetchOrders = async () => {
        try {
            const res = await api.get("/api/orders/get-all-orders/"); // No token
            setOrders(res.data?.data || []);
        } catch (error) {
            console.error("Failed to load orders", error.response || error.message);
        } finally {
            setLoading(false);
        }
    };

    /* FETCH ALL PRODUCTS WITHOUT TOKEN */
    const fetchProducts = async () => {
        try {
            const res = await api.get("/api/products/get-all-products/");
            setProductsCount(res.data?.data?.length || 0);
        } catch (error) {
            console.error("Failed to load products", error);
        }
    };

    /* CALCULATIONS */
    const totalOrders = orders.length;

    // Treat orders with no status or empty status as "pending"
    const pendingOrders = orders.filter(o => !o.status || o.status === "pending").length;
    const confirmedOrders = orders.filter(o => o.status === "confirmed").length;
    const shippedOrders = orders.filter(o => o.status === "shipped").length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length;

    const totalIncome = orders
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);


    return (
        <DashboardShell>
            <div className="bg-white rounded-md px-6 py-4 mb-6">
                <h2 className="font-semibold text-lg text-black">Dashboard</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={<FiShoppingBag />}
                    iconBg="bg-gray-200 text-black"
                    title="Total Orders"
                    value={totalOrders}
                />
                <StatCard
                    icon={<FiDollarSign />}
                    iconBg="bg-gray-200 text-black"
                    title="Total Income"
                    value={`$${totalIncome}`}
                />
                <StatCard
                    icon={<FiBox />}
                    iconBg="bg-gray-200 text-black"
                    title="Total Products"
                    value={productsCount}
                />
            </div>

            <div className="bg-white rounded-md p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="bg-gray-100 rounded-md p-6 flex flex-col h-full">
                            <span className="text-3xl font-semibold text-black">{totalOrders}</span>
                            <span className="text-[16px] mt-1 text-black">Total Orders</span>
                            <button className="mt-auto bg-black text-white py-3 text-[16px] rounded-md">All Orders</button>
                        </div>

                        <div className="bg-gray-300 text-black text-[16px] rounded-md px-5 py-6 flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <FiClock /> Pending Orders
                            </span>
                            <span className="font-semibold">{pendingOrders}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <OrderCard icon={<FiCheckCircle />} label="Confirmed Orders" value={confirmedOrders} />
                        <OrderCard icon={<FiTruck />} label="Shipped Orders" value={shippedOrders} />
                        <OrderCard icon={<FiPackage />} label="Delivered Orders" value={deliveredOrders} />
                        <OrderCard icon={<FiArchive />} label="Cancelled Orders" value={cancelledOrders} />
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

function StatCard({ icon, iconBg, title, value }) {
    return (
        <div className="bg-white rounded-md p-6 flex items-center gap-4">
            <div className={`w-14 h-16 flex items-center justify-center rounded-md ${iconBg}`}>{icon}</div>
            <div>
                <p className="text-[16px] text-black">{title}</p>
                <h3 className="text-2xl font-semibold mt-1 text-black">{value}</h3>
            </div>
        </div>
    );
}

function OrderCard({ icon, label, value }) {
    return (
        <div className="flex justify-between items-center px-5 py-6 rounded-md bg-gray-100">
            <span className="flex items-center gap-3 text-black">{icon}{label}</span>
            <span className="font-semibold text-lg text-black">{value}</span>
        </div>
    );
}
