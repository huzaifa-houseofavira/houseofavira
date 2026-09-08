import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = 'https://houseofavira.shop';

  // Fetch all products using Admin SDK
  let products = [];
  try {
    if (adminDb) {
      const snapshot = await adminDb.collection('products').get();
      products = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          url: `${baseUrl}/product/${data.slug || doc.id}`,
          lastModified: data.updatedAt?.toDate?.() || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        };
      });
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // All static and category routes
  const routes = [
    { path: '', changeFreq: 'daily', priority: 1.0 },
    { path: '/catalogue', changeFreq: 'daily', priority: 0.9 },
    { path: '/how-it-works', changeFreq: 'monthly', priority: 0.8 },
    { path: '/privacy-policy', changeFreq: 'monthly', priority: 0.8 },
    { path: '/order-info/policies', changeFreq: 'monthly', priority: 0.8 },
    { path: '/order-info/shipping', changeFreq: 'monthly', priority: 0.8 },
    { path: '/order-info/order-process', changeFreq: 'monthly', priority: 0.8 },
    { path: '/auth/login', changeFreq: 'monthly', priority: 0.7 },
    { path: '/auth/register', changeFreq: 'monthly', priority: 0.7 },
    { path: '/wishlist', changeFreq: 'daily', priority: 0.8 },
    // Women
    { path: '/category/women', changeFreq: 'weekly', priority: 0.9 },
    { path: '/category/women/tops', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/women/pants-jeans', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/women/skirts', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/women/dresses', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/women/jackets', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/women/beach-wear', changeFreq: 'weekly', priority: 0.8 },
    // Men
    { path: '/category/men', changeFreq: 'weekly', priority: 0.9 },
    { path: '/category/men/tops', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/men/pants-jeans', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/men/jackets', changeFreq: 'weekly', priority: 0.8 },
    // Footwear
    { path: '/category/footwear', changeFreq: 'weekly', priority: 0.9 },
    { path: '/category/footwear/heels', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/footwear/boots', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/footwear/shoes', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/footwear/flats', changeFreq: 'weekly', priority: 0.8 },
    // Bags
    { path: '/category/bags', changeFreq: 'weekly', priority: 0.9 },
    { path: '/category/bags/handbags', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/bags/mini-bags', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/bags/shoulder-bags', changeFreq: 'weekly', priority: 0.8 },
    // Accessories
    { path: '/category/accessories', changeFreq: 'weekly', priority: 0.9 },
    { path: '/category/accessories/phone-cases', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/phone-cases/iphone', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/phone-cases/android', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/hair', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/belts', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/jewellery', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/accessories/jewellery/necklace', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/jewellery/rings', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/jewellery/bracelets', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/jewellery/earings', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/nails', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/keychains', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/accessories/room-decor', changeFreq: 'weekly', priority: 0.7 },
    // Collectibles
    { path: '/category/collectibles', changeFreq: 'weekly', priority: 0.8 },
    { path: '/category/collectibles/sanrio', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/collectibles/nagano', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/collectibles/miffy', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/collectibles/other', changeFreq: 'weekly', priority: 0.7 },
    // Pets
    { path: '/category/pets', changeFreq: 'weekly', priority: 0.7 },
    { path: '/category/pets/cats', changeFreq: 'weekly', priority: 0.6 },
    { path: '/category/pets/cats/clothes', changeFreq: 'weekly', priority: 0.6 },
    { path: '/category/pets/cats/toys', changeFreq: 'weekly', priority: 0.6 },
    { path: '/category/pets/cats/accessories', changeFreq: 'weekly', priority: 0.6 },
    { path: '/category/pets/dogs', changeFreq: 'weekly', priority: 0.6 },
    { path: '/category/pets/dogs/clothes', changeFreq: 'weekly', priority: 0.6 },
    { path: '/category/pets/dogs/toys', changeFreq: 'weekly', priority: 0.6 },
    // Info pages
    { path: '/shipping', changeFreq: 'monthly', priority: 0.5 },
    { path: '/order-info', changeFreq: 'monthly', priority: 0.5 },
    { path: '/policy', changeFreq: 'monthly', priority: 0.4 },
    { path: '/track-order', changeFreq: 'monthly', priority: 0.5 },
    { path: '/shop-by-price', changeFreq: 'weekly', priority: 0.7 },
    { path: '/shop-aesthetic', changeFreq: 'weekly', priority: 0.7 },
    { path: '/shop-your-look', changeFreq: 'weekly', priority: 0.7 },
  ];

  const staticRoutes = routes.map(({ path, changeFreq, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority: priority,
  }));

  return [...staticRoutes, ...products];
}
