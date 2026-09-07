'use client';

import { useEffect, useState } from 'react';

export default function PriceDisplay({ basePrice, className }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // To prevent hydration errors, return the base INR price before mount.
  if (!mounted) {
    return <span className={className}>₹{(basePrice ?? 0).toFixed(2)}</span>;
  }

  let formattedPrice;
  const safePrice = basePrice ?? 0;
  try {
    formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(safePrice);
  } catch (e) {
    formattedPrice = `₹${safePrice.toFixed(2)}`;
  }

  return <span className={className}>{formattedPrice}</span>;
}
