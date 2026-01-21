import MenHoodiesSweatersHome from '@/components/pages/men/men-hoodies-sweaters/MenHoodiesSweatersHome';
import React from 'react';

export const metadata = {
  title: "Men’s Hoodies & Sweaters Collection | Blackaboij",
  description:
    "Shop premium men’s hoodies and sweaters at Blackaboij. Discover stylish, comfortable, and modern designs perfect for everyday wear and seasonal fashion.",

  keywords: [
    "men hoodies",
    "men sweaters",
    "black men hoodie",
    "men fashion sweater",
    "stylish men hoodies",
    "Blackaboij men sweaters",
    "men winter fashion",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/men/men-hoodies-sweaters",
  },

  openGraph: {
    title: "Men’s Hoodies & Sweaters | Blackaboij Premium Collection",
    description:
      "Explore premium men’s hoodies and sweaters at Blackaboij. Stylish and comfortable designs for everyday wear and seasonal fashion.",
    url: "https://blackaboij.com/collections/men/men-hoodies-sweaters",
    siteName: "Blackaboij",
    type: "website",
  },
};


const MenHoodiesSweatersPage = () => {
    return (
        <div>
            <MenHoodiesSweatersHome />
        </div>
    );
};

export default MenHoodiesSweatersPage;