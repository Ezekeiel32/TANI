import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import type { ChargeJob } from '@/lib/queue';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const chargeWorker = new Worker<ChargeJob>(
  'charge',
  async (job) => {
    const { bookingId } = job.data;
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, service: true },
    });
    
    if (!booking || booking.status !== 'CONFIRMED') {
      console.log(`Skipping charge for booking ${bookingId}: not confirmed`);
      return;
    }
    
    if (!booking.user?.stripeCustomerId) {
      console.error(`No Stripe customer for booking ${bookingId}`);
      return;
    }
    
    const stripe = getStripe();
    const amount = booking.service.priceCents * (booking.groupSize || 1);
    
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        customer: booking.user.stripeCustomerId,
        amount,
        currency: booking.service.currency.toLowerCase(),
        confirm: true,
        off_session: true,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        metadata: { bookingId: booking.id },
      });
      
      await prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: { stripePaymentIntentId: paymentIntent.id, status: 'PENDING' },
        create: {
          bookingId: booking.id,
          amountCents: amount,
          currency: booking.service.currency,
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
        },
      });
      
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'COMPLETED' },
      });
      
      console.log(`Charged booking ${bookingId}: ${paymentIntent.id}`);
    } catch (error: any) {
      console.error(`Failed to charge booking ${bookingId}:`, error.message);
      
      await prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: { status: 'FAILED', failureReason: error.message },
        create: {
          bookingId: booking.id,
          amountCents: amount,
          currency: booking.service.currency,
          status: 'FAILED',
          failureReason: error.message,
        },
      });
    }
  },
  { connection }
);

console.log('Charge worker started');

