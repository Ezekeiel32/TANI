import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './ui/button';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Book', href: '/booking' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Calendar', href: '/dashboard/calendar' },
  { name: 'Waivers', href: '/dashboard/waivers' },
  { name: 'Add Booking', href: '/dashboard/bookings/add' },
  { name: 'Workout AI', href: '/workout' },
  { name: 'Summarize AI', href: '/summarize' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full mx-0 px-0 relative">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo on left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-4 ml-6 sm:ml-12 lg:ml-24">
              <Logo className="text-primary" /> {/* Logo uses its own sizing */}
            </Link>
          </div>

          {/* Centered navigation buttons */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
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
          </div>

          {/* Tagline centered between logo and Home button */}
          <div className="hidden md:flex items-center justify-center" style={{ position: 'absolute', left: 'calc(25% - 135px)' }}>
            <span className="font-brand uppercase tracking-[0.09em] text-sm md:text-base lg:text-lg text-[#ff8a00] font-bold [text-shadow:0_-1px_0_rgba(255,255,255,0.9),0_-2px_0_rgba(255,255,255,0.7),0_-4px_8px_rgba(255,165,0,0.6),0_-6px_16px_rgba(255,69,0,0.5),0_-8px_24px_rgba(220,20,60,0.4)] animate-gradient-shift">
              MMA and Striking Gym
            </span>
          </div>

          {/* Book now button on right */}
          <div className="flex items-center mr-4 sm:mr-6 lg:mr-8">
            <Link href="/booking">
              <Button>Book Now</Button>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
