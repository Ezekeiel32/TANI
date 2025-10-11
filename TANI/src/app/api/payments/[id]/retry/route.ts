import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { sendPaymentFailedNotice } from '@/lib/email';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { booking: { include: { user: true } } },
  });
  if (!payment) return Response.json({ error: 'Not found' }, { status: 404 });
  const stripe = getStripe();
  const setupIntent = await stripe.setupIntents.create({ customer: payment.booking.user.stripeCustomerId! });
  if (payment.booking.user.email) {
    await sendPaymentFailedNotice({
      to: payment.booking.user.email,
      userName: payment.booking.user.name || payment.booking.user.email,
      serviceName: 'Training Session',
      bookingId: payment.bookingId,
    });
  }
  return Response.json({ clientSecret: setupIntent.client_secret });
}


