import MenOutwearHome from '@/components/pages/men/men-outwear/MenOutwearHome';
import React from 'react';


export const metadata = {
  title: "Men’s Outerwear Collection | Blackaboij",
  description:
    "Shop premium men’s outerwear at Blackaboij. Discover stylish jackets, coats, and layered essentials designed for comfort, warmth, and modern fashion.",

  keywords: [
    "men outerwear",
    "men jackets",
    "men coats",
    "black men outerwear",
    "stylish men jackets",
    "Blackaboij men coats",
    "men winter outerwear",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/men/men-outerwears",
  },

  openGraph: {
    title: "Men’s Outerwear | Blackaboij Premium Collection",
    description:
      "Explore premium men’s outerwear at Blackaboij. Modern jackets and coats crafted for style, comfort, and warmth.",
    url: "https://blackaboij.com/collections/men/men-outerwears",
    siteName: "Blackaboij",
    type: "website",
  },
};


const MenOutwearPage = () => {
    return (
        <div>
            <MenOutwearHome />
        </div>
    );
};

export default MenOutwearPage;