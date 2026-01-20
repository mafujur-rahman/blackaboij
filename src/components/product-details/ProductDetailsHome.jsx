"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";

export default function ProductDetailsHome() {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize state from localStorage or defaults
    const [selectedSizes, setSelectedSizes] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`product_${id}_sizes`);
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [selectedColors, setSelectedColors] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`product_${id}_colors`);
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [quantity, setQuantity] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`product_${id}_quantity`);
            return saved ? parseInt(saved) : 1;
        }
        return 1;
    });

    const [activeImage, setActiveImage] = useState(null);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (product) {
            localStorage.setItem(`product_${id}_sizes`, JSON.stringify(selectedSizes));
            localStorage.setItem(`product_${id}_colors`, JSON.stringify(selectedColors));
            localStorage.setItem(`product_${id}_quantity`, quantity.toString());
        }
    }, [selectedSizes, selectedColors, quantity, id, product]);

    // Clear saved state when leaving the page
    useEffect(() => {
        return () => {
            // Optional: Clear saved state after some time if needed
            // setTimeout(() => {
            //     localStorage.removeItem(`product_${id}_sizes`);
            //     localStorage.removeItem(`product_${id}_colors`);
            //     localStorage.removeItem(`product_${id}_quantity`);
            // }, 10000);
        };
    }, [id]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get("/api/products/get-all-products/");
                const found = res.data?.data?.find(
                    (p) => String(p.id) === String(id)
                );
                console.log(found)
                if (!found) {
                    Swal.fire("Error", "Product not found", "error");
                    return;
                }

                setProduct(found);

                // Set initial active image
                const allImages = getAllImages(found);
                if (allImages.length > 0) {
                    setActiveImage(allImages[0].url);
                }
            } catch {
                Swal.fire("Error", "Failed to load product", "error");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    /* =========================
       GET ALL IMAGES INCLUDING THUMBNAIL
    ========================= */
    const getAllImages = (productData = product) => {
        if (!productData || !productData.images) return [];

        // Map images and mark thumbnail
        return productData.images.map(img => ({
            url: img.image,
            type: img.is_thumbnail ? 'thumbnail' : 'gallery'
        }));
    };


    /* =========================
        SELECTION HANDLERS
    ========================= */
    const handleSizeToggle = (size) => {
        setSelectedSizes(prev => {
            const isSelected = prev.some(s => s.id === size.id);

            if (isSelected) {
                return prev.filter(s => s.id !== size.id);
            } else {
                if (prev.length < quantity) {
                    return [...prev, size];
                } else {
                    Swal.fire({
                        icon: "warning",
                        title: `Select ${quantity} sizes`,
                        text: `You've already selected ${quantity} sizes.`,
                        timer: 1500,
                        showConfirmButton: false,
                        position: 'top-end'
                    });
                    return prev;
                }
            }
        });
    };

    const handleColorToggle = (color) => {
        setSelectedColors(prev => {
            const isSelected = prev.some(c => c.id === color.id);

            if (isSelected) {
                return prev.filter(c => c.id !== color.id);
            } else {
                if (prev.length < quantity) {
                    return [...prev, color];
                } else {
                    Swal.fire({
                        icon: "warning",
                        title: `Select ${quantity} colors`,
                        text: `You've already selected ${quantity} colors.`,
                        timer: 1500,
                        showConfirmButton: false,
                        position: 'top-end'
                    });
                    return prev;
                }
            }
        });
    };

    /* =========================
        QUANTITY HANDLER
    ========================= */
    const handleQuantityChange = (newQuantity) => {
        setQuantity(newQuantity);

        // Trim selections if quantity decreased
        if (newQuantity < selectedSizes.length) {
            setSelectedSizes(prev => prev.slice(0, newQuantity));
        }
        if (newQuantity < selectedColors.length) {
            setSelectedColors(prev => prev.slice(0, newQuantity));
        }
    };

    /* =========================
        VALIDATION
    ========================= */
    const validateSelections = () => {
        if (selectedSizes.length !== quantity || selectedColors.length !== quantity) {
            Swal.fire({
                icon: "warning",
                title: "Complete Selection Required",
                text: `Please select ${quantity} sizes and ${quantity} colors`,
                confirmButtonText: "OK",
                confirmButtonColor: "#000"
            });
            return false;
        }
        return true;
    };

    /* =========================
        ADD TO CART
    ========================= */
    const handleAddToCart = () => {
        if (!validateSelections()) return;

        const cart = JSON.parse(localStorage.getItem("cart_items")) || [];
        const originalPrice = Number(product.original_price);
        const discountPrice = Number(product.discounted_price);
        const hasDiscount = discountPrice < originalPrice;
        const price = hasDiscount ? discountPrice : Number(product.unit_price);
        const allImages = getAllImages();

        // Add each selection as separate item
        for (let i = 0; i < quantity; i++) {
            cart.push({
                id: `${product.id}-${i}-${Date.now()}`,
                product_id: Number(product.id),
                name: product.name,
                price: price,
                original_price: originalPrice,
                discounted_price: discountPrice,
                image: allImages[0]?.url || '',
                quantity: 1,
                size: selectedSizes[i]?.name,
                size_id: Number(selectedSizes[i]?.id),
                color: selectedColors[i]?.name,
                color_id: Number(selectedColors[i]?.id)
            });
        }

        localStorage.setItem("cart_items", JSON.stringify(cart));

        Swal.fire({
            icon: "success",
            title: "Added to Cart",
            text: `${quantity} item(s) added successfully`,
            showConfirmButton: false,
            timer: 1500
        });
    };

    /* =========================
        ORDER NOW
    ========================= */
    const handleOrderNow = () => {
        if (!validateSelections()) return;

        const originalPrice = Number(product.original_price);
        const discountPrice = Number(product.discounted_price);
        const hasDiscount = discountPrice < originalPrice;
        const price = hasDiscount ? discountPrice : Number(product.unit_price);
        const allImages = getAllImages();

        // Create checkout items
        const checkoutItems = [];
        for (let i = 0; i < quantity; i++) {
            checkoutItems.push({
                id: `${product.id}-${i}`,
                product_id: Number(product.id),
                name: product.name,
                price: price,
                original_price: originalPrice,
                discounted_price: discountPrice,
                image: allImages[0]?.url || '',
                quantity: 1,
                size: selectedSizes[i]?.name,
                size_id: Number(selectedSizes[i]?.id),
                color: selectedColors[i]?.name,
                color_id: Number(selectedColors[i]?.id)
            });
        }

        localStorage.setItem("checkout_items", JSON.stringify(checkoutItems));
        router.push("/checkout");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600">Product not found</h2>
                </div>
            </div>
        );
    }

    // Calculate prices
    const originalPrice = Number(product.original_price);
    const discountPrice = Number(product.discounted_price);
    const hasDiscount = discountPrice < originalPrice;
    const price = hasDiscount ? discountPrice : Number(product.unit_price);
    const discountPercentage = hasDiscount
        ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
        : 0;

    const allImages = getAllImages();

    return (
        <div className="px-4 lg:px-16 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* IMAGE SECTION */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-square bg-white  overflow-hidden">
                        {activeImage ? (
                            <Image
                                src={getImageUrl(activeImage)}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <div className="text-gray-300 text-4xl mb-2">📷</div>
                                    <p className="text-gray-400">No image available</p>
                                </div>
                            </div>
                        )}

                        {/* Discount Badge */}
                        {hasDiscount && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                -{discountPercentage}%
                            </div>
                        )}
                    </div>

                    {/* Gallery Thumbnails */}
                    {allImages.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-700">Product Images</h3>
                            <div className="grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${activeImage === img.url
                                            ? "border-black scale-105 shadow-sm"
                                            : "border-black/10 hover:border-gray-400"
                                            }`}
                                    >
                                        <Image
                                            src={getImageUrl(img.url)}
                                            alt={`${product.name} ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 25vw, 10vw"
                                        />
                                        {activeImage === img.url && <div className="absolute inset-0 bg-black/5"></div>}
                                        {img.type === 'thumbnail' && (
                                            <div className="absolute top-1 left-1 bg-black text-white text-xs px-1.5 py-0.5 rounded">
                                                Main
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* DETAILS SECTION */}
                <div className="space-y-6">
                    {/* Product Title & Description */}
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>
                        <div
                            className="mt-3 text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                            style={{
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap'
                            }}
                        />
                    </div>

                    {/* Price Display */}
                    <div className="flex items-center gap-3 pt-2">
                        <span className="text-2xl font-bold text-gray-900">
                            €{price.toFixed(2)}
                        </span>
                        {hasDiscount && (
                            <>
                                <span className="text-lg text-gray-500 line-through">
                                    €{originalPrice.toFixed(2)}
                                </span>
                                <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                                    Save {discountPercentage}%
                                </span>
                            </>
                        )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-black/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-700">Quantity</span>
                            <span className="text-sm text-gray-500">
                                {selectedSizes.length} of {quantity} selected
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center border border-black/10 rounded-full hover:bg-gray-100 transition"
                                    aria-label="Decrease quantity"
                                >
                                    <span className="text-lg">−</span>
                                </button>
                                <span className="w-12 text-center text-xl font-semibold">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center border border-black/10 rounded-full hover:bg-gray-100 transition"
                                    aria-label="Increase quantity"
                                >
                                    <span className="text-lg">+</span>
                                </button>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-semibold">
                                    €{(price * quantity).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500">Total</div>
                            </div>
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                                Select {quantity} Size{quantity > 1 ? 's' : ''}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedSizes.length}/{quantity}
                            </span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {product.sizes?.map((size) => {
                                const isSelected = selectedSizes.some(s => s.id === size.id);
                                const selectionIndex = selectedSizes.findIndex(s => s.id === size.id);
                                const isDisabled = selectedSizes.length >= quantity && !isSelected;

                                return (
                                    <button
                                        key={size.id}
                                        onClick={() => handleSizeToggle(size)}
                                        disabled={isDisabled}
                                        className={`relative py-3 border rounded-md transition-all ${isSelected
                                            ? 'bg-black text-white border-black shadow-sm'
                                            : isDisabled
                                                ? 'bg-gray-100 text-gray-400 border-black/10 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-black/10 hover:border-black hover:bg-gray-50'
                                            }`}
                                    >
                                        {size.name}
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white text-xs rounded-full flex items-center justify-center">
                                                {selectionIndex + 1}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                                Select {quantity} Color{quantity > 1 ? 's' : ''}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedColors.length}/{quantity}
                            </span>
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-5 xl:grid-cols-8 gap-3">
                            {product.colors?.map((color) => {
                                const isSelected = selectedColors.some(c => c.id === color.id);
                                const selectionIndex = selectedColors.findIndex(c => c.id === color.id);
                                const isDisabled = selectedColors.length >= quantity && !isSelected;
                                const colorValue = color.code || color.hex_code;

                                return (
                                    <button
                                        key={color.id}
                                        onClick={() => handleColorToggle(color)}
                                        disabled={isDisabled}
                                        className="group relative flex flex-col items-center"
                                        title={color.name}
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${isSelected
                                                ? 'border-black scale-110'
                                                : isDisabled
                                                    ? 'border-black/10 opacity-40'
                                                    : 'border-black/10 group-hover:scale-105 group-hover:border-gray-400'
                                                }`}
                                            style={{ backgroundColor: colorValue }}
                                        >
                                            {isSelected && (
                                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-bold text-black">
                                                        {selectionIndex + 1}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-1 text-xs text-center truncate text-gray-600">
                                            {color.name}
                                        </div>
                                    </button>

                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Items Summary - Only show when selections exist */}
                    {(selectedSizes.length > 0 || selectedColors.length > 0) && (
                        <div className="bg-gray-50 border border-black/10 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                <span className="font-medium text-gray-700">Your Selections</span>
                            </div>
                            <div className="space-y-2">
                                {Array.from({ length: Math.max(selectedSizes.length, selectedColors.length) }).map((_, index) => {
                                    const size = selectedSizes[index];
                                    const color = selectedColors[index];

                                    return (
                                        <div key={index} className="flex items-center justify-between bg-white rounded p-3 border border-black/10">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-500">Item {index + 1}</span>
                                                {size && (
                                                    <span className="px-3 py-1 bg-gray-100 rounded text-sm border border-black/10">
                                                        <span className="font-medium">{size.name}</span>
                                                    </span>
                                                )}
                                                {color && (
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-black/10"
                                                            style={{ backgroundColor: color.code || color.hex || color.name.toLowerCase() }}
                                                        ></div>
                                                        <span className="text-sm">
                                                            <span className="font-medium">{color.name}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {size && color && (
                                                <span className="font-medium">€{price.toFixed(2)}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className=" bottom-0 bg-white pt-4 pb-6 lg:pb-0 lg:pt-8 border-t border-black/10 lg:border-t-0">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={selectedSizes.length !== quantity || selectedColors.length !== quantity}
                                className={`flex-1 py-4 rounded-lg transition ${selectedSizes.length !== quantity || selectedColors.length !== quantity
                                    ? 'bg-gray-100 text-gray-400 border border-black/10 cursor-not-allowed'
                                    : 'bg-black text-white  border border-black'
                                    }`}
                            >
                                <div className="font-medium">Add to Cart</div>
                                <div className="text-sm opacity-90">
                                    {quantity} item{quantity > 1 ? 's' : ''} • €{(price * quantity).toFixed(2)}
                                </div>
                            </button>

                            <button
                                onClick={handleOrderNow}
                                disabled={selectedSizes.length !== quantity || selectedColors.length !== quantity}
                                className={`flex-1 py-4 rounded-lg transition ${selectedSizes.length !== quantity || selectedColors.length !== quantity
                                    ? 'bg-gray-100 text-gray-400 border border-black/10 cursor-not-allowed'
                                    : 'bg-black text-white  border border-black'
                                    }`}
                            >
                                <div className="font-medium">Buy Now</div>
                                <div className="text-sm opacity-90">
                                    Secure checkout
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}