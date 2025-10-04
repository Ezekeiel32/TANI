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
    <header className="fixed top-0 left-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <Logo className="h-10 w-10 text-primary" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap font-body text-primary">Warrior Wisdom</span>
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
          <div className="flex items-center">
            <Button>Login / Sign Up</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
