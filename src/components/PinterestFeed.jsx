'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StickyScroll from '@/components/ui/sticky-scroll';

export default function PinterestFeed({ children, products = null }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (products) {
      const imgs = products.map(data => {
        const productImages = data.images || (data.imageUrl ? [data.imageUrl] : []);
        if (productImages[0]) {
          return { src: productImages[0], id: data.id };
        }
        return null;
      }).filter(Boolean);
      setImages(imgs);
      return;
    }

    async function fetchImages() {
      try {
        const res = await fetch('/api/products?limit=30');
        const products = await res.json();
        const imgs = products.map(data => {
          const productImages = data.images || (data.imageUrl ? [data.imageUrl] : []);
          if (productImages[0]) {
            return { src: productImages[0], id: data.id };
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
