import MenShoesHome from '@/components/pages/men/men-shoes/MenShoesHome';
import WomenShoesHome from '@/components/pages/women/women-shoes/WomenShoesHome';
import React from 'react';

export const metadata = {
  title: "Women’s Shoes Collection | Blackaboij",
  description:
    "Shop premium women’s shoes at Blackaboij. Discover stylish sneakers, boots, and formal shoes designed for comfort, durability, and modern fashion.",

  keywords: [
    "women shoes",
    "women sneakers",
    "women boots",
    "women formal shoes",
    "stylish women shoes",
    "Blackaboij women shoes",
    "women fashion footwear",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/women/women-shoes",
  },

  openGraph: {
    title: "Women’s Shoes | Blackaboij Premium Collection",
    description:
      "Explore premium women’s shoes at Blackaboij. Stylish sneakers, boots, and formal shoes crafted for comfort and modern style.",
    url: "https://blackaboij.com/collections/women/women-shoes",
    siteName: "Blackaboij",
    type: "website",
  },
};


const WomenShoesPage = () => {
    return (
        <div>
            <WomenShoesHome />
        </div>
    );
};

export default WomenShoesPage;