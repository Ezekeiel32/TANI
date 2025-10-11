import { NextRequest } from 'next/server';
import { sendVerificationCode } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return Response.json({ error: 'Missing phone' }, { status: 400 });
  try {
    await sendVerificationCode(phone);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}


