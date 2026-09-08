'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import PriceDisplay from '@/components/PriceDisplay';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const priceTabs = ['199', '299', '499', '999'];

function ShopByPriceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrice = searchParams.get('price') || priceTabs[0];
  
  const [activePrice, setActivePrice] = useState(initialPrice);
  const { user } = useAuthStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { t } = useTranslation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // We can provide some dummy products if DB is empty to prevent it from looking broken
  const dummyProducts = [
    {
      id: "valerie-ruffle-hot-short",
      name: "Valerie Ruffle Hot Short",
      price: 150.00,
      imageUrl: "/product1.png",
      badge: "MOST LOVED",
    },
    {
      id: "ravenna-mini-dress",
      name: "Ravenna Mini Dress",
      price: 250.00,
      imageUrl: "/product2.png",
      badge: "MOST LOVED",
    },
    {
      id: "nyomi-mini-dress",
      name: "Nyomi Mini Dress",
      price: 350.00,
      imageUrl: "/product3.png",
      badge: "NEW",
    },
    {
      id: "ave-bikini-bottom",
      name: "Ave Bikini Bottom",
      price: 600.00,
      imageUrl: "/product4.png",
      badge: "NEW",
    }
  ];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const fetchedProducts = await res.json();

        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          setProducts(dummyProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(dummyProducts);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    await toggleWishlist(product);
  };

  // Logical filtering based on activePrice
  const filterProductsByPrice = (prods, priceStr) => {
    return prods.filter(p => {
      const pPrice = typeof p.price === 'number' ? p.price : parseFloat(p.price);
      if (isNaN(pPrice)) return false;

      switch(priceStr) {
        case '199':
          return pPrice <= 199;
        case '299':
          return pPrice > 199 && pPrice <= 299;
        case '499':
          return pPrice > 299 && pPrice <= 499;
        case '999':
          return pPrice > 499 && pPrice <= 999;
        default:
          return false;
      }
    });
  };

  const curatedItems = filterProductsByPrice(products, activePrice);

  return (
    <div className="pt-24 min-h-screen bg-white">
      <section className="py-10 bg-white w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans font-black tracking-tight text-[#000000] mb-4">Shop By Price</h1>
          
          {/* Pills / Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full mt-8">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-2 md:pb-0">
              {priceTabs.map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActivePrice(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors uppercase ${activePrice === tab ? 'bg-[#000000] text-white' : 'border border-[#000000] text-[#000000] hover:bg-[#000000]/5'}`}
                >
                  Under {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Seamless Grid */}
        <div className="w-full border-t border-b border-[#000000]/20">
          <div className="grid grid-cols-2 md:grid-cols-5 w-full">
            {curatedItems.length > 0 ? (
              curatedItems.map((item, idx) => (
                <Link href={`/product/${item.slug || item.id}`} key={item.id || idx} className="border-r border-[#000000]/20 group cursor-pointer flex flex-col relative bg-white block">
                  {/* Image Block */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FFFFFF]">
                    <img src={item.imageUrl || item.img || item.images?.[0]} alt={item.name || item.title} className="w-full h-full object-cover" />

                    {idx < 2 && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-semibold text-[#000000]">
                        Selling Fast
                      </div>
                    )}

                    {/* Hover Size Selector */}
                    <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-md p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center">
                      <p className="text-[10px] font-bold tracking-widest mb-2 uppercase text-[#000000]">Select Size</p>
                      <div className="flex gap-1.5 justify-center flex-wrap">
                        {(item.sizes || ['XS', 'S', 'M', 'L', 'XL']).map(s => (
                          <button key={s} className="w-6 h-6 border border-[#000000]/20 bg-white text-[10px] font-medium flex items-center justify-center hover:border-[#000000] transition-colors text-[#000000]">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text Block */}
                  <div className="p-4 flex justify-between items-start bg-white h-24">
                    <div className="flex flex-col pr-2">
                      <h3 className="text-xs font-medium text-[#000000] line-clamp-2 leading-tight">{item.name || item.title}</h3>
                      <p className="text-xs text-[#000000]/60 mt-1.5">
                        {typeof item.price === 'number' ? <PriceDisplay basePrice={item.price} /> : item.price}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleWishlistToggle(e, item)}
                      className={`transition-colors shrink-0 ${wishlist.some(w => w.id === item.id) ? 'text-[#000000]' : 'text-[#000000]/40 hover:text-[#000000]'}`}
                      aria-label="Toggle wishlist"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist.some(w => w.id === item.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 md:col-span-5 p-10 text-center text-[#000000]/60 flex flex-col items-center justify-center min-h-[40vh]">
                <p>No products found under {activePrice}.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ShopByPriceClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 bg-white">Loading...</div>}>
      <ShopByPriceContent />
    </Suspense>
  );
}
