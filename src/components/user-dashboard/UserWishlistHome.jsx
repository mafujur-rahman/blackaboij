"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import UserDashboardShell from "./UserDashboardShell";
import { getImageUrl } from "@/components/utils/get-image-url";

const UserWishlistHome = () => {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  // Remove item from wishlist
  const removeItem = (id) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== id);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  };

  return (
    <UserDashboardShell>
      {/* TITLE */}
      <div className="bg-white rounded-md px-6 py-4 mb-6 border border-black/10">
        <h2 className="font-semibold text-lg">My Wishlist</h2>
      </div>

      {/* WISHLIST LIST */}
      <div className="space-y-4">
        {wishlist.length > 0 ? (
          wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-md border border-black/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <Image
                    src={getImageUrl(item.thumbnail_image || item.image)}
                    alt={item.name}
                    fill
                    className="rounded-md border border-black/10 object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">€{item.unit_price || item.price}</p>

                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                      item.inStock || item.in_stock
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.inStock || item.in_stock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 rounded border border-black/10 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-md border border-black/10 p-10 text-center text-gray-500">
            Your wishlist is empty.
          </div>
        )}
      </div>
    </UserDashboardShell>
  );
};

export default UserWishlistHome;
