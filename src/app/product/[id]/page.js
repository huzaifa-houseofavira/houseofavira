import { adminDb } from '@/lib/firebase-admin';
import ProductClient from './ProductClient';

export const revalidate = 3600;

// Helper function to fetch product by slug or id using Admin SDK
async function getProduct(idOrSlug) {
  try {
    if (!adminDb) return null;

    // Try slug first
    const slugSnap = await adminDb
      .collection('products')
      .where('slug', '==', idOrSlug)
      .limit(1)
      .get();

    if (!slugSnap.empty) {
      const doc = slugSnap.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || null,
      };
    }

    // Fallback to document ID
    const docSnap = await adminDb.collection('products').doc(idOrSlug).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || null,
      };
    }
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
  }
  return null;
}

// Map category slugs to readable names for breadcrumbs
function getCategoryDisplay(category) {
  const map = {
    women: "Women's Clothing",
    men: "Men's Clothing",
    footwear: 'Footwear',
    bags: 'Bags',
    accessories: 'Accessories',
    collectibles: 'Collectibles',
    pets: 'Pets',
  };
  if (!category) return { name: 'Shop', slug: 'catalogue' };
  const mainCat = category.split('/')[0]?.toLowerCase();
  return { name: map[mainCat] || category, slug: mainCat || 'catalogue' };
}

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found | House of Avira',
    };
  }

  const images = product.images || [];
  const imageUrl = images.length > 0 ? images[0] : '/opengraph-image.png';
  const productSlug = product.slug || product.id;
  const canonicalUrl = `https://houseofavira.shop/product/${productSlug}`;
  
  const seoTitle = `${product.name} â€” Buy Imported ${product.category || 'Fashion'} India | House of Avira`;
  const seoDesc = product.description 
    ? `${product.description.substring(0, 140)}. Shop at House of Avira.`
    : `Buy ${product.name} at House of Avira. Premium imported ${(product.category || 'fashion').toLowerCase()} delivered to India. Internationally sourced, authentic quality.`;

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: canonicalUrl,
      siteName: 'House of Avira',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: `${product.name} â€” Imported Fashion at House of Avira`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: [imageUrl],
    }
  };
}

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  
  if (!product) {
    return <ProductClient params={params} initialProduct={null} />;
  }

  const productSlug = product.slug || product.id;
  const canonicalUrl = `https://houseofavira.shop/product/${productSlug}`;
  const catInfo = getCategoryDisplay(product.category);

  // Enhanced Product structured data
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [],
    description: product.description || `Buy ${product.name} from House of Avira â€” premium imported fashion delivered to India.`,
    sku: product.sku || `HOA-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'House of Avira'
    },
    category: product.category || 'Fashion',
    color: product.swatches?.[0]?.colorName || undefined,
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/PreOrder',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@id': 'https://houseofavira.shop/#organization'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 7,
            maxValue: 21,
            unitCode: 'd'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'd'
          }
        }
      }
    }
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://houseofavira.shop'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: catInfo.name,
        item: `https://houseofavira.shop/category/${catInfo.slug}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductClient params={params} initialProduct={product} />
    </>
  );
}
