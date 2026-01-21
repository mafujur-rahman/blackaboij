import AccessoriesHome from '@/components/pages/accessories/AccessoriesHome';
import React from 'react';


export const metadata = {
    title: "Accessories Collection | Blackaboij",
    description:
        "Shop premium accessories for men and women at Blackaboij. Discover stylish hats, belts, bags, and more to complete your modern fashion look.",

    keywords: [
        "men accessories",
        "women accessories",
        "hats",
        "belts",
        "bags",
        "fashion accessories",
        "Blackaboij accessories",
        "unisex accessories",
    ],

    robots: {
        index: true,
        follow: true,
    },

    alternates: {
        canonical: "https://blackaboij.com/accessories",
    },

    openGraph: {
        title: "Accessories Collection | Blackaboij Premium Fashion",
        description:
            "Explore stylish accessories for men and women at Blackaboij. From hats and belts to bags and more, find the perfect pieces to enhance your fashion style.",
        url: "https://blackaboij.com/accessories",
        siteName: "Blackaboij",
        type: "website",
    },
};


const AccessoriesPage = () => {
    return (
        <div>
            <AccessoriesHome />
        </div>
    );
};

export default AccessoriesPage;