'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

export interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-64 sm:h-80 items-center justify-center rounded-3xl border border-navy-100 bg-navy-50 text-xs text-navy-400">
        No property photographs provided for this listing
      </div>
    );
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-3">
      {/* Main Showcase Image */}
      <div className="group relative h-[320px] sm:h-[460px] w-full overflow-hidden rounded-3xl border border-navy-100 bg-navy-950 shadow-card">
        <Image
          src={images[activeIndex]}
          alt={`${title} - Photo ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-500 group-hover:scale-102"
        />

        {/* Expand / Lightbox Trigger */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl bg-navy-950/70 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white shadow-lg hover:bg-navy-900 transition"
          aria-label="View full size photo"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>View Fullscreen ({activeIndex + 1}/{images.length})</span>
        </button>

        {/* Previous & Next overlay buttons (if > 1 image) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white hover:text-navy-950 transition shadow-md"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white hover:text-navy-950 transition shadow-md"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative h-24 sm:h-28 rounded-2xl overflow-hidden border-2 transition ${
                activeIndex === idx
                  ? 'border-brand-600 shadow-md ring-2 ring-brand-500/20'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${title} - Thumbnail ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 33vw, 20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white hover:text-navy-950 transition"
            aria-label="Close fullscreen gallery"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={images[activeIndex]}
              alt={`${title} - Lightbox Photo ${activeIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white hover:text-navy-950 transition"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white hover:text-navy-950 transition"
                aria-label="Next image"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
