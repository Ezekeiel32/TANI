import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// All sessions take place in Arizona
const ARIZONA_TIMEZONE = 'America/Phoenix';

export async function POST(req: NextRequest) {
  const { email, name, phone, timezone } = await req.json();
  if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: name || undefined, phone: phone || undefined, timezone: timezone || undefined },
    create: { email, name: name || email.split('@')[0], phone: phone || null, timezone: timezone || ARIZONA_TIMEZONE },
  });
  return Response.json({ userId: user.id, email: user.email });
}


