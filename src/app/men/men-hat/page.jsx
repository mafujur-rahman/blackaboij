import MenHatHome from '@/components/pages/men/men-hat/MenHatHome';
import React from 'react';


export const metadata = {
    title: "Men’s Hats Collection | Blackaboij",
    description:
        "Shop premium men’s hats at Blackaboij. Discover stylish black hats designed for everyday wear, comfort, and modern fashion.",

    keywords: [
        "men hat",
        "men hats collection",
        "black men hat",
        "men fashion hat",
        "stylish men hats",
        "Blackaboij men hat",
        "men accessories black",
    ],

    robots: {
        index: true,
        follow: true,
    },

    alternates: {
        canonical: "https://blackaboij.com/collections/men/men-hat",
    },

    openGraph: {
        title: "Men’s Hats | Blackaboij Premium Collection",
        description:
            "Explore premium men’s hats at Blackaboij. Modern black hats crafted for comfort and style.",
        url: "https://blackaboij.com/collections/men/men-hat",
        siteName: "Blackaboij",
        type: "website",
    },
};


const MenHatPage = () => {
    return (
        <div>
            <MenHatHome />
        </div>
    );
};

export default MenHatPage;