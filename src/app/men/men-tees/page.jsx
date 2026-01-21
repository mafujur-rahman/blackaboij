import MenTeesHome from '@/components/pages/men/men-tees/MenTeesHome';
import React from 'react';


export const metadata = {
  title: "Men’s Tees Collection | Blackaboij",
  description:
    "Shop premium men’s tees at Blackaboij. Discover stylish t-shirts crafted for comfort, everyday wear, and modern fashion.",

  keywords: [
    "men tees",
    "men t-shirts",
    "stylish men tees",
    "Blackaboij men t-shirts",
    "men casual wear",
    "men fashion tees",
    "men graphic tees",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/collections/men/men-tees",
  },

  openGraph: {
    title: "Men’s Tees | Blackaboij Premium Collection",
    description:
      "Explore premium men’s tees at Blackaboij. Comfortable and stylish t-shirts designed for everyday wear and modern fashion.",
    url: "https://blackaboij.com/collections/men/men-tees",
    siteName: "Blackaboij",
    type: "website",
  },
};


const MenTeesPage = () => {
    return (
        <div>
            <MenTeesHome />
        </div>
    );
};

export default MenTeesPage;