'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Plane, Globe, Package, FileText, Receipt, Truck, ShieldCheck, Clock, AlertTriangle, ChevronDown, MessageCircle, Mail, Smartphone, Megaphone, Scale, Box, Sparkles, Heart, Zap, Weight, Maximize, LayoutGrid, FileCheck, BarChart2, Calendar, CloudLightning, Map, Flame, ChevronRight, Info } from 'lucide-react';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion';

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

/* ─── Reveal on scroll wrapper ─── */
function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Horizontal reveal line ─── */
function RevealLine({ className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className={`h-px bg-gradient-to-r from-transparent via-[#8A001A] to-transparent ${className}`}
      initial={{ scaleX: 0 }}
      animate={isInView ? { scaleX: 1 } : {}}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}

/* ─── Floating SVG decorations ─── */
function FloatingIcon({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stagger variants ─── */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};
const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function ShippingPage() {
  const containerRef = useRef(null);

  /* ── Parallax scroll values ── */
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.08]);

  /* ── Smooth spring for progress bar ── */
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div ref={containerRef} className="relative bg-[#FAFAFA] text-[#1a1a1a] overflow-hidden" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>

      {/* ═══ PROGRESS BAR ═══ */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#8A001A] via-[#c4002a] to-[#8A001A] z-[9999] origin-left"
        style={{ scaleX }}
      />

      {/* ═══════ HERO — MINIMALIST EDITORIAL ═══════ */}
      <section className="relative min-h-[90vh] md:min-h-[100vh] flex items-center justify-center p-4 pt-16 md:pt-20">
        <div className="relative w-full h-full min-h-[85vh] md:min-h-[90vh] rounded-[32px] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/order-hero-bg-new.png"
              alt="Shipping Port"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 w-full flex flex-col md:flex-row items-center justify-between gap-12 pt-12 md:pt-0">
            
            {/* Left side text */}
            <div className="w-full md:w-[55%] flex flex-col items-start pb-10 md:pb-0">
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-12 h-1 bg-[#8A001A] mb-6 md:mb-10 origin-left" 
              />
              
              <div className="relative w-full">
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="font-perandory text-[55px] sm:text-[75px] md:text-[85px] lg:text-[100px] text-[#111111] uppercase leading-[0.85] tracking-tighter w-full"
                >
                  SHIPPING<br/>
                  &amp; DELIVERY
                </motion.h1>
                <motion.span 
                  initial={{ opacity: 0, rotate: -5, y: 10 }}
                  animate={{ opacity: 0.9, rotate: -5, y: 0 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="font-aston-script text-[45px] sm:text-[55px] md:text-[60px] lg:text-[75px] text-[#8A001A] absolute -bottom-10 md:-bottom-12 left-2 md:left-4 lg:left-8 italic whitespace-nowrap drop-shadow-sm z-10"
                >
                  Across the Globe
                </motion.span>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-20 md:mt-24 max-w-[420px]"
              >
                <p className="text-white text-sm md:text-[15px] leading-relaxed font-medium bg-black/40 backdrop-blur-sm p-3 rounded-lg drop-shadow-md border border-white/10">
                  Experience seamless delivery tailored for you. Track your orders, understand shipping timelines, and enjoy a hassle-free journey from our store to your door.
                </p>
              </motion.div>
            </div>

            {/* Right side tracking card */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full md:w-[440px] shrink-0 pb-12 md:pb-0"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white">
                
                {/* Header */}
                <div className="flex bg-[#F5F5F7] rounded-full p-1.5 mb-8 shadow-inner border border-gray-100/50">
                  <div className="w-full bg-[#5A1C20] text-white py-2.5 px-4 rounded-full text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 shadow-md">
                    <Package className="w-4 h-4" />
                    Tracking Package
                  </div>
                </div>

                {/* Form */}
                <form action="/track-order" method="GET" className="space-y-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      name="orderId"
                      required
                      placeholder="Order ID (e.g. #HOA001)" 
                      className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1C20]/20 focus:border-[#5A1C20] text-sm bg-white transition-all shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="contact"
                      required
                      placeholder="Phone No. or Email" 
                      className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A1C20]/20 focus:border-[#5A1C20] text-sm bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-2 pb-4">
                    <span>Enter details used during checkout.</span>
                  </div>

                  <button type="submit" className="w-full flex items-center justify-center bg-[#5A1C20] text-white py-4 rounded-xl font-bold tracking-wide shadow-[0_8px_20px_rgba(90,28,32,0.2)] hover:bg-[#4a171a] hover:shadow-[0_10px_25px_rgba(90,28,32,0.3)] transition-all transform hover:-translate-y-0.5">
                    Track Order
                  </button>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════ SECTION 01 — INTERNATIONAL SHIPPING ═══════ */}
      <section className="relative py-24 md:py-36 bg-[#FAFAFA]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#8A001A]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-16">
          {/* Step header */}
          <RevealSection className="mb-16 md:mb-24">
            <div className="flex items-end gap-6 md:gap-10">
              <span className="font-perandory text-[8rem] md:text-[12rem] leading-none text-black/[0.04] select-none">01</span>
              <div className="pb-4 md:pb-8">
                <p className="text-[#8A001A] text-xs font-bold uppercase tracking-[0.3em] mb-2">Worldwide</p>
                <h2 className="font-perandory text-3xl md:text-5xl lg:text-6xl uppercase">International Shipping</h2>
              </div>
            </div>
          </RevealSection>

          <RevealLine className="mb-16" />

          {/* Key Point — dark featured card */}
          <RevealSection delay={0.1} className="mb-16">
            <div className="relative rounded-2xl overflow-hidden bg-[#111] shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
                style={{ backgroundImage: 'url(/images/global.png)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#8A001A]/20 via-[#111]/60 to-[#111]/80" />
              <div className="relative p-10 md:p-16 border border-white/10 rounded-2xl">
                <p className="font-perandory text-2xl md:text-3xl text-white leading-[1.4] mb-4 uppercase tracking-wide">
                  Shipping charges are <span className="text-[#8A001A]">completely separate</span> from the product price.
                </p>
                <p className="text-white/50 text-sm md:text-base leading-[1.9]">
                  These charges are NOT collected during checkout. They are calculated later once your products arrive at our shipping warehouse, allowing us to determine the most accurate amount possible.
                </p>
              </div>
            </div>
          </RevealSection>

          {/* What it includes */}
          <RevealSection delay={0.15} className="mb-16">
            <h3 className="font-perandory text-3xl md:text-5xl font-bold uppercase tracking-wide text-[#1a1a1a] mb-8">May Include</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
            >
              {[
                { icon: Plane, label: 'International freight charges' },
                { icon: ShieldCheck, label: 'Customs duties' },
                { icon: FileText, label: 'Customs clearance fees' },
                { icon: Receipt, label: 'Import-related taxes' },
                { icon: Truck, label: 'Logistics costs' },
                { icon: Package, label: 'Handling charges' },
                { icon: Box, label: 'Product-specific shipping requirements' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl p-4 md:p-5 flex items-center gap-4 md:gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] cursor-default transition-all duration-300 group"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f8f8f8] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 text-[#1a1a1a] stroke-[1.5]" />
                  </div>
                  <div className="h-10 w-[1px] bg-gray-200 flex-shrink-0" />
                  <div className="text-[#1a1a1a] font-medium text-[14px] md:text-[15px] leading-snug text-left whitespace-pre-line" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </RevealSection>

          {/* Factors */}
          <RevealSection delay={0.2} className="mb-16">
            <div className="max-w-3xl mx-auto mb-8 text-center md:text-left pl-0 md:pl-2">
              <h3 className="font-perandory text-3xl md:text-5xl font-bold uppercase tracking-wide text-[#1a1a1a]">Final Amount Depends On</h3>
            </div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
            >
              {[
                { label: "Product\nweight", icon: Weight },
                { label: "Volumetric\nweight", icon: Box },
                { label: "Parcel\ndimensions", icon: Maximize },
                { label: "Product\ncategory", icon: LayoutGrid },
                { label: "Logistics\nrates", icon: Truck },
                { label: "Customs\nrequirements", icon: FileCheck },
                { label: "Carrier\nrates", icon: Plane },
                { label: "Economic\nconditions", icon: BarChart2 },
                { label: "Market\nconditions", icon: Globe }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl p-4 md:p-5 flex items-center gap-4 md:gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] cursor-default transition-all duration-300"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f8f8f8] flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 text-[#1a1a1a] stroke-[1.5]" />
                  </div>
                  <div className="h-10 w-[1px] bg-gray-200 flex-shrink-0" />
                  <div className="text-[#1a1a1a] font-medium text-[14px] md:text-[15px] leading-snug text-left whitespace-pre-line" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════ PARALLAX DIVIDER ═══════ */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ y: useTransform(scrollYProgress, [0.2, 0.35], [0, -60]) }}
        >
          <Image
            src="/images/branded-items-bg.png"
            alt="Branded products and logistics"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <RevealSection>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50 mb-4">Special Categories</p>
            <h2 className="font-perandory text-4xl md:text-6xl lg:text-7xl uppercase mb-4 text-white">Branded Products</h2>
            <p className="font-aston-script text-[#c4a87c] text-2xl md:text-4xl">& Special Items</p>
          </RevealSection>
        </div>
      </section>

      {/* ═══════ BRANDED PRODUCTS ═══════ */}
      <section className="relative py-20 md:py-28 bg-[#FAFAF8] text-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 100px, rgba(0,0,0,0.1) 100px, rgba(0,0,0,0.1) 101px)' }} />

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
          <RevealSection className="mb-14">
            <div className="relative p-8 md:p-10 rounded-[28px] bg-gradient-to-r from-[#FFF5F5]/90 to-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#ff7a7a] to-[#c62828]" />
              {/* Box Graphic on the right */}
              <div className="absolute -right-16 -bottom-16 w-64 h-64 opacity-80 rotate-12 pointer-events-none hidden md:block">
                <div className="w-full h-full bg-gradient-to-tr from-[#F5F5F5] to-[#FFFFFF] shadow-2xl rounded-sm border border-[#E5E5E5] relative">
                   <div className="absolute bottom-4 right-4 w-10 h-14 bg-[#c62828] flex flex-col items-center justify-end pb-1.5 rounded-sm shadow-md">
                     <span className="font-aston-script text-white/90 text-lg leading-none">A</span>
                   </div>
                   <div className="absolute inset-0 border-t-[2px] border-l-[2px] border-white" />
                   <div className="absolute left-1/2 -top-4 bottom-0 w-[2px] bg-[#E5E5E5]" />
                   <div className="absolute top-1/2 -left-4 right-0 h-[2px] bg-[#E5E5E5]" />
                </div>
              </div>

              <div className="w-20 h-20 shrink-0 rounded-full bg-[#FFEFEF] flex items-center justify-center shadow-inner relative z-10">
                <AlertTriangle className="w-10 h-10 text-[#c62828]" />
              </div>
              <div className="relative z-10 md:pt-3">
                <h3 className="text-xl md:text-[22px] font-bold text-[#1a1a1a] mb-2 tracking-tight">Additional charges may apply.</h3>
                <p className="text-[14px] text-[#666666] leading-relaxed max-w-md font-medium">
                  Certain products may attract higher customs and shipping costs due to additional inspections, clearance requirements, restrictions, or documentation.
                </p>
              </div>
            </div>
          </RevealSection>

          <RevealSection className="mb-10 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
              <Sparkles className="w-4 h-4 text-[#c62828]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#c62828]">Additional Costs By Category</p>
            </div>
            <h2 className="font-perandory text-4xl md:text-5xl text-[#1a1a1a] mb-4 tracking-tight">
              Know before <span className="font-aston-script text-[#c62828] lowercase italic text-5xl md:text-6xl">you order.</span>
            </h2>
            <p className="text-[14px] text-[#666666] max-w-sm mx-auto md:mx-0">
              These charges are generally included in your final shipping calculation.
            </p>
          </RevealSection>

          <motion.div
            className="flex flex-col gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            {[
              { label: 'Hello Kitty, Sanrio etc.', sub: 'Premium & branded items', icon: Sparkles },
              { label: 'Cosmetics & Beauty', sub: 'Beauty, skincare, makeup & more', icon: Heart },
              { label: 'Lighters', sub: 'All types of lighters', icon: Zap },
              { label: 'Restricted categories', sub: 'Products with shipping restrictions', icon: AlertTriangle },
              { label: 'Fragile items', sub: 'Breakable or delicate products', icon: ShieldCheck },
              { label: 'Oversized items', sub: 'Large in size or weight', icon: Box },
              { label: 'Special handling', sub: 'Items requiring extra care', icon: Package },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-[20px] p-4 md:p-5 flex items-center justify-between shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-transparent hover:shadow-[0_8px_25px_rgba(198,40,40,0.08)] hover:border-[#c62828]/10 transition-all duration-300 cursor-default group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#FFF5F5] flex items-center justify-center shrink-0 group-hover:bg-[#FFE0E0] transition-colors duration-300">
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 text-[#c62828] group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h4 className="text-[15px] md:text-[16px] font-bold text-[#1a1a1a] mb-0.5">{item.label}</h4>
                    <p className="text-[12px] md:text-[13px] text-[#888888]">{item.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <RevealSection delay={0.3}>
            <div className="mt-10 flex items-start justify-center md:justify-start gap-3 opacity-80">
              <Info className="w-5 h-5 text-[#666666] shrink-0 mt-0.5" />
              <p className="text-[#666666] text-[13px] italic leading-relaxed">These additional costs are generally included within your final shipping calculation.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════ SHIPPING UPDATES ═══════ */}
      <section className="relative pt-10 pb-24 md:pt-16 md:pb-36 bg-[#FAFAFA] overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#8A001A]/5 rounded-full blur-[180px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-16">
          
          {/* Instagram Notice */}
          <RevealSection>
            <div className="mb-16 md:mb-24 relative overflow-hidden rounded-3xl bg-white shadow-[0_10px_50px_rgba(0,0,0,0.06)] border border-[#E5E5E5] flex flex-col md:flex-row items-center justify-between p-8 md:p-12 group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#8A001A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left mb-8 md:mb-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px] shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <svg className="w-9 h-9 text-[#ee2a7b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-perandory text-xl md:text-2xl lg:text-3xl uppercase text-black mb-2 tracking-wide">
                    Instagram is our primary channel for updates
                  </h3>
                  <p className="text-gray-500 font-medium tracking-wide text-sm md:text-base">
                    Follow us for real-time order drops, aesthetic finds, and behind the scenes.
                  </p>
                </div>
              </div>

              <a 
                href="https://www.instagram.com/houseof_avira/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative z-10 whitespace-nowrap inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:shadow-[0_10px_30px_rgba(238,42,123,0.3)] transition-all duration-300"
              >
                Open Instagram
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </RevealSection>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — accent card */}
            <RevealSection>
              <div className="relative rounded-2xl overflow-hidden bg-[#111] shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8A001A]/10 via-transparent to-[#8A001A]/5" />
                <div className="relative p-10 md:p-14 border border-white/10 rounded-2xl">
                  <p className="text-[#8A001A] text-xs font-bold uppercase tracking-[0.3em] mb-4">Stay Informed</p>
                  <h2 className="font-perandory text-3xl md:text-4xl uppercase text-white mb-6">Shipping Updates</h2>
                  <p className="font-aston-script text-[#c4a87c] text-2xl md:text-3xl mb-6">Real-time tracking</p>
                  <p className="text-white/50 text-sm leading-relaxed">
                    We keep you in the loop at every stage. From dispatch to doorstep, you&apos;ll receive timely updates through your preferred channel so you always know where your piece is.
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Right — channel cards */}
            <div>
              <motion.div
                className="grid grid-cols-2 gap-5"
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-50px' }}
              >
                {[
                  { icon: WhatsAppIcon, label: 'WhatsApp', desc: 'Instant order updates' },
                  { icon: Smartphone, label: 'SMS', desc: 'Delivery notifications' },
                  { icon: Mail, label: 'Email', desc: 'Detailed breakdowns' },
                  { icon: Megaphone, label: 'Official Channels', desc: 'Tracking & support' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={staggerItem}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-lg hover:border-[#8A001A]/20 transition-all duration-500 group cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <item.icon className="w-8 h-8 text-[#8A001A] mb-4 group-hover:text-[#c4002a] transition-colors" />
                    </motion.div>
                    <h4 className="font-perandory text-sm uppercase tracking-wider text-[#1a1a1a] mb-1">{item.label}</h4>
                    <p className="text-[11px] text-gray-400 group-hover:text-gray-600 transition-colors">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              <RevealSection delay={0.4}>
                <div className="mt-8">
                  <a
                    href="https://www.instagram.com/houseof_avira/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1a1a1a] text-white rounded-xl transition-all duration-300 hover:bg-[#8A001A] hover:shadow-lg hover:shadow-[#8A001A]/20 hover:-translate-y-1 w-full sm:w-auto"
                  >
                    <span className="font-perandory text-xs sm:text-sm uppercase tracking-widest text-center">Join our group to get updated about shipments</span>
                    <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </RevealSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 02 — DOMESTIC SHIPPING ═══════ */}
      <section className="relative py-24 md:py-36 bg-[#111] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#8A001A]/5 rounded-full blur-[200px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-16 relative z-10">
          {/* Step header */}
          <RevealSection className="mb-16 md:mb-24">
            <div className="flex items-end gap-6 md:gap-10">
              <span className="font-perandory text-[8rem] md:text-[12rem] leading-none text-white/[0.04] select-none">02</span>
              <div className="pb-4 md:pb-8">
                <p className="text-[#8A001A] text-xs font-bold uppercase tracking-[0.3em] mb-2">Within India</p>
                <h2 className="font-perandory text-3xl md:text-5xl lg:text-6xl uppercase">Domestic Shipping</h2>
              </div>
            </div>
          </RevealSection>

          <RevealLine className="mb-16" />

          <RevealSection>
            <p className="text-lg md:text-xl text-white/50 max-w-3xl leading-relaxed mb-16">
              Delivery of your parcel from our warehouse to your final delivery address within India.
            </p>
          </RevealSection>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            {[
              { icon: Scale, label: 'Parcel weight' },
              { icon: Box, label: 'Parcel dimensions' },
              { icon: Globe, label: 'Delivery location' },
              { icon: Truck, label: 'Courier rates' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center transition-all duration-300 group"
              >
                <item.icon className="w-5 h-5 text-[#8A001A] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          <RevealSection delay={0.2}>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 md:p-10 space-y-4">
              <p className="text-white/50 text-sm leading-[1.9]">
                Domestic shipping charges are not collected during checkout. They are included in the final shipping payment together with your international shipping charges. A complete breakdown will always be provided before payment is requested.
              </p>
              <p className="text-white/30 text-xs">Tracking information will be shared once the parcel has been dispatched. We currently ship across India.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════ SECTION 03 — DELIVERY TIMELINES ═══════ */}
      <section className="relative py-24 md:py-36 bg-[#FAFAFA]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#8A001A]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-16">
          {/* Step header */}
          <RevealSection className="mb-16 md:mb-24">
            <div className="flex items-end gap-6 md:gap-10">
              <span className="font-perandory text-[8rem] md:text-[12rem] leading-none text-black/[0.04] select-none">03</span>
              <div className="pb-4 md:pb-8">
                <p className="text-[#8A001A] text-xs font-bold uppercase tracking-[0.3em] mb-2">Timelines</p>
                <h2 className="font-perandory text-3xl md:text-5xl lg:text-6xl uppercase">Delivery Timelines</h2>
              </div>
            </div>
          </RevealSection>

          <RevealLine className="mb-16" />

          {/* Typical Delivery — dark featured card */}
          <RevealSection delay={0.1} className="mb-16">
            <div className="relative rounded-2xl overflow-hidden bg-[#111] shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8A001A]/10 via-transparent to-[#8A001A]/5" />
              <div className="relative p-12 md:p-20 text-center border border-white/10 rounded-2xl">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-6 right-6 opacity-10"
                >
                  <Clock className="w-16 h-16 text-[#8A001A]" />
                </motion.div>
                <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-[#8A001A] block mb-6">Typical Delivery</span>
                <p className="font-perandory text-7xl md:text-8xl lg:text-9xl text-white tracking-tight">2–4</p>
                <p className="font-perandory text-xl md:text-2xl text-white/60 mt-2 uppercase tracking-wider">Weeks</p>
                <p className="text-white/25 text-xs mt-8">after shipment · estimates only · does not include sourcing period</p>
              </div>
            </div>
          </RevealSection>

          <RevealSection delay={0.2} className="mb-16">
            <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FFF5EB] border border-[#8A001A]/[0.08] rounded-2xl p-6 text-center">
              <p className="text-sm text-[#8A001A]/80">In some cases, orders may take up to <strong className="font-semibold text-[#8A001A]">8 weeks or longer</strong> depending on circumstances beyond our control.</p>
            </div>
          </RevealSection>

          {/* Delay Factors */}
          <RevealSection delay={0.25} className="mb-16">
            <h3 className="font-perandory text-3xl md:text-5xl font-bold uppercase tracking-wide text-[#1a1a1a] mb-8">Delays May Occur Due To</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
            >
              {[
                { label: 'Customs inspections', icon: ShieldCheck },
                { label: 'Customs clearance', icon: FileCheck },
                { label: 'Logistics disruptions', icon: Truck },
                { label: 'Weather conditions', icon: CloudLightning },
                { label: 'Public holidays', icon: Calendar },
                { label: 'Transportation delays', icon: Truck },
                { label: 'Political situations', icon: Globe },
                { label: 'War-related disruptions', icon: AlertTriangle },
                { label: 'Economic conditions', icon: BarChart2 },
                { label: 'Carrier delays', icon: Plane },
                { label: 'Supplier delays', icon: Package },
                { label: 'Government regulations', icon: FileText },
                { label: 'Port congestion', icon: AlertTriangle },
                { label: 'Route disruptions', icon: Map }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl p-4 md:p-5 flex items-center gap-4 md:gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] cursor-default transition-all duration-300 group"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f8f8f8] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 text-[#1a1a1a] stroke-[1.5]" />
                  </div>
                  <div className="h-10 w-[1px] bg-gray-200 flex-shrink-0" />
                  <div className="text-[#1a1a1a] font-medium text-[14px] md:text-[15px] leading-snug text-left whitespace-pre-line" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </RevealSection>

          {/* Price Fluctuation */}
          <RevealSection delay={0.3} className="mb-16">
            <h3 className="font-perandory text-3xl md:text-5xl font-bold uppercase tracking-wide text-[#1a1a1a] mb-8">Shipping Prices May Fluctuate Due To</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
            >
              {[
                { label: 'Fuel costs', icon: Flame },
                { label: 'Logistics rates', icon: Truck },
                { label: 'Customs requirements', icon: FileCheck },
                { label: 'Carrier pricing', icon: Plane },
                { label: 'Economic conditions', icon: BarChart2 },
                { label: 'Market fluctuations', icon: Globe }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl p-4 md:p-5 flex items-center gap-4 md:gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] cursor-default transition-all duration-300 group"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f8f8f8] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <item.icon className="w-5 h-5 md:w-6 md:h-6 text-[#1a1a1a] stroke-[1.5]" />
                  </div>
                  <div className="h-10 w-[1px] bg-gray-200 flex-shrink-0" />
                  <div className="text-[#1a1a1a] font-medium text-[14px] md:text-[15px] leading-snug text-left whitespace-pre-line" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <p className="text-gray-400 text-xs mt-6 italic">These factors are completely outside of our control.</p>
          </RevealSection>

          {/* Transparency Notice */}
          <RevealSection delay={0.35}>
            <div className="relative rounded-2xl overflow-hidden bg-[#111] shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8A001A]/10 via-transparent to-[#8A001A]/5" />
              <div className="relative p-10 md:p-14 border border-white/10 rounded-2xl">
                <p className="text-white/60 text-sm leading-[1.9]">
                  We kindly ask customers to place orders only if they are comfortable with possible delays, changing shipping costs, customs procedures, and international sourcing timelines. Our goal is to be <strong className="font-semibold text-white">transparent from the beginning</strong> so there are no surprises later.
                </p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════ NAVIGATION ═══════ */}
      <section className="bg-[#111] py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-16 flex justify-between items-center">
          <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
            <Link href="/order-info/order-process" className="flex items-center gap-3 text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold tracking-[0.2em] uppercase">
              <ArrowLeft className="w-4 h-4" />
              Order Process
            </Link>
          </motion.div>
          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
            <Link href="/order-info/policies" className="flex items-center gap-3 text-[#8A001A] hover:text-[#c4002a] transition-colors text-[10px] font-bold tracking-[0.2em] uppercase">
              Policies & Guidelines
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
