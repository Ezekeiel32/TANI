import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@/lib/prisma';
import { getTrainerOAuth, getCalendarClient } from '@/lib/google';
import { scheduleGoogleSyncRenewal } from '@/lib/queue';
import { refreshAvailabilityCacheForTrainer } from '@/lib/availability';
import type { GoogleSyncJob } from '@/lib/queue';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const googleSyncWorker = new Worker<GoogleSyncJob>(
  'googleSync',
  async (job) => {
    const { trainerId, action } = job.data;

    if (action === 'renew') {
      await renewWatchChannel(trainerId);
    } else if (action === 'sync') {
      await syncCalendarChanges(trainerId);
    } else if (action === 'sweep') {
      const soon = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const expiring = await prisma.calendarSync.findMany({ where: { expiresAt: { lte: soon } } });
      for (const s of expiring) {
        await renewWatchChannel(s.trainerId);
      }
    }
  },
  { connection }
);

async function renewWatchChannel(trainerId: string) {
  const sync = await prisma.calendarSync.findUnique({ where: { trainerId } });
  if (!sync) return;
  
  const auth = await getTrainerOAuth(trainerId);
  if (!auth) return;
  
  const calendar = getCalendarClient(auth);
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId } });
  const calendarId = trainer?.defaultCalendarId || 'primary';
  
  try {
    // Stop old channel
    await calendar.channels.stop({
      requestBody: {
        id: sync.channelId,
        resourceId: sync.resourceId,
      },
    });
  } catch (error) {
    // Ignore errors, channel might already be expired
  }
  
  // Create new channel
  const channelId = `trainer-${trainerId}-${Date.now()}`;
  const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  const response = await calendar.events.watch({
    calendarId,
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: `${process.env.NEXT_PUBLIC_URL}/api/google/webhook`,
      expiration: String(Date.now() + expiresIn),
    },
  });
  
  if (response.data.resourceId && response.data.expiration) {
    const expiresAt = new Date(parseInt(response.data.expiration));
    
    await prisma.calendarSync.update({
      where: { trainerId },
      data: {
        channelId,
        resourceId: response.data.resourceId,
        expiresAt,
      },
    });
    
    // Schedule next renewal
    await scheduleGoogleSyncRenewal(trainerId, expiresAt);
    
    console.log(`Renewed watch channel for trainer ${trainerId}, expires at ${expiresAt}`);
  }
}

async function syncCalendarChanges(trainerId: string) {
  const sync = await prisma.calendarSync.findUnique({ where: { trainerId } });
  if (!sync) return;
  
  const auth = await getTrainerOAuth(trainerId);
  if (!auth) return;
  
  const calendar = getCalendarClient(auth);
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId } });
  const calendarId = trainer?.defaultCalendarId || 'primary';
  
  try {
    const response = await calendar.events.list({
      calendarId,
      syncToken: sync.syncToken || undefined,
      showDeleted: true,
    });
    
    if (response.data.items) {
      for (const event of response.data.items) {
        // Process each changed event
        if (event.status === 'cancelled' && event.id) {
          // Event was deleted in Google Calendar
          const booking = await prisma.booking.findFirst({
            where: { googleEventId: event.id, trainerId },
          });
          
          if (booking && booking.status === 'CONFIRMED') {
            await prisma.booking.update({
              where: { id: booking.id },
              data: { status: 'CANCELLED' },
            });
            console.log(`Cancelled booking ${booking.id} due to Google Calendar deletion`);
          }
        } else if (event.id && event.start?.dateTime && event.end?.dateTime) {
          // Event time changed or new event
          const booking = await prisma.booking.findFirst({
            where: { googleEventId: event.id, trainerId },
          });
          if (booking) {
            const newStart = new Date(event.start.dateTime);
            const newEnd = new Date(event.end.dateTime);
            if (booking.start.getTime() !== newStart.getTime() || booking.end.getTime() !== newEnd.getTime()) {
              await prisma.booking.update({ where: { id: booking.id }, data: { start: newStart, end: newEnd } });
              console.log(`Updated booking ${booking.id} from Google change`);
            }
          }
        }
      }
    }
    
    // Update sync token
    if (response.data.nextSyncToken) {
      await prisma.calendarSync.update({
        where: { trainerId },
        data: { syncToken: response.data.nextSyncToken },
      });
    }

    // Refresh availability cache after processing changes
    await refreshAvailabilityCacheForTrainer(trainerId);
  } catch (error) {
    console.error(`Failed to sync calendar for trainer ${trainerId}:`, error);
  }
}

console.log('Google sync worker started');
