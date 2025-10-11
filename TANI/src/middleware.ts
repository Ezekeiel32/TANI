import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  return `${ip}:${req.nextUrl.pathname}`;
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  // Rate limit API endpoints
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);
    
    // Different limits for different endpoints
    let limit = 100; // Default: 100 requests per minute
    let windowMs = 60 * 1000; // 1 minute
    
    if (request.nextUrl.pathname.startsWith('/api/bookings') && request.method === 'POST') {
      limit = 10; // 10 bookings per minute
    } else if (request.nextUrl.pathname.startsWith('/api/stripe/webhook')) {
      limit = 1000; // Higher limit for webhooks
    }
    
    if (!checkRateLimit(key, limit, windowMs)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
