import CategoryClient from './CategoryClient';

export const revalidate = 300;

const categoryMeta = {
  women: {
    title: "Imported Women's Clothing India — Premium Dresses, Tops & Luxury Fashion | House of Avira",
    description: "Shop the finest imported women's clothing in India. Premium dresses, tops, co-ord sets, party wear, Korean fashion & more. Internationally sourced, delivered to your doorstep.",
    h1: "Imported Women's Clothing",
    keywords: ["imported women's clothing India", "premium dresses India", "imported tops for women", "co-ord sets for women", "party dresses India", "luxury women's fashion"]
  },
  men: {
    title: "Imported Men's Clothing India — Premium Streetwear, Old Money Fashion & Luxury | House of Avira",
    description: "Discover premium imported men's clothing at House of Avira. Old money aesthetics, streetwear, oversized tees & luxury menswear sourced internationally and delivered to India.",
    h1: "Imported Men's Clothing",
    keywords: ["imported men's clothing India", "premium men's streetwear", "old money fashion men", "oversized t-shirts India", "luxury men's fashion"]
  },
  footwear: {
    title: "Imported Footwear India — Premium Heels, Boots & Luxury Shoes | House of Avira",
    description: "Shop imported premium footwear at House of Avira. Heels, boots, flats & designer shoes internationally sourced. Trending Pinterest footwear delivered across India.",
    h1: "Imported Footwear",
    keywords: ["imported heels India", "imported shoes India", "premium footwear online", "luxury heels India", "imported boots"]
  },
  bags: {
    title: "Luxury Imported Bags India — Premium Handbags, Shoulder & Mini Bags | House of Avira",
    description: "Shop luxury imported bags at House of Avira. Designer-inspired handbags, shoulder bags, mini bags & premium carry accessories. Internationally sourced & delivered to India.",
    h1: "Luxury Imported Bags",
    keywords: ["luxury handbags India", "imported bags online India", "premium handbags", "designer inspired bags India", "mini bags imported"]
  },
  accessories: {
    title: "Premium Fashion Accessories India — Imported Jewelry, Belts & Luxury Add-Ons | House of Avira",
    description: "Discover premium imported fashion accessories at House of Avira. Jewelry, hair accessories, phone cases, belts & more. Curated international fashion accessories delivered to India.",
    h1: "Premium Fashion Accessories",
    keywords: ["premium fashion accessories India", "imported jewelry India", "luxury accessories online", "aesthetic accessories"]
  },
  collectibles: {
    title: "Imported Collectibles India — Sanrio, Nagano Characters, Blind Boxes & More | House of Avira",
    description: "Shop rare imported collectibles at House of Avira. Sanrio, Miffy, Nagano Characters, blind boxes & character merchandise directly imported and delivered across India.",
    h1: "Imported Collectibles",
    keywords: ["imported collectibles India", "Sanrio India", "blind boxes India", "Nagano characters", "Miffy collectibles"]
  },
  pets: {
    title: "Imported Pet Fashion India — Cute Pet Clothes, Toys & Accessories | House of Avira",
    description: "Shop imported pet fashion and accessories at House of Avira. Adorable clothes, toys & accessories for cats and dogs. Internationally sourced pet products delivered to India.",
    h1: "Imported Pet Fashion & Accessories",
    keywords: ["imported pet clothes India", "pet accessories imported", "cat clothes India", "dog clothes imported"]
  },
};

const subCategoryMeta = {
  'women/tops': { title: "Imported Tops for Women India", desc: "Shop premium imported tops for women. Trendy crop tops, blouses, tank tops & more from international fashion trends." },
  'women/pants-jeans': { title: "Imported Pants & Jeans for Women India", desc: "Discover premium imported pants, jeans & trousers for women. Wide-leg, straight-fit, cargo & trending styles." },
  'women/skirts': { title: "Imported Skirts for Women India", desc: "Shop imported skirts — mini, midi, maxi & pleated styles. Premium quality, Pinterest-inspired designs delivered to India." },
  'women/dresses': { title: "Imported Dresses for Women India", desc: "Shop premium imported dresses — party dresses, casual dresses, vacation wear & wedding guest outfits delivered to India." },
  'women/jackets': { title: "Imported Jackets for Women India", desc: "Premium imported women's jackets — blazers, leather jackets, denim & outerwear from international fashion." },
  'women/beach-wear': { title: "Imported Beachwear for Women India", desc: "Shop imported beachwear & swimwear for women. Vacation-ready cover-ups, bikinis & resort wear from international brands." },
  'men/tops': { title: "Imported Tops & T-shirts for Men India", desc: "Shop premium imported men's tops — oversized tees, polo shirts, graphic tees & streetwear from international brands." },
  'men/pants-jeans': { title: "Imported Pants & Jeans for Men India", desc: "Discover imported men's pants, jeans & joggers. Premium quality cargo pants, straight-fit jeans & trending styles." },
  'men/jackets': { title: "Imported Jackets for Men India", desc: "Premium imported men's jackets — bombers, denim, leather & outerwear. Old money & streetwear aesthetics." },
  'footwear/heels': { 
    title: "Imported Heels & Stilettos India — Pinterest Aesthetics & Premium Footwear", 
    desc: "Shop luxury imported heels at House of Avira. Discover trending stilettos, platform heels, kitten heels, and Y2K aesthetic footwear. Premium quality, internationally sourced, and delivered across India.",
    keywords: ["imported heels India", "buy stilettos online India", "pinterest aesthetic heels", "Y2K heels online", "platform heels India", "luxury imported footwear", "korean aesthetic heels", "party wear heels"]
  },
  'footwear/boots': { title: "Imported Boots India", desc: "Premium imported boots — ankle boots, combat boots, Chelsea boots & knee-highs from international fashion." },
  'footwear/shoes': { title: "Imported Shoes India", desc: "Shop imported shoes — sneakers, loafers, oxfords & casual shoes. Premium international footwear delivered to India." },
  'footwear/flats': { title: "Imported Flats India", desc: "Comfortable imported flats — ballet flats, mules, slides & slip-ons. Premium quality at House of Avira." },
  'bags/handbags': { title: "Imported Handbags India", desc: "Shop luxury imported handbags — totes, satchels, structured bags & designer-inspired handbags delivered to India." },
  'bags/mini-bags': { title: "Imported Mini Bags India", desc: "Trendy imported mini bags — crossbody, clutches, evening bags & micro bags from international fashion trends." },
  'bags/shoulder-bags': { title: "Imported Shoulder Bags India", desc: "Premium imported shoulder bags — hobo bags, bucket bags & classic shoulder styles from international brands." },
  'accessories/jewellery': { title: "Imported Jewelry & Watches India", desc: "Shop premium imported jewelry and watches — necklaces, rings, bracelets, earrings & watches from House of Avira." },
  'accessories/phone-cases': { title: "Imported Phone Cases India", desc: "Shop aesthetic imported phone cases for iPhone & Android. Trendy, cute & premium quality phone cases." },
  'accessories/hair': { title: "Imported Hair Accessories & Wigs India", desc: "Trendy imported hair accessories & wigs — clips, bands, scrunchies, claw clips & wigs from international fashion." },
  'accessories/belts': { title: "Imported Belts & Caps India", desc: "Premium imported belts & caps — leather belts, fashion belts, caps and hats." },
  'accessories/nails': { title: "Imported Nail Art Supplies India", desc: "Shop imported nail art supplies — press-on nails, nail stickers, nail art tools & accessories." },
  'accessories/keychains': { title: "Imported Keychains India", desc: "Cute imported keychains & charms — character keychains, aesthetic keychains & premium key accessories." },
};

function getCategoryInfo(slugArray) {
  if (!slugArray || slugArray.length === 0) return { name: 'Category', breadcrumbs: [] };
  
  const main = slugArray[0];
  const formatName = (str) => str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  
  const breadcrumbs = slugArray.map((segment, index) => ({
    name: formatName(segment),
    slug: slugArray.slice(0, index + 1).join('/'),
  }));

  const fullSlug = slugArray.join('/');
  const subMeta = subCategoryMeta[fullSlug];
  const mainMeta = categoryMeta[main];
  
  if (subMeta) {
    return {
      name: subMeta.title.split(' | ')[0],
      title: `${subMeta.title} | House of Avira`,
      description: subMeta.desc,
      keywords: subMeta.keywords,
      breadcrumbs,
    };
  }
  
  if (mainMeta) {
    return {
      name: mainMeta.h1,
      title: mainMeta.title,
      description: mainMeta.description,
      keywords: mainMeta.keywords,
      breadcrumbs,
    };
  }

  // Fallback for unlisted categories
  const displayName = slugArray.map(formatName).reverse().join(' — ');
  return {
    name: displayName,
    title: `${displayName} — Imported Fashion India | House of Avira`,
    description: `Shop premium imported ${displayName.toLowerCase()} at House of Avira. Internationally sourced fashion delivered to your doorstep in India.`,
    breadcrumbs,
  };
}

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const info = getCategoryInfo(params.slug);
  const canonicalPath = `/category/${params.slug.join('/')}`;
  
  return {
    title: info.title,
    description: info.description,
    keywords: info.keywords,
    alternates: {
      canonical: `https://houseofavira.shop${canonicalPath}`,
    },
    openGraph: {
      title: info.title,
      description: info.description,
      url: `https://houseofavira.shop${canonicalPath}`,
      siteName: 'House of Avira',
      images: ['/opengraph-image.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: info.title,
      description: info.description,
    },
  };
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const info = getCategoryInfo(resolvedParams.slug);
  const canonicalPath = `/category/${resolvedParams.slug.join('/')}`;

  // Build BreadcrumbList schema
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
      ...info.breadcrumbs.map((bc, idx) => ({
        "@type": "ListItem",
        "position": idx + 2,
        "name": bc.name,
        "item": `https://houseofavira.shop/category/${bc.slug}`
      }))
    ]
  };

  // Build CollectionPage schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": info.name,
    "description": info.description,
    "url": `https://houseofavira.shop${canonicalPath}`,
    "isPartOf": {
      "@id": "https://houseofavira.shop/#website"
    },
    "provider": {
      "@id": "https://houseofavira.shop/#organization"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <CategoryClient slug={resolvedParams.slug} />
    </>
  );
}
