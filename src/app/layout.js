import { Geist, Geist_Mono, Playfair_Display, Cormorant_Garamond, DM_Sans, Montserrat } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: 'swap',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "700"],
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL("https://houseofavira.shop"),
  title: "House of Avira — Premium Imported Fashion Store India | Shop Pinterest Finds & Luxury Clothing",
  description: "Shop premium imported fashion at House of Avira. Internationally sourced clothing, bags, shoes & accessories delivered to India. ✈️ Pinterest finds, Korean fashion, old money aesthetics, luxury streetwear & 5000+ orders delivered.",
  keywords: [
    "House of Avira",
    "Avira Shopping",
    "HOUSEOFAVIRA",
    "imported clothing India",
    "imported fashion India",
    "premium imported clothing",
    "luxury fashion India",
    "Pinterest outfits India",
    "Pinterest clothing India",
    "old money outfits",
    "quiet luxury clothing",
    "Korean fashion India",
    "Japanese streetwear India",
    "aesthetic clothing India",
    "imported dresses India",
    "premium women's clothing",
    "luxury men's clothing",
    "designer inspired fashion",
    "online luxury boutique India",
    "buy imported clothes online",
    "premium fashion store India",
    "international fashion India",
    "co-ord sets for women",
    "oversized t-shirts India",
    "luxury handbags India",
    "imported heels",
    "viral fashion products",
    "trending women's fashion",
    "celebrity inspired outfits",
    "premium fashion accessories",
    "vacation outfits",
    "party dresses India",
    "wedding guest dresses"
  ],
  verification: {
    google: "hliUadrK80fd7IaPduYmqG5-aOHzpBLlkWYOIt22yBA",
  },

  openGraph: {
    title: "House of Avira — Premium Imported Fashion Store India | Shop Pinterest Finds & Luxury Clothing",
    description: "Shop premium imported fashion at House of Avira. Internationally sourced clothing, bags, shoes & accessories delivered to India. ✈️ Pinterest finds, Korean fashion, old money aesthetics, luxury streetwear & 5000+ orders delivered.",
    url: "https://houseofavira.shop",
    siteName: "House of Avira",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "House of Avira Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "House of Avira — Premium Imported Fashion Store India | Shop Pinterest Finds & Luxury Clothing",
    description: "Shop premium imported fashion at House of Avira. Internationally sourced clothing, bags, shoes & accessories delivered to India. ✈️ Pinterest finds, Korean fashion, old money aesthetics, luxury streetwear & 5000+ orders delivered.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
};

import dynamic from 'next/dynamic';

const ProductOptionsModal = dynamic(() => import("@/components/ProductOptionsModal"));
const Chatbot = dynamic(() => import("@/components/Chatbot"));

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://houseofavira.shop/#organization",
        "name": "House of Avira",
        "alternateName": ["Avira Shopping", "HOUSEOFAVIRA", "Avira Fashion Store"],
        "url": "https://houseofavira.shop",
        "logo": {
          "@type": "ImageObject",
          "url": "https://houseofavira.shop/LOGO.png",
          "width": 512,
          "height": 512
        },
        "image": "https://houseofavira.shop/opengraph-image.png",
        "description": "Premium import-based fashion store in India. Internationally sourced clothing, bags, shoes & accessories delivered to your doorstep. Shop Pinterest finds, Korean fashion, luxury aesthetics & trending styles.",
        "foundingDate": "2022",
        "areaServed": {
          "@type": "Country",
          "name": "India"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "support@houseofavira.shop",
            "availableLanguage": ["English", "Hindi"]
          }
        ],
        "sameAs": [
          "https://www.instagram.com/houseofavira"
        ],
        "knowsAbout": [
          "Imported Fashion",
          "Luxury Clothing",
          "Korean Fashion",
          "Pinterest Fashion",
          "Streetwear",
          "Old Money Fashion",
          "Premium Accessories"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://houseofavira.shop/#website",
        "url": "https://houseofavira.shop",
        "name": "House of Avira",
        "description": "Premium imported fashion store India — Shop internationally sourced clothing, bags, shoes & accessories",
        "publisher": {
          "@id": "https://houseofavira.shop/#organization"
        },
        "inLanguage": "en-IN",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://houseofavira.shop/catalogue?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Store",
        "@id": "https://houseofavira.shop/#store",
        "name": "House of Avira",
        "image": "https://houseofavira.shop/LOGO.png",
        "url": "https://houseofavira.shop",
        "priceRange": "₹₹₹",
        "currenciesAccepted": "INR",
        "paymentAccepted": "UPI, Credit Card, Debit Card, Net Banking, COD",
        "description": "Premium imported fashion store offering internationally sourced clothing, bags, shoes, jewelry & accessories delivered across India.",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN"
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Imported Fashion Collection",
          "itemListElement": [
            {"@type": "OfferCatalog", "name": "Women's Clothing"},
            {"@type": "OfferCatalog", "name": "Men's Clothing"},
            {"@type": "OfferCatalog", "name": "Luxury Bags"},
            {"@type": "OfferCatalog", "name": "Premium Footwear"},
            {"@type": "OfferCatalog", "name": "Fashion Accessories"},
            {"@type": "OfferCatalog", "name": "Collectibles"}
          ]
        }
      }
    ]
  };

  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${cormorant.variable} ${dmSans.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FFFFFF] text-[#000000] selection:bg-[#8A001A] selection:text-[#FFFFFF]">
        <AuthProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <ProductOptionsModal />
          <Chatbot />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
