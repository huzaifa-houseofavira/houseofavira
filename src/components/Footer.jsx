'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#000000] text-[#FFFFFF] pt-24 pb-0 w-full mt-auto relative flex flex-col">
      <div className="px-6 md:px-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24 max-w-[1400px] mx-auto relative z-10">
          
          {/* Brand & Description (Col Span 5) */}
          <div className="md:col-span-5 pr-4 md:pr-12">
            <div className="mb-6 flex flex-col">
              <span className="font-perandory text-white text-3xl md:text-4xl uppercase tracking-widest leading-none mb-1">House Of</span>
              <span className="font-aston-script text-[#8A001A] text-5xl md:text-6xl -mt-2 leading-none">Avira</span>
            </div>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed font-lato">
              An exclusive curation of luxury aesthetics. Redefining the modern muse with uncompromising elegance, global sourcing, and precision.
            </p>
          </div>

          {/* Links Grid (Col Span 7) */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-perandory text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 text-neutral-500">Explore</h5>
              <ul className="space-y-4 text-sm font-lato text-neutral-300">
                <li><Link prefetch={false} href="/catalogue" className="hover:text-white transition-colors footer-link-animate">The Archive</Link></li>
                <li><Link prefetch={false} href="/#new-arrivals" className="hover:text-white transition-colors footer-link-animate">New Arrivals</Link></li>
                <li><Link prefetch={false} href="/category/men" className="hover:text-white transition-colors footer-link-animate">Men</Link></li>
                <li><Link prefetch={false} href="/category/women" className="hover:text-white transition-colors footer-link-animate">Women</Link></li>
                <li><Link prefetch={false} href="/category/accessories" className="hover:text-white transition-colors footer-link-animate">Accessories</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-perandory text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 text-neutral-500">Support</h5>
              <ul className="space-y-4 text-sm font-lato text-neutral-300">
                <li><Link prefetch={false} href="/track-order" className="hover:text-white transition-colors footer-link-animate">Track Order</Link></li>
                <li><Link prefetch={false} href="/how-it-works" className="hover:text-white transition-colors footer-link-animate">Ordering Guide </Link></li>
                <li><Link prefetch={false} href="/order-info/shipping" className="hover:text-white transition-colors footer-link-animate">Shipping &amp; Customs</Link></li>
                <li><Link prefetch={false} href="/policy" className="hover:text-white transition-colors footer-link-animate">Policies</Link></li>
                <li><Link prefetch={false} href="/#contact-studio" className="hover:text-white transition-colors footer-link-animate">Contact Studio</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-perandory text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 text-neutral-500">Connect</h5>
              <ul className="space-y-4 text-sm font-lato text-neutral-300">
                <li>
                  <a href="https://www.instagram.com/houseof.avira/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors footer-link-animate flex items-center gap-2 group">
                    <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/919986742779" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors footer-link-animate flex items-center gap-2 group">
                    <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:houseofavira@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors footer-link-animate flex items-center gap-2 group">
                    <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>Gmail</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center py-8 border-t border-white/10 text-xs text-neutral-500 font-lato max-w-[1400px] mx-auto gap-4 relative z-10">
          <div className="flex gap-6 order-2 md:order-1">
            <Link prefetch={false} href="/privacy-policy" className="hover:text-white transition-colors footer-link-animate">Privacy Policy</Link>
            <Link prefetch={false} href="/order-info/policies" className="hover:text-white transition-colors footer-link-animate">Terms of Service</Link>
          </div>
          
          <p className="order-3 md:order-2">© {new Date().getFullYear()} House of Avira. All rights reserved.</p>
        </div>
      </div>

      {/* Big Bold Footer Brand Text */}
      <div className="w-full flex justify-center items-end overflow-hidden pt-4 select-none pointer-events-none relative z-0 bg-[#000000]">
        <h1 className="font-perandory text-[24vw] leading-[0.75] text-[#FFFFFF] tracking-tighter m-0 p-0 text-center uppercase whitespace-nowrap opacity-95">
          AVIRA
        </h1>
      </div>

      {/* Developer Credit - Bottom Left */}
      <a 
        href="https://wa.me/917488100344" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute bottom-4 left-4 md:bottom-6 md:left-8 z-20 flex items-center gap-1.5 text-white hover:opacity-70 transition-all duration-300 group mix-blend-difference"
        aria-label="Contact Developer on WhatsApp"
      >
        <span className="font-perandory text-[9px] md:text-[11px] uppercase tracking-[0.25em] font-bold scale-y-125 scale-x-105 inline-block origin-bottom-left">
          Designed and developed by HUZAIFA
        </span>
        <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform stroke-[2.5] ml-1" />
      </a>
    </footer>
  );
}
