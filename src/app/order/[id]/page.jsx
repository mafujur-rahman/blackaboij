import OrderHome from '@/components/order/OrderHome';
import React from 'react';


export const metadata = {
  title: "Your Orders | Blackaboij",
  description:
    "View and manage your orders at Blackaboij. Track delivery, check order status, and access details for all your purchases securely.",

  keywords: [
    "Blackaboij orders",
    "view orders",
    "track order",
    "order history",
    "order status",
    "Blackaboij account orders",
  ],

  robots: {
    index: false, 
    follow: false,
  },

  alternates: {
    canonical: "https://blackaboij.com/order",
  },

  openGraph: {
    title: "Your Orders | Blackaboij",
    description:
      "Manage your Blackaboij orders. Track delivery, check status, and view details of all your purchases securely.",
    url: "https://blackaboij.com/order",
    siteName: "Blackaboij",
    type: "website",
  },
};


const OrderPage = () => {
    return (
        <div>
            <OrderHome />
        </div>
    );
};

export default OrderPage;