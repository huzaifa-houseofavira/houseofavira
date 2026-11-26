'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useChatbotStore } from '@/store/chatbotStore';

const GsapImageStack = dynamic(() => import('@/components/ui/gsap-image-stack'), { 
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center text-xs tracking-widest uppercase text-neutral-400">Loading Animations...</div>
});
import breakdownImg from '../../../15f12b5c-ac29-439c-81bc-14b46ef75005.png';
import { 
  Route, Plane, Tag, Shield, HelpCircle, 
  Store, Home, UserRound, Ship, Weight, Award, 
  Landmark, MapPin, Package, Gem, Droplet, Box, 
  Footprints, ChevronDown, Sparkles, Heart, Calculator, Truck, MessageSquareText
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const TimelineItem = ({ step, idx }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 40%"]
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [-20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const isActionRequired = step.badge === 'ACTION REQUIRED';

  return (
    <motion.div ref={ref} style={{ opacity, x, scale }} className={`relative group ${isActionRequired ? 'bg-gradient-to-r from-[#FAFAFA] to-white -mx-4 md:-mx-6 px-4 md:px-6 py-5 rounded-2xl border-l-4 border-l-[#8A001A] border-y border-r border-[#E5E5E5] shadow-md my-6 z-20' : 'py-4'}`}>
      <div className={`absolute ${isActionRequired ? '-left-[18px] md:-left-[28px] top-6 w-5 h-5' : '-left-[30px] md:-left-[38px] top-5 w-4 h-4'} rounded-full border-2 ${isActionRequired ? 'border-[#8A001A] bg-white shadow-[0_0_0_4px_#FAFAFA] animate-pulse' : 'border-[#8A001A] bg-[#FFFFFF]'} z-10 transition-all duration-300 ${step.state === 'done' ? 'bg-[#8A001A]' : ''}`}></div>
      <div>
        <div className={`flex items-center flex-wrap gap-3 mb-2 transition-colors ${isActionRequired ? 'text-[#8A001A] text-[18px] font-bold' : 'text-[#000000] text-[16px] font-medium group-hover:text-[#8A001A]'}`}>
          {step.title}
          {step.badge && (
            <span className={`${isActionRequired ? 'bg-[#8A001A] text-white text-[12px] px-3 py-1 shadow-sm' : 'bg-[#FAFAFA] text-[#8A001A] text-[10px] px-2 py-0.5'} font-bold rounded-full tracking-widest uppercase flex items-center gap-1`}>
              {isActionRequired && <Sparkles className="w-3 h-3 animate-pulse" />} {step.badge}
            </span>
          )}
          {step.icon && <step.icon className={`w-4 h-4 ${isActionRequired ? 'text-[#8A001A]' : 'text-[#8A001A]'} ml-1`} />}
        </div>
        <div className={`leading-relaxed ${isActionRequired ? 'text-[#8A001A] text-[14px] font-medium' : 'text-[#666666] text-[14px]'}`}>{step.desc}</div>
      </div>
    </motion.div>
  );
};

export default function ShippingClient() {
  const openChatbot = useChatbotStore(state => state.openChatbot);
  const [activeSection, setActiveSection] = useState('how-it-works');
  const [openFaq, setOpenFaq] = useState(null);
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(heroScroll, [0, 1], [1, 0]);

  const sections = ['how-it-works', 'shipping-modes', 'special-cats', 'policies', 'faq'];

  // Handle intersection for sticky nav highlighting
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.2, rootMargin: "-100px 0px 0px 0px" });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const reviews = [
    { name: "Priya S.", location: "Mumbai, Maharashtra", text: "Was skeptical about the wait time, but my Coach bag arrived in perfect condition. The constant updates kept me at ease. Totally worth it!", rating: 5, item: "Coach Tabby" },
    { name: "Anjali R.", location: "Delhi, NCR", text: "The two-tier shipping sounded confusing at first, but it makes so much sense. Paid exact customs, no hidden charges. Highly transparent!", rating: 5, item: "Rhode Lip Tint Set" },
    { name: "Meera K.", location: "Bangalore, Karnataka", text: "Got my Hello Kitty merch faster than expected. The packaging was super secure. Will definitely preorder again.", rating: 5, item: "Sanrio Collection" },
    { name: "Sneha M.", location: "Pune, Maharashtra", text: "I've ordered international before and paid crazy surprise duties. Avira's method is so much better. You know what you're paying for.", rating: 5, item: "Nike Dunks" },
    { name: "Riya T.", location: "Hyderabad, Telangana", text: "Beautiful experience! The customer service was so sweet and answered all my 100 questions. Product is 100% authentic.", rating: 5, item: "Dior Saddle" },
    { name: "Kavya V.", location: "Chennai, Tamil Nadu", text: "Love the transparency! The shipping for my rare makeup finds was surprisingly fast.", rating: 5, item: "Rare Beauty Blush" },
  ];

  const faqs = [
    {
      q: "Why can't you tell me the shipping cost upfront?",
      a: "We ship in batches. The international cost is split equally among all customers based on the total package weight. Since we collect all orders first and then ship together, the exact per-customer cost is only known when the full batch is packed. This ensures you're charged accurately — never based on a rough estimate."
    },
    {
      q: "Is COD (Cash on Delivery) available?",
      a: "No, COD is not available at House of Avira. We deal with imported products sourced internationally on your behalf — payment must be received before the order can be placed with our Overseas Team. We accept GPay, Paytm, UPI, bank transfers, and card payments."
    },
    {
      q: "How long will my order take?",
      a: "Important: the delivery timeline does NOT start from the day you place your order. All orders are pre-orders collected in batches. After your batch closes, we source the products, quality check them, calculate shipping costs, and send you a shipping payment. Only after you pay that payment does the shipping clock begin. Delivery typically takes 2–4 weeks from this point, but may take longer depending on customs, logistics, and the factors mentioned earlier. For example, if you order on October 1st and your batch closes on October 20th, you first wait until October 20th. Processing and invoicing take a few days after that. The 2–4 week shipping estimate starts only after your shipping payment is paid."
    },
    {
      q: "Can I cancel my order if I change my mind?",
      a: "You can cancel your order within 2-3 days of placing it (e.g., if you order on October 1st, you can cancel until October 3rd). After this window, your order is submitted to our Overseas Team. Once submitted, cancellations, refunds, or exchanges are no longer possible under any circumstances."
    },
    {
      q: "What if I don't pay the shipping payment on time?",
      a: "If the shipping payment is not paid by the specified deadline, your parcel will not be shipped. No refund will be issued for your product payment, as the order has already been placed with our Overseas Team on your behalf. Please pay shipping payments promptly when they are sent."
    },
    {
      q: "Are customs and duty charges included in the shipping payment?",
      a: "Yes. India's customs duties and GST on imports are calculated and included in your final shipping payment. You will receive a full itemised breakdown showing the shipping cost, customs duty, and GST before you are required to pay anything."
    },
    {
      q: "My order is delayed — can I get a refund?",
      a: "No. Delivery delays are not grounds for a refund or cancellation. International shipping and customs timelines can vary significantly due to factors completely outside our control. We ask that you only place an order if you are patient and comfortable with variable timelines. We will always keep you updated on your order's progress."
    }
  ];

  return (
    <div className="bg-[#FFFFFF] text-[#000000] min-h-screen font-sans selection:bg-[#8A001A] selection:text-white overflow-x-hidden">
      
      {/* Education Marquee */}
      <div className="bg-[#000000] text-white text-[11px] font-medium tracking-widest py-2.5 overflow-hidden whitespace-nowrap flex">
        <div className="animate-marquee-full flex shrink-0 items-center">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="mx-4 uppercase">
              House of Avira: All orders are prepaid pre-orders &middot; Products are sourced internationally &middot; Shipping is charged separately &middot; Cancellations allowed within 2-3 days &middot; Delivery timelines are estimates only &middot;
            </span>
          ))}
        </div>
        <div className="animate-marquee-full flex shrink-0 items-center" aria-hidden="true">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="mx-4 uppercase">
              House of Avira: All orders are prepaid pre-orders &middot; Products are sourced internationally &middot; Shipping is charged separately &middot; Cancellations allowed within 2-3 days &middot; Delivery timelines are estimates only &middot;
            </span>
          ))}
        </div>
      </div>
      <header ref={heroRef} className="relative pt-24 pb-20 px-6 text-center max-w-5xl mx-auto overflow-hidden rounded-b-[40px] mb-8">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <Image src="/shipping/hero.png" alt="Shipping Box" fill className="object-cover opacity-50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/60 to-[#FFFFFF]/90" />
        </motion.div>
        
        <FadeIn className="relative z-10">
          <div className="text-[11px] tracking-[0.12em] uppercase text-[#999999] font-medium mb-4">Shipping Information</div>
          <h1 className="font-perandory text-5xl md:text-6xl font-light text-[#000000] mb-5 leading-tight">
            Everything about<br />
            <em className="font-aston-script text-4xl md:text-6xl text-[#8A001A]">How Your Order Travels</em>
          </h1>
          <p className="text-[15px] md:text-[16px] text-[#8A001A] font-medium leading-relaxed max-w-2xl mx-auto mb-6">
              All orders are pre-orders. Your delivery timeline begins only after your batch closes and you pay your shipping payment — not from the day you place your order.
            </p>

          
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { id: 'how-it-works', icon: Route, label: 'The Journey' },
              { id: 'special-cats', icon: Tag, label: 'Special Categories' },
              { id: 'policies', icon: Shield, label: 'Policies' },
              { id: 'faq', icon: HelpCircle, label: 'FAQ' }
            ].map(btn => (
              <button 
                key={btn.id}
                onClick={() => scrollTo(btn.id)}
                className="bg-white border border-[#E5E5E5] rounded-full px-5 py-2.5 text-[13px] text-[#000000] font-medium hover:bg-[#E5E5E5] hover:text-[#000000] transition-all flex items-center gap-2"
              >
                <btn.icon className="w-4 h-4" /> {btn.label}
              </button>
            ))}
          </div>
        </FadeIn>
      </header>

      <div className="h-px bg-gradient-to-r from-transparent via-[#E5E5E5] to-transparent max-w-5xl mx-auto"></div>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-24 md:space-y-32">
        
        {/* SECTION 1: HOW IT WORKS */}
        <section id="how-it-works" className="scroll-mt-24">
          <FadeIn>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[#8A001A] font-medium mb-3">Section 01</div>
            <h2 className="font-perandory text-4xl text-[#000000] mb-4">Your order's two-step journey</h2>
            <p className="text-[15px] text-[#666666] leading-relaxed mb-6">You only pay twice: first for the products when placing your order, and second for a single comprehensive shipping payment before your batch is dispatched.</p>
          </FadeIn>

          {/* Pre-order Warning Callout */}
          <FadeIn delay={0.05}>
            <div className="bg-[#FFF5F5] border-2 border-[#8A001A]/20 rounded-xl p-4 md:p-5 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8A001A] rounded-l-xl" />
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-[#8A001A]/10 flex items-center justify-center mt-0.5">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#8A001A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                </div>
                <div>
                  <h4 className="text-lg md:text-xl text-[#000000] mb-2" style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'normal', fontWeight: 700, fontSize: '22px', lineHeight: '28px' }}>The delivery timeline does NOT start from the day you order</h4>
                  <p className="mb-3" style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'normal', fontWeight: 700, fontSize: '18px', lineHeight: '26px', color: '#000000' }}>House of Avira operates on a <strong className="text-[#000000]">batch pre-order model</strong>. When you place an order, it joins a batch. Only after the batch closes do we begin sourcing, quality checking, and calculating your shipping costs.</p>
                  <div className="bg-white border border-[#E5E5E5] rounded-lg p-3 md:p-4" style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'normal', fontWeight: 700, fontSize: '18px', lineHeight: '26px', color: '#000000' }}>
                    <strong className="text-[#000000] block mb-1">Example:</strong>
                    You order on <strong className="text-[#000000]">Oct 1st</strong>. Your batch closes on <strong className="text-[#000000]">Oct 20th</strong>. You wait until Oct 20th. After the batch closes, we source your products, QC them, pack them, and send you a shipping payment. Only after you <strong className="text-[#000000]">pay that payment</strong> does the 2–4 week shipping window begin.
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-24 md:space-y-32">
        <section>
{/* Diagram */}
          <FadeIn delay={0.1}>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes flow {
                to { stroke-dashoffset: -12; }
              }
              .animate-flow { animation: flow 1s linear infinite; }
            `}} />
            <div className="bg-white border border-[#E5E5E5]/50 rounded-[32px] p-6 md:p-12 mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAFAFA] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <h3 className="font-perandory text-3xl md:text-5xl text-center text-[#000000] mb-12 relative z-10">
                International + Domestic Flow
              </h3>
              
              {/* Tier 1 */}
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-0 mb-12 relative z-10">
                <div className="w-full md:w-[240px] shrink-0 bg-white border border-[#E5E5E5] rounded-[24px] p-5 text-center overflow-hidden relative group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(138,0,26,0.15)] hover:-translate-y-1 transition-all duration-300 z-10">
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#8A001A] animate-pulse"></div>
                  <div className="w-full h-[120px] rounded-xl overflow-hidden mb-5 relative ring-1 ring-black/5">
                    <Image src="/shipping/international.png" alt="International Shipping" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="text-[15px] font-extrabold tracking-tight text-[#000000] leading-snug">Overseas Team &amp; Manufacturers</div>
                  <div className="text-[11px] text-[#999999] mt-1.5 font-bold tracking-[0.2em] uppercase">Abroad</div>
                </div>
                
                <div className="flex-1 flex flex-col items-center px-4 w-full relative min-h-[80px] md:min-h-0 justify-center">
                  <svg className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 z-0" preserveAspectRatio="none">
                    <line x1="0" y1="1" x2="100%" y2="1" stroke="#E5E5E5" strokeWidth="2" strokeDasharray="6 6" className="animate-flow" />
                  </svg>
                  <div className="md:hidden absolute left-1/2 top-0 w-[2px] h-full -translate-x-1/2 z-0">
                    <line x1="1" y1="0" x2="1" y2="100%" stroke="#E5E5E5" strokeWidth="2" strokeDasharray="6 6" className="animate-flow" />
                  </div>
                  
                  <div className="bg-white border-2 border-[#8A001A] rounded-xl p-4 w-full md:w-[85%] text-center relative z-10 shadow-[0_8px_30px_rgba(138,0,26,0.12)] group hover:-translate-y-1 transition-all duration-300">
                    <div className="text-[13px] font-extrabold tracking-tight text-[#8A001A] mb-1.5 flex items-center justify-center gap-2">
                      <Plane className="w-4 h-4" /> International Shipping
                    </div>
                    <div className="text-[12px] text-[#666666] font-medium leading-relaxed">Cost split equally among all customers. Charged separately.</div>
                  </div>
                </div>

                <div className="w-full md:w-[180px] shrink-0 bg-white border border-[#E5E5E5] rounded-[24px] p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(138,0,26,0.15)] hover:-translate-y-1 transition-all duration-300 z-10 relative group">
                  <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#FAFAFA] to-[#FFFFFF] rounded-full flex items-center justify-center mb-4 ring-1 ring-[#E5E5E5]/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Home className="w-6 h-6 text-[#8A001A]" />
                  </div>
                  <div className="text-[15px] font-extrabold tracking-tight text-[#000000] leading-snug">House of Avira</div>
                  <div className="text-[11px] text-[#999999] mt-1.5 font-bold tracking-[0.2em] uppercase">India</div>
                </div>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-[#E5E5E5]"></div>
                <div className="bg-[#000000] text-white rounded-full text-[9px] font-semibold px-3 py-1 tracking-widest uppercase shadow-sm">Arrives in India &middot; Customs Cleared</div>
                <div className="flex-1 h-px bg-[#E5E5E5]"></div>
              </div>

              {/* Tier 2 */}
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-0 relative z-10">
                <div className="w-full md:w-[180px] shrink-0 bg-white border border-[#E5E5E5] rounded-[24px] p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 z-10 relative group">
                  <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#FAFAFA] to-white rounded-full flex items-center justify-center mb-4 ring-1 ring-[#E5E5E5]/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Home className="w-6 h-6 text-[#000000]" />
                  </div>
                  <div className="text-[15px] font-extrabold tracking-tight text-[#000000] leading-snug">House of Avira</div>
                  <div className="text-[11px] text-[#999999] mt-1.5 font-bold tracking-[0.2em] uppercase">India</div>
                </div>
                
                <div className="flex-1 flex flex-col items-center px-4 w-full relative min-h-[80px] md:min-h-0 justify-center">
                  <svg className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 z-0" preserveAspectRatio="none">
                    <line x1="0" y1="1" x2="100%" y2="1" stroke="#E5E5E5" strokeWidth="2" strokeDasharray="6 6" className="animate-flow" />
                  </svg>
                  <div className="md:hidden absolute left-1/2 top-0 w-[2px] h-full -translate-x-1/2 z-0">
                    <line x1="1" y1="0" x2="1" y2="100%" stroke="#E5E5E5" strokeWidth="2" strokeDasharray="6 6" className="animate-flow" />
                  </div>
                  
                  <div className="bg-white border-2 border-[#8A001A] rounded-xl p-4 w-full md:w-[85%] text-center relative z-10 shadow-[0_8px_30px_rgba(138,0,26,0.12)] group hover:-translate-y-1 transition-all duration-300">
                    <div className="text-[13px] font-extrabold tracking-tight text-[#8A001A] mb-1.5 flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4" /> Domestic Shipping
                    </div>
                    <div className="text-[12px] text-[#666666] font-medium leading-relaxed">Cost based on pincode & weight. Charged before dispatch.</div>
                  </div>
                </div>

                <div className="w-full md:w-[240px] shrink-0 bg-white border border-[#E5E5E5] rounded-[24px] p-5 text-center overflow-hidden relative group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 z-10">
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#000000] animate-pulse"></div>
                  <div className="w-full h-[120px] rounded-xl overflow-hidden mb-5 relative ring-1 ring-black/5">
                    <Image src="/shipping/domestic.png" alt="Domestic Shipping" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="text-[15px] font-extrabold tracking-tight text-[#000000] leading-snug">You</div>
                  <div className="text-[11px] text-[#999999] mt-1.5 font-bold tracking-[0.2em] uppercase">Your doorstep</div>
                </div>
              </div>

              <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-6 mt-8 shadow-sm">
                <h4 className="text-[18px] font-perandory font-bold text-[#8A001A] mb-2">Why wait for the batch date?</h4>
                <p className="text-[14px] text-[#444444] leading-relaxed font-dm-sans" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                  You can place an order whenever you like! We simply combine all orders received during the month into one large international batch before processing. Once this shipment arrives in India, the total delivery cost is distributed precisely according to the weight and category of your items. This ensures you <strong>only pay the real, un-marked-up shipping price</strong>.
                </p>
              </div>

              
              

              {/* Modern Price Breakdown UI */}
              <div className="mt-12 border-t border-[#E5E5E5] pt-10">
                <div className="text-center mb-10">
                  <h4 className="font-perandory text-3xl md:text-5xl font-extrabold text-[#000000] mb-3">What your shipping covers</h4>
                  <p className="text-[14px] text-[#666666] max-w-lg mx-auto" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>A transparent look at everything included in your final shipping cost. No hidden fees.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                  {[
                    { name: 'International Shipping', desc: 'Base cost to move the batch globally.', icon: Plane },
                    { name: 'Customs Clearance', desc: 'Brokerage fees to clear Indian borders.', icon: Shield },
                    { name: 'Import Duties', desc: 'Mandatory government tariffs on imports.', icon: Landmark },
                    { name: 'Government Taxes', desc: 'GST and applicable local taxes.', icon: Calculator },
                    { name: 'Processing Fees', desc: 'Documentation and compliance handling.', icon: Award },
                    { name: 'Handling Fees', desc: 'Warehouse packing and material costs.', icon: Box },
                    { name: 'Domestic Shipping', desc: 'Final mile courier to your doorstep.', icon: Truck }
                  ].map((item, idx) => (
                    <div key={idx} className="group bg-white border border-[#E5E5E5] hover:border-[#8A001A] rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(138,0,26,0.08)] hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#FAFAFA] rounded-bl-[100%] z-0 group-hover:bg-[#FFF5F5] transition-colors"></div>
                      <item.icon className="w-6 h-6 text-[#8A001A] mb-4 relative z-10" />
                      <h5 className="text-[14px] font-bold text-[#000000] mb-2 relative z-10">{item.name}</h5>
                      <p className="text-[12px] text-[#666666] leading-relaxed relative z-10">{item.desc}</p>
                    </div>
                  ))}
                </div>
                  <p className="mt-8 text-[12px] md:text-[13px] text-[#666666] text-center" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    (These are the primary components of the shipping cost. Additional minor operational charges may also be included where applicable.)
                  </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[#8A001A] font-medium mb-2 mt-16">Your Order Timeline</div>
            <h3 className="font-perandory text-4xl md:text-5xl font-extrabold text-[#000000] mb-2">From pre-order to doorstep</h3>
            <p className="text-[14px] text-[#666666] leading-relaxed mb-10">Your journey has two distinct phases. The shipping clock only starts in Phase 2.</p>
            
            {/* PHASE 1 */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#000000] text-white text-[10px] tracking-[0.2em] uppercase px-4 py-2 rounded-full" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontWeight: 700 }}>Phase 1</div>
                <div>
                  <h4 className="font-aston-script text-3xl text-[#000000] leading-tight">Pre-shipping</h4>
                  <p className="text-[12px] text-[#999999] font-medium">Before the delivery clock starts</p>
                </div>
              </div>
              
              <div className="relative pl-8 md:pl-10">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#E5E5E5] via-[#000000] to-[#E5E5E5]"></div>
                <div className="space-y-4">
                  {[
                    { state: 'done', title: 'Pre-Order Placed & Product Payment', desc: 'You pay the product price only. Your order is confirmed and assigned to the current open batch.' },
                    { state: 'done', title: 'Waiting for Batch to Close', desc: 'Your order waits alongside other pre-orders until the batch closing date. This could be days or weeks depending on when you ordered.' },
                    { state: 'done', title: 'Batch Closed — Sourcing Begins', desc: 'The batch closes. We now place bulk orders with our Overseas Team on your behalf.' },
                    { state: 'done', title: 'Products Sourced & Quality Checked', desc: 'Products arrive from our Overseas Team. Each item is quality checked before being cleared for shipping.' },
                    { state: 'done', title: 'Products at International Warehouse', desc: 'Your product has arrived at our international warehouse. Batch packing and weight calculation begins.' },
                    { state: 'done', title: 'Shipping Cost Calculated', desc: 'Comprehensive shipping cost (International, Customs, Domestic) is calculated precisely based on weight.' },
                    { state: 'active', title: 'Final shipping payment Sent', badge: 'ACTION REQUIRED', desc: 'We send you a single, transparent shipping payment covering all logistics to your doorstep. Must be paid to proceed.' },
                    { state: 'pending', title: 'shipping payment Paid', desc: 'Payment confirmed. Your batch is now fully cleared for international dispatch.' }
                  ].map((step, idx) => (
                    <TimelineItem key={idx} step={step} idx={idx} />
                  ))}
                </div>
              </div>
            </div>

            {/* CLOCK STARTS HERE DIVIDER */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-[#8A001A]/30"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-[#8A001A] text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <div>
                    <div className="text-[13px] font-bold tracking-wide uppercase">The delivery clock starts here</div>
                    <div className="text-[11px] text-white/70">Estimated delivery: 2–4 weeks from this point</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PHASE 2 */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#8A001A] text-white text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full">Phase 2</div>
                <div>
                  <h4 className="font-perandory text-xl text-[#8A001A] leading-tight">Shipping & delivery</h4>
                  <p className="text-[12px] text-[#999999] font-medium">The delivery window begins now</p>
                </div>
              </div>
              
              <div className="relative pl-8 md:pl-10">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#8A001A] via-[#8A001A] to-[#E5E5E5]"></div>
                <div className="space-y-4">
                  {[
                    { state: 'pending', title: 'Dispatched Internationally', desc: 'Batch dispatched from our international warehouse towards India.' },
                    { state: 'pending', title: 'Customs Clearance', desc: 'Shipment clears Indian customs seamlessly. All duties were pre-paid in your shipping payment.' },
                    { state: 'pending', title: 'Arrived in India', desc: 'Your order has successfully cleared customs and arrived with us in India. Almost there!' },
                    { state: 'pending', title: 'Domestic Dispatch', desc: 'Your order is carefully packed for its final leg. A local tracking ID is generated and shared with you.' },
                    { state: 'pending', title: 'Delivered', icon: Heart, desc: 'Your order is at your door. Please record your unboxing — we love seeing it!' }
                  ].map((step, idx) => (
                    <TimelineItem key={`p2-${idx}`} step={step} idx={idx} />
                  ))}
                </div>
              </div>
            </div>

            
            <div className="text-center mt-6 mb-8">
              <span className="font-aston-script text-4xl md:text-5xl text-[#8A001A]">Worth The Wait</span>
              <p className="text-[13px] text-[#999999] mt-3 font-medium tracking-wide uppercase">Every order is hand-sourced, quality checked & shipped with care</p>
            </div>
          </FadeIn>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-[#E5E5E5] to-transparent w-full my-6"></div>

        {/* SECTION 3: SPECIAL CATEGORIES */}
        <section id="special-cats" className="scroll-mt-24">
          <FadeIn>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[#8A001A] font-medium mb-3">Section 02</div>
            <h2 className="font-perandory text-4xl text-[#000000] mb-4">Special category notices</h2>
            <p className="text-[15px] text-[#666666] leading-relaxed mb-10 font-dm-sans" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Some product types require extra attention. Please read the relevant notice before placing your order.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
            
            {/* 1. Branded Items - Red - Large Square */}
            <FadeIn delay={0.1} className="md:col-span-2 md:row-span-2">
              <div className="bg-[#FF3B30] rounded-[32px] p-8 md:p-10 flex flex-col h-full shadow-lg relative overflow-hidden group">
                <div className="relative z-10 flex-1">
                  <h3 className="text-[24px] md:text-[32px] font-perandory font-bold text-white mb-3">Branded Items</h3>
                  <p className="text-[14px] md:text-[15px] text-white/90 leading-relaxed max-w-md font-dm-sans" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Products from brands like Coach, Hello Kitty, Ferrari, LV, Dior, Chanel, Nike, and Stussy carry higher customs duties and a longer customs processing period. Expect higher shipping costs and a slightly longer timeline.
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 w-48 h-48 md:w-80 md:h-80 transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-3">
                  <Image src="/shipping/branded-item-first.png" alt="Branded Item" fill className="object-contain drop-shadow-xl" />
                </div>
              </div>
            </FadeIn>

            {/* 2. Beauty Products - Pink - Wide Rectangle */}
            <FadeIn delay={0.2} className="md:col-span-2 md:row-span-1">
              <div className="bg-white border border-[#E5E5E5] rounded-[32px] p-8 flex flex-col md:flex-row h-full shadow-sm relative overflow-hidden group items-center">
                <div className="relative z-10 flex-1 md:pr-8 mb-6 md:mb-0">
                  <h3 className="text-[20px] md:text-[24px] font-perandory font-bold text-[#8A001A] mb-2">Liquids & Beauty</h3>
                  <p className="text-[13px] md:text-[14px] text-[#444444] leading-relaxed font-dm-sans" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Liquid products such as lip glosses, serums, and skincare require special handling and documentation. This means they typically carry a slightly higher shipping cost.
                  </p>
                </div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                  <Image src="/shipping/beauty_product_bento.png" alt="Beauty Product" fill className="object-contain drop-shadow-md" />
                </div>
              </div>
            </FadeIn>

            {/* 3. Oversized Items - Yellow - Small Square */}
            <FadeIn delay={0.3} className="md:col-span-1 md:row-span-1">
              <div className="bg-white border border-[#E5E5E5] rounded-[32px] p-8 flex flex-col h-full shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-[18px] md:text-[20px] font-perandory font-bold text-[#8A001A] mb-2">Oversized Items</h3>
                  <p className="text-[12px] md:text-[13px] text-[#444444] leading-relaxed font-dm-sans" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Large or bulky items take a bigger share of the batch weight, meaning a higher shipping cost.
                  </p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 md:w-40 md:h-40 transition-transform duration-700 group-hover:scale-110">
                  <Image src="/bulky.png" alt="Oversized Item" fill className="object-contain drop-shadow-md" />
                </div>
              </div>
            </FadeIn>

            {/* 4. Footwear - Blue - Small Square */}
            <FadeIn delay={0.4} className="md:col-span-1 md:row-span-1">
              <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[32px] p-8 flex flex-col h-full shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-[18px] md:text-[20px] font-perandory font-bold text-[#8A001A] mb-2">Footwear</h3>
                  <p className="text-[12px] md:text-[13px] text-[#444444] leading-relaxed font-dm-sans" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Shoes ship in original boxes, which are larger and heavier. This typically results in higher costs.
                  </p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 md:w-40 md:h-40 transition-transform duration-700 group-hover:scale-110 -rotate-12 group-hover:-rotate-0">
                  <Image src="/shipping/footwear_bento.png" alt="Footwear" fill className="object-contain drop-shadow-md" />
                </div>
              </div>
            </FadeIn>

          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-[#E5E5E5] to-transparent w-full"></div>

        {/* SECTION 4: POLICIES */}
        <section id="policies" className="scroll-mt-24">
          <FadeIn>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[#8A001A] font-medium mb-3">Section 03</div>
            <h2 className="font-perandory text-4xl text-[#000000] mb-4">Important shipping policies</h2>
            <p className="text-[15px] text-[#666666] leading-relaxed mb-10">Please read and understand these policies before placing your order. By ordering from House of Avira, you agree to all of the following.</p>
          </FadeIn>

          <div className="space-y-3">
            {[
              { id: 'P-01', color: '#8A001A', title: 'Payment deadline is mandatory', text: 'Once your shipping payment is sent, it must be paid by the specified deadline. If the shipping fee remains unpaid, your parcel will not be shipped and no refund will be issued. Your order is placed with our Overseas Team immediately after you submit it — it cannot be reversed.' },
              { id: 'P-02', color: '#8A001A', title: 'Cancellations allowed within 2-3 days only', text: 'You may cancel your order within 2-3 days of placing it (e.g., if you order on Oct 1st, you can cancel until Oct 3rd). After this window, the batch is submitted to our Overseas Team. Once submitted, cancellations, refunds, and exchanges cannot be accommodated under any circumstances.' },
              { id: 'P-03', color: '#000000', title: 'Shipping prices may change', text: 'Shipping prices may fluctuate due to carrier rates, customs regulations, and the nature of the product. The exact cost is calculated only when your parcel is packed and ready to ship. We recommend placing an order only if you\'re comfortable with this variable.' },
              { id: 'P-04', color: '#000000', title: 'Our responsibility ends at the courier', text: 'Once your domestic package is handed over to the courier and a tracking ID is provided, delivery delays, transit issues, or rare mishaps are beyond our control. We will always support you with tracking information, but we cannot take responsibility for courier-side delays or losses.' },
              { id: 'P-05', color: '#000000', title: 'Delays are not grounds for cancellation', text: 'We do not accept cancellations or offer refunds for delayed deliveries, particularly for imported goods. Delivery times may vary due to customs, logistics, and factors completely beyond our control. Please only order if you are patient and comfortable waiting.' },
              { id: 'P-06', color: '#8A001A', title: 'Customs fees are included in your payment', text: 'India\'s basic customs duty on imported goods varies depending on the shipment and product type. These charges are calculated and included in your final shipping payment — you will receive a full cost breakdown before payment is required.' },
            ].map((policy, idx) => (
              <FadeIn key={idx} delay={idx * 0.05}>
                <div className="bg-white border-y border-r border-[#E5E5E5] border-l-4 rounded-xl p-5 md:p-6 flex flex-col md:flex-row gap-2 md:gap-5 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: policy.color }}>
                  <div className="font-mono text-[11px] font-semibold mt-1 shrink-0" style={{ color: policy.color }}>{policy.id}</div>
                  <div>
                    <h3 className="text-[18px] md:text-[20px] text-[#000000] mb-1.5" style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'normal', fontWeight: 700 }}>{policy.title}</h3>
                    <p className="text-[13px] text-[#666666] leading-relaxed">{policy.text}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-[#E5E5E5] to-transparent w-full"></div>

        {/* SECTION 5: FAQ */}
        <section id="faq" className="scroll-mt-24">
          <FadeIn>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[#8A001A] font-medium mb-3">Section 04</div>
            <h2 className="font-perandory text-4xl text-[#000000] mb-4">Frequently asked questions</h2>
            <p className="text-[15px] text-[#666666] leading-relaxed mb-10">The questions our team answers most often — answered here, permanently.</p>
          </FadeIn>

          <div className="border-t border-[#E5E5E5]">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-[#E5E5E5] overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between py-5 text-left text-[14px] font-medium text-[#000000] hover:text-[#8A001A] transition-colors focus:outline-none"
                  style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#999999] shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="pb-6 text-[13px] text-[#666666] leading-relaxed pr-8">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* SECTION 6: REVIEWS */}
      <section className="py-24 bg-gradient-to-b from-transparent to-[#FAFAFA] -mx-6 px-6 md:-mx-auto md:px-0 rounded-t-[40px] overflow-hidden mt-16 border-t border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-6 text-center mb-12">
          <FadeIn>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[#8A001A] font-medium mb-3 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 fill-[#8A001A]" /> Real Stories
            </div>
            <h2 className="font-perandory text-4xl md:text-5xl text-[#000000] mb-4">Hear from people who ordered</h2>
            <p className="text-[15px] text-[#666666] leading-relaxed max-w-xl mx-auto">
              Join thousands of happy customers across India who trust our transparent two-tier shipping process.
            </p>
          </FadeIn>
        </div>

        <div className="relative w-full overflow-hidden flex items-center pb-8">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
          
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
            className="flex w-max gap-6 px-6"
          >
            {[...reviews, ...reviews].map((review, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-md border border-[#E5E5E5] p-6 rounded-2xl w-[320px] md:w-[380px] shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(201,123,110,0.1)] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-[#000000] text-[15px]">{review.name}</h4>
                    <p className="text-[#999999] text-[12px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {review.location}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-[#000000] fill-[#000000]" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-[#666666] text-[14px] leading-relaxed mb-4 italic">
                  {review.text}
                </p>
                <div className="inline-flex items-center gap-1.5 bg-[#FFFFFF] text-[#000000] px-3 py-1.5 rounded-lg text-[11px] font-medium border border-[#E5E5E5]/50">
                  <Package className="w-3.5 h-3.5" /> Preordered: {review.item}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <footer className="bg-[#000000] text-[#FFFFFF] py-16 md:py-20 px-6 text-center mt-12">
        <FadeIn>
          <h2 className="font-perandory text-3xl md:text-4xl font-light mb-4">Still have questions?</h2>
          <p className="text-[14px] text-[#FFFFFF]/70 leading-relaxed max-w-lg mx-auto mb-8">
            Our team is always happy to help. DM us on Instagram or use our AI assistant — we'll make sure you have everything you need before placing your order.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 max-w-md mx-auto">
            <button onClick={openChatbot} className="bg-[#8A001A] text-white px-6 py-3.5 rounded-lg text-[13px] font-medium hover:bg-[#B86B5E] transition-colors flex items-center justify-center gap-2">
              <MessageSquareText className="w-4 h-4" /> Use our Chatbot
            </button>
            <a href="https://www.instagram.com/houseof_avira/" target="_blank" rel="noopener noreferrer" className="bg-transparent border border-[#FFFFFF]/30 text-[#FFFFFF] px-6 py-3.5 rounded-lg text-[13px] font-medium hover:border-[#FFFFFF]/60 transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> DM on Instagram
            </a>
          </div>
          <div className="mt-16 text-[10px] text-[#FFFFFF]/40 tracking-widest uppercase font-mono">
            HOUSE OF AVIRA &middot; ALL ORDERS ARE PREPAID PRE-ORDERS &middot; EST. 2022
          </div>
        </FadeIn>
      </footer>

    </div>
  );
}
