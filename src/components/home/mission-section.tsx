import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function MissionSection() {
  const missionPortrait = PlaceHolderImages.find(p => p.id === 'mission-portrait');
  const missionAction = PlaceHolderImages.find(p => p.id === 'mission-action');

  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="md:order-2">
            <h2 className="text-5xl md:text-7xl font-headline font-bold text-primary mb-6">
              Mission and Vision
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <h3 className="text-2xl font-semibold text-primary font-body">Our Story</h3>
              <p>
                Warrior Jews was born from a passion for empowering individuals through personalized workout and nutrition plans in self-defense and fitness training. Our mission is to cater to each individual’s specific needs and goals, helping them achieve confidence, strength, and mastery.
              </p>
              <p>
                Through dedication and expertise, we aim to inspire a community committed to continuous growth and development.
              </p>
            </div>
            <Button size="lg" className="mt-8">Learn More</Button>
          </div>
          <div className="md:order-1 grid grid-cols-2 gap-4 items-center">
            {missionAction && (
              <div className="col-span-2 sm:col-span-1">
                <div className="aspect-w-3 aspect-h-4">
                  <Image
                    src={missionAction.imageUrl}
                    alt={missionAction.description}
                    className="rounded-lg object-cover"
                    fill
                    data-ai-hint={missionAction.imageHint}
                  />
                </div>
              </div>
            )}
            {missionPortrait && (
              <div className="col-span-2 sm:col-span-1">
                <div className="aspect-w-1 aspect-h-1">
                  <Image
                    src={missionPortrait.imageUrl}
                    alt={missionPortrait.description}
                    className="rounded-lg object-cover"
                    fill
                    data-ai-hint={missionPortrait.imageHint}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
