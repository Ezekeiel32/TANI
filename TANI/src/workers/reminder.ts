import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@/lib/prisma';
import { sendBookingReminder } from '@/lib/email';
import type { ReminderJob } from '@/lib/queue';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const reminderWorker = new Worker<ReminderJob>(
  'reminder',
  async (job) => {
    const { bookingId, type } = job.data;
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, service: true },
    });
    
    if (!booking || booking.status !== 'CONFIRMED' || !booking.user?.email) {
      console.log(`Skipping reminder for booking ${bookingId}`);
      return;
    }
    
    const hoursUntil = type === '24h' ? 24 : 2;
    
    await sendBookingReminder({
      to: booking.user.email,
      userName: booking.user.name || booking.user.email,
      serviceName: booking.service.name,
      startTime: booking.start,
      hoursUntil,
      bookingId: booking.id,
    });
    
    console.log(`Sent ${type} reminder for booking ${bookingId}`);
  },
  { connection }
);

console.log('Reminder worker started');
