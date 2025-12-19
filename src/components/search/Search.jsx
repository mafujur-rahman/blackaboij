"use client"; // must be first
export const dynamic = "force-dynamic"; // prevent prerendering

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// TEMP: Replace with API data later
const PRODUCTS = [
    { id: 1, name: "Men Black Hoodie", category: "men", image: "/images/products/hoodie.jpg", price: 2999 },
    { id: 2, name: "Women White Tee", category: "women", image: "/images/products/tee.jpg", price: 1499 },
    { id: 3, name: "Men Sneakers", category: "men", image: "/images/products/shoes.jpg", price: 4599 },
    { id: 4, name: "Women Jacket", category: "women", image: "/images/products/jacket.jpg", price: 5599 },
];

export default function SearchHome() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q")?.toLowerCase() || "";

    const results = PRODUCTS.filter((product) =>
        product.name.toLowerCase().includes(query)
    );

    return (
        <div className="px-4 md:px-12 py-10">
            {/* HEADER */}
            <h1 className="text-2xl font-semibold mb-2">
                Search results for{" "}
                <span className="text-gray-500">“{query}”</span>
            </h1>

            <p className="text-gray-500 mb-8">
                {results.length} product{results.length !== 1 && "s"} found
            </p>

            {/* NO RESULTS */}
            {results.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    No products found. Try a different keyword.
                </div>
            )}

            {/* RESULTS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {results.map((product) => (
                    <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="group"
                    >
                        <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        <div className="mt-3">
                            <h3 className="text-sm font-medium">
                                {product.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                 {product.price}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
