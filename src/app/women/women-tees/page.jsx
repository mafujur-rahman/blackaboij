import MenTeesHome from '@/components/pages/men/men-tees/MenTeesHome';
import WomenTeesHome from '@/components/pages/women/women-tees/WomenTeesHome';
import React from 'react';

export const metadata = {
  title: "Women’s Tees Collection | Blackaboij",
  description:
    "Shop premium women’s tees at Blackaboij. Discover stylish t-shirts crafted for comfort, everyday wear, and modern fashion.",

  keywords: [
    "women tees",
    "women t-shirts",
    "stylish women tees",
    "Blackaboij women t-shirts",
    "women casual wear",
    "women fashion tees",
    "women graphic tees",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/women/women-tees",
  },

  openGraph: {
    title: "Women’s Tees | Blackaboij Premium Collection",
    description:
      "Explore premium women’s tees at Blackaboij. Comfortable and stylish t-shirts designed for everyday wear and modern fashion.",
    url: "https://blackaboij.com/collections/women/women-tees",
    siteName: "Blackaboij",
    type: "website",
  },
};


const WomenTeesPage = () => {
    return (
        <div>
            <WomenTeesHome />
        </div>
    );
};

export default WomenTeesPage;