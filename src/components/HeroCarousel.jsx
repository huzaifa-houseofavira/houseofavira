'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const defaultDesktopSlides = [
  {
    id: 1,
    desktopImage: '/new-hero-for-avira-pc.png',
    title: '',
    subtitle: '',
    link: '/category/women',
    textPosition: 'left'
  },
  {
    id: 2,
    desktopImage: '/images/hero-2-new.png',
    title: '',
    subtitle: '',
    link: '/category/women',
    textPosition: 'right'
  },
  {
    id: 3,
    desktopImage: '/hero3pcnewe.webp',
    title: '',
    subtitle: '',
    link: '/catalogue',
    textPosition: 'right'
  },
  {
    id: 4,
    desktopImage: '/images/hero-4-new.png',
    title: '',
    subtitle: '',
    link: '/catalogue',
    textPosition: 'right'
  }
];

export default function HeroCarousel() {
  const [currentDesktopSlide, setCurrentDesktopSlide] = useState(0);
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0);
  const [mobileSlides, setMobileSlides] = useState([]);

  useEffect(() => {
    async function fetchMobileBanners() {
      try {
        const res = await fetch('/api/banners');
        const fetchedBanners = await res.json();
        setMobileSlides(fetchedBanners);
      } catch (error) {
        console.error("Error fetching mobile banners:", error);
      }
    }
    fetchMobileBanners();
  }, []);

  useEffect(() => {
    const desktopTimer = setInterval(() => {
      setCurrentDesktopSlide((prev) => (prev === defaultDesktopSlides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(desktopTimer);
  }, []);

  useEffect(() => {
    const mobileTimer = setInterval(() => {
      setCurrentMobileSlide((prev) => (prev === mobileSlides.length - 1 ? 0 : prev + 1));
    }, 2000);

    return () => clearInterval(mobileTimer);
  }, [mobileSlides]);

  return (
    <section className="relative w-full h-[100dvh] md:h-[calc(100vh-32px)] -mt-[148px] overflow-hidden bg-black">
      {/* DESKTOP CAROUSEL */}
      <div className="hidden md:block w-full h-full">
        {defaultDesktopSlides.map((slide, index) => {
          const isActive = index === currentDesktopSlide;
          return (
            <div 
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <Image 
                src={slide.desktopImage}
                alt={slide.title || 'House of Avira'}
                fill
                sizes="100vw"
                quality={60}
                priority={index === 0}
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/20"></div>
              
              {(slide.title || slide.subtitle) && (
                <div className={`absolute inset-0 flex flex-col justify-center ${slide.textPosition === 'left' ? 'items-start pl-8 md:pl-24' : 'items-end pr-8 md:pr-24'} p-20 pointer-events-none`}>
                  <div className={`flex flex-col ${slide.textPosition === 'left' ? 'items-start text-left' : 'items-end text-right'} w-full max-w-5xl pointer-events-auto`}>
                    {slide.title && (
                      <h1 className="text-[100px] md:text-[160px] leading-[0.8] font-sans font-black tracking-tighter text-white mb-6 uppercase mix-blend-overlay whitespace-pre-line">
                        {slide.title}
                      </h1>
                    )}
                    {slide.subtitle && (
                      <div className="flex items-center gap-6 mt-4">
                        <div className="h-[2px] w-16 bg-white/80"></div>
                        <p className="text-sm md:text-xl text-white/90 font-sans font-semibold tracking-[0.5em] uppercase">
                          {slide.subtitle}
                        </p>
                      </div>
                    )}
                    
                    <Link 
                      href={slide.link || '/catalogue'}
                      className="mt-16 inline-flex items-center justify-center bg-white text-black px-12 py-5 hover:bg-black hover:text-white transition-all duration-500 font-bold tracking-[0.3em] uppercase text-xs md:text-sm shadow-2xl"
                    >
                      SHOP THE DROP
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
      </div>

      {/* MOBILE CAROUSEL */}
      <div className="block md:hidden w-full h-full bg-black">
        {mobileSlides.map((slide, index) => {
          const isActive = index === currentMobileSlide;
          return (
            <div 
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <Image 
                src={slide.mobileImage || slide.imageUrl}
                alt="House of Avira Banner"
                fill
                sizes="100vw"
                quality={60}
                priority={index === 0}
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/20"></div>
              
              <div className="absolute inset-0 flex flex-col justify-end items-center p-8 pb-16">
                <div className="text-center flex flex-col items-center w-full mt-auto">
                  <h1 className="flex flex-col items-center justify-center mb-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center text-white/95">
                    <span className="font-perandory text-[14px] font-bold tracking-[0.15em] mb-1">Imported</span>
                    <span className="font-aston-script text-[48px] text-white leading-none px-1.5 drop-shadow-md">Pinterest</span>
                    <span className="font-perandory text-[14px] font-bold tracking-[0.15em] mt-2">Finds</span>
                  </h1>
                  <Link 
                    href={slide.link || '/catalogue'}
                    className="inline-flex items-center justify-center gap-2.5 bg-white/95 backdrop-blur-sm text-black px-10 py-4 w-full sm:w-auto text-center border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] active:scale-[0.98]"
                  >
                    <span className="font-perandory text-[16px] tracking-[0.1em] font-bold">Shop Now</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        
      </div>
    </section>
  );
}
