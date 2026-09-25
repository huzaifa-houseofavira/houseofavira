import { Suspense } from 'react';
import CatalogueClient from './CatalogueClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Shop All Imported Fashion â€” Browse Premium Clothing, Bags & Accessories | House of Avira',
  description: 'Browse our complete collection of imported fashion at House of Avira. Premium clothing, luxury bags, shoes, accessories & more. Filter by category, price & style. 5000+ orders delivered across India.',
  keywords: [
    'shop imported fashion India',
    'browse premium clothing',
    'imported fashion collection',
    'buy imported clothes online India',
    'luxury fashion catalogue',
    'premium fashion store India',
  ],
  alternates: {
    canonical: 'https://houseofavira.shop/catalogue',
  },
  openGraph: {
    title: 'Shop All Imported Fashion | House of Avira',
    description: 'Browse our complete collection of premium imported fashion. Clothing, bags, shoes, accessories & more delivered across India.',
    url: 'https://houseofavira.shop/catalogue',
    siteName: 'House of Avira',
    images: ['/opengraph-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop All Imported Fashion | House of Avira',
    description: 'Browse premium imported fashion â€” clothing, bags, shoes & accessories at House of Avira.',
  },
};

export default function CataloguePage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Imported Fashion Collection",
    "description": "Browse the complete collection of premium imported fashion at House of Avira â€” clothing, bags, shoes, accessories & more.",
    "url": "https://houseofavira.shop/catalogue",
    "isPartOf": {
      "@id": "https://houseofavira.shop/#website"
    },
    "provider": {
      "@id": "https://houseofavira.shop/#organization"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://houseofavira.shop"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Catalogue"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading catalogue...</div>}>
        <CatalogueClient />
      </Suspense>
    </>
  );
}
