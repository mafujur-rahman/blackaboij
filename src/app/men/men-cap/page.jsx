import MenCapHome from '@/components/pages/men/men-cap/MenCapHome';
import React from 'react';


export const metadata = {
  title: "Men’s Caps Collection | BlackaboiJ",
  description:
    "Shop stylish men’s caps at BlackaboiJ. Discover premium black caps designed for comfort, durability, and everyday fashion.",

  keywords: [
    "men cap",
    "men caps collection",
    "black men cap",
    "men fashion cap",
    "baseball cap men",
    "BlackaboiJ men cap",
    "men accessories black",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/men/men-cap",
  },

  openGraph: {
    title: "Men’s Caps | BlackaboiJ Premium Black Collection",
    description:
      "Explore premium men’s caps at BlackaboiJ. Modern black caps made for everyday style and comfort.",
    url: "https://blackaboij.com/collections/men/men-cap",
    siteName: "BlackaboiJ",
    type: "website",
  },
};


const MenCapPage = () => {
    return (
        <div>
            <MenCapHome />
        </div>
    );
};

export default MenCapPage;