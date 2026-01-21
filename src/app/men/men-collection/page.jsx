import MenCollectionHome from '@/components/pages/men/men-collection/MenCollectionHome';
import React from 'react';


export const metadata = {
  title: "Men’s Collection | BlackaboiJ",
  description:
    "Shop stylish men’s at BlackaboiJ. Discover premium black designed for comfort, durability, and everyday fashion.",

  keywords: [
    "men ",
    "men collection",
    "black men ",
    "men fashion ",
    "baseball men",
    "BlackaboiJ men ",
    "men accessories black",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/men/men-collection",
  },

  openGraph: {
    title: "Men’s | BlackaboiJ Premium Black Collection",
    description:
      "Explore premium men’s at BlackaboiJ. Modern black made for everyday style and comfort.",
    url: "https://blackaboij.com/collections/men/men-collection",
    siteName: "BlackaboiJ",
    type: "website",
  },
};


const MenCollectionPage = () => {
    return (
        <div>
            <MenCollectionHome />
        </div>
    );
};

export default MenCollectionPage;