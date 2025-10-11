import { prisma } from '@/lib/prisma';

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: {
      booking: {
        include: {
          service: true,
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  
  return Response.json({ payments });
}
