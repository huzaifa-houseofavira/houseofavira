'use client';
import { ShoppingBag, Plane, PackageCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  return (
    <section className="pt-12 pb-24 md:py-24 bg-[#FAFAFA] w-full border-t border-[#000000]/5 relative overflow-hidden">
      <div className="max-w-2xl mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-sm md:text-base font-gambetta italic tracking-[0.3em] uppercase text-[#8A001A] mb-6">
            How It Works
          </h2>
          <p className="text-4xl md:text-5xl font-perandory font-bold text-[#000000] mb-2 leading-tight">
            Internationally Sourced &
          </p>
          <p className="text-4xl md:text-5xl font-perandory font-bold text-[#000000] leading-tight">
            <span className="font-aston-script text-5xl md:text-6xl font-normal text-[#8A001A] mr-3 tracking-normal">Delivered</span> 
            to Your Doorstep.
          </p>
          
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="w-16 h-px bg-black/20"></div>
            <div className="w-2 h-2 bg-[#8A001A] rotate-45"></div>
            <div className="w-16 h-px bg-black/20"></div>
          </div>
        </div>

        {/* Steps Flow (Vertical) */}
        <div className="flex flex-col w-full max-w-lg mx-auto relative mb-20 mt-8 pl-4 md:pl-0">
          
          {/* Step 1 */}
          <div className="relative flex items-start gap-8 group">
            {/* Dotted Line connecting to next step */}
            <div className="absolute left-[2.25rem] md:left-[2.75rem] top-[5.5rem] md:top-[6.5rem] bottom-[-2rem] w-px border-l-2 border-dotted border-black/15"></div>
            
            {/* Icon Circle */}
            <div className="relative z-10 mt-6 md:mt-7 w-[4.5rem] h-[4.5rem] md:w-[5.5rem] md:h-[5.5rem] shrink-0 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-black/5 group-hover:-translate-y-1 transition-transform duration-500">
              <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-[#000000] stroke-[1.2]" />
            </div>
            
            {/* Content */}
            <div className="flex-1 pt-2 pb-14">
              <div className="text-black/30 text-2xl md:text-3xl font-gambetta mb-1">01.</div>
              <div className="flex items-center justify-between mb-3 pr-2">
                <h3 className="text-[32px] md:text-[40px] leading-[36px] md:leading-[44px] font-gambetta italic font-normal text-[#000000] capitalize">
                  Place Your Order
                </h3>
                <Link prefetch={false} href="/order-info/policies" aria-label="Read policies">
                  <ArrowRight className="w-5 h-5 text-[#8A001A] hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="text-xs md:text-sm text-black/60 leading-relaxed max-w-sm">
                Choose your favorites and place your pre-order with ease.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex items-start gap-8 group">
            {/* Dotted Line connecting to next step */}
            <div className="absolute left-[2.25rem] md:left-[2.75rem] top-[5.5rem] md:top-[6.5rem] bottom-[-2rem] w-px border-l-2 border-dotted border-black/15"></div>
            
            {/* Icon Circle */}
            <div className="relative z-10 mt-6 md:mt-7 w-[4.5rem] h-[4.5rem] md:w-[5.5rem] md:h-[5.5rem] shrink-0 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-black/5 group-hover:-translate-y-1 transition-transform duration-500">
              <Plane className="w-6 h-6 md:w-8 md:h-8 text-[#000000] stroke-[1.2]" />
            </div>
            
            {/* Content */}
            <div className="flex-1 pt-2 pb-14">
              <div className="text-black/30 text-2xl md:text-3xl font-gambetta mb-1">02.</div>
              <div className="flex items-center justify-between mb-3 pr-2">
                <Link prefetch={false} href="/shipping" className="hover:opacity-70 transition-opacity cursor-pointer">
                  <h3 className="text-[32px] md:text-[40px] leading-[36px] md:leading-[44px] font-gambetta italic font-normal text-[#000000] capitalize">
                    International Shipping
                  </h3>
                </Link>
                <Link prefetch={false} href="/shipping" aria-label="Read shipping details">
                  <ArrowRight className="w-5 h-5 text-[#8A001A] hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="text-xs md:text-sm text-black/60 leading-relaxed max-w-sm">
                Your order is sourced internationally and shipped to our warehouse.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex items-start gap-8 group">
            {/* Icon Circle */}
            <div className="relative z-10 mt-6 md:mt-7 w-[4.5rem] h-[4.5rem] md:w-[5.5rem] md:h-[5.5rem] shrink-0 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-black/5 group-hover:-translate-y-1 transition-transform duration-500">
              <PackageCheck className="w-6 h-6 md:w-8 md:h-8 text-[#000000] stroke-[1.2]" />
            </div>
            
            {/* Content */}
            <div className="flex-1 pt-2">
              <div className="text-black/30 text-2xl md:text-3xl font-gambetta mb-1">03.</div>
              <div className="flex items-center justify-between mb-3 pr-2">
                <h3 className="text-[32px] md:text-[40px] leading-[36px] md:leading-[44px] font-gambetta italic font-normal text-[#000000] capitalize">
                  Delivered to Your Doorstep
                </h3>
                <Link prefetch={false} href="/order-info/policies" aria-label="Read policies">
                  <ArrowRight className="w-5 h-5 text-[#8A001A] hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="text-xs md:text-sm text-black/60 leading-relaxed max-w-sm">
                After careful handling and quality checks, it reaches you safely.
              </p>
            </div>
          </div>

        </div>

        {/* Disclaimer Note */}
        <div className="bg-[#FAFAFA] border border-[#000000]/5 px-8 py-6 md:py-8 rounded-2xl max-w-xl w-full text-center shadow-sm flex flex-col items-center gap-6">
          <p className="text-xs md:text-sm font-bold tracking-widest text-[#000000]/70 uppercase leading-relaxed font-perandory">
            * Please place an order only if you are comfortable with the international shipping process and charges.
          </p>
          <Link prefetch={false} href="/order-info/order-process" className="inline-block bg-[#000000] text-white px-8 py-3 rounded-full text-xs md:text-sm font-bold tracking-[0.2em] uppercase hover:bg-[#8A001A] transition-colors shadow-md font-[family-name:var(--font-dm-sans)]">
            Read Full Shipping Details
          </Link>
        </div>

      </div>
    </section>
  );
}
