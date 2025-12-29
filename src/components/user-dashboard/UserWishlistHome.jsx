"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Eye } from "lucide-react";
import UserDashboardShell from "./UserDashboardShell";
import { getImageUrl } from "@/components/utils/get-image-url";
import api from "@/lib/axios";

const UserWishlistHome = () => {
  const [wishlist, setWishlist] = useState([]);
  const [productStock, setProductStock] = useState({});
  const [loading, setLoading] = useState(true);

  /* ---------- LOAD WISHLIST ---------- */
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  /* ---------- FETCH STOCK ---------- */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products/get-all-products/");
        const products = res?.data?.data || [];

        const stockMap = {};
        products.forEach((p) => {
          stockMap[p.id] = p.quantity;
        });

        setProductStock(stockMap);
      } catch (e) {
        console.error("Stock fetch failed", e);
      } finally {
        setLoading(false); // ✅ finished
      }
    };

    fetchProducts();
  }, []);

  /* ---------- REMOVE ---------- */
  const removeItem = (id) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== id);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  };

  return (
    <UserDashboardShell>
      {/* TITLE */}
      <div className="bg-white px-6 py-4 mb-6 border border-black/10">
        <h2 className="font-semibold text-lg">My Wishlist</h2>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-black/10 p-4 animate-pulse flex justify-between"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200" />
                <div className="space-y-2">
                  <div className="w-40 h-4 bg-gray-200" />
                  <div className="w-24 h-3 bg-gray-200" />
                </div>
              </div>
              <div className="w-20 h-8 bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (
        /* REAL LIST */
        <div className="space-y-4">
          {wishlist.length > 0 ? (
            wishlist.map((item) => {
              const productLink = `/product/${item.slug || item.id}`;
              const quantity = productStock[item.id];
              const isOutOfStock = quantity === 0;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-black/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4">
                    <Link
                      href={productLink}
                      className={`relative w-20 h-20 flex-shrink-0 ${
                        isOutOfStock ? "pointer-events-none" : ""
                      }`}
                    >
                      <Image
                        src={getImageUrl(item.thumbnail_image || item.image)}
                        alt={item.name}
                        fill
                        className="border border-black/10 object-cover"
                      />
                    </Link>

                    <div>
                      <Link
                        href={productLink}
                        className={`font-medium hover:underline ${
                          isOutOfStock
                            ? "pointer-events-none text-gray-500"
                            : ""
                        }`}
                      >
                        {item.name}
                      </Link>

                      <p className="text-sm text-gray-600">
                        €{item.unit_price || item.price}
                      </p>

                      {isOutOfStock && (
                        <p className="text-xs text-red-600">Out of stock</p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={productLink}
                      className={`flex items-center gap-1 px-3 py-2 text-sm border border-black/10
                        ${
                          isOutOfStock
                            ? "pointer-events-none text-gray-400 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                    >
                      <Eye size={16} />
                      View
                    </Link>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 border border-black/10 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-black/10 p-10 text-center text-gray-500">
              Your wishlist is empty.
            </div>
          )}
        </div>
      )}
    </UserDashboardShell>
  );
};

export default UserWishlistHome;
