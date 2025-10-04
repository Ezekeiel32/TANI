import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, ...props }: { className?: string }) {
  return (
    <div className={cn("relative h-8 w-8", className)} {...props}>
      <Image
        src="/images/logo.png"
        alt="Warrior Wisdom Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
