import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './ui/button';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '#' },
  { name: 'Book Online', href: '#' },
  { name: 'Workout AI', href: '/workout' },
  { name: 'Summarize AI', href: '/summarize' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-0">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center ml-4 sm:ml-6 lg:ml-8">
              <Logo className="text-primary" /> {/* Logo uses its own sizing */}
            </Link>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center mr-4 sm:mr-6 lg:mr-8">
            <Button>Login / Sign Up</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
