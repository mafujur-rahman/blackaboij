import WomenCollectionHome from '@/components/pages/women/women-collection/WomenCollectionHome';
import React from 'react';

export const metadata = {
  title: "Women’s Collection | BlackaboiJ",
  description:
    "Shop stylish women’s at BlackaboiJ. Discover premium black designed for comfort, durability, and everyday fashion.",

  keywords: [
    "women ",
    "women collection",
    "black women ",
    "women fashion ",
    "baseball women",
    "BlackaboiJ women ",
    "women accessories black",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/women/women-collection",
  },

  openGraph: {
    title: "Women’s | BlackaboiJ Premium Black Collection",
    description:
      "Explore premium women’s at BlackaboiJ. Modern black made for everyday style and comfort.",
    url: "https://blackaboij.com/collections/women/women-collection",
    siteName: "BlackaboiJ",
    type: "website",
  },
};

const WomenCollectionPage = () => {
    return (
        <div>
            <WomenCollectionHome />
        </div>
    );
};

export default WomenCollectionPage;