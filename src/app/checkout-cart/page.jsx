import CheckoutCartHome from '@/components/checkout-cart/CheckoutCart';
import React from 'react';
export const metadata = {
    title: "Secure Checkout | BlackaboiJ",
    description:
        "Complete your purchase securely at BlackaboiJ. Fast checkout, safe payment, and reliable order processing.",

    robots: {
        index: false,
        follow: false,
    },

    alternates: {
        canonical: "https://blackaboij.com/checkout-cart",
    },

    openGraph: {
        title: "Secure Checkout | BlackaboiJ",
        description:
            "Complete your purchase securely at BlackaboiJ with fast and safe checkout.",
        url: "https://blackaboij.com/checkout-cart",
        siteName: "BlackaboiJ",
        type: "website",
    },
};

const CheckoutCart = () => {
    return (
        <div>
            <CheckoutCartHome />
        </div>
    );
};

export default CheckoutCart;