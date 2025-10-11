import { NextRequest } from 'next/server';
import { getOAuth2Client, GOOGLE_SCOPES } from '@/lib/google';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trainerId = searchParams.get('trainerId');
  if (!trainerId) return Response.json({ error: 'Missing trainerId' }, { status: 400 });
  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_SCOPES,
    prompt: 'consent',
    state: trainerId,
  });
  return Response.redirect(url);
}


