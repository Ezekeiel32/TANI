import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, ...props }: { className?: string }) {
  return (
    <div className={cn("relative", className)} {...props}>
      <Image
        src="/images/logo.png"
        alt="Warrior Jews Logo"
        fill
        className="object-left object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
        priority
        sizes="(max-width: 768px) 160px, 200px"
      />
    </div>
  );
}
