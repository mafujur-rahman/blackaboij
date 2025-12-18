"use client"
import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import DashboardShell from '../DashboardShell';
import Link from 'next/link';

const Category = () => {


    return (
        <DashboardShell>
            <div className="min-h-screen">
                {/* Header Section */}
                <div className="bg-white rounded-md px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
                    <h1 className="text-xl font-bold">Category</h1>
                    <div className="flex items-center space-x-2 text-[16px]">
                        {/* Home navigation */}
                        <Link href="/" className="flex items-center space-x-1 hover:text-purple-600">
                            <Home size={16} />
                        </Link>
                        <ChevronRight size={14} />
                        <Link href="/category" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Products</span>
                        </Link>

                        <ChevronRight size={14} />
                        <Link href="/category" className="flex items-center space-x-1 hover:text-purple-600">
                            <span>Category</span>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Category List Section */}
                    <div className="bg-white shadow-sm p-4 border border-black/10 rounded-sm w-full lg:w-1/4">
                        <h2 className="text-2xl font-bold mb-4">Categories</h2>
                        <ul className="space-y-2 text-lg text-slate-700">
                            <li className="font-medium">1. Men
                                <ul className="ml-4 list-disc">
                                    <li>TEES</li>
                                    <li>HOODIES AND SWEATERS</li>
                                    <li>PANTS</li>
                                    <li>OUTWEAR</li>
                                    <li>SHOES</li>
                                </ul>
                            </li>
                            <li className="font-medium mt-2">2. Women
                                <ul className="ml-4 list-disc">
                                    <li>TEES</li>
                                    <li>HOODIES AND SWEATERS</li>
                                    <li>PANTS</li>
                                    <li>OUTWEAR</li>
                                    <li>SHOES</li>
                                </ul>
                            </li>
                            <li className="font-medium mt-2">3. ACCESSORIES
                                <ul className="ml-4 list-disc">
                                    <li>Men - ACCESSORIES</li>
                                    <li>Women - ACCESSORIES</li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    {/* Category Table Section */}
                    <div className="flex-1 bg-white shadow-sm p-6 overflow-x-auto border border-black/10 rounded-sm">
                        <table className="w-full text-left border-collapse border-l border-r border-black/10">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 uppercase text-[16px] font-bold border-b border-black/10">
                                    <th className="px-4 py-3 w-16 text-center text-black border-r border-black/10">SL</th>
                                    <th className="px-4 py-3 border-r border-black/10">Category</th>
                                    <th className="px-4 py-3 border-r border-black/10">Parent Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { sl: 1, name: 'Men', parent: 'Parent Category' },
                                    { sl: -1, name: 'TEES', parent: 'Men' },
                                    { sl: -2, name: 'HOODIES AND SWEATERS', parent: 'Men' },
                                    { sl: -3, name: 'PANTS', parent: 'Men' },
                                    { sl: -4, name: 'OUTWEAR', parent: 'Men' },
                                    { sl: -5, name: 'SHOES', parent: 'Men' },
                                    { sl: 2, name: 'Women', parent: 'Parent Category' },
                                    { sl: -6, name: 'TEES', parent: 'Women' },
                                    { sl: -7, name: 'HOODIES AND SWEATERS', parent: 'Women' },
                                    { sl: -8, name: 'PANTS', parent: 'Women' },
                                    { sl: -9, name: 'OUTWEAR', parent: 'Women' },
                                    { sl: -10, name: 'SHOES', parent: 'Women' },
                                    { sl: 3, name: 'ACCESSORIES', parent: 'Parent Category' },
                                    { sl: -11, name: 'Men - ACCESSORIES', parent: 'ACCESSORIES' },
                                    { sl: -12, name: 'Women - ACCESSORIES', parent: 'ACCESSORIES' },
                                ].map((cat) => (
                                    <tr key={cat.sl} className="border-b border-black/10 hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-4 border-r border-black/10 text-center font-bold text-slate-700">{cat.sl}</td>
                                        <td className="px-4 py-4 border-r border-black/10 text-sm text-slate-700">{cat.name}</td>
                                        <td className="px-4 py-4 border-r border-black/10 text-sm text-slate-700">{cat.parent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>
        </DashboardShell>
    );
};

export default Category;
