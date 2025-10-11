import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const { paymentId, stripePaymentIntentId } = await req.json();
  
  if (!paymentId || !stripePaymentIntentId) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  const stripe = getStripe();
  
  try {
    await stripe.refunds.create({
      payment_intent: stripePaymentIntentId,
    });
    
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });
    
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
