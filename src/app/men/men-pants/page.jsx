import MenPantsHome from '@/components/pages/men/men-pants/MenPantsHome';
import React from 'react';


export const metadata = {
  title: "Men’s Pants Collection | Blackaboij",
  description:
    "Shop premium men’s pants at Blackaboij. Discover stylish chinos, jeans, and casual trousers designed for comfort, versatility, and modern fashion.",

  keywords: [
    "men pants",
    "men jeans",
    "men chinos",
    "men trousers",
    "stylish men pants",
    "Blackaboij men pants",
    "men fashion bottoms",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/men/men-pants",
  },

  openGraph: {
    title: "Men’s Pants | Blackaboij Premium Collection",
    description:
      "Explore premium men’s pants at Blackaboij. Stylish chinos, jeans, and trousers crafted for comfort and everyday wear.",
    url: "https://blackaboij.com/collections/men/men-pants",
    siteName: "Blackaboij",
    type: "website",
  },
};


const MenPants = () => {
    return (
        <div>
            <MenPantsHome />
        </div>
    );
};

export default MenPants;