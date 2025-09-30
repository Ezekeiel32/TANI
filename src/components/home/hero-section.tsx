import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HeroSection() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center text-center text-white">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover object-center"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-extrabold tracking-tight leading-tight mb-4">
          Master Your Skills
        </h1>
        <p className="text-xl md:text-2xl text-slate-200 mb-8">
          Personalized Training for Self-Defense and Fitness
        </p>
        <Button size="lg" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Get Started
        </Button>
      </div>
    </section>
  );
}
