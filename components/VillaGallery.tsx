"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
  overlay?: React.ReactNode;
};

export function VillaGallery({ images, alt, overlay }: Props) {
  const safeImages = images && images.length > 0 ? images : [];
  const [mainRef, mainApi] = useEmblaCarousel({
    loop: false,
  });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "keepSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!mainApi) return;
    const index = mainApi.selectedScrollSnap();
    setSelectedIndex(index);
    if (thumbApi) thumbApi.scrollTo(index);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
  }, [mainApi, onSelect]);

  const scrollTo = (index: number) => {
    if (!mainApi) return;
    mainApi.scrollTo(index);
  };

  const openLightbox = (index: number) => {
    if (!safeImages.length) return;
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxPrev = () => {
    setLightboxIndex((i) =>
      i === 0 ? safeImages.length - 1 : i - 1
    );
  };

  const lightboxNext = () => {
    setLightboxIndex((i) =>
      i === safeImages.length - 1 ? 0 : i + 1
    );
  };

  if (safeImages.length === 0) {
    return null;
  }

  return (
    <>
      <section className="relative">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
          {/* Main slider */}
          <div className="embla" ref={mainRef}>
            <div className="embla__container flex">
              {safeImages.map((src, index) => (
                <div
                  key={index}
                  className="embla__slide min-w-0 flex-[0_0_100%]"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openLightbox(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openLightbox(index);
                      }
                    }}
                    className="relative block aspect-[16/9] w-full cursor-pointer overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 70vw"
                    />
                    {index === 0 && overlay}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          {safeImages.length > 1 && (
            <div className="border-t border-white/10 bg-black/60 px-3 py-2 sm:px-4 sm:py-3">
              <div className="embla" ref={thumbRef}>
                <div className="embla__container flex gap-2 sm:gap-3">
                  {safeImages.map((src, index) => {
                    const isActive = index === selectedIndex;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => scrollTo(index)}
                        className={`relative h-16 w-20 flex-[0_0_auto] overflow-hidden rounded-lg border transition-all ${
                          isActive
                            ? "border-amber-400 ring-2 ring-amber-400/80"
                            : "border-white/10 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxPrev();
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxNext();
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <div
            className="relative max-h-[85vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={safeImages[lightboxIndex]}
              alt={alt}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto object-contain"
            />
            <p className="mt-2 text-center text-sm text-neutral-400">
              {lightboxIndex + 1} / {safeImages.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

