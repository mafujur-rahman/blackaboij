import ReturnPolicyHome from '@/components/pages/return-policy/ReturnPolicyHome';
import React from 'react';


export const metadata = {
  title: "Return Policy | Blackaboij",
  description:
    "Read Blackaboij’s return policy to learn how to return or exchange products. Hassle-free returns and exchanges to ensure a smooth shopping experience.",

  keywords: [
    "Blackaboij return policy",
    "product returns",
    "exchange policy",
    "return items",
    "refund policy",
    "Blackaboij returns",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/return-policy",
  },

  openGraph: {
    title: "Return Policy | Blackaboij",
    description:
      "Understand Blackaboij’s return and exchange policy. Enjoy hassle-free returns and exchanges for a smooth shopping experience.",
    url: "https://blackaboij.com/return-policy",
    siteName: "Blackaboij",
    type: "website",
  },
};


const ReturnPolicyPage = () => {
    return (
        <div>
            <ReturnPolicyHome />
        </div>
    );
};

export default ReturnPolicyPage;