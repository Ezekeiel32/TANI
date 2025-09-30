import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-8 w-8", props.className)}
      {...props}
    >
      <title>Warrior Wisdom Logo</title>
      <path d="M12 2a10 10 0 0 0-3.16 19.49" />
      <path d="M12 2a10 10 0 0 1 3.16 19.49" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M5.4 12H3" />
      <path d="M21 12h-2.4" />
      <path d="m17 17-1.4-1.4" />
      <path d="m7 17 1.4-1.4" />
      <path d="M8 8a4 4 0 0 1 8 0" />
      <path d="M17.5 13.5c-2.5 2.5-7.5 2.5-10 0" />
    </svg>
  );
}
