'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function CampaignAndGrid() {

  const items = [
    { title: "UNDER 199", img: "/under199-new.png", bg: "bg-[#F9F9F9]", priceValue: "199" },
    { title: "UNDER 299", img: "/under299-new.png", bg: "bg-[#0A0A0A]", priceValue: "299" },
    { title: "UNDER 599", img: "/under599-new.png", bg: "bg-[#F9F9F9]", priceValue: "599" },
    { title: "UNDER 999", img: "/under999-new.png", bg: "bg-[#0A0A0A]", priceValue: "999" }
  ];

  return (
    <div className="relative w-full">
      {/* Soft Silhouettes Campaign Section (CSS Sticky for smooth 60fps pinning) */}
      <div className="sticky top-0 h-[80vh] md:h-[100vh] w-full z-0 overflow-hidden">
        <section className="w-full h-full relative">
          <div className="w-full h-full origin-bottom">
            <Image src="/final section.png" alt="Campaign" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
            <h2 className="font-serif text-4xl md:text-7xl mb-6 drop-shadow-md">
              Curated For The Unforgettable
            </h2>
            <Link prefetch={false} href="/catalogue" className="border-b border-white pb-1 text-xs uppercase tracking-widest hover:opacity-70 transition-opacity drop-shadow-md">
              explore the unmatched imported collection
            </Link>
          </div>
        </section>
      </div>

      {/* 4-Grid Section (Slides over pinned campaign) */}
      <section className="w-full relative z-10 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        {/* Mobile: 2x2 Grid with Text inside. Desktop: 4x1 Flex with images */}
        <div className="grid grid-cols-2 md:flex md:flex-row w-full md:h-[70vh]">
          {items.map((item, idx) => (
            <Link
              prefetch={false}
              href={`/shop-by-price?price=${item.priceValue}`}
              key={idx}
              className={`w-full md:w-1/4 flex flex-col md:justify-end border-b md:border-b-0 border-r md:border-r-0 border-[#000000]/10 block`}
            >
              <div className={`relative w-full aspect-[4/5] md:h-full flex items-center justify-center overflow-hidden ${item.bg}`}>
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Mobile text (hidden on desktop) */}
              <div className="md:hidden w-full p-3 bg-white">
                <h3 className="font-gambetta italic text-[13px] tracking-tight text-center uppercase text-[#000000]">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* The White Text Bar at the Bottom (Desktop Only) */}
        <div className="hidden md:flex w-full flex-row bg-white border-b border-[#000000]/10">
          {items.map((item, idx) => (
            <Link prefetch={false} href={`/shop-by-price?price=${item.priceValue}`} key={idx} className="w-1/4 p-5 hover:bg-[#000000]/5 transition-colors block cursor-pointer">
              <h3 className="font-gambetta italic text-[15px] tracking-tight w-full text-left uppercase text-[#000000]">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
