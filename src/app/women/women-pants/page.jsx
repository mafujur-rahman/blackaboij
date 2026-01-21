import MenPantsHome from '@/components/pages/men/men-pants/MenPantsHome';
import WomenPantsHome from '@/components/pages/women/women-pants/WomenPantsHome';
import React from 'react';

export const metadata = {
  title: "Women’s Pants Collection | Blackaboij",
  description:
    "Shop premium women’s pants at Blackaboij. Discover stylish chinos, jeans, and casual trousers designed for comfort, versatility, and modern fashion.",

  keywords: [
    "women pants",
    "women jeans",
    "women chinos",
    "women trousers",
    "stylish women pants",
    "Blackaboij women pants",
    "women fashion bottoms",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/women/women-pants",
  },

  openGraph: {
    title: "Women’s Pants | Blackaboij Premium Collection",
    description:
      "Explore premium women’s pants at Blackaboij. Stylish chinos, jeans, and trousers crafted for comfort and everyday wear.",
    url: "https://blackaboij.com/collections/women/women-pants",
    siteName: "Blackaboij",
    type: "website",
  },
};

const WomenPants = () => {
    return (
        <div>
            <WomenPantsHome />
        </div>
    );
};

export default WomenPants;