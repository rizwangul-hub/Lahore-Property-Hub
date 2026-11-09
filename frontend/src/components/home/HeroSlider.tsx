'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { HERO_SLIDES } from '@/config/heroSlides';

export const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = HERO_SLIDES.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // 3-second automatic timer with pause on hover/interaction
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        goToNext();
      }, 3000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, goToNext]);

  return (
    <div
      className="relative w-full overflow-hidden bg-navy-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-label="Featured Property Showcase Slider"
    >
      {/* 7-Slide Container */}
      <div className="relative h-[480px] sm:h-[540px] md:h-[600px] lg:h-[640px] w-full">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Optimized Image with explicit priority and lazy-loading for non-initial slides */}
              <Image
                src={slide.imageUrl}
                alt={slide.alt}
                fill
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
                className="object-cover object-center"
              />

              {/* Gradient Scrim for contrast & readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/45 to-navy-950/30" />

              {/* Slide Content Caption */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center text-white">
                  <span className="inline-block rounded-full bg-brand-500/90 backdrop-blur-sm px-3.5 py-1 text-xs font-bold tracking-wide uppercase text-white shadow-sm mb-4">
                    {slide.tag}
                  </span>

                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl drop-shadow-md">
                    Find Your Perfect Property in{' '}
                    <span className="text-brand-400">Lahore</span>
                  </h1>

                  <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-white/90 font-medium leading-relaxed drop-shadow">
                    Discover homes, apartments, plots, and commercial properties for rent or sale
                    across Lahore.
                  </p>

                  <div className="mt-2 text-xs sm:text-sm text-brand-200 font-semibold">
                    {slide.title} &bull; {slide.subtitle}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Previous & Next Buttons */}
      <button
        type="button"
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-navy-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-navy-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators & Auto-play status */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-navy-950/60 backdrop-blur-md px-3.5 py-1.5 border border-white/10">
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          className="text-white/80 hover:text-white mr-1 focus:outline-none"
          aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
          title={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
        >
          {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>

        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goToSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
              idx === currentIndex
                ? 'w-7 bg-brand-400'
                : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
            aria-current={idx === currentIndex ? 'true' : 'false'}
          />
        ))}

        <span className="text-[11px] font-mono font-medium text-white/70 ml-1">
          {currentIndex + 1}/7
        </span>
      </div>
    </div>
  );
};
