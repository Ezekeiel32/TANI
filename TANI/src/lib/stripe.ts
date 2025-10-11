import Stripe from 'stripe';

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(secretKey, {
    apiVersion: '2024-09-30.acacia',
  });
}


