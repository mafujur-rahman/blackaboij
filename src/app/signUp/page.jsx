import SignUpForm from '@/components/pages/authentication/SignUpForm';
import React from 'react';



export const metadata = {
  title: "Sign Up ",
  description:
    "Create a Blackaboij account to start shopping, track orders, save favorites, and enjoy a personalized fashion experience. Quick and secure registration.",

  keywords: [
    "Blackaboij sign up",
    "register account",
    "create account",
    "Blackaboij registration",
    "secure sign up",
  ],

  robots: {
    index: false, 
    follow: false,
  },

  alternates: {
    canonical: "https://blackaboij.com/signUp",
  },

  openGraph: {
    title: "Sign Up | Blackaboij",
    description:
      "Register your Blackaboij account to shop, save favorites, and track your orders. Enjoy a secure and personalized shopping experience.",
    url: "https://blackaboij.com/signUp",
    siteName: "Blackaboij",
    type: "website",
  },
};


const SignUpPage = () => {
    return (
        <div>
            <SignUpForm />
        </div>
    );
};

export default SignUpPage;