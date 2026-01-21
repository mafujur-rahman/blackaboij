import WomenHatHome from '@/components/pages/women/women-hat/WomenHatHome';
import React from 'react';

export const metadata = {
    title: "Women’s Hats Collection | Blackaboij",
    description:
        "Shop premium women’s hats at Blackaboij. Discover stylish black hats designed for everyday wear, comfort, and modern fashion.",

    keywords: [
        "Women hat",
        "Women hats collection",
        "black Women hat",
        "Women fashion hat",
        "stylish Women hats",
        "Blackaboij Women hat",
        "Women accessories black",
    ],

    robots: {
        index: true,
        follow: true,
    },

    alternates: {
        canonical: "https://blackaboij.com/collections/women/women-hat",
    },

    openGraph: {
        title: "Women’s Hats | Blackaboij Premium Collection",
        description:
            "Explore premium Women’s hats at Blackaboij. Modern black hats crafted for comfort and style.",
        url: "https://blackaboij.com/collections/women/women-hat",
        siteName: "Blackaboij",
        type: "website",
    },
};

const WomenHatPage = () => {
    return (
        <div>
            <WomenHatHome />
        </div>
    );
};

export default WomenHatPage;