import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata = {
  metadataBase: new URL("https://blackaboij.com"),

  title: {
    default: "Blackaboij | Premium Fashion & Lifestyle Store",
    template: "%s | Blackaboij",
  },

  description:
    "Blackaboij is a premium fashion and lifestyle brand offering modern clothing, accessories, and essentials with fast delivery and secure checkout.",

  keywords: [
    "Blackaboij",
    "blackaboij",
    "blackaboij.com",
    "fashion store",
    "online clothing store",
    "streetwear brand",
    "lifestyle products",
    "buy fashion online",
  ],

  authors: [{ name: "Blackaboij" }],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blackaboij.com",
    siteName: "Blackaboij",
    title: "Blackaboij | Premium Fashion & Lifestyle Store",
    description:
      "Discover premium fashion and lifestyle essentials at Blackaboij. Designed for modern style.",
    images: [
      {
        url: "/images/new.webp",
        width: 1200,
        height: 630,
        alt: "Blackaboij Official Store",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Blackaboij | Premium Fashion & Lifestyle Store",
    description:
      "Discover premium fashion and lifestyle essentials at Blackaboij.",
    images: ["/images/new.webp"],
  },

  alternates: {
    canonical: "https://blackaboij.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}