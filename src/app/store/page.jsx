import ContactHome from '@/components/pages/contact/ContactHome';
import React from 'react';


export const metadata = {
  title: "Store | BlackaboiJ Store",
  description:
    "Explore the BlackaboiJ store for premium black fashion. Shop hoodies, pants, t-shirts, and accessories with fast delivery and secure checkout.",

  keywords: [
    "BlackaboiJ store",
    "black fashion store",
    "premium black clothing",
    "hoodies pants t shirts black",
    "BlackaboiJ products",
    "buy black clothing online",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/store",
  },

  openGraph: {
    title: "BlackaboiJ Store | Premium Black Fashion Collection",
    description:
      "Store at BlackaboiJ. Discover hoodies, pants, t-shirts & accessories designed for modern style.",
    url: "https://blackaboij.com/store",
    siteName: "BlackaboiJ",
    type: "website",
  },
};


const StorePage = () => {
    return (
        <div>
            <ContactHome />
        </div>
    );
};

export default StorePage;