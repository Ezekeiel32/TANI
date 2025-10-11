import { RRule } from 'rrule';
import { addMinutes } from 'date-fns';
import { prisma } from './prisma';
import { createCalendarEvent, deleteCalendarEvent } from './google';
import { scheduleCharge, scheduleReminders } from './queue';

export async function expandRecurringSeries(seriesId: string, weeksAhead: number = 12) {
  const series = await prisma.recurringSeries.findUnique({
    where: { id: seriesId },
    include: { service: true },
  });
  
  if (!series) return;
  
  // Parse RRULE
  const rule = RRule.fromString(series.rrule);
  const dates = rule.between(
    new Date(),
    new Date(Date.now() + weeksAhead * 7 * 24 * 60 * 60 * 1000),
    true
  );
  
  // Get existing bookings
  const existingBookings = await prisma.booking.findMany({
    where: { seriesId },
    select: { start: true },
  });
  
  const existingStarts = new Set(existingBookings.map(b => b.start.toISOString()));
  
  // Parse exceptions
  const exceptions = series.exceptionsJson ? JSON.parse(series.exceptionsJson) : [];
  const exceptionDates = new Set(exceptions.map((d: string) => new Date(d).toISOString()));
  
  // Create missing bookings
  for (const date of dates) {
    const start = date;
    const end = addMinutes(start, series.service.durationMinutes);
    
    // Skip if already exists or is an exception
    if (existingStarts.has(start.toISOString()) || exceptionDates.has(start.toISOString())) {
      continue;
    }
    
    // Check if slot is available
    const conflict = await prisma.booking.findFirst({
      where: {
        trainerId: series.trainerId,
        status: { in: ['TENTATIVE', 'CONFIRMED'] },
        OR: [
          { start: { lte: end }, end: { gte: start } },
        ],
      },
    });
    
    if (conflict) continue;
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        trainerId: series.trainerId,
        userId: series.userId,
        serviceId: series.serviceId,
        start,
        end,
        status: 'CONFIRMED',
        seriesId: series.id,
      },
    });
    
    // Create Google Calendar event
    const user = await prisma.user.findUnique({ where: { id: series.userId } });
    const eventId = await createCalendarEvent({
      trainerId: series.trainerId,
      summary: series.service.name,
      start: start.toISOString(),
      end: end.toISOString(),
      attendeeEmail: user?.email,
    });
    
    if (eventId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { googleEventId: eventId },
      });
    }
    
    // Schedule charge and reminders
    await scheduleCharge(booking.id, end);
    await scheduleReminders(booking.id, start);
  }
}

export async function skipRecurringOccurrence(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { series: true },
  });
  
  if (!booking || !booking.seriesId || !booking.series) return;
  
  // Add to exceptions
  const exceptions = booking.series.exceptionsJson ? JSON.parse(booking.series.exceptionsJson) : [];
  exceptions.push(booking.start.toISOString());
  
  await prisma.recurringSeries.update({
    where: { id: booking.seriesId },
    data: { exceptionsJson: JSON.stringify(exceptions) },
  });
  
  // Cancel the booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED' },
  });
  
  // Delete Google event
  if (booking.googleEventId) {
    await deleteCalendarEvent({ trainerId: booking.trainerId, eventId: booking.googleEventId });
  }
}
