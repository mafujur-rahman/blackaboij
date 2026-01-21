import MenOutwearHome from '@/components/pages/men/men-outwear/MenOutwearHome';
import WomenOutwearHome from '@/components/pages/women/women-outwear/WomenOutwearHome';
import React from 'react';

export const metadata = {
  title: "Women’s Outerwear Collection | Blackaboij",
  description:
    "Shop premium women’s outerwear at Blackaboij. Discover stylish jackets, coats, and layered essentials designed for comfort, warmth, and modern fashion.",

  keywords: [
    "women outerwear",
    "women jackets",
    "women coats",
    "black women outerwear",
    "stylish women jackets",
    "Blackaboij women coats",
    "women winter outerwear",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/women/women-outerwears",
  },

  openGraph: {
    title: "Women’s Outerwear | Blackaboij Premium Collection",
    description:
      "Explore premium women’s outerwear at Blackaboij. Modern jackets and coats crafted for style, comfort, and warmth.",
    url: "https://blackaboij.com/collections/women/women-outerwears",
    siteName: "Blackaboij",
    type: "website",
  },
};

const WomenOutwearPage = () => {
    return (
        <div>
            <WomenOutwearHome />
        </div>
    );
};

export default WomenOutwearPage;