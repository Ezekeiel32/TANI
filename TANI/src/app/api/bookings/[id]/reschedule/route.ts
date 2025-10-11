import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeAvailability } from '@/lib/availability';
import { updateCalendarEvent } from '@/lib/google';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const { newStart, newEnd } = await req.json();
  if (!newStart || !newEnd) return Response.json({ error: 'Missing newStart/newEnd' }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { id }, include: { service: true } });
  if (!booking) return Response.json({ error: 'Not found' }, { status: 404 });

  const slots = await computeAvailability({
    trainerId: booking.trainerId,
    serviceDurationMinutes: booking.service.durationMinutes,
    from: new Date(newStart),
    to: new Date(newEnd),
  });
  const ok = slots.some((s) => s.start.toISOString() === newStart && s.end.toISOString() === newEnd);
  if (!ok) return Response.json({ error: 'Slot unavailable' }, { status: 409 });

  // Update Google event
  if (booking.googleEventId) {
    await updateCalendarEvent({ trainerId: booking.trainerId, eventId: booking.googleEventId, start: newStart, end: newEnd });
  }

  const updated = await prisma.booking.update({ where: { id }, data: { start: new Date(newStart), end: new Date(newEnd) } });
  return Response.json({ booking: updated });
}


