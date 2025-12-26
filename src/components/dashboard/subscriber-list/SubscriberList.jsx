"use client";

import React, { useEffect, useState } from "react";
import { Home, ChevronRight } from "lucide-react";
import DashboardShell from "../DashboardShell";
import Link from "next/link";
import Swal from "sweetalert2";
import api from "@/lib/axios";

const SubscriberList = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(subscribers.length / itemsPerPage);

    const currentSubscribers = subscribers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // FETCH SUBSCRIBERS
    useEffect(() => {
        const fetchSubscribers = async () => {
            try {
                const token = localStorage.getItem("auth_token");

                const res = await api.get(
                    "/api/newsletter/get-all-newsletter/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setSubscribers(res.data || []);
            } catch (error) {
                console.error(error);
                Swal.fire("Error", "Failed to fetch subscribers", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchSubscribers();
    }, []);

    return (
        <DashboardShell>
            <div className="min-h-screen">

                {/* HEADER */}
                <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold">Subscriber List</h1>

                    <div className="flex items-center space-x-2 text-[16px]">
                        <Link href="/" className="hover:text-purple-600">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} />
                        <span>Newsletter</span>
                        <ChevronRight size={14} />
                        <span>Subscribers</span>
                    </div>
                </div>

                {/* MAIN CARD */}
                <div className="bg-white shadow-sm p-6">

                    {loading ? (
                        <div className="text-center py-20 text-gray-500">
                            Loading subscribers...
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-black/10 rounded-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-black uppercase text-[16px] font-bold border-b border-black/10">
                                        <th className="px-4 py-3 border-r border-black/10 w-20 text-center">
                                            SL
                                        </th>
                                        <th className="px-4 py-3 border-r border-black/10">
                                            Email
                                        </th>
                                        <th className="px-4 py-3">
                                            Subscribed At
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentSubscribers.map((subscriber, index) => (
                                        <tr
                                            key={subscriber.id}
                                            className="border-b border-black/10 hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-4 border-r border-black/10 text-center font-bold">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>

                                            <td className="px-4 py-4 border-r border-black/10 text-sm font-medium">
                                                {subscriber.email}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {new Date(subscriber.subscribed_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex justify-end mt-6 space-x-1">
                            <button
                                onClick={() => setCurrentPage((p) => p - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 text-sm rounded ${
                                    currentPage === 1
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-black text-white"
                                }`}
                            >
                                Previous
                            </button>

                            <span className="px-4 py-2 text-sm bg-black text-white rounded">
                                {currentPage}
                            </span>

                            <button
                                onClick={() => setCurrentPage((p) => p + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 text-sm rounded ${
                                    currentPage === totalPages
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-black text-white"
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
};

export default SubscriberList;
