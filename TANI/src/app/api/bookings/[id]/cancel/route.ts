import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteCalendarEvent } from '@/lib/google';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { service: true } });
  if (!booking) return Response.json({ error: 'Not found' }, { status: 404 });

  const hoursUntil = (booking.start.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) return Response.json({ error: 'Cannot cancel within 24h' }, { status: 400 });

  if (booking.googleEventId) {
    await deleteCalendarEvent({ trainerId: booking.trainerId, eventId: booking.googleEventId });
  }
  const updated = await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
  return Response.json({ booking: updated });
}


