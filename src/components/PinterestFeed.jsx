'use client';

import { useState, useEffect } from 'react';
import StickyScroll from '@/components/ui/sticky-scroll';
import { getCachedProducts } from '@/lib/products-cache';
import { optimizeCloudinaryUrl } from '@/lib/image-optimizer';

export default function PinterestFeed({ children, products = null }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (products) {
      const imgs = products.map(data => {
        const productImages = data.images || (data.imageUrl ? [data.imageUrl] : []);
        if (productImages[0]) {
          return {
            src: optimizeCloudinaryUrl(productImages[0], 800),
            id: data.id,
            slug: data.slug,
          };
        }
        return null;
      }).filter(Boolean);
      setImages(imgs);
      return;
    }

    async function fetchImages() {
      try {
        const fetchedProducts = await getCachedProducts({ limit: 30 });
        const imgs = fetchedProducts.map(data => {
          const productImages = data.images || (data.imageUrl ? [data.imageUrl] : []);
          if (productImages[0]) {
            return {
              src: optimizeCloudinaryUrl(productImages[0], 800),
              id: data.id,
              slug: data.slug,
            };
          }
          return null;
        }).filter(Boolean);
        setImages(imgs);
      } catch (err) {
        console.error('PinterestFeed fetch error:', err);
      }
    }
    fetchImages();
  }, [products]);

  if (images.length === 0) {
    return (
      <div className="w-full relative z-20">
        {children}
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-[#8A001A] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <StickyScroll products={images}>
      {children}
    </StickyScroll>
  );
}
