import React from "react";
import Image from "next/image";
import { FiHeart } from "react-icons/fi";
import AnimatedButton from "@/components/utils/AnimatedButton";


const WomenTeesArea = () => {
    // Sample products (can be replaced with real data)
    const products = [
        {
            id: 1,
            name: "Blackaboij Men's T-Shirt - White Edition",
            price: "€40",
            image: "/images/new.webp",
            isNew: true,
        },
        // {
        //     id: 2,
        //     name: "Blackaboij Men's T-Shirt - Black Edition",
        //     price: "€45",
        //     image: "/images/new.webp",
        //     isNew: false,
        // },
        
    ];

    // New Badge
    const NewBadge = () => (
        <div className="absolute right-0 top-0 bg-black px-2 py-1 text-[12px] md:text-[15px] font-semibold uppercase text-white">
            New
        </div>
    );

    // Product Card
    const ProductCard = ({ product }) => (
        <div className="relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm">
            {/* Image */}
            <div className="relative aspect-3/4 w-full bg-gray-100">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    priority
                />

                {product.isNew && <NewBadge />}

                {/* Wishlist */}
                <button className="absolute top-2 left-2 z-10 text-white">
                    <FiHeart size={20} />
                </button>
            </div>

            {/* Info */}
            <div className="flex flex-col bg-black p-4">
                <h3 className="text-[16px] md:text-[22px] font-bold text-white">
                    {product.name}
                </h3>

                <div className="mt-2 flex items-center justify-between">
                    <p className="text-[12px] md:text-[15px] font-bold text-white">
                        {product.price}
                    </p>
                    <AnimatedButton variant="white">Buy Now</AnimatedButton>
                </div>
            </div>
        </div>
    );

    return (
        <div className=" my-12.5 ">
            <div className="px-4 lg:px-12 xl:container xl:mx-auto xl:px-0">
                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WomenTeesArea;
