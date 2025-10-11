import { NextRequest } from 'next/server';
import { getOAuth2Client, createWatchChannel } from '@/lib/google';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  if (!code || !state) return Response.json({ error: 'Missing params' }, { status: 400 });
  const trainerId = state;
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.access_token || !tokens.refresh_token) {
    return Response.json({ error: 'Missing tokens' }, { status: 400 });
  }

  const encAccess = encrypt(tokens.access_token);
  const encRefresh = encrypt(tokens.refresh_token);

  await prisma.googleCredential.upsert({
    where: { trainerId },
    update: {
      accessToken: JSON.stringify(encAccess),
      refreshToken: JSON.stringify(encRefresh),
      scope: tokens.scope ?? undefined,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    },
    create: {
      trainerId,
      accessToken: JSON.stringify(encAccess),
      refreshToken: JSON.stringify(encRefresh),
      scope: tokens.scope ?? undefined,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    },
  });
  // Create watch channel
  await createWatchChannel(trainerId);
  const redirectUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:9002'}/dashboard`;
  return Response.redirect(redirectUrl);
}


