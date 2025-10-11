import { NextRequest } from 'next/server';
import { verifyCode } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  if (!phone || !code) return Response.json({ error: 'Missing fields' }, { status: 400 });
  const ok = await verifyCode(phone, code);
  return Response.json({ ok });
}


