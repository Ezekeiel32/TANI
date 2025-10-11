import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { user: true, service: true } });
  if (!booking) return Response.json({ error: 'Not found' }, { status: 404 });
  if (!booking.userId || !booking.user?.stripeCustomerId) {
    return Response.json({ error: 'No stored payment method' }, { status: 400 });
  }

  const stripe = getStripe();
  const amount = booking.service.priceCents * (booking.groupSize || 1);

  const paymentIntent = await stripe.paymentIntents.create({
    customer: booking.user.stripeCustomerId,
    amount,
    currency: booking.service.currency.toLowerCase(),
    confirm: true,
    off_session: true,
    automatic_payment_methods: { enabled: true },
    metadata: { bookingId: booking.id },
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: { stripePaymentIntentId: paymentIntent.id },
    create: { bookingId: booking.id, amountCents: amount, currency: booking.service.currency, status: 'PENDING', stripePaymentIntentId: paymentIntent.id },
  });

  const updated = await prisma.booking.update({ where: { id }, data: { status: 'COMPLETED' } });
  return Response.json({ booking: updated, paymentIntentId: paymentIntent.id });
}



