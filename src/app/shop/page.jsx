import ShopHome from '@/components/shop/ShopHome';
import React from 'react';


export const metadata = {
  title: "Shop All Collections | Blackaboij",
  description:
    "Discover the full range of fashion at Blackaboij. Shop premium clothing, shoes, and accessories for men and women, crafted for modern style and comfort.",

  keywords: [
    "shop Blackaboij",
    "men clothing",
    "women clothing",
    "men shoes",
    "women shoes",
    "men accessories",
    "women accessories",
    "fashion collection",
    "premium clothing",
    "unisex fashion",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/shop",
  },

  openGraph: {
    title: "Shop All Collections | Blackaboij Premium Fashion",
    description:
      "Explore the full Blackaboij shop. Find stylish clothing, shoes, and accessories for men and women, all designed for comfort and modern fashion.",
    url: "https://blackaboij.com/shop",
    siteName: "Blackaboij",
    type: "website",
  },
};


const ShopPage = () => {
    return (
        <div>
            <ShopHome />
        </div>
    );
};

export default ShopPage;