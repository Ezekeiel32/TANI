import Twilio from 'twilio';
import { getRedis } from './redis';

export function getTwilio() {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error('Twilio not configured');
  return Twilio(sid, token);
}

export async function sendVerificationCode(phone: string): Promise<string> {
  const client = getTwilio();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const from = process.env.TWILIO_PHONE!;
  await client.messages.create({ from, to: phone, body: `Your verification code is ${code}` });
  const redis = getRedis();
  await redis.set(`verify:${phone}`, code, 'EX', 300);
  return code;
}

export async function verifyCode(phone: string, code: string): Promise<boolean> {
  const redis = getRedis();
  const stored = await redis.get(`verify:${phone}`);
  return stored === code;
}


