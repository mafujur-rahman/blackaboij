"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FiHeart } from 'react-icons/fi';
import AnimatedButton from '@/components/utils/AnimatedButton';

// Sample product for design
const mainProduct = {
    id: 1,
    name: "Blackaboij Men's T-Shirt - White Edition",
    price: "€40",
    image: "/images/new.webp",
    isNew: true,
};

// Sample categories
const categories = ['Men', 'Women', 'Accessories'];

// New Badge Component
const NewBadge = () => (
    <div className="absolute right-0 top-0 bg-black px-2 py-1 text-[12px] md:text-[15px] font-semibold uppercase text-[#ffffff]">
        New
    </div>
);

// New Product Card Component
const ProductCard = ({ product }) => (
    <div className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm relative">
        <div className="relative aspect-3/4 w-full bg-gray-100">
            <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
            />

            {/* New Badge */}
            {product.isNew && <NewBadge />}

            {/* Wishlist Heart Icon - Top Left */}
            <button className="absolute top-2 left-2">
                <FiHeart size={20} />
            </button>
        </div>

        {/* Product Info */}
        <div className="p-4 bg-black flex flex-col">
            <h3 className="text-[16px] md:text-[22px] font-bold text-[#ffffff]">{product.name}</h3>
            <div className="mt-2 flex items-center justify-between">
                <p className="text-[12px] md:text-[15px] font-bold text-[#ffffff]">{product.price}</p>
                <AnimatedButton variant="white">Buy Now</AnimatedButton>
            </div>
        </div>
    </div>
);


// Category Tab Component
const CategoryTab = ({ category, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`pb-1 transition-colors ${isActive
                ? 'border-b-2 border-black text-black font-bold'
                : 'text-gray-700 hover:text-black'
            }`}
    >
        {category}
    </button>
);

// Main Component
const HotSale = () => {
    const [activeCategory, setActiveCategory] = useState('Men');

    return (
        <div className="min-h-screen mt-12.5 mb-25">
            <div className="px-4 lg:px-12 xl:container xl:mx-auto xl:px-0">
                <h1 className="text-center text-3xl font-bold text-black">
                    Hot Sale
                </h1>

                {/* Category Tabs */}
                <nav className="mt-8 lg:mt-5">
                    <div className="flex justify-center space-x-6">
                        {categories.map((category) => (
                            <CategoryTab
                                key={category}
                                category={category}
                                isActive={activeCategory === category}
                                onClick={() => setActiveCategory(category)}
                            />
                        ))}
                    </div>
                </nav>

                {/* Product Cards Section */}
                <div className="mt-12 flex flex-wrap justify-start gap-4">
                    {/* First Card */}
                    <div className="w-full sm:w-1/2 lg:w-1/3">
                        <ProductCard product={mainProduct} />
                    </div>

                    {/* Placeholder for Second Card */}
                    <div className="w-full sm:w-1/2 lg:w-1/3">
                        {/* Empty space for now */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotSale;
