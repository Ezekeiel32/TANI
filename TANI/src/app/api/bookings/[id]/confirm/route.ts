import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCalendarEvent } from '@/lib/google';
import { scheduleCharge, scheduleReminders } from '@/lib/queue';
import { sendBookingConfirmation } from '@/lib/email';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { service: true } });
  if (!booking) return Response.json({ error: 'Not found' }, { status: 404 });
  if (booking.status === 'CANCELLED') return Response.json({ error: 'Cancelled booking' }, { status: 400 });

  // Create Google Calendar event if OAuth is connected
  const eventId = await createCalendarEvent({
    trainerId: booking.trainerId,
    summary: booking.service.name,
    start: booking.start.toISOString(),
    end: booking.end.toISOString(),
    attendeeEmail: booking.user?.email ?? undefined,
  });

  const updated = await prisma.booking.update({ 
    where: { id }, 
    data: { status: 'CONFIRMED', holdExpiresAt: null, googleEventId: eventId ?? undefined },
    include: { user: true, service: true }
  });
  
  // Schedule charge and reminders
  await scheduleCharge(booking.id, booking.end);
  await scheduleReminders(booking.id, booking.start);
  
  // Send confirmation email
  if (updated.user?.email) {
    await sendBookingConfirmation({
      to: updated.user.email,
      userName: updated.user.name || updated.user.email,
      serviceName: updated.service.name,
      startTime: updated.start,
      endTime: updated.end,
      bookingId: updated.id,
    });
  }
  
  return Response.json({ booking: updated, googleEventId: eventId });
}


