import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const { userId, email } = await req.json();
  if (!userId || !email) return Response.json({ error: 'Missing userId/email' }, { status: 400 });
  const stripe = getStripe();

  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    user = await prisma.user.create({ data: { id: userId, email, name: email.split('@')[0] } });
  }

  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const cust = await stripe.customers.create({ email });
    customerId = cust.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const setup = await stripe.setupIntents.create({
    customer: customerId,
    automatic_payment_methods: { enabled: true },
  });
  return Response.json({ clientSecret: setup.client_secret });
}


