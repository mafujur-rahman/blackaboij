import MenHoodiesSweatersHome from '@/components/pages/men/men-hoodies-sweaters/MenHoodiesSweatersHome';
import WomenHoodiesSweatersHome from '@/components/pages/women/women-hoodies-sweaters/WomenHoodiesSweatersHome';
import React from 'react';

export const metadata = {
  title: "Wen’s Hoodies & Sweaters Collection | Blackaboij",
  description:
    "Shop premium women’s hoodies and sweaters at Blackaboij. Discover stylish, comfortable, and modern designs perfect for everyday wear and seasonal fashion.",

  keywords: [
    "women hoodies",
    "women sweaters",
    "black women hoodie",
    "women fashion sweater",
    "stylish women hoodies",
    "Blackaboij women sweaters",
    "women winter fashion",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/women/women-hoodies-sweaters",
  },

  openGraph: {
    title: "Women’s Hoodies & Sweaters | Blackaboij Premium Collection",
    description:
      "Explore premium women’s hoodies and sweaters at Blackaboij. Stylish and comfortable designs for everyday wear and seasonal fashion.",
    url: "https://blackaboij.com/collections/women/women-hoodies-sweaters",
    siteName: "Blackaboij",
    type: "website",
  },
};

const WomenHoodiesSweatersPage = () => {
    return (
        <div>
            <WomenHoodiesSweatersHome />
        </div>
    );
};

export default WomenHoodiesSweatersPage;