import HomeClient from './HomeClient';

export const metadata = {
  title: 'House of Avira â€” Premium Imported Fashion Store India | Shop Pinterest Finds & Luxury Clothing',
  description: 'Shop premium imported fashion at House of Avira. Internationally sourced clothing, bags, shoes & accessories delivered to India. âœˆï¸ Pinterest finds, Korean fashion, old money aesthetics, luxury streetwear & 5000+ orders delivered.',
  keywords: [
    'imported clothing India',
    'imported fashion India',
    'premium imported clothing',
    'luxury fashion India',
    'Pinterest outfits India',
    'Pinterest clothing India',
    'old money outfits',
    'quiet luxury clothing',
    'Korean fashion India',
    'Japanese streetwear India',
    'aesthetic clothing India',
    'imported dresses India',
    'premium women\'s clothing',
    'luxury men\'s clothing',
    'designer inspired fashion',
    'online luxury boutique India',
    'buy imported clothes online',
    'premium fashion store India',
    'international fashion India',
    'House of Avira',
    'Avira Shopping',
    'HOUSEOFAVIRA',
  ],
  alternates: {
    canonical: 'https://houseofavira.shop',
  },
  openGraph: {
    title: 'House of Avira â€” Premium Imported Fashion Store India',
    description: 'Internationally sourced fashion delivered to your doorstep. Shop Pinterest finds, Korean fashion, old money aesthetics & luxury clothing at House of Avira.',
    url: 'https://houseofavira.shop',
    siteName: 'House of Avira',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'House of Avira â€” Premium Imported Fashion Store India',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'House of Avira â€” Premium Imported Fashion Store India',
    description: 'Shop internationally sourced fashion. Pinterest finds, Korean fashion, luxury clothing & 5000+ orders delivered across India.',
    images: ['/opengraph-image.png'],
  },
};

export const revalidate = 3600;

export default function HomePage() {
  // FAQ Schema for homepage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is House of Avira?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "House of Avira is India's premier premium import-based fashion store. We curate internationally sourced clothing, bags, shoes, and accessories from global fashion trends â€” including Pinterest finds, Korean fashion, Japanese streetwear, and luxury aesthetics â€” and deliver them directly to your doorstep across India."
        }
      },
      {
        "@type": "Question",
        "name": "How long does delivery take for imported fashion at House of Avira?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Since we import products internationally, delivery typically takes 10-28 business days depending on the product and availability. We operate on a pre-order model to ensure you get authentic, high-quality imported fashion at the best possible prices."
        }
      },
      {
        "@type": "Question",
        "name": "Is House of Avira a legit website to buy imported clothes in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, House of Avira is a trusted premium import-based fashion store with 5000+ orders delivered and 4+ years of operation. We source authentic, high-quality products from international suppliers and deliver them across India with full order tracking."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods does House of Avira accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We accept UPI, credit cards, debit cards, net banking, and cash on delivery (COD) across India. All payments are processed through secure payment gateways."
        }
      },
      {
        "@type": "Question",
        "name": "Where does House of Avira source its products from?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We source our products from premium international suppliers across Korea, Japan, Europe, and other fashion capitals. Every product is hand-curated to match Pinterest, Instagram, and international fashion trends that are viral globally."
        }
      },
      {
        "@type": "Question",
        "name": "Can I return or exchange imported clothes from House of Avira?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We have a clear returns and exchange policy for eligible items. Since products are internationally sourced, please check our Returns Policy page for specific details about eligible items and the return process before ordering."
        }
      }
    ]
  };

  // WebPage schema for homepage
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "House of Avira â€” Premium Imported Fashion Store India",
    "description": "Shop premium imported fashion at House of Avira. Internationally sourced clothing, bags, shoes & accessories delivered to India.",
    "url": "https://houseofavira.shop",
    "isPartOf": {
      "@id": "https://houseofavira.shop/#website"
    },
    "about": {
      "@id": "https://houseofavira.shop/#organization"
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://houseofavira.shop/opengraph-image.png"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://houseofavira.shop"
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      {/* SEO-critical content visible to crawlers even if JS doesn't execute */}
      <div className="sr-only" aria-hidden="false">
        <h1>House of Avira â€” Premium Imported Fashion Store India</h1>
        <p>India&apos;s most trusted destination for internationally sourced fashion. We curate the trendiest Pinterest finds, Korean fashion, Japanese streetwear, luxury accessories, and designer-inspired pieces â€” and deliver them directly to your doorstep across India. With 5000+ orders delivered and 4+ years of trust, House of Avira is where fashion-forward Indians shop imported clothing, bags, shoes, and accessories.</p>
        <h2>Shop by Category</h2>
        <nav aria-label="Shop categories">
          <ul>
            <li><a href="/category/women">Imported Women&apos;s Clothing India</a></li>
            <li><a href="/category/men">Imported Men&apos;s Clothing India</a></li>
            <li><a href="/category/bags">Luxury Imported Bags</a></li>
            <li><a href="/category/footwear">Imported Footwear India</a></li>
            <li><a href="/category/accessories">Premium Fashion Accessories</a></li>
            <li><a href="/category/accessories/jewellery">Imported Jewelry India</a></li>
            <li><a href="/category/collectibles">Imported Collectibles</a></li>
            <li><a href="/catalogue">Shop All Imported Fashion</a></li>
          </ul>
        </nav>
        <h2>Shop by Style</h2>
        <p>Discover old money fashion, quiet luxury clothing, Korean fashion, Y2K aesthetics, Japanese streetwear, Pinterest inspired outfits, coquette fashion, dark academia, coastal grandmother style, and more trending aesthetics â€” all imported and available in India.</p>
        <h2>Why Shop at House of Avira?</h2>
        <ul>
          <li>5000+ orders delivered across India</li>
          <li>4+ years trusted by fashion lovers</li>
          <li>Imported directly from international suppliers</li>
          <li>Pinterest finds you can actually buy in India</li>
          <li>Secure payments â€” UPI, Cards, COD accepted</li>
          <li>Full order tracking on every purchase</li>
        </ul>
      </div>
      <HomeClient />
    </>
  );
}
