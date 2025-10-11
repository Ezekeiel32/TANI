import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

// Queues
export const chargeQueue = new Queue('charge', { connection });
export const reminderQueue = new Queue('reminder', { connection });
export const googleSyncQueue = new Queue('googleSync', { connection });

// Job types
export type ChargeJob = {
  bookingId: string;
};

export type ReminderJob = {
  bookingId: string;
  type: '24h' | '2h';
};

export type GoogleSyncJob = {
  trainerId: string;
  action: 'renew' | 'sync';
};

// Schedule charge after session
export async function scheduleCharge(bookingId: string, sessionEndTime: Date) {
  const delay = sessionEndTime.getTime() - Date.now();
  if (delay > 0) {
    await chargeQueue.add('charge-booking', { bookingId }, { delay });
  }
}

// Schedule reminders
export async function scheduleReminders(bookingId: string, sessionStartTime: Date) {
  const now = Date.now();
  const start = sessionStartTime.getTime();
  
  const delay24h = start - now - 24 * 60 * 60 * 1000;
  const delay2h = start - now - 2 * 60 * 60 * 1000;
  
  if (delay24h > 0) {
    await reminderQueue.add('reminder-24h', { bookingId, type: '24h' }, { delay: delay24h });
  }
  if (delay2h > 0) {
    await reminderQueue.add('reminder-2h', { bookingId, type: '2h' }, { delay: delay2h });
  }
}

// Schedule Google sync renewal
export async function scheduleGoogleSyncRenewal(trainerId: string, expiresAt: Date) {
  const delay = expiresAt.getTime() - Date.now() - 60 * 60 * 1000; // 1h before expiry
  if (delay > 0) {
    await googleSyncQueue.add('renew-watch', { trainerId, action: 'renew' }, { delay });
  }
}

