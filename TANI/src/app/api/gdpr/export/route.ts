import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  
  // Fetch all user data
  const [user, bookings, payments, waivers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { paymentMethods: true },
    }),
    prisma.booking.findMany({
      where: { userId },
      include: { service: true, payments: true },
    }),
    prisma.payment.findMany({
      where: { booking: { userId } },
    }),
    prisma.waiverSignature.findMany({
      where: { userId },
      select: {
        id: true,
        bookingId: true,
        signedAt: true,
        createdAt: true,
      },
    }),
  ]);
  
  const exportData = {
    exportDate: new Date().toISOString(),
    user: {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      phone: user?.phone,
      timezone: user?.timezone,
      createdAt: user?.createdAt,
    },
    bookings: bookings.map(b => ({
      id: b.id,
      service: b.service.name,
      start: b.start,
      end: b.end,
      status: b.status,
      payments: b.payments.map(p => ({
        amount: p.amountCents / 100,
        currency: p.currency,
        status: p.status,
        date: p.createdAt,
      })),
    })),
    paymentMethods: user?.paymentMethods.map(pm => ({
      id: pm.id,
      isDefault: pm.isDefault,
      createdAt: pm.createdAt,
    })),
    waivers,
  };
  
  return Response.json(exportData, {
    headers: {
      'Content-Disposition': `attachment; filename="user-data-${userId}.json"`,
    },
  });
}
