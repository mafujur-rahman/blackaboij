"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Eye } from "lucide-react";
import UserDashboardShell from "./UserDashboardShell";
import { getImageUrl } from "@/components/utils/get-image-url";

const UserWishlistHome = () => {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  // Remove item
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

      {/* WISHLIST LIST */}
      <div className="space-y-4">
        {wishlist.length > 0 ? (
          wishlist.map((item) => {
            const productLink = `/product/${item.slug || item.id}`;

            return (
              <div
                key={item.id}
                className="bg-white border border-black/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  {/* IMAGE */}
                  <Link
                    href={productLink}
                    className="relative w-20 h-20 flex-shrink-0"
                  >
                    <Image
                      src={getImageUrl(item.thumbnail_image || item.image)}
                      alt={item.name}
                      fill
                      className="border border-black/10 object-cover hover:opacity-90 transition"
                    />
                  </Link>

                  {/* INFO */}
                  <div>
                    {/* NAME */}
                    <Link
                      href={productLink}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>

                    <p className="text-sm text-gray-600">
                      €{item.unit_price || item.price}
                    </p>
                  </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-2 justify-end">
                  {/* VIEW DETAILS */}
                  <Link
                    href={productLink}
                    className="flex items-center gap-1 px-3 py-2 text-sm border border-black/10 hover:bg-gray-100"
                  >
                    <Eye size={16} />
                    View
                  </Link>

                  {/* REMOVE */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 border border-black/10 hover:bg-red-50 hover:text-red-600"
                    title="Remove from wishlist"
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
    </UserDashboardShell>
  );
};

export default UserWishlistHome;
