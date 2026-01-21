import SignInForm from '@/components/pages/authentication/SignInForm';
import React from 'react';


export const metadata = {
  title: "Sign In ",
  description:
    "Sign in to your Blackaboij account to access your orders, wishlist, and personalized shopping experience. Secure and easy login for all users.",

  keywords: [
    "Blackaboij sign in",
    "login",
    "account login",
    "secure sign in",
    "Blackaboij account",
  ],

  robots: {
    index: false, 
    follow: false,
  },

  alternates: {
    canonical: "https://blackaboij.com/signin",
  },

  openGraph: {
    title: "Sign In | Blackaboij",
    description:
      "Access your Blackaboij account to manage orders, wishlist, and enjoy a personalized shopping experience. Secure login for all users.",
    url: "https://blackaboij.com/signin",
    siteName: "Blackaboij",
    type: "website",
  },
};


const SignInPage = () => {
    return (
        <div>
            <SignInForm />
        </div>
    );
};

export default SignInPage;