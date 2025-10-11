'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Only use hero-appropriate images in the carousel.
  // Explicitly EXCLUDES the following which belong to Latest Updates only:
  // - update-2 (IMG_3815.JPG)
  // - event-1 (IMG_4638.jpg)
  // - event-3 (4.PNG)
  // - event-2 (3.PNG)
  const images = PlaceHolderImages
    .filter((img) => ['update-3', 'mission-portrait', 'update-1', 'mission-action', 'hero'].includes(img.id))
    .sort((a, b) => {
      const order = ['update-3', 'mission-portrait', 'update-1', 'mission-action', 'hero'];
      return order.indexOf(a.id) - order.indexOf(b.id);
    });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black" style={{ marginTop: '-80px' }}>

      {/* Render only the current image */}
      {images[currentImageIndex] && (
        <div
          key={`${images[currentImageIndex].id}-${currentImageIndex}`}
          className="absolute inset-0"
          style={{
            transition: 'opacity 1s ease-in-out',
          }}
        >
          <Image
            src={images[currentImageIndex].imageUrl}
            alt={images[currentImageIndex].description}
            fill
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: images[currentImageIndex].id === 'mission-portrait' ? 'center bottom' : 'center 47%',
            }}
            priority={currentImageIndex === 0}
          />
        </div>
      )}

      {/* Center overlay content intentionally removed per request (no headline/CTA) */}

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`rounded-full transition-all duration-300 w-3 h-3 ${
              index === currentImageIndex
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}



