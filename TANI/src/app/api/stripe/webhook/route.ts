import { NextRequest } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response('Missing webhook secret', { status: 500 });

  const stripe = getStripe();
  const rawBody = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'setup_intent.succeeded': {
      const si = event.data.object as { customer: string; payment_method: string };
      const user = await prisma.user.findFirst({ where: { stripeCustomerId: si.customer } });
      if (user) {
        await prisma.paymentMethod.upsert({
          where: { stripePaymentMethodId: si.payment_method },
          update: {},
          create: {
            userId: user.id,
            stripePaymentMethodId: si.payment_method,
            stripeCustomerId: si.customer,
            isDefault: true,
          },
        });
      }
      break;
    }
    case 'payment_intent.succeeded': {
      const pi = event.data.object as any;
      if (pi.metadata?.bookingId) {
        await prisma.payment.update({
          where: { bookingId: pi.metadata.bookingId },
          data: { status: 'SUCCEEDED', stripePaymentIntentId: pi.id },
        });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as any;
      if (pi.metadata?.bookingId) {
        await prisma.payment.update({
          where: { bookingId: pi.metadata.bookingId },
          data: { status: 'FAILED', failureReason: pi.last_payment_error?.message ?? 'Unknown' },
        });
      }
      break;
    }
  }

  return new Response('ok');
}

export const config = {
  api: {
    bodyParser: false,
  },
};


