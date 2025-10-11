import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, ...props }: { className?: string }) {
  return (
    <div
      className={cn("relative w-[194px] h-[276px] -mt-[2px]", className)}
      style={{
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      }}
      {...props}
    >
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
