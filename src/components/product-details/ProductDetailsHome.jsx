"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import { getImageUrl } from "@/components/utils/get-image-url";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/card/ProductCard";

export default function ProductDetailsHome() {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allProducts, setAllProducts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(true);

    // Single selection model (matches the reference design — one size, one color)
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null); // regular products only

    // Design products
    const [selectedColorId, setSelectedColorId] = useState(null);
    const [selectedDesignId, setSelectedDesignId] = useState(null);
    const [selectedBackImageIndex, setSelectedBackImageIndex] = useState(0);
    const [availableBackImages, setAvailableBackImages] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [imageType, setImageType] = useState('front'); // 'front' or 'back'

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get("/api/products/get-all-products/");
                const allData = res.data?.data || [];
                setAllProducts(allData);
                
                const found = allData.find(
                    (p) => String(p.id) === String(id)
                );

                if (!found) {
                    Swal.fire("Error", "Product not found", "error");
                    return;
                }

                setProduct(found);

                // Fetch related products from the same category parent (men/women/accessories)
                if (found.category?.parent_name) {
                    const related = allData.filter(
                        (p) => 
                            p.category?.parent_name?.toLowerCase() === found.category?.parent_name?.toLowerCase() && 
                            String(p.id) !== String(id)
                    );
                    setRelatedProducts(related || []);
                    setRelatedLoading(false);
                }

                // Default size selected, matches reference design
                if (found.sizes && found.sizes.length > 0) {
                    setSelectedSize(found.sizes[0]);
                }

                if (found.is_design) {
                    // Default color (and design, if any) selected
                    if (found.product_colors && found.product_colors.length > 0) {
                        const firstColor = found.product_colors[0];
                        setSelectedColorId(firstColor.color);

                        const defaultDesign = found.designs?.find(d => d.is_default) || found.designs?.[0];
                        if (defaultDesign) setSelectedDesignId(defaultDesign.id);

                        if (firstColor.front_image?.image) {
                            setMainImage(firstColor.front_image.image);
                            setImageType('front');
                        }
                    }
                } else {
                    // Default color selected
                    if (found.colors && found.colors.length > 0) {
                        setSelectedColor(found.colors[0]);
                    }
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

    /* ========================= GET ALL IMAGES (regular products) ========================= */
    const getAllImages = (productData = product) => {
        if (!productData || !productData.images) return [];
        return productData.images.map(img => ({
            url: img.image,
            type: img.is_thumbnail ? 'thumbnail' : 'gallery'
        }));
    };

    /* ========================= GET ALL PRODUCT IMAGES FOR DISPLAY ========================= */
    const getAllProductImages = () => {
        if (!product) return [];
        
        const images = [];
        const seenUrls = new Set(); // Prevent duplicates
        
        // For design products - get all front images from all colors
        if (product.is_design && product.product_colors) {
            product.product_colors.forEach(pc => {
                if (pc.front_image?.image) {
                    const imageUrl = pc.front_image.image;
                    // Only add if not already added
                    if (!seenUrls.has(imageUrl)) {
                        seenUrls.add(imageUrl);
                        images.push({
                            id: `front-${pc.color}`,
                            image: imageUrl,
                            type: 'front',
                            label: pc.color_name || 'Front',
                            colorId: pc.color,
                            colorName: pc.color_name
                        });
                    }
                }
            });
            
            // Also add back images
            product.product_colors.forEach(pc => {
                if (pc.back_designs && Array.isArray(pc.back_designs)) {
                    pc.back_designs.forEach(bd => {
                        if (bd.image) {
                            const imageUrl = bd.image;
                            // Only add if not already added
                            if (!seenUrls.has(imageUrl)) {
                                seenUrls.add(imageUrl);
                                images.push({
                                    id: `back-${bd.id || Math.random()}`,
                                    image: imageUrl,
                                    type: 'back',
                                    label: bd.design_name || 'Back',
                                    colorId: pc.color,
                                    designId: bd.design,
                                    designName: bd.design_name
                                });
                            }
                        }
                    });
                }
            });
        }
        
        // For regular products - get images from product.images
        if (!product.is_design && product.images && Array.isArray(product.images)) {
            product.images.forEach(img => {
                if (img.image) {
                    const imageUrl = img.image;
                    // Only add if not already added
                    if (!seenUrls.has(imageUrl)) {
                        seenUrls.add(imageUrl);
                        images.push({
                            id: img.id || `img-${Math.random()}`,
                            image: imageUrl,
                            type: 'gallery',
                            label: img.is_thumbnail ? 'Main' : 'Image'
                        });
                    }
                }
            });
        }
        
        // If still no images, try to get from mainImage
        if (images.length === 0 && mainImage) {
            images.push({
                id: 'main-image',
                image: mainImage,
                type: 'main',
                label: 'Main Image'
            });
        }
        
        return images;
    };

    /* ========================= DESIGN PRODUCTS: front images for all colors ========================= */
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

    /* ========================= DESIGN PRODUCTS: back images grouped by design ========================= */
    const getBackImagesForSelectedColor = () => {
        if (!product?.is_design || !selectedColorId) return {};
        const productColor = product.product_colors?.find(pc => pc.color === selectedColorId);
        if (!productColor) return {};

        const imagesByDesign = {};
        productColor.back_designs?.forEach(bd => {
            if (!imagesByDesign[bd.design]) imagesByDesign[bd.design] = [];
            imagesByDesign[bd.design].push({
                id: bd.id,
                image: bd.image,
                designName: bd.design_name,
                isDefault: bd.is_default
            });
        });
        return imagesByDesign;
    };

    /* ========================= SELECTION HANDLERS ========================= */
    const handleSizeSelect = (size) => {
        setSelectedSize(size);
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
    };

    const handleDesignColorSelect = (colorId, frontImage) => {
        setSelectedColorId(colorId);
        setSelectedDesignId(null);
        setAvailableBackImages([]);
        if (frontImage) {
            setMainImage(frontImage);
            setImageType('front');
        }
    };

    const handleImageClick = (imageUrl) => {
        setMainImage(imageUrl);
    };

    /* ========================= VALIDATION ========================= */
    const validateSelections = () => {
        if (product?.is_design) {
            if (!selectedColorId) {
                Swal.fire({ icon: "warning", title: "Select a Color", text: "Please select a color to continue", confirmButtonText: "OK", confirmButtonColor: "#000" });
                return false;
            }
            if (product.designs?.length > 0 && !selectedDesignId) {
                Swal.fire({ icon: "warning", title: "Select a Design", text: "Please select a design to continue", confirmButtonText: "OK", confirmButtonColor: "#000" });
                return false;
            }
            if (!selectedSize) {
                Swal.fire({ icon: "warning", title: "Select a Size", text: "Please select a size to continue", confirmButtonText: "OK", confirmButtonColor: "#000" });
                return false;
            }
            return true;
        } else {
            if (!selectedSize || !selectedColor) {
                Swal.fire({ icon: "warning", title: "Complete Selection Required", text: "Please select a size and a color", confirmButtonText: "OK", confirmButtonColor: "#000" });
                return false;
            }
            return true;
        }
    };

    /* ========================= ADD TO CART ========================= */
    const handleAddToCart = () => {
        if (!validateSelections()) return;

        const cart = JSON.parse(localStorage.getItem("cart_items")) || [];
        const originalPrice = Number(product.original_price);
        const discountPrice = Number(product.discounted_price);
        const hasDiscount = discountPrice < originalPrice;
        const price = hasDiscount ? discountPrice : Number(product.unit_price);

        if (product.is_design) {
            const productColor = product.product_colors?.find(pc => pc.color === selectedColorId);
            const selectedBackImage = availableBackImages[selectedBackImageIndex];
            const selectedDesign = product.designs?.find(d => d.id === selectedDesignId);

            cart.push({
                id: `${product.id}-${selectedColorId}-${selectedDesignId}-${Date.now()}`,
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
                size: selectedSize?.name,
                size_id: Number(selectedSize?.id),
                color_id: Number(selectedColorId),
                color_name: productColor?.color_name || '',
                hex_code: productColor?.hex_code || '',
                is_design: true
            });
        } else {
            const allImages = getAllImages();
            cart.push({
                id: `${product.id}-${Date.now()}`,
                product_id: Number(product.id),
                name: product.name,
                price: price,
                original_price: originalPrice,
                discounted_price: discountPrice,
                image: allImages[0]?.url || '',
                quantity: 1,
                size: selectedSize?.name,
                size_id: Number(selectedSize?.id),
                color: selectedColor?.name,
                color_id: Number(selectedColor?.id),
                is_design: false
            });
        }

        localStorage.setItem("cart_items", JSON.stringify(cart));

        Swal.fire({
            icon: "success",
            title: "Added to Cart",
            text: `${product.name} added to your cart`,
            showConfirmButton: false,
            timer: 1500
        });
    };

    /* ========================= ORDER NOW ========================= */
    const handleOrderNow = () => {
        if (!validateSelections()) return;

        const originalPrice = Number(product.original_price);
        const discountPrice = Number(product.discounted_price);
        const hasDiscount = discountPrice < originalPrice;
        const price = hasDiscount ? discountPrice : Number(product.unit_price);

        let checkoutItems;

        if (product.is_design) {
            const productColor = product.product_colors?.find(pc => pc.color === selectedColorId);
            const selectedBackImage = availableBackImages[selectedBackImageIndex];
            const selectedDesign = product.designs?.find(d => d.id === selectedDesignId);

            checkoutItems = [{
                id: `${product.id}-${selectedColorId}-${selectedDesignId}`,
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
                size: selectedSize?.name,
                size_id: Number(selectedSize?.id),
                color_id: Number(selectedColorId),
                color_name: productColor?.color_name || '',
                hex_code: productColor?.hex_code || '',
                is_design: true
            }];
        } else {
            const allImages = getAllImages();
            checkoutItems = [{
                id: `${product.id}`,
                product_id: Number(product.id),
                name: product.name,
                price: price,
                original_price: originalPrice,
                discounted_price: discountPrice,
                image: allImages[0]?.url || '',
                quantity: 1,
                size: selectedSize?.name,
                size_id: Number(selectedSize?.id),
                color: selectedColor?.name,
                color_id: Number(selectedColor?.id),
                is_design: false
            }];
        }

        localStorage.setItem("checkout_items", JSON.stringify(checkoutItems));
        router.push("/checkout");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="h-10 w-10 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <h2 className="text-sm uppercase tracking-widest text-gray-500">Product not found</h2>
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

    // All colors, shown together in a single row (thumbnail image if available, otherwise the hex swatch)
    const designColors = product.is_design ? getDesignFrontImages() : [];
    const regularColors = product.is_design ? [] : (product.colors || []);
    const allProductImages = getAllProductImages();

    const currentColorLabel = product.is_design
        ? designColors.find(c => c.isSelected)?.colorName
        : selectedColor?.name;

    const isCTADisabled = product.is_design
        ? !selectedColorId || (product.designs?.length > 0 && !selectedDesignId) || !selectedSize
        : !selectedSize || !selectedColor;

    const inStock = product.stock === undefined || product.stock === null
        ? true
        : Number(product.stock) > 0;

    // Get first 4 related products to display
    const displayRelated = relatedProducts.slice(0, 4);

    return (
        <div className="px-4 lg:px-12 xl:px-24 2xl:px-48 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
                {/* ================= IMAGE SECTION ================= */}
                <div className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[760px] bg-[#f7f7f7] overflow-hidden">
                    {mainImage ? (
                        <Image
                            src={getImageUrl(mainImage)}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                            onError={(e) => {
                                // If main image fails, try to load first available image
                                const fallbackImage = allProductImages.find(img => img.image !== mainImage);
                                if (fallbackImage) {
                                    setMainImage(fallbackImage.image);
                                }
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-xs uppercase tracking-widest text-gray-400">No image available</p>
                        </div>
                    )}

                    {/* Back-image nav (design products only) */}
                    {product.is_design && imageType === 'back' && availableBackImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/90 px-3 py-1.5">
                            <button
                                onClick={() => setSelectedBackImageIndex(prev => prev > 0 ? prev - 1 : availableBackImages.length - 1)}
                                className="p-1 hover:opacity-60 transition-opacity"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[11px] uppercase tracking-wider text-gray-600">
                                {selectedBackImageIndex + 1} / {availableBackImages.length}
                            </span>
                            <button
                                onClick={() => setSelectedBackImageIndex(prev => prev < availableBackImages.length - 1 ? prev + 1 : 0)}
                                className="p-1 hover:opacity-60 transition-opacity"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ================= DETAILS SECTION ================= */}
                <div className="lg:pt-1">
                    {/* Breadcrumb */}
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">
                        <Link href="/" className="hover:text-black transition-colors">Home</Link>
                        <span className="mx-1.5">/</span>
                        <Link href="/collections" className="hover:text-black transition-colors">Collections</Link>
                        {product.category_name && (
                            <>
                                <span className="mx-1.5">/</span>
                                <Link href={`/collections/${product.category_slug || ''}`} className="hover:text-black transition-colors">
                                    {product.category_name}
                                </Link>
                            </>
                        )}
                        <span className="mx-1.5">/</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-lg font-medium uppercase tracking-[0.2em] text-black">
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-2">
                        {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                                €{originalPrice.toFixed(2)} EUR
                            </span>
                        )}
                        <span className="text-base font-medium text-black">
                            €{price.toFixed(2)} EUR
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-red-600 font-medium">-{discountPercentage}% off</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Taxes included.</p>

                    <div className="border-t border-gray-200 mt-5 mb-5" />

                    {/* ================= PRODUCT IMAGES SECTION ================= */}
                    <div className="mb-5">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-black">
                            Product Images
                        </span>
                        
                        {/* ALL Product Images in circles */}
                        <div className="flex flex-wrap gap-3 mt-2">
                            {allProductImages.length > 0 ? (
                                allProductImages.map((img) => {
                                    // Get the image URL properly
                                    const imageUrl = getImageUrl(img.image);
                                    
                                    // Skip if no image URL
                                    if (!imageUrl) return null;
                                    
                                    return (
                                        <button
                                            key={img.id}
                                            onClick={() => handleImageClick(img.image)}
                                            title={img.label || img.colorName || img.designName || 'Product image'}
                                            className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 ${
                                                mainImage === img.image ? "border-black scale-110 shadow-lg" : "border-gray-200 hover:border-gray-400 hover:scale-105"
                                            }`}
                                        >
                                            <Image 
                                                src={imageUrl} 
                                                alt={img.label || img.colorName || img.designName || 'Product image'} 
                                                fill 
                                                className="object-cover" 
                                                sizes="64px"
                                                priority={allProductImages.indexOf(img) < 4}
                                                onError={(e) => {
                                                    // If image fails to load, show a fallback
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        parent.style.backgroundColor = '#f0f0f0';
                                                        const fallbackText = document.createElement('span');
                                                        fallbackText.className = 'absolute inset-0 flex items-center justify-center text-[8px] text-gray-400';
                                                        fallbackText.textContent = 'No img';
                                                        parent.appendChild(fallbackText);
                                                    }
                                                }}
                                            />
                                            {mainImage === img.image && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                                                        <span className="text-[10px] font-bold text-black">✓</span>
                                                    </div>
                                                </div>
                                            )}
                                            {img.type && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center py-0.5">
                                                    {img.type === 'front' ? 'Front' : img.type === 'back' ? 'Back' : ''}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-gray-400">No images available</p>
                            )}
                        </div>
                    </div>

                    {/* ================= COLOR SECTION ================= */}
                    <div className="mb-5">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-black">
                            Color{currentColorLabel ? ` — ${currentColorLabel}` : ''}
                        </span>
                        
                        {product.is_design ? (
                            <>
                                {/* Color swatches for design products */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {designColors.map((c) => (
                                        <button
                                            key={`color-${c.colorId}`}
                                            onClick={() => handleDesignColorSelect(c.colorId, c.frontImage)}
                                            title={c.colorName}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                                                c.isSelected ? "border-black scale-110 shadow-lg" : "border-gray-200 hover:border-gray-400 hover:scale-105"
                                            }`}
                                            style={{ backgroundColor: c.hexCode || '#eee' }}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Color swatches for regular products */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {regularColors.map((color) => {
                                        const isSelected = selectedColor?.id === color.id;
                                        return (
                                            <button
                                                key={color.id}
                                                onClick={() => handleColorSelect(color)}
                                                title={color.name}
                                                className={`w-10 h-10 rounded-full border-2 transition-all ${
                                                    isSelected ? "border-black scale-110 shadow-lg" : "border-gray-200 hover:border-gray-400 hover:scale-105"
                                                }`}
                                                style={{ backgroundColor: color.code || color.hex_code }}
                                            />
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* SIZE */}
                    <div className="mb-5">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-black">Size</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {product.sizes?.map((size) => {
                                const isSelected = selectedSize?.id === size.id;
                                return (
                                    <button
                                        key={size.id}
                                        onClick={() => handleSizeSelect(size)}
                                        className={`min-w-[44px] h-10 px-2 text-sm bg-white transition-colors ${
                                            isSelected
                                                ? 'border-2 border-black text-black font-semibold'
                                                : 'border border-gray-300 text-gray-700 hover:border-black'
                                        }`}
                                    >
                                        {size.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Back design (design products only) */}
                    {product.is_design && selectedColorId && product.designs && product.designs.length > 0 && (
                        <div className="mb-5">
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-black">Back Design</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {product.designs.map((design) => {
                                    const backImagesForDesign = getBackImagesForSelectedColor()[design.id] || [];
                                    const hasImages = backImagesForDesign.length > 0;
                                    const isSelected = selectedDesignId === design.id;
                                    return (
                                        <button
                                            key={design.id}
                                            disabled={!hasImages}
                                            onClick={() => {
                                                if (hasImages) {
                                                    setSelectedDesignId(design.id);
                                                    setSelectedBackImageIndex(0);
                                                    setImageType('back');
                                                    setMainImage(backImagesForDesign[0].image);
                                                }
                                            }}
                                            className={`px-3 h-9 text-xs border transition-colors ${
                                                isSelected
                                                    ? 'border-black bg-black text-white'
                                                    : hasImages
                                                        ? 'border-gray-300 text-black hover:border-black'
                                                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                            }`}
                                        >
                                            {design.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Stock indicator */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-gray-600">{inStock ? 'In stock' : 'Out of stock'}</span>
                    </div>

                    {/* Add to cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isCTADisabled || !inStock}
                        className={`w-full h-12 text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer ${
                            isCTADisabled || !inStock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-900'
                        }`}
                    >
                        Add to Cart
                    </button>

                    {/* Buy now */}
                    <button
                        onClick={handleOrderNow}
                        disabled={isCTADisabled || !inStock}
                        className={`w-full h-12 mt-2 text-xs uppercase tracking-[0.2em] font-semibold border transition-colors cursor-pointer ${
                            isCTADisabled || !inStock
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-black text-black hover:bg-gray-50'
                        }`}
                    >
                        Buy Now
                    </button>

                    {/* Description */}
                    {product.description && (
                        <div
                            className="mt-6 text-sm text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                            style={{ whiteSpace: 'pre-wrap' }}
                        />
                    )}

                    {/* Feature bullets */}
                    {Array.isArray(product.features) && product.features.length > 0 && (
                        <ul className="mt-4 space-y-1.5 text-sm text-gray-700 list-disc list-inside">
                            {product.features.map((f, i) => (
                                <li key={i} className="font-medium">{f}</li>
                            ))}
                        </ul>
                    )}

                    {/* Size measurements - ONLY IMAGE */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="relative w-full border border-gray-300 rounded-lg overflow-hidden bg-white">
                            <Image
                                src='/images/size-measurment.webp'
                                alt="Size measurements"
                                width={900}
                                height={500}
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                    </div>

                    {/* Vegan badge - using image with text below */}
                    <div className="flex flex-col items-center mt-8">
                        <div className="relative w-40 h-20">
                            <Image
                                src='/images/peta-approved_vegan_0.webp'
                                alt="Vegan Approved"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        
                        {/* Two text lines below vegan image */}
                        <div className="text-center mt-3 space-y-1">
                            <p className="text-[12px] uppercase tracking-widest text-gray-600 font-medium">
                                Streetwear company BLACKABOIJ © 2026
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= RELATED PRODUCTS SECTION ================= */}
            {!relatedLoading && relatedProducts.length > 0 && (
                <div className="mt-16 pt-8 border-t border-gray-200">
                    <h2 className="text-center text-[20px] uppercase tracking-[0.2em] font-medium text-black mb-8">
                        Blackaboij Featured
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayRelated.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}