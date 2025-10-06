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
    <section className="relative w-full h-screen overflow-hidden bg-black" style={{ marginTop: '-20px' }}>

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

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center justify-center pt-20">
        <div className="text-center text-white p-4 max-w-4xl mx-auto">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-headline font-extrabold tracking-tight leading-tight mb-4"
            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
          >
            Master Your Skills
          </h1>
          <p
            className="text-lg md:text-xl text-slate-200 mb-8"
            style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.8)' }}
          >
            Personalized Training for Self-Defense and Fitness
          </p>
          <Button size="lg" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Get Started
          </Button>
        </div>
      </div>

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



