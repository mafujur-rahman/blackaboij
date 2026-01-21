import MenShoesHome from '@/components/pages/men/men-shoes/MenShoesHome';
import React from 'react';


export const metadata = {
  title: "Men’s Shoes Collection | Blackaboij",
  description:
    "Shop premium men’s shoes at Blackaboij. Discover stylish sneakers, boots, and formal shoes designed for comfort, durability, and modern fashion.",

  keywords: [
    "men shoes",
    "men sneakers",
    "men boots",
    "men formal shoes",
    "stylish men shoes",
    "Blackaboij men shoes",
    "men fashion footwear",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/men/men-shoes",
  },

  openGraph: {
    title: "Men’s Shoes | Blackaboij Premium Collection",
    description:
      "Explore premium men’s shoes at Blackaboij. Stylish sneakers, boots, and formal shoes crafted for comfort and modern style.",
    url: "https://blackaboij.com/collections/men/men-shoes",
    siteName: "Blackaboij",
    type: "website",
  },
};


const MemShoesPage = () => {
    return (
        <div>
            <MenShoesHome />
        </div>
    );
};

export default MemShoesPage;