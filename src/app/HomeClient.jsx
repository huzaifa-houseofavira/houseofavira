'use client';

import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import HowItWorks from '@/components/HowItWorks';
import WhyHouseOfAvira from '@/components/WhyHouseOfAvira';
import CampaignAndGrid from '@/components/CampaignAndGrid';
import PinterestFeed from '@/components/PinterestFeed';

import LiveProducts from '@/components/LiveProducts';

import ContactForm from '@/components/ContactForm';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Plane } from 'lucide-react';
import PriceDisplay from '@/components/PriceDisplay';

const categories = [
  { title: "Dresses", img: "/images/categories/dress.png", link: "/category/women/dresses" },
  { title: "Tops", img: "/top category.png", link: "/category/women/tops" },
  { title: "Bottoms", img: "/bottoms new.png", link: "/category/women/pants-jeans" },
  { title: "Denim", img: "/images/categories/denim.png", link: "/category/women/denim" },
  { title: "Activewear", img: "/images/categories/gymwear.png", link: "/category/women/activewear" },
  { title: "T-shirts", img: "/images/categories/tshirts.png", link: "/category/women/t-shirts" },
  { title: "Co-ords", img: "/images/categories/co-ords.png", link: "/category/women/co-ords" },
  { title: "Homewear", img: "/images/categories/homewear.png", link: "/category/women/homewear" },
  { title: "Bags", img: "/images/categories/bags.jpg", link: "/category/bags" },
  { title: "Jewellery", img: "/images/categories/jewellery.png", link: "/category/accessories/jewellery" },
  { title: "Accessories", img: "/images/categories/accessories.jpg", link: "/category/accessories" },
  { title: "Beauty", img: "/images/categories/beauty.png", link: "/category/accessories/nails" }
];

const aestheticsCards = [
  { title: "babydoll / coquette", img: "/babydoll.png" },
  { title: "dark feminine", img: "/opium.png" },
  { title: "office siren", img: "/officesiren.png" },
  { title: "y2k", img: "/elegant-chic.png" },
  { title: "streetwear", img: "/streetwear.png" },
  { title: "elegant chic", img: "/y2k.png" },
  { title: "grunge", img: "/dark-feminine.png" },
  { title: "Summer vacation", img: "/summer-vacation.png" }
];

export default function HomeClient() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { t } = useTranslation();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 200 : 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const aestheticsTabs = [
    'babydoll / coquette',
    'dark feminine',
    'office siren',
    'y2k',
    'streetwear',
    'elegant chic',
    'grunge'
  ];
  const [activeAesthetic, setActiveAesthetic] = useState(aestheticsTabs[0]);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'best'

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    await toggleWishlist(product);
  };
  const dummyProducts = [
    {
      id: "valerie-ruffle-hot-short",
      name: "Valerie Ruffle Hot Short",
      price: 3900.00,
      imageUrl: "/product1.png",
      badge: "MOST LOVED",
      swatches: [
        { color: "#8cb4d6", active: true },
        { color: "#000000", active: false }
      ],
      extraColors: 0
    },
    {
      id: "ravenna-mini-dress",
      name: "Ravenna Mini Dress",
      price: 6000.00,
      imageUrl: "/product2.png",
      badge: "MOST LOVED",
      swatches: [
        { color: "#8fe3ff", active: true },
        { color: "#f7f5db", active: false },
        { color: "#000000", active: false }
      ],
      extraColors: 1
    },
    {
      id: "nyomi-mini-dress",
      name: "Nyomi Mini Dress",
      price: 5500.00,
      imageUrl: "/product3.png",
      badge: "NEW",
      swatches: [
        { color: "#4a3525", active: true },
        { color: "#000000", active: false },
        { color: "#ffffff", active: false }
      ],
      extraColors: 1
    },
    {
      id: "ave-bikini-bottom",
      name: "Ave Bikini Bottom",
      price: 3600.00,
      imageUrl: "/product4.png",
      badge: "NEW",
      swatches: [
        { color: "#b5878d", active: true },
        { color: "#d9ba96", active: false },
        { color: "#1f4a66", active: false }
      ],
      extraColors: 2
    }
  ];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products', { next: { revalidate: 60 } });
        const fetchedProducts = await res.json();

        // If empty, fall back to dummy data so layout isn't broken
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

  const newArrivals = products.filter(p => p.sections?.includes('New Arrivals') || p.section === 'New Arrivals');
  const bestSellers = products.filter(p => p.bestSeller === true || p.sections?.includes('Best Seller') || p.section === 'Best Sellers');
  const bestSellersList = bestSellers;
  const curatedAestheticsRaw = products.filter(p => p.sections?.includes('Shop your aesthetic') || p.section === 'Shop your aesthetic');
  const curatedAesthetics = curatedAestheticsRaw.filter(p => p.aesthetic === activeAesthetic);
  const curatedItems = curatedAesthetics.length > 0 ? curatedAesthetics : dummyProducts.slice(0, 5);
  const topPicksGridItemsRaw = products.filter(p => p.sections?.includes('Top Picks Grid') || p.section === 'Top Picks Grid');
  const topPicksGridItems = topPicksGridItemsRaw.slice(0, 12);

  return (
    <div className="flex flex-col w-full">
      {/* Fullscreen Hero Image Carousel */}
      <HeroCarousel />

      {/* Modern Trust Strip */}
      <div className="w-full relative z-20">
        {/* Mobile View */}
        <div className="md:hidden w-full bg-[#FAFAFA] border-b border-[#000000]/5 py-3 overflow-hidden flex flex-col justify-center items-center gap-3">
          <div className="flex justify-center items-center gap-4 text-[10px] font-perandory font-bold tracking-[0.2em] uppercase text-[#000000]/80 px-4">
            <div className="flex items-center gap-2 shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
              <span>5000+ Orders</span>
            </div>
            <span className="text-[#000000]/20 shrink-0">•</span>
            <div className="flex items-center gap-2 shrink-0">
              <Plane className="w-4 h-4" />
              <span>Imported Directly</span>
            </div>
          </div>
          <div className="flex justify-center items-center gap-4 text-[10px] font-perandory font-bold tracking-[0.2em] uppercase text-[#000000]/80 px-4">
            <div className="flex items-center gap-2 shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <span>4+ Years Trusted</span>
            </div>
          </div>
        </div>

        {/* Desktop View (Straight Marquee) */}
        <div className="hidden md:flex w-full h-[70px] overflow-hidden bg-[#111111] items-center justify-center border-y border-white/10">
          <div className="flex whitespace-nowrap animate-marquee-full shrink-0 items-center h-full">
            {[...Array(6)].map((_, i) => (
              <div key={`mqa3-${i}`} className="flex items-center gap-16 px-8 h-full">
                <span className="text-white font-bold tracking-[0.3em] uppercase text-base font-sans drop-shadow-sm">5000+ Orders</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5c00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 2v20M17 5l-10 14M22 12H2M19 19L5 5" /></svg>
                <span className="text-white font-bold tracking-[0.3em] uppercase text-base font-sans drop-shadow-sm">Imported Directly</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5c00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 2v20M17 5l-10 14M22 12H2M19 19L5 5" /></svg>
                <span className="text-white font-bold tracking-[0.3em] uppercase text-base font-sans drop-shadow-sm">4+ Years Trusted</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5c00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 2v20M17 5l-10 14M22 12H2M19 19L5 5" /></svg>
              </div>
            ))}
          </div>
          <div className="flex whitespace-nowrap animate-marquee-full shrink-0 items-center h-full" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <div key={`mqb3-${i}`} className="flex items-center gap-16 px-8 h-full">
                <span className="text-white font-bold tracking-[0.3em] uppercase text-base font-sans drop-shadow-sm">5000+ Orders</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5c00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 2v20M17 5l-10 14M22 12H2M19 19L5 5" /></svg>
                <span className="text-white font-bold tracking-[0.3em] uppercase text-base font-sans drop-shadow-sm">Imported Directly</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5c00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 2v20M17 5l-10 14M22 12H2M19 19L5 5" /></svg>
                <span className="text-white font-bold tracking-[0.3em] uppercase text-base font-sans drop-shadow-sm">4+ Years Trusted</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5c00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 2v20M17 5l-10 14M22 12H2M19 19L5 5" /></svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Arrivals Section */}
      <section id="new-arrivals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 w-full border-b border-[#000000]/10 scroll-mt-20">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div className="flex items-baseline gap-6 sm:gap-8 flex-wrap">
            <h2 className="text-3xl font-serif tracking-tight text-[#000000] font-semibold italic border-black border-b-2 pb-1">
              {t.hero.newArrivals}
            </h2>
            <a href="/catalogue" className="text-xs font-semibold tracking-widest uppercase text-[#000000]/70 hover:text-[#000000] sm:ml-2">
              {t.hero.shopAll}
            </a>
          </div>
          <div className="flex gap-2 text-[#000000]/40 self-end sm:self-auto">
            <button onClick={() => scroll('left')} className="hover:text-[#000000] transition-colors cursor-pointer" aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button onClick={() => scroll('right')} className="hover:text-[#000000] transition-colors cursor-pointer" aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        {/* Horizontally Scrollable Product List */}
        <div ref={scrollRef} className="flex overflow-x-auto gap-4 hide-scrollbar snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
          {newArrivals.map((product, idx) => (
            <div key={product.id || idx} className="w-[calc(50%-8px)] md:w-[calc(25%-12px)] snap-start flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers & Might Interest You Section */}
      {bestSellersList.length > 0 && (
        <PinterestFeed products={bestSellersList}>
          <div className="w-full bg-[#FAFAFA] pt-12 md:pt-24 pb-8 md:pb-16 relative z-30">
            <div className="text-center max-w-[1400px] mx-auto fade-up px-4">
              <h2 className="font-perandory text-4xl md:text-5xl lg:text-7xl font-bold tracking-widest uppercase text-black mb-6">
                Best Seller
              </h2>
              <p className="font-aston-script text-3xl md:text-4xl lg:text-5xl text-[#8A001A] leading-relaxed max-w-4xl mx-auto">
                Our most loved pieces, curated just for you
              </p>
            </div>
          </div>
        </PinterestFeed>
      )}

      {/* Shop Your Look Section */}
      <section className="w-full bg-[#000000] flex flex-col">
        {/* Header */}
        <div className="w-full px-6 md:px-12 py-8 md:py-12 flex items-center">
          <h2 className="font-perandory tracking-widest text-white uppercase" style={{ fontFamily: 'var(--font-perandory), Perandory, sans-serif', fontStyle: 'normal', fontWeight: 700, fontSize: '48px', lineHeight: '48px' }}>Shop your look</h2>
        </div>

        {/* Images Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-4 aspect-auto md:aspect-[4/1.5] lg:aspect-[4/1.8]">
          {[
            { img: '/images/looks/casual.jpg', title: 'CASUAL' },
            { img: '/images/looks/summer.png', title: 'SUMMER' },
            { img: '/images/looks/festival-concerts.png', title: 'FESTIVALS / CONCERTS' },
            { img: '/images/looks/trendy.png', title: 'TRENDY' }
          ].map((look, idx) => (
            <Link href={`/shop-your-look?category=${encodeURIComponent(look.title.toLowerCase())}`} key={idx} className="relative group overflow-hidden block w-full h-[60vh] md:h-full cursor-pointer">
              <Image src={look.img} alt={look.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-center transition-transform duration-[2000ms] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:from-black/60 md:via-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-10">
                <span className="text-white text-lg md:text-xl font-perandory font-bold tracking-widest uppercase">{look.title}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="w-full flex justify-center items-center py-10 md:py-16">
          <Link href="/catalogue" className="border border-white text-white px-8 py-3 text-sm md:text-base font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300 font-perandory">
            SEE ALL STYLES
          </Link>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="w-full bg-[#FFFFFF] pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="w-full text-left max-w-[1600px] mx-auto px-4 md:px-8 mb-6">
          <h2 className="text-4xl md:text-5xl font-perandory font-bold tracking-widest text-[#000000] uppercase">
            CATEGORIES
          </h2>
        </div>

        {/* 12-Card Grid (4 columns on desktop and mobile, minimal gap) */}
        <div className="max-w-[1600px] mx-auto grid grid-cols-4 gap-1 md:gap-2 px-4 md:px-8">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.link}
              className="relative aspect-[3/4] block overflow-hidden bg-gray-200 group cursor-pointer"
            >
              <Image
                  src={cat.img}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 25vw, 15vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              {/* Dark Overlay Gradient (bottom only) */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 transition-opacity duration-300" />
              
              {/* Bottom Centered Label */}
              <div className="absolute bottom-3 md:bottom-6 left-0 right-0 flex justify-center items-center z-10 px-1">
                <span 
                  className="text-white text-[10px] sm:text-[11px] md:text-3xl font-sans font-black tracking-widest md:tracking-wide text-center whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-full"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}
                >
                  {cat.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Curated Aesthetics Section */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-24 bg-white w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-perandory font-bold text-[#000000] mb-4">{t.curated.title}</h2>
          <p className="font-aston-script text-xl md:text-2xl text-[#000000]/80 mb-12 capitalize">{t.curated.subtitle}</p>

          {/* Aesthetic Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-left">
            {aestheticsCards.map((cat, idx) => (
              <Link
                key={idx}
                href={`/shop-aesthetic?category=${encodeURIComponent(cat.title)}`}
                className="relative aspect-[3/4] block overflow-hidden bg-gray-100 group cursor-pointer rounded-2xl md:rounded-none transition-all hover:ring-2 hover:ring-[#000000]"
              >
                <Image
                  src={cat.img}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 25vw, 15vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Dark Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                
                {/* Bottom Label */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white z-10">
                  <span className="text-xs md:text-sm font-bold tracking-widest uppercase">{cat.title}</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="w-full bg-[#FFFFFF] text-[#000000] py-16 md:py-24 overflow-hidden border-y-[3px] border-[#000000] relative">
        <div className="flex flex-col gap-20 relative z-10">
          {/* Top Line: Bold, Tall & Big */}
          <div className="flex whitespace-nowrap">
            <div className="flex animate-marquee-full shrink-0">
              {[...Array(4)].map((_, i) => (
                <span key={`mqa1-${i}`} className="text-6xl md:text-8xl lg:text-[7rem] font-perandory tracking-tighter uppercase mx-10 whitespace-nowrap scale-y-[1.25] inline-block origin-center pb-2">
                  {t.marquee.line1}
                </span>
              ))}
            </div>
            <div className="flex animate-marquee-full shrink-0" aria-hidden="true">
              {[...Array(4)].map((_, i) => (
                <span key={`mqb1-${i}`} className="text-6xl md:text-8xl lg:text-[7rem] font-perandory tracking-tighter uppercase mx-10 whitespace-nowrap scale-y-[1.25] inline-block origin-center pb-2">
                  {t.marquee.line1}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Line: Spaced & Informative */}
          <div className="flex whitespace-nowrap">
            <div className="flex animate-marquee-full-reverse shrink-0">
              {[...Array(6)].map((_, i) => (
                <span key={`mqa2-${i}`} className="text-lg md:text-2xl tracking-[0.4em] uppercase mx-16 whitespace-nowrap opacity-80 inline-block origin-center pt-2" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontWeight: 500 }}>
                  {t.marquee.line2}
                </span>
              ))}
            </div>
            <div className="flex animate-marquee-full-reverse shrink-0" aria-hidden="true">
              {[...Array(6)].map((_, i) => (
                <span key={`mqb2-${i}`} className="text-lg md:text-2xl tracking-[0.4em] uppercase mx-16 whitespace-nowrap opacity-80 inline-block origin-center pt-2" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontWeight: 500 }}>
                  {t.marquee.line2}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Soft Silhouettes Campaign & 4-Grid GSAP Section */}
      <CampaignAndGrid />


      {/* Why House of Avira Section */}
      <WhyHouseOfAvira />

      {/* How It Works Educational Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Live Products Section */}
      <div className="w-full relative">
        <LiveProducts />
      </div>


      {/* Contact Us Section */}
      <ContactForm />

      {/* Join the Archive Section */}
      <section className="py-32 md:py-48 px-6 bg-[#FFFFFF] flex flex-col items-center justify-center text-center w-full">
        <div className="w-full max-w-xl">
          <h3 className="font-perandory text-3xl md:text-5xl mb-6 text-[#000000] tracking-wider uppercase">{t.archive.title}</h3>
          <p className="font-[family-name:var(--font-dm-sans)] text-sm md:text-base text-gray-600 mb-12">{t.archive.subtitle}</p>
          <form className="flex flex-col md:flex-row w-full gap-4 border-b border-[#000000]/30 pb-4">
            <input type="email" placeholder={t.archive.placeholder} className="bg-transparent font-[family-name:var(--font-dm-sans)] w-full outline-none text-[#000000] placeholder:text-gray-400 text-sm" />
            <button type="button" className="font-[family-name:var(--font-dm-sans)] text-xs uppercase tracking-widest text-[#000000] font-medium hover:opacity-60 transition-opacity text-left md:text-right">{t.archive.subscribe}</button>
          </form>
          

        </div>
      </section>

    </div>
  );
}
