"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductDetailsHome() {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // For both product types
    const [selectedSizes, setSelectedSizes] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`product_${id}_sizes`);
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

    // For regular products
    const [selectedColors, setSelectedColors] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`product_${id}_colors`);
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    // For design products
    const [selectedColorId, setSelectedColorId] = useState(null);
    const [selectedDesignId, setSelectedDesignId] = useState(null);
    const [selectedBackImageIndex, setSelectedBackImageIndex] = useState(0);
    const [availableBackImages, setAvailableBackImages] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [imageType, setImageType] = useState('front'); // 'front' or 'back'

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (product) {
            localStorage.setItem(`product_${id}_sizes`, JSON.stringify(selectedSizes));
            localStorage.setItem(`product_${id}_quantity`, quantity.toString());
            if (!product.is_design) {
                localStorage.setItem(`product_${id}_colors`, JSON.stringify(selectedColors));
            }
        }
    }, [selectedSizes, selectedColors, quantity, id, product]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get("/api/products/get-all-products/");
                const found = res.data?.data?.find(
                    (p) => String(p.id) === String(id)
                );
                
                if (!found) {
                    Swal.fire("Error", "Product not found", "error");
                    return;
                }

                setProduct(found);

                if (found.is_design) {
                    // Set first color as default if available
                    if (found.product_colors && found.product_colors.length > 0) {
                        const firstColor = found.product_colors[0];
                        setSelectedColorId(firstColor.color);
                        
                        // Set default design (first design with is_default: true, or first design)
                        const defaultDesign = found.designs?.find(d => d.is_default) || found.designs?.[0];
                        if (defaultDesign) {
                            setSelectedDesignId(defaultDesign.id);
                        }
                        
                        // Set initial main image as front image
                        if (firstColor.front_image?.image) {
                            setMainImage(firstColor.front_image.image);
                            setImageType('front');
                        }
                    }
                } else {
                    // For regular products, set initial active image
                    const allImages = getAllImages(found);
                    if (allImages.length > 0) {
                        setMainImage(allImages[0].url);
                    }
                }
            } catch {
                Swal.fire("Error", "Failed to load product", "error");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    // Update available back images when color or design changes
    useEffect(() => {
        if (product?.is_design && selectedColorId && selectedDesignId) {
            const productColor = product.product_colors?.find(pc => pc.color === selectedColorId);
            if (productColor) {
                const backDesignsForSelectedDesign = productColor.back_designs?.filter(bd => bd.design === selectedDesignId);
                setAvailableBackImages(backDesignsForSelectedDesign || []);
                setSelectedBackImageIndex(0);
            } else {
                setAvailableBackImages([]);
            }
        }
    }, [product, selectedColorId, selectedDesignId]);

    // Update main image when back image index changes
    useEffect(() => {
        if (product?.is_design && imageType === 'back' && availableBackImages.length > 0) {
            setMainImage(availableBackImages[selectedBackImageIndex]?.image);
        }
    }, [selectedBackImageIndex, availableBackImages, product, imageType]);

    /* =========================
       GET ALL IMAGES INCLUDING THUMBNAIL (for regular products)
    ========================= */
    const getAllImages = (productData = product) => {
        if (!productData || !productData.images) return [];

        return productData.images.map(img => ({
            url: img.image,
            type: img.is_thumbnail ? 'thumbnail' : 'gallery'
        }));
    };

    /* =========================
       FOR DESIGN PRODUCTS: Get front images for all colors
    ========================= */
    const getDesignFrontImages = () => {
        if (!product?.is_design || !product.product_colors) return [];
        
        return product.product_colors.map(pc => ({
            colorId: pc.color,
            colorName: pc.color_name,
            hexCode: pc.hex_code,
            frontImage: pc.front_image?.image,
            isSelected: pc.color === selectedColorId
        }));
    };

    /* =========================
       FOR DESIGN PRODUCTS: Get back images for selected color
    ========================= */
    const getBackImagesForSelectedColor = () => {
        if (!product?.is_design || !selectedColorId) return [];
        
        const productColor = product.product_colors?.find(pc => pc.color === selectedColorId);
        if (!productColor) return [];
        
        // Group back images by design
        const imagesByDesign = {};
        productColor.back_designs?.forEach(bd => {
            if (!imagesByDesign[bd.design]) {
                imagesByDesign[bd.design] = [];
            }
            imagesByDesign[bd.design].push({
                id: bd.id,
                image: bd.image,
                designName: bd.design_name,
                isDefault: bd.is_default
            });
        });
        
        return imagesByDesign;
    };

    /* =========================
       FOR DESIGN PRODUCTS: Get all images for selected color (front + back)
    ========================= */
    const getAllImagesForSelectedColor = () => {
        if (!product?.is_design || !selectedColorId) return [];
        
        const productColor = product.product_colors?.find(pc => pc.color === selectedColorId);
        if (!productColor) return [];
        
        const images = [];
        
        // Add front image
        if (productColor.front_image?.image) {
            images.push({
                id: 'front',
                image: productColor.front_image.image,
                type: 'front',
                label: 'Front View',
                isActive: imageType === 'front'
            });
        }
        
        // Add back images
        productColor.back_designs?.forEach(bd => {
            images.push({
                id: bd.id,
                image: bd.image,
                type: 'back',
                label: bd.design_name,
                designId: bd.design,
                isActive: imageType === 'back' && bd.design === selectedDesignId && 
                          availableBackImages[selectedBackImageIndex]?.id === bd.id
            });
        });
        
        return images;
    };

    /* =========================
       FOR REGULAR PRODUCTS: Selection Handlers
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
        if (!product?.is_design && newQuantity < selectedColors.length) {
            setSelectedColors(prev => prev.slice(0, newQuantity));
        }
    };

    /* =========================
        VALIDATION
    ========================= */
    const validateSelections = () => {
        if (product?.is_design) {
            // For design products: need color, design, and size
            if (!selectedColorId) {
                Swal.fire({
                    icon: "warning",
                    title: "Select a Color",
                    text: "Please select a color to continue",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#000"
                });
                return false;
            }
            
            if (!selectedDesignId) {
                Swal.fire({
                    icon: "warning",
                    title: "Select a Design",
                    text: "Please select a design to continue",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#000"
                });
                return false;
            }
            
            if (selectedSizes.length !== quantity) {
                Swal.fire({
                    icon: "warning",
                    title: "Select Size(s)",
                    text: `Please select ${quantity} size${quantity > 1 ? 's' : ''}`,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#000"
                });
                return false;
            }
            
            return true;
        } else {
            // For regular products
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
        }
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

        if (product.is_design) {
            // For design products
            const productColor = product.product_colors?.find(pc => pc.color === selectedColorId);
            const selectedBackImage = availableBackImages[selectedBackImageIndex];
            const selectedDesign = product.designs?.find(d => d.id === selectedDesignId);
            
            for (let i = 0; i < quantity; i++) {
                const size = selectedSizes[i];
                cart.push({
                    id: `${product.id}-${selectedColorId}-${selectedDesignId}-${i}-${Date.now()}`,
                    product_id: Number(product.id),
                    name: product.name,
                    price: price,
                    original_price: originalPrice,
                    discounted_price: discountPrice,
                    front_image: productColor?.front_image?.image || '',
                    back_image: selectedBackImage?.image || '',
                    design_id: selectedDesignId,
                    design_name: selectedDesign?.name || '',
                    quantity: 1,
                    size: size?.name,
                    size_id: Number(size?.id),
                    color_id: Number(selectedColorId),
                    color_name: productColor?.color_name || '',
                    hex_code: productColor?.hex_code || '',
                    is_design: true
                });
            }
        } else {
            // For regular products
            const allImages = getAllImages();
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
                    color_id: Number(selectedColors[i]?.id),
                    is_design: false
                });
            }
        }

        localStorage.setItem("cart_items", JSON.stringify(cart));

        Swal.fire({
            icon: "success",
            title: "Added to Cart",
            text: product.is_design ? `${quantity} design item(s) added to cart` : `${quantity} item(s) added successfully`,
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

        if (product.is_design) {
            // For design products
            const productColor = product.product_colors?.find(pc => pc.color === selectedColorId);
            const selectedBackImage = availableBackImages[selectedBackImageIndex];
            const selectedDesign = product.designs?.find(d => d.id === selectedDesignId);
            
            const checkoutItems = selectedSizes.map((size, index) => ({
                id: `${product.id}-${selectedColorId}-${selectedDesignId}-${index}`,
                product_id: Number(product.id),
                name: product.name,
                price: price,
                original_price: originalPrice,
                discounted_price: discountPrice,
                front_image: productColor?.front_image?.image || '',
                back_image: selectedBackImage?.image || '',
                design_id: selectedDesignId,
                design_name: selectedDesign?.name || '',
                quantity: 1,
                size: size?.name,
                size_id: Number(size?.id),
                color_id: Number(selectedColorId),
                color_name: productColor?.color_name || '',
                hex_code: productColor?.hex_code || '',
                is_design: true
            }));

            localStorage.setItem("checkout_items", JSON.stringify(checkoutItems));
        } else {
            // For regular products
            const allImages = getAllImages();
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
                    color_id: Number(selectedColors[i]?.id),
                    is_design: false
                });
            }
            localStorage.setItem("checkout_items", JSON.stringify(checkoutItems));
        }

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
    const allColorImages = getAllImagesForSelectedColor();

    return (
        <div className="px-4 lg:px-16 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* IMAGE SECTION */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-square bg-white overflow-hidden">
                        {mainImage ? (
                            <Image
                                src={getImageUrl(mainImage)}
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

                        {/* Image Type Badge */}
                        {product.is_design && selectedColorId && (
                            <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {imageType === 'front' ? 'Front View' : 'Back Design'}
                            </div>
                        )}

                        {/* Discount Badge */}
                        {hasDiscount && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                -{discountPercentage}%
                            </div>
                        )}
                    </div>

                    {/* Gallery Thumbnails */}
                    {product.is_design ? (
                        // Front + Back images gallery for design products
                        allColorImages.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-gray-700">Product Images</h3>
                                    <div className="text-sm text-gray-500">
                                        {allColorImages.findIndex(img => img.isActive) + 1} of {allColorImages.length}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
                                    {allColorImages.map((img, index) => {
                                        const isActive = img.isActive;
                                        const isBackImage = img.type === 'back';
                                        const isCurrentDesign = isBackImage && img.designId === selectedDesignId;
                                        
                                        return (
                                            <button
                                                key={img.id}
                                                onClick={() => {
                                                    if (img.type === 'front') {
                                                        setImageType('front');
                                                        setMainImage(img.image);
                                                    } else {
                                                        setImageType('back');
                                                        setSelectedDesignId(img.designId);
                                                        
                                                        // Find the index of this back image in availableBackImages
                                                        const backImageIndex = availableBackImages.findIndex(bi => bi.id === img.id);
                                                        if (backImageIndex !== -1) {
                                                            setSelectedBackImageIndex(backImageIndex);
                                                        }
                                                        
                                                        setMainImage(img.image);
                                                    }
                                                }}
                                                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${isActive
                                                    ? "border-black scale-105 shadow-sm"
                                                    : isBackImage && isCurrentDesign
                                                        ? "border-gray-500 hover:border-gray-600"
                                                        : "border-black/10 hover:border-gray-400"
                                                    }`}
                                            >
                                                <Image
                                                    src={getImageUrl(img.image)}
                                                    alt={img.label}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 25vw, 10vw"
                                                />
                                                {isActive && <div className="absolute inset-0 bg-black/5"></div>}
                                                {isBackImage && isCurrentDesign && !isActive && (
                                                    <div className="absolute inset-0 bg-gray-500/10"></div>
                                                )}
                                                
                                                {/* Image Type Label */}
                                                <div className={`absolute bottom-0 left-0 right-0 text-white text-xs py-1 px-2 truncate ${img.type === 'front' ? 'bg-gray-600/80' : 'bg-gray-600/80'}`}>
                                                    {img.label}
                                                </div>
                                                
                                                {/* Front/Back Indicator */}
                                                <div className={`absolute top-1 left-1 text-white text-xs px-1.5 py-0.5 rounded ${img.type === 'front' ? 'bg-gray-500' : 'bg-gray-500'}`}>
                                                    {img.type === 'front' ? 'F' : 'B'}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                {/* Navigation Controls */}
                                {imageType === 'back' && availableBackImages.length > 1 && (
                                    <div className="flex justify-center items-center gap-4 pt-2">
                                        <button
                                            onClick={() => {
                                                setSelectedBackImageIndex(prev => 
                                                    prev > 0 ? prev - 1 : availableBackImages.length - 1
                                                );
                                            }}
                                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            {selectedBackImageIndex + 1} of {availableBackImages.length} back images
                                        </span>
                                        <button
                                            onClick={() => {
                                                setSelectedBackImageIndex(prev => 
                                                    prev < availableBackImages.length - 1 ? prev + 1 : 0
                                                );
                                            }}
                                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : selectedColorId ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                                <p className="text-gray-500">No images available for selected color</p>
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                                <p className="text-gray-500">Select a color to view images</p>
                            </div>
                        )
                    ) : allImages.length > 0 && (
                        // Regular product gallery
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-700">Product Images</h3>
                            <div className="grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setMainImage(img.url)}
                                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${mainImage === img.url
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
                                        {mainImage === img.url && <div className="absolute inset-0 bg-black/5"></div>}
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
                        <div className="mt-2 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.is_design ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                                {product.is_design ? 'Design Product' : 'Regular Product'}
                            </span>
                        </div>
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

                    {/* Quantity Selector - For both product types */}
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

                    {product.is_design ? (
                        // FOR DESIGN PRODUCTS
                        <>
                            {/* Color Selection */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">
                                        Select Color
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-5 xl:grid-cols-8 gap-3">
                                    {getDesignFrontImages().map((colorData) => (
                                        <button
                                            key={colorData.colorId}
                                            onClick={() => {
                                                setSelectedColorId(colorData.colorId);
                                                // Show front image when color is selected
                                                if (colorData.frontImage) {
                                                    setMainImage(colorData.frontImage);
                                                    setImageType('front');
                                                }
                                            }}
                                            className="group relative flex flex-col items-center"
                                            title={colorData.colorName}
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${colorData.isSelected
                                                    ? 'border-black scale-110'
                                                    : 'border-black/10 group-hover:scale-105 group-hover:border-gray-400'
                                                    }`}
                                                style={{ backgroundColor: colorData.hexCode || '#cccccc' }}
                                            >
                                                {colorData.isSelected && (
                                                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-bold text-black">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-1 text-xs text-center truncate text-gray-600">
                                                {colorData.colorName}
                                            </div>
                                        </button>
                                    ))}
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

                            {/* Design Selection - Right Side Panel */}
                            {selectedColorId && product.designs && product.designs.length > 0 && (
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-medium text-gray-700">
                                            Select Back Design
                                        </span>
                                        {selectedDesignId && (
                                            <div className="text-sm text-gray-600">
                                                {availableBackImages.length} image{availableBackImages.length !== 1 ? 's' : ''} available
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {product.designs.map((design) => {
                                            const backImagesForDesign = getBackImagesForSelectedColor()[design.id] || [];
                                            const hasImages = backImagesForDesign.length > 0;
                                            const isSelected = selectedDesignId === design.id;
                                            
                                            return (
                                                <div 
                                                    key={design.id}
                                                    onClick={() => {
                                                        if (hasImages) {
                                                            setSelectedDesignId(design.id);
                                                            setSelectedBackImageIndex(0);
                                                            setImageType('back');
                                                            setMainImage(backImagesForDesign[0].image);
                                                        }
                                                    }}
                                                    className={`cursor-pointer border rounded-lg p-4 transition-all ${isSelected 
                                                        ? 'border-black bg-gray-50 ring-1 ring-gray-300' 
                                                        : hasImages 
                                                            ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50' 
                                                            : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {hasImages ? (
                                                            <div className="relative w-16 h-16 flex-shrink-0">
                                                                <Image
                                                                    src={getImageUrl(backImagesForDesign[0].image)}
                                                                    alt={design.name}
                                                                    fill
                                                                    className="object-cover rounded"
                                                                    sizes="64px"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
                                                                <span className="text-gray-400 text-xs">No images</span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium text-gray-900">
                                                                    {design.name}
                                                                </h4>
                                                                {design.is_default && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {hasImages 
                                                                    ? `${backImagesForDesign.length} image${backImagesForDesign.length !== 1 ? 's' : ''} available`
                                                                    : 'No images available'
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // FOR REGULAR PRODUCTS
                        <>
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
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="bottom-0 bg-white pt-4 pb-6 lg:pb-0 lg:pt-8 border-t border-black/10 lg:border-t-0">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.is_design 
                                    ? !selectedColorId || !selectedDesignId || selectedSizes.length !== quantity
                                    : selectedSizes.length !== quantity || selectedColors.length !== quantity
                                }
                                className={`flex-1 py-4 rounded-lg transition cursor-pointer ${product.is_design 
                                    ? !selectedColorId || !selectedDesignId || selectedSizes.length !== quantity
                                        ? 'bg-gray-100 text-gray-400 border border-black/10 cursor-not-allowed'
                                        : 'bg-black text-white border border-black'
                                    : selectedSizes.length !== quantity || selectedColors.length !== quantity
                                        ? 'bg-gray-100 text-gray-400 border border-black/10 cursor-not-allowed'
                                        : 'bg-black text-white border border-black'
                                    }`}
                            >
                                <div className="font-medium">Add to Cart</div>
                                <div className="text-sm opacity-90">
                                    {quantity} item{quantity > 1 ? 's' : ''} • €{(price * quantity).toFixed(2)}
                                </div>
                            </button>

                            <button
                                onClick={handleOrderNow}
                                disabled={product.is_design 
                                    ? !selectedColorId || !selectedDesignId || selectedSizes.length !== quantity
                                    : selectedSizes.length !== quantity || selectedColors.length !== quantity
                                }
                                className={`flex-1 py-4 rounded-lg transition cursor-pointer ${product.is_design 
                                    ? !selectedColorId || !selectedDesignId || selectedSizes.length !== quantity
                                        ? 'bg-gray-100 text-gray-400 border border-black/10 cursor-not-allowed'
                                        : 'bg-black text-white border border-black'
                                    : selectedSizes.length !== quantity || selectedColors.length !== quantity
                                        ? 'bg-gray-100 text-gray-400 border border-black/10 cursor-not-allowed'
                                        : 'bg-black text-white border border-black'
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