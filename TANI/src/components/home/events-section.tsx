import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '../ui/separator';

const events = [
  {
    id: 1,
    title: 'Nutrition Consultation',
    price: '$70',
    description: 'Optimize your nutrition with a personalized consultation. Our experts will craft a nutrition plan that aligns with your fitness objectives and lifestyle.',
    image: PlaceHolderImages.find(p => p.id === 'event-1'),
    buttonText: 'Book Now',
  },
  {
    id: 2,
    title: 'Personalized Workout Plan',
    price: '$100',
    description: 'Achieve your fitness goals with a custom-designed workout plan tailored to your individual needs.',
    image: PlaceHolderImages.find(p => p.id === 'event-2'),
    buttonText: 'Book Now',
  },
  {
    id: 3,
    title: 'Self-Defense Training',
    price: '$80',
    description: 'Empower yourself with our personalized self-defense training sessions. Learn effective techniques from a seasoned expert.',
    image: PlaceHolderImages.find(p => p.id === 'event-3'),
    buttonText: 'View Course',
  },
];

export default function EventsSection() {
  return (
    <section className="bg-secondary py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-headline font-bold text-primary">Events</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col overflow-hidden">
              {event.image && (
                <div className="aspect-video relative">
                  <Image
                    src={event.image.imageUrl}
                    alt={event.image.description}
                    fill
                    className="object-cover"
                    data-ai-hint={event.image.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline text-2xl">{event.title}</CardTitle>
                <CardDescription className="text-muted-foreground !mt-2">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold text-primary">{event.price}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">{event.buttonText}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
