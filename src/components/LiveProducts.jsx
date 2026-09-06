'use client';
import { useRef, useEffect } from 'react';

const VIDEOS = [
  '/videos/live/AQMRSxWb83aesdjTGbVP7uJWr4HjchWd_sCyYZsuXzZ_a_0aus9j3Hae2mhd_iZkjAF_-RkKXX3-TqdtN3y4hAELHX4zhccEE4ONBjg.mp4',
  '/videos/live/AQMZOhUwQQFTK4jkvtGj-eyOpSYOiiy7OZL-4Qj37zS6W1IKML3vqS58jO50j9eC0OEb2Gg2zsxszjtMDerCHYQJJ5tnq9npwZF3F9k.mp4',
  '/videos/live/AQNgA8ZYAHN06pa6ZAZK4VPSlsQkYkJQKlqfgEvntMGlKXUI-DUcaNtC5MP3BRr8YaMHHU2lG49rHzfHd2KKchHMmI1_QEAKJfkWZ5w.mp4',
  '/videos/live/AQNh57rGPM02voe9NJ577TMdXvOkJI69pS8l82NfEH8Po46UGoM93pz_2U-0yy3a8gIU3t2xpLSe7AhrbVNNi1v0D4wOumrVC8xy0nQ.mp4',
  '/videos/live/AQPtoiJKfqyS8vneKByTWlsIRn2H01Jsszh_a5F9bU1JV5Uaw_cQopTrSKxQ6eiABMwZnWZ8wJc_2xG5GgVFFSVh--kAOfUGrAa0_Ms.mp4',
  '/videos/live/live-vid-1.mp4',
  '/videos/live/live-vid-2.mp4'
];

const VideoCard = ({ src }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Play when at least 50% visible
          videoRef.current?.play().catch(() => {});
        } else {
          // Pause when it goes out of view
          videoRef.current?.pause();
        }
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  return (
    <div className="relative w-[260px] h-[460px] md:w-[320px] md:h-[580px] shrink-0 snap-center overflow-hidden bg-gray-100 group rounded-none">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="none"
      />
    </div>
  );
};

export default function LiveProducts() {
  return (
    <section className="py-16 md:py-24 bg-[#FFFFFF] border-y-[3px] border-[#000000] overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center mb-10 md:mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-perandory font-bold text-[#000000] uppercase tracking-normal">
            LIVE VIDEOS FROM AVIRA
          </h2>
          <p className="mt-4 text-sm md:text-base font-bold tracking-[0.2em] uppercase text-neutral-500" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            Real Videos. Real Quality.
          </p>
        </div>

        {/* Hide scrollbar using tailwind utility classes, snap scrolling for smooth mobile experience */}
        <div className="flex overflow-x-auto gap-4 md:gap-6 snap-x snap-mandatory pb-8 px-4 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {VIDEOS.map((src, idx) => (
            <VideoCard key={idx} src={src} />
          ))}
        </div>
      </div>
      
      {/* CSS to hide scrollbar for webkit browsers */}
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  );
}
