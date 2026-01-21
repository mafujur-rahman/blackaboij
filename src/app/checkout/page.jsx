import Checkout from "@/components/checkout/Checkout";

export const metadata = {
  title: "Secure Checkout | BlackaboiJ",
  description:
    "Complete your purchase securely at BlackaboiJ. Fast checkout, safe payment, and reliable order processing.",

  robots: {
    index: false,
    follow: false,
  },

  alternates: {
    canonical: "https://blackaboij.com/checkout",
  },

  openGraph: {
    title: "Secure Checkout | BlackaboiJ",
    description:
      "Complete your purchase securely at BlackaboiJ with fast and safe checkout.",
    url: "https://blackaboij.com/checkout",
    siteName: "BlackaboiJ",
    type: "website",
  },
};

const CheckoutPage = () => {
  return <Checkout />;
};

export default CheckoutPage;
