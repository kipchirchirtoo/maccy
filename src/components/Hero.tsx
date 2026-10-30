'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

interface HeroProps {
  onNavigate: (link: string) => void;
}

// Full-width slider. Slides are managed in the admin dashboard (Banners tab).
export function Hero({ onNavigate }: HeroProps) {
  const { banners } = useShop();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const count = banners.length;
  const current = count ? index % count : 0;

  useEffect(() => {
    if (!playing || count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [playing, count]);

  if (count === 0) return null;

  const go = (dir: number) => setIndex((current + dir + count) % count);

  return (
    <section className="bg-[#1c1719]" aria-roledescription="carousel" aria-label="Featured">
      <div className="relative h-[460px] sm:h-[560px] lg:h-[620px] overflow-hidden">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            aria-hidden={i !== current}
          >
            {b.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    i % 2 === 0
                      ? 'radial-gradient(circle at 80% 30%, #8a1c38 0%, #4a0d1c 45%, #1c1719 100%)'
                      : 'radial-gradient(circle at 20% 30%, #6b1429 0%, #35101b 50%, #1c1719 100%)',
                }}
              />
            )}

            {!b.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/icon.png" alt="" className="absolute right-[6%] top-1/2 -translate-y-1/2 w-[38%] max-w-[420px] opacity-[0.14] pointer-events-none select-none hidden sm:block" />
            )}

            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-end pb-16 sm:pb-24">
              <div className="max-w-2xl text-white space-y-4">
                <h2 className="!text-white text-4xl sm:text-6xl leading-[1.08]">{b.title}</h2>
                {b.subtitle && <p className="text-base sm:text-lg text-white/85 leading-relaxed">{b.subtitle}</p>}
                {b.buttonLabel && (
                  <button
                    onClick={() => onNavigate(b.link)}
                    className="mt-3 border border-white/80 hover:bg-white hover:text-[#1c1719] text-white px-8 py-3.5 text-[15px] tracking-wide transition-colors"
                  >
                    {b.buttonLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-[#2a262914]">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-center gap-5 text-[#2a2629]">
          <button onClick={() => go(-1)} aria-label="Previous slide" className="p-2 hover:text-[#6b1429]"><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-3">
            {banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full border border-[#2a2629] transition-colors ${i === current ? 'bg-[#2a2629]' : 'bg-white'}`}
              />
            ))}
          </div>
          <button onClick={() => go(1)} aria-label="Next slide" className="p-2 hover:text-[#6b1429]"><ChevronRight className="w-4 h-4" /></button>
          <span className="w-px h-6 bg-[#2a262920]" />
          <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} className="p-2 hover:text-[#6b1429]">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}
