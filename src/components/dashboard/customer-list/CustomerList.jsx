"use client"
import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import DashboardShell from '../DashboardShell';
import Image from 'next/image';
import Link from 'next/link';

const CustomerList = () => {
    const customers = [
        {
            id: 1,
            sl: 1,
            name: "John Doe",
            image: "/images/new.webp",
            email: "john@example.com",
            phone: "+123456789",
            orders: 5,
        },
        {
            id: 2,
            sl: 2,
            name: "Jane Smith",
            image: "/images/new.webp",
            email: "jane@example.com",
            phone: "+987654321",
            orders: 3,
        },
        {
            id: 3,
            sl: 3,
            name: "Mike Johnson",
            image: "/images/new.webp",
            email: "mike@example.com",
            phone: "+192837465",
            orders: 8,
        },
    ];

    return (
        <DashboardShell>
            <div className="min-h-screen">
                {/* Header Section */}
                <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold">Customer List</h1>
                    <div className="flex items-center space-x-2 text-[16px]">
                        {/* Home navigation */}
                        <Link href="/" className="flex items-center space-x-1 hover:text-purple-600">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} />
                        <Link href="/customer-list" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>All User</span>
                        </Link>

                        <ChevronRight size={14} />
                        <Link href="/customer-list" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Customer List</span>
                        </Link>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white shadow-sm p-6 overflow-x-auto border border-black/10 rounded-sm">
                    <table className="w-full text-left border-collapse border-l border-r border-black/10">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 uppercase text-[16px] font-bold border-b border-black/10">
                                <th className="px-4 py-3 w-16 text-center text-black border-r border-black/10">SL</th>
                                <th className="px-4 py-3 border-r border-black/10">Name</th>
                                <th className="px-4 py-3 border-r border-black/10">Email</th>
                                <th className="px-4 py-3 border-r border-black/10">Phone</th>
                                <th className="px-4 py-3 w-24 text-center">Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id} className="border-b border-black/10 hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4 border-r border-black/10 text-center font-bold text-slate-700">{customer.sl}</td>
                                    <td className="px-4 py-4 border-r border-black/10">
                                        <div className="flex items-center space-x-3">
                                            <Image
                                                src={customer.image}
                                                alt={customer.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full border border-black/10 object-cover"
                                            />
                                            <span className="text-sm font-medium">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 border-r border-black/10 text-sm text-slate-700">{customer.email}</td>
                                    <td className="px-4 py-4 border-r border-black/10 text-sm text-slate-700">{customer.phone}</td>
                                    <td className="px-4 py-4 text-center font-medium">{customer.orders}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardShell>
    );
};

export default CustomerList;
