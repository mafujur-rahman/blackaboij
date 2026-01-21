import ContactHome from '@/components/pages/contact/ContactHome';
import React from 'react';

// app/contact/page.js

export const metadata = {
  title: "Contact | BlackaboiJ – Premium Black Fashion Store",
  description:
    "Contact BlackaboiJ for customer support, order inquiries, bulk orders, or business collaborations. We are here to help you.",

  keywords: [
    "BlackaboiJ contact",
    "BlackaboiJ customer support",
    "Black fashion store contact",
    "online clothing store contact",
    "fashion brand support",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://blackaboij.com/contact",
  },

  openGraph: {
    title: "Contact BlackaboiJ | Customer Support & Inquiries",
    description:
      "Get in touch with BlackaboiJ for support, order questions, or business inquiries. Fast and friendly assistance.",
    url: "https://blackaboij.com/contact",
    siteName: "BlackaboiJ",
    type: "website",
  },
};


const ContactPage = () => {
    return (
        <div>
            <ContactHome />
        </div>
    );
};

export default ContactPage;