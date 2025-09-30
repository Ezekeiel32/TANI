import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

const posts = [
  {
    id: 1,
    title: 'Achieve your fitness goals with expert self-defense training at Lion Cub',
    href: '#',
    description:
      'Are you looking to achieve your fitness goals while also learning valuable self-defense skills? Look no further than Lion Cub, a fitness...',
    author: {
      name: 'Eitan Kagan',
      imageUrl: PlaceHolderImages.find(p => p.id === 'author-eitan-kagan')?.imageUrl || ''
    },
    image: PlaceHolderImages.find(p => p.id === 'update-1'),
  },
  {
    id: 2,
    title: 'Empower yourself with self-defense and fitness training at Lion Cub',
    href: '#',
    description:
      'Are you looking to boost your self-defense skills and fitness levels? Look no further than Lion Cub, a leading fitness business...',
    author: {
      name: 'Eitan Kagan',
      imageUrl: PlaceHolderImages.find(p => p.id === 'author-eitan-kagan')?.imageUrl || ''
    },
    image: PlaceHolderImages.find(p => p.id === 'update-2'),
  },
  {
    id: 3,
    title: 'Master self-defense with personalized fitness training at Lion Cub',
    href: '#',
    description:
      'Are you looking to enhance your self-defense skills while also improving your fitness levels? Look no further than Lion Cub, a...',
    author: {
      name: 'Eitan Kagan',
      imageUrl: PlaceHolderImages.find(p => p.id === 'author-eitan-kagan')?.imageUrl || ''
    },
    image: PlaceHolderImages.find(p => p.id === 'update-3'),
  },
];

export default function UpdatesSection() {
  return (
    <section className="bg-secondary py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-headline font-bold text-primary">Latest Updates</h2>
        </div>
        <Separator className="my-12 max-w-4xl mx-auto" />
        <div className="mt-16 grid gap-16 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {posts.map((post) => (
            <div key={post.id} className="bg-card p-4 rounded-lg shadow-md transition-shadow hover:shadow-xl">
              {post.image && (
                <div className="mb-4 aspect-h-9 aspect-w-16">
                  <Image
                    className="rounded-lg object-cover"
                    src={post.image.imageUrl}
                    alt={post.image.description}
                    fill
                    data-ai-hint={post.image.imageHint}
                  />
                </div>
              )}
              <div>
                <p className="text-2xl font-semibold text-primary font-headline">
                  <Link href={post.href} className="hover:underline">
                    {post.title}
                  </Link>
                </p>
                <p className="mt-3 text-base text-muted-foreground">{post.description}</p>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="sr-only">{post.author.name}</span>
                    <Image className="h-10 w-10 rounded-full" src={post.author.imageUrl} alt="" width={40} height={40}/>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-primary">{post.author.name}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
