import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiHeart } from 'react-icons/fi';
import AnimatedButton from '../utils/AnimatedButton';
import { getImageUrl } from '../utils/get-image-url';
import { FaHeart } from 'react-icons/fa';


const ProductCard = ({ product }) => {
    const router = useRouter();
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setIsWishlisted(wishlist.some((item) => item.id === product.id));
    }, [product.id]);



    // Helper function to trigger wishlist update events
    const triggerWishlistUpdate = () => {
        // Dispatch custom event for navbar to listen
        const event = new CustomEvent('wishlistUpdated');
        window.dispatchEvent(event);

        // Also dispatch storage event for cross-tab sync
        window.dispatchEvent(new Event('storage'));
    };

    const toggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const token =
            localStorage.getItem("auth_token") ||
            sessionStorage.getItem("auth_token");

        if (!token) {
            router.push("/signin");
            return;
        }

        try {
            const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
            let updatedWishlist;
            let newWishlistStatus;

            if (isWishlisted) {
                // Remove from wishlist
                updatedWishlist = wishlist.filter((item) => item.id !== product.id);
                newWishlistStatus = false;
            } else {
                // Add to wishlist
                // Create product data for wishlist
                const wishlistProduct = {
                    id: product.id,
                    name: product.name,
                    unit_price: product.unit_price,
                    thumbnail_image: product.thumbnail_image,
                    slug: product.slug,
                    addedAt: new Date().toISOString()
                };
                updatedWishlist = [...wishlist, wishlistProduct];
                newWishlistStatus = true;
            }

            // Update localStorage
            localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

            // Update local state
            setIsWishlisted(newWishlistStatus);

            // Trigger events to update navbar counter
            triggerWishlistUpdate();

            // Optional: Show toast notification
            if (newWishlistStatus) {
                console.log('Added to wishlist');
                // You can add a toast notification here
            } else {
                console.log('Removed from wishlist');
                // You can add a toast notification here
            }

        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    // NewBadge component
    const NewBadge = () => (
        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase rounded">
            New
        </div>
    );

    return (
        <div className="flex flex-col overflow-hidden bg-white relative mb-6 group">
            <div className="relative aspect-square w-full bg-gray-100">
                {/* HEART BUTTON */}
                <button
                    onClick={toggleWishlist}
                    className={`absolute top-2 left-2 z-10 p-2 rounded-full 
        ${isWishlisted
                            ? "text-red-500 "
                            : " text-gray-700  hover:text-red-500"
                        }`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    {/* Show filled heart when wishlisted, outline heart otherwise */}
                    {isWishlisted ? (
                        <FaHeart
                            size={20}
                            className="fill-current"
                        />
                    ) : (
                        <FiHeart
                            size={20}
                        />
                    )}

                    {/* Optional: Pulse animation when adding to wishlist */}
                    {isWishlisted && (
                        <span className="absolute inset-0 rounded-full bg-red-500 opacity-0 group-hover:opacity-20 animate-ping"></span>
                    )}
                </button>

                {/* IMAGE - Click goes to product details */}
                <Link
                    href={`/product/${product.slug || product.id}`}
                    className="block w-full h-full"
                >
                    <div className="relative w-full h-full">
                        <Image
                            src={getImageUrl(product.thumbnail_image)}
                            alt={product.name}
                            fill
                            className="object-contain cursor-pointer "
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            priority={false}
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </div>
                </Link>

                {/* New Badge */}
                {product.is_new && <NewBadge />}
            </div>

            {/* Product Info */}
            <div className="p-4 bg-black flex flex-col flex-grow">
                <Link
                    href={`/product/${product.slug || product.id}`}
                    className="hover:opacity-80 transition-opacity"
                >
                    <h3 className="text-xl font-medium text-white line-clamp-2 mb-2">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-2xl font-bold text-white">
                            €{product.unit_price}
                        </p>
                        {product.original_price && product.original_price > product.unit_price && (
                            <p className="text-gray-400 line-through text-sm">
                                €{product.original_price}
                            </p>
                        )}
                    </div>

                    <Link href={`/product/${product.slug || product.id}`}>
                        <AnimatedButton variant="white" className="whitespace-nowrap">
                            Buy Now
                        </AnimatedButton>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;