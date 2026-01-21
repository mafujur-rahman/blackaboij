import ShippingPolicyHome from '@/components/pages/shipping-policy/ShippingPolicyHome';
import React from 'react';


export const metadata = {
  title: "Shipping Policy | Blackaboij",
  description:
    "Learn about Blackaboij’s shipping policies, including delivery times, shipping costs, and worldwide shipping options. Get your orders delivered reliably and on time.",

  keywords: [
    "Blackaboij shipping policy",
    "shipping information",
    "delivery times",
    "shipping costs",
    "order shipping",
    "Blackaboij delivery",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/shipping-policy",
  },

  openGraph: {
    title: "Shipping Policy | Blackaboij",
    description:
      "Read Blackaboij’s shipping policy. Find out about delivery times, shipping costs, and how we ensure your orders are delivered on time.",
    url: "https://blackaboij.com/shipping-policy",
    siteName: "Blackaboij",
    type: "website",
  },
};


const ShippingPolicyPage = () => {
    return (
        <div>
            <ShippingPolicyHome />
        </div>
    );
};

export default ShippingPolicyPage;