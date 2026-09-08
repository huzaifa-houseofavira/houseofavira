'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Truck, Package, CreditCard, Globe, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function WhyHouseOfAvira() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredProductId = '7DzypF64LEWkBY1yruXe';
  const [featuredSlug, setFeaturedSlug] = useState(featuredProductId);
  const carouselImages = [
    '/images/bagbg.png',
    '/silver bag.png',
    '/images/bag2.png'
  ];

  useEffect(() => {
    async function fetchSlug() {
      try {
        const res = await fetch('/api/products?limit=1000');
        const products = await res.json();
        const found = products.find(p => p.id === featuredProductId);
        if (found?.slug) {
          setFeaturedSlug(found.slug);
        }
      } catch (err) {
        // Keep fallback ID
      }
    }
    fetchSlug();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const lineVariants = {
    hidden: { scaleX: 0, originX: 0 },
    visible: { scaleX: 1, transition: { duration: 1.5, ease: 'easeInOut' } }
  };

  const lineVerticalVariants = {
    hidden: { scaleY: 0, originY: 0 },
    visible: { scaleY: 1, transition: { duration: 1.5, ease: 'easeInOut' } }
  };

  return (
    <section className="w-full bg-[#FAFAFA] pt-12 pb-12 md:pt-16 md:pb-32 overflow-hidden border-t border-[#000000]/10">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >

        {/* Minimalist Image Overlay Section */}
        <motion.div className="w-full relative mb-32 md:mb-48 flex flex-col items-center justify-center" variants={itemVariants}>
          {/* 3D Swipable Carousel */}
          <div className="relative w-full max-w-5xl mx-auto h-[400px] sm:h-[500px] md:h-[600px] z-10 flex items-center justify-center">
            {carouselImages.map((src, index) => {
              const isCenter = index === currentIndex;
              const isLeft = index === (currentIndex - 1 + carouselImages.length) % carouselImages.length;
              const isRight = index === (currentIndex + 1) % carouselImages.length;

              if (!isCenter && !isLeft && !isRight) return null;

              return (
                <motion.div
                  key={index}
                  className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-[36rem] md:h-[36rem] cursor-pointer"
                  initial={false}
                  animate={{
                    x: isCenter ? 0 : isLeft ? '-40%' : '40%',
                    scale: isCenter ? 1.25 : 0.65,
                    opacity: isCenter ? 1 : 0.5,
                    zIndex: isCenter ? 30 : 10,
                    rotateY: isCenter ? 0 : isLeft ? 15 : -15,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                  style={{ perspective: 1200 }}
                  onClick={() => {
                    if (isLeft) handlePrev();
                    if (isRight) handleNext();
                  }}
                >
                  {isCenter ? (
                    <Link href={`/product/${featuredSlug}`} className="block w-full h-full relative group outline-none">
                      <img src={src} alt="Featured aesthetic" className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" />
                    </Link>
                  ) : (
                    <img src={src} alt="Featured aesthetic" className="w-full h-full object-contain drop-shadow-xl" />
                  )}
                </motion.div>
              );
            })}

            {/* Navigation Arrows */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-8 md:px-12 z-40 pointer-events-none">
              <button onClick={handlePrev} className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-black/5 flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all text-black hover:text-[#8A001A]">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNext} className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-black/5 flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all text-black hover:text-[#8A001A]">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Huge Typography Behind */}
          <div className="absolute top-[35%] sm:top-[35%] left-1/2 -translate-x-1/2 w-full flex items-center justify-center z-0 pointer-events-none">
            <h2 className="font-perandory text-[#000000] text-[9vw] sm:text-[7vw] md:text-[6vw] lg:text-[5.5vw] leading-none whitespace-nowrap tracking-tighter opacity-90 scale-y-[1.5] inline-block origin-center">
              STRAIGHT FROM <span className="text-[#8A001A]">PINTEREST</span>
            </h2>
          </div>
        </motion.div>

        {/* Two Stage Pricing Header */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-perandory font-bold text-[#000000] mb-4">
            Two-Stage <span className="font-aston-script text-5xl md:text-6xl lg:text-7xl text-[#8A001A] tracking-normal font-normal">Pricing</span>
          </h3>
          <p className="max-w-3xl mx-auto" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontStyle: "normal", fontWeight: 500, color: "rgb(0, 0, 0)", fontSize: "16px", lineHeight: "24px" }}>
            We only take two payments: one is the product price which you pay on the website while ordering, and the other is the SHIPPING + DELIVERY CHARGES.
          </p>
        </motion.div>

        {/* Three Stage Pricing Graph */}
        <motion.div className="relative" variants={containerVariants}>

          {/* Desktop Layout (Horizontal) */}
          <div className="hidden md:flex justify-between relative">
            {/* Connecting Line */}
            <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10">
              <motion.div className="h-full bg-[#8A001A]" variants={lineVariants} />
            </div>

            {/* Stage 1 */}
            <motion.div className="flex flex-col items-center text-center w-1/3 px-4 relative" variants={itemVariants}>
              <div className="w-24 h-24 rounded-full bg-white border-4 border-[#000000] flex items-center justify-center shadow-lg mb-6 z-10">
                <CreditCard className="w-10 h-10 text-[#000000]" />
              </div>
              <div className="bg-[#000000] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full mb-4">
                Pay Now
              </div>
              <h4 className="text-2xl font-cormorant-garamond font-bold text-[#000000] mb-3">1. Fixed Product Price</h4>
              <p className="text-sm text-[#000000]/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                You pay only the transparent cost of the items at checkout today.
              </p>
            </motion.div>

            {/* Stage 2 */}
            <motion.div className="flex flex-col items-center text-center w-1/3 px-4 relative" variants={itemVariants}>
              <div className="w-24 h-24 rounded-full bg-white border-4 border-[#8A001A] flex items-center justify-center shadow-lg mb-6 z-10">
                <Plane className="w-10 h-10 text-[#8A001A]" />
              </div>
              <div className="bg-[#8A001A] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full mb-4">
                Billed Later
              </div>
              <h4 className="text-2xl font-cormorant-garamond font-bold text-[#8A001A] mb-3">2. Int'l Shipping & Duty</h4>
              <p className="text-sm text-[#000000]/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Once items arrive at our hub, we calculate the exact customs and international freight to your address.
              </p>
            </motion.div>

            {/* Stage 3 */}
            <motion.div className="flex flex-col items-center text-center w-1/3 px-4 relative" variants={itemVariants}>
              <div className="w-24 h-24 rounded-full bg-[#FAFAFA] border-4 border-[#000000] flex items-center justify-center shadow-lg mb-6 z-10">
                <Truck className="w-10 h-10 text-[#000000]" />
              </div>
              <div className="bg-gray-200 text-[#000000] text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full mb-4">
                Delivery
              </div>
              <h4 className="text-2xl font-cormorant-garamond font-bold text-[#000000] mb-3">3. Doorstep Arrival</h4>
              <p className="text-sm text-[#000000]/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                After the final balance is cleared, we dispatch it locally straight to your doorstep.
              </p>
            </motion.div>
          </div>

          {/* Mobile Layout (Vertical) */}
          <div className="flex md:hidden flex-col gap-12 relative pl-8">
            {/* Connecting Vertical Line */}
            <div className="absolute top-4 bottom-4 left-[60px] w-0.5 bg-gray-200 -z-10">
              <motion.div className="w-full bg-[#8A001A]" variants={lineVerticalVariants} />
            </div>

            {/* Stage 1 */}
            <motion.div className="flex items-start gap-6 relative" variants={itemVariants}>
              <div className="w-14 h-14 rounded-full bg-white border-4 border-[#000000] flex items-center justify-center shadow-md shrink-0 z-10">
                <CreditCard className="w-6 h-6 text-[#000000]" />
              </div>
              <div>
                <div className="inline-block bg-[#000000] text-white text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full mb-2">
                  Pay Now
                </div>
                <h4 className="text-xl font-cormorant-garamond font-bold text-[#000000] mb-2">1. Fixed Product Price</h4>
                <p className="text-sm text-[#000000]/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  You pay only the transparent cost of the items at checkout today.
                </p>
              </div>
            </motion.div>

            {/* Stage 2 */}
            <motion.div className="flex items-start gap-6 relative" variants={itemVariants}>
              <div className="w-14 h-14 rounded-full bg-white border-4 border-[#8A001A] flex items-center justify-center shadow-md shrink-0 z-10">
                <Plane className="w-6 h-6 text-[#8A001A]" />
              </div>
              <div>
                <div className="inline-block bg-[#8A001A] text-white text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full mb-2">
                  Billed Later
                </div>
                <h4 className="text-xl font-cormorant-garamond font-bold text-[#8A001A] mb-2">2. Int'l Shipping & Duty</h4>
                <p className="text-sm text-[#000000]/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Exact customs and international freight billed when it reaches our hub.
                </p>
              </div>
            </motion.div>

            {/* Stage 3 */}
            <motion.div className="flex items-start gap-6 relative" variants={itemVariants}>
              <div className="w-14 h-14 rounded-full bg-[#FAFAFA] border-4 border-[#000000] flex items-center justify-center shadow-md shrink-0 z-10">
                <Truck className="w-6 h-6 text-[#000000]" />
              </div>
              <div>
                <div className="inline-block bg-gray-200 text-[#000000] text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full mb-2">
                  Delivery
                </div>
                <h4 className="text-xl font-cormorant-garamond font-bold text-[#000000] mb-2">3. Doorstep Arrival</h4>
                <p className="text-sm text-[#000000]/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Locally dispatched straight to your doorstep.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
