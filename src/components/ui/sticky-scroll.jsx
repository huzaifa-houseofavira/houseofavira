'use client';
import { ReactLenis } from 'lenis/react';
import React, { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const StickyScroll = forwardRef(({ products = [], children }, ref) => {
  const leftCol = [];
  const rightCol = [];

  // Explicitly use the requested 3 images for the center column
  const centerCol = [
    { id: 'static-might1', src: '/best-seller-combo-1.webp' },
    { id: 'static-might2', src: '/best-seller-combo-2.webp' },
    { id: 'static-product5', src: '/best-seller-combo-3.webp' }
  ];

  // Distribute all fetched products to the left and right columns
  products.forEach((prod, i) => {
    if (i % 2 === 0) {
      leftCol.push(prod);
    } else {
      rightCol.push(prod);
    }
  });

  return (
    <ReactLenis root>
      <div className='bg-[#FAFAFA]' ref={ref}>
        {/* Render the header passed as children */}
        {children}

        <section className='w-full bg-[#FAFAFA] pb-24 relative z-20'>
          <div className='max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8'>
            <div className='grid grid-cols-12 gap-2 sm:gap-4 md:gap-6'>
              
              {/* Left Column - scrolls normally */}
              <div className='grid gap-2 sm:gap-4 md:gap-6 col-span-4 self-start'>
                {leftCol.map((item) => (
                  <Link key={item.id} href={`/product/${item.slug || item.id}`} className="block group">
                      <figure className='w-full h-40 sm:h-64 md:h-[32rem] relative overflow-hidden rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-500'>
                        <Image
                          src={item.src}
                          alt="Product image"
                          fill
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 768px) 33vw, 33vw"
                          className='transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-1 object-cover align-bottom'
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </figure>
                  </Link>
                ))}
              </div>

              {/* Center Column - Sticky */}
              <div className='sticky top-0 h-screen w-full col-span-4 gap-2 sm:gap-4 md:gap-6 grid grid-rows-3 py-2 sm:py-4 md:py-6'>
                {centerCol.map((item) => (
                  <Link key={item.id} href={item.id.startsWith('static-') ? '/catalogue' : `/product/${item.slug || item.id}`} className="block group w-full h-full relative overflow-hidden rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-500">
                    <figure className='w-full h-full relative'>
                      <Image
                        src={item.src}
                        alt="Product image"
                        fill
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 33vw, 33vw"
                        className='transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-1 object-cover align-bottom'
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </figure>
                  </Link>
                ))}
              </div>

              {/* Right Column - scrolls normally */}
              <div className='grid gap-2 sm:gap-4 md:gap-6 col-span-4 self-start mt-6 sm:mt-12 md:mt-32'>
                {/* Adding margin-top to stagger the right column visually */}
                {rightCol.map((item) => (
                  <Link key={item.id} href={`/product/${item.slug || item.id}`} className="block group">
                    <figure className='w-full h-48 sm:h-72 md:h-[36rem] relative overflow-hidden rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-500'>
                      <Image
                        src={item.src}
                        alt="Product image"
                        fill
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 33vw, 33vw"
                        className='transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-1 object-cover align-bottom'
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </figure>
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </section>
      </div>
    </ReactLenis>
  );
});

StickyScroll.displayName = 'StickyScroll';

export default StickyScroll;
