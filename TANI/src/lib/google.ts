import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import crypto from 'node:crypto';

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth env vars');
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getCalendarClient(auth: any) {
  return google.calendar({ version: 'v3', auth });
}

export const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar'];

export async function getTrainerOAuth(trainerId: string) {
  const cred = await prisma.googleCredential.findUnique({ where: { trainerId } });
  if (!cred) return null;
  const oauth = getOAuth2Client();
  try {
    const access = decrypt(JSON.parse(cred.accessToken));
    const refresh = decrypt(JSON.parse(cred.refreshToken));
    oauth.setCredentials({ access_token: access, refresh_token: refresh, expiry_date: cred.tokenExpiry?.getTime() });
  } catch {
    return null;
  }
  return oauth;
}

export async function listBusyFromGoogle(params: {
  trainerId: string;
  timeMin: string; // ISO
  timeMax: string; // ISO
  calendarId?: string;
}): Promise<{ start: string; end: string }[]> {
  const auth = await getTrainerOAuth(params.trainerId);
  if (!auth) return [];
  const cal = getCalendarClient(auth);
  const trainer = await prisma.trainer.findUnique({ where: { id: params.trainerId } });
  const calendarId = trainer?.defaultCalendarId || 'primary';
  const resp = await cal.freebusy.query({
    requestBody: {
      timeMin: params.timeMin,
      timeMax: params.timeMax,
      items: [{ id: params.calendarId || calendarId }],
    },
  });
  const busy = resp.data.calendars?.[params.calendarId || calendarId]?.busy || [];
  return busy.map((b: any) => ({ start: b.start as string, end: b.end as string }));
}

export async function createCalendarEvent(params: {
  trainerId: string;
  summary: string;
  description?: string;
  start: string; // ISO
  end: string; // ISO
  attendeeEmail?: string;
}): Promise<string | null> {
  const auth = await getTrainerOAuth(params.trainerId);
  if (!auth) return null;
  const cal = getCalendarClient(auth);
  const trainer = await prisma.trainer.findUnique({ where: { id: params.trainerId } });
  const calendarId = trainer?.defaultCalendarId || 'primary';
  const res = await cal.events.insert({
    calendarId,
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.start },
      end: { dateTime: params.end },
      attendees: params.attendeeEmail ? [{ email: params.attendeeEmail }] : undefined,
      reminders: { useDefault: true },
    },
  });
  return res.data.id || null;
}

export async function deleteCalendarEvent(params: { trainerId: string; eventId: string }) {
  const auth = await getTrainerOAuth(params.trainerId);
  if (!auth) return;
  const cal = getCalendarClient(auth);
  const trainer = await prisma.trainer.findUnique({ where: { id: params.trainerId } });
  const calendarId = trainer?.defaultCalendarId || 'primary';
  await cal.events.delete({ calendarId, eventId: params.eventId });
}

export async function updateCalendarEvent(params: {
  trainerId: string;
  eventId: string;
  start: string;
  end: string;
}) {
  const auth = await getTrainerOAuth(params.trainerId);
  if (!auth) return;
  const cal = getCalendarClient(auth);
  const trainer = await prisma.trainer.findUnique({ where: { id: params.trainerId } });
  const calendarId = trainer?.defaultCalendarId || 'primary';
  await cal.events.update({
    calendarId,
    eventId: params.eventId,
    requestBody: {
      start: { dateTime: params.start },
      end: { dateTime: params.end },
    },
  });
}

export async function createWatchChannel(trainerId: string) {
  const auth = await getTrainerOAuth(trainerId);
  if (!auth) return null;
  const cal = getCalendarClient(auth);
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId } });
  const calendarId = trainer?.defaultCalendarId || 'primary';
  const channelId = `trainer-${trainerId}-${crypto.randomUUID()}`;
  const response = await cal.events.watch({
    calendarId,
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: `${process.env.NEXT_PUBLIC_URL}/api/google/webhook`,
    },
  });
  if (response.data.resourceId && response.data.expiration) {
    const expiresAt = new Date(parseInt(response.data.expiration));
    await prisma.calendarSync.upsert({
      where: { trainerId },
      update: {
        channelId,
        resourceId: response.data.resourceId,
        expiresAt,
      },
      create: {
        trainerId,
        channelId,
        resourceId: response.data.resourceId,
        expiresAt,
      },
    });
    return { channelId, resourceId: response.data.resourceId, expiresAt };
  }
  return null;
}



