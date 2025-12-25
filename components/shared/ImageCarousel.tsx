"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { ImageIcon } from "lucide-react";

interface ImageCarouselProps {
  images: Array<{
    id: string;
    image_url: string;
    display_order: number;
    is_primary: boolean;
  }>;
  alt: string;
  badges?: string[];
  emptyText?: string;
}

/**
 * Image Carousel with swipe/drag support and slide animation
 */
export function ImageCarousel({
  images,
  alt,
  badges,
  emptyText = "Không có hình ảnh",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort images: primary image first, then by display_order
  const sortedImages = useMemo(() => {
    if (!images || images.length === 0) return [];

    const primaryImage = images.find((img) => img.is_primary);
    const nonPrimaryImages = images
      .filter((img) => !img.is_primary)
      .sort((a, b) => a.display_order - b.display_order);

    return primaryImage
      ? [primaryImage, ...nonPrimaryImages]
      : nonPrimaryImages;
  }, [images]);
  const imageUrls = sortedImages.map((img) => img.image_url);
  const hasImages = imageUrls.length > 0;
  const showDots = hasImages && imageUrls.length > 1;

  const goToIndex = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating],
  );

  // Swipe handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isAnimating) return;
      touchStartX.current = e.touches[0].clientX;
    },
    [isAnimating],
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setSwipeOffset(diff);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null) return;

    const minSwipeDistance = 50;

    if (Math.abs(swipeOffset) > minSwipeDistance) {
      if (swipeOffset < 0) {
        goToIndex(currentIndex === imageUrls.length - 1 ? 0 : currentIndex + 1);
      } else {
        goToIndex(currentIndex === 0 ? imageUrls.length - 1 : currentIndex - 1);
      }
    }

    touchStartX.current = null;
    setSwipeOffset(0);
  }, [swipeOffset, currentIndex, imageUrls.length, goToIndex]);

  // Mouse drag support for desktop
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isAnimating) return;
      touchStartX.current = e.clientX;
    },
    [isAnimating],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.clientX - touchStartX.current;
    setSwipeOffset(diff);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (touchStartX.current === null) return;

    const minSwipeDistance = 50;

    if (Math.abs(swipeOffset) > minSwipeDistance) {
      if (swipeOffset < 0) {
        goToIndex(currentIndex === imageUrls.length - 1 ? 0 : currentIndex + 1);
      } else {
        goToIndex(currentIndex === 0 ? imageUrls.length - 1 : currentIndex - 1);
      }
    }

    touchStartX.current = null;
    setSwipeOffset(0);
  }, [swipeOffset, currentIndex, imageUrls.length, goToIndex]);

  const handleMouseLeave = useCallback(() => {
    touchStartX.current = null;
    setSwipeOffset(0);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800 shadow-lg md:aspect-square select-none cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Slider */}
      {hasImages ? (
        <div
          className="flex size-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${swipeOffset}px))`,
            transitionDuration: swipeOffset !== 0 ? "0ms" : "300ms",
          }}
        >
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="size-full shrink-0 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url('${url}')` }}
              aria-label={`${alt} - Image ${index + 1}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3 text-gray-300 dark:text-slate-600">
          <ImageIcon className="size-20" strokeWidth={1} />
          <span className="text-sm font-medium text-gray-400 dark:text-slate-500">
            {emptyText}
          </span>
        </div>
      )}

      {/* Dot Indicators - Clickable */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {imageUrls.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`size-2.5 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white scale-125 shadow-lg"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Badges */}
      {badges?.map((badge) => (
        <div key={badge} className="absolute left-4 top-4 pointer-events-none">
          <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
            {badge}
          </span>
        </div>
      ))}
    </div>
  );
}
