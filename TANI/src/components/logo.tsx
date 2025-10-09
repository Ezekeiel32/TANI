import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, ...props }: { className?: string }) {
  return (
    <div className={cn("relative w-[194px] h-[276px] -mt-[2px]", className)} {...props}>
      <Image
        src="/images/logo.png"
        alt="Warrior Jews Logo"
        fill
        className="object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
        priority
      />
    </div>
  );
}
