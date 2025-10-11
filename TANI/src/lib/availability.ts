import { addMinutes, isBefore } from 'date-fns';
import { prisma } from './prisma';
import { listBusyFromGoogle } from './google';
import { getRedis } from './redis';

type Slot = { start: Date; end: Date };

export async function computeAvailability(params: {
  trainerId: string;
  serviceDurationMinutes: number;
  from: Date;
  to: Date;
  minNoticeMinutes?: number;
  bufferMinutes?: number;
}): Promise<Slot[]> {
  const { trainerId, serviceDurationMinutes, from, to, minNoticeMinutes = 60, bufferMinutes = 0 } = params;

  const [templates, timeOff, busyBookings] = await Promise.all([
    prisma.availabilityTemplate.findMany({ where: { trainerId } }),
    prisma.timeOff.findMany({ where: { trainerId, OR: [{ start: { lte: to } }, { end: { gte: from } }] } }),
    prisma.booking.findMany({
      where: {
        trainerId,
        status: { in: ['TENTATIVE', 'CONFIRMED'] },
        OR: [
          { start: { gte: from, lt: to } },
          { end: { gt: from, lte: to } },
          { start: { lte: from }, end: { gte: to } },
        ],
      },
      select: { start: true, end: true },
    }),
  ]);

  const nowPlusNotice = addMinutes(new Date(), minNoticeMinutes);

  const slots: Slot[] = [];
  // Iterate days
  for (let d = new Date(from); d <= to; d = addMinutes(d, 24 * 60)) {
    const weekday = d.getUTCDay();
    const dailyTemplates = templates.filter((t: { weekday: number }) => t.weekday === weekday);
    for (const tpl of dailyTemplates) {
      // Use local date components but maintain UTC time for consistent timezone handling
      const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
      const windowStart = addMinutes(dayStart, tpl.startMinutes);
      const windowEnd = addMinutes(dayStart, tpl.endMinutes);
      // Build optional breaks
      const breaks: { startMinutes: number; endMinutes: number }[] = tpl.breaksJson
        ? JSON.parse(tpl.breaksJson)
        : [];

      // Create candidate slots
      for (let s = new Date(windowStart); addMinutes(s, serviceDurationMinutes) <= windowEnd; s = addMinutes(s, serviceDurationMinutes)) {
        const e = addMinutes(s, serviceDurationMinutes);

        // Enforce min notice and buffer
        if (isBefore(s, nowPlusNotice)) continue;

        // Buffer windows (simple approach): extend slot by buffer and ensure within working window
        const sWithBuffer = addMinutes(s, -bufferMinutes);
        const eWithBuffer = addMinutes(e, bufferMinutes);
        if (sWithBuffer < windowStart || eWithBuffer > windowEnd) continue;

        // Exclude breaks
        const inBreak = breaks.some((b) => {
          const bStart = addMinutes(dayStart, b.startMinutes);
          const bEnd = addMinutes(dayStart, b.endMinutes);
          return (s < bEnd && e > bStart);
        });
        if (inBreak) continue;

        // Exclude time off
        const overlapsTimeOff = timeOff.some((off: { start: Date; end: Date }) => s < off.end && e > off.start);
        if (overlapsTimeOff) continue;

        // Exclude existing bookings
        const overlapsBookings = busyBookings.some((b: { start: Date; end: Date }) => s < b.end && e > b.start);
        if (overlapsBookings) continue;

        slots.push({ start: s, end: e });
      }
    }
  }

  // Merge Google Calendar busy
  const googleBusy = await listBusyFromGoogle({ trainerId, timeMin: from.toISOString(), timeMax: to.toISOString() });
  const filtered = slots.filter((s) => !googleBusy.some((b) => new Date(s.start) < new Date(b.end) && new Date(s.end) > new Date(b.start)));
  return filtered;
}

function cacheKey(trainerId: string, serviceDurationMinutes: number, from: Date, to: Date) {
  return `availability:${trainerId}:${serviceDurationMinutes}:${from.toISOString()}:${to.toISOString()}`;
}

export async function getAvailabilityWithCache(params: {
  trainerId: string;
  serviceDurationMinutes: number;
  from: Date;
  to: Date;
  minNoticeMinutes?: number;
  bufferMinutes?: number;
}): Promise<Slot[]> {
  const redis = getRedis();
  const key = cacheKey(params.trainerId, params.serviceDurationMinutes, params.from, params.to);
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const slots = await computeAvailability(params);
  await redis.set(key, JSON.stringify(slots), 'EX', 60 * 30); // 30 min TTL
  return slots;
}

export async function refreshAvailabilityCacheForTrainer(trainerId: string) {
  // Simple refresher: recompute for next 30 days for common durations (30,45,60)
  const redis = getRedis();
  const services = await prisma.service.findMany({ where: { active: true } });
  const from = new Date();
  const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  for (const s of services) {
    const slots = await computeAvailability({
      trainerId,
      serviceDurationMinutes: s.durationMinutes,
      from,
      to,
    });
    const key = cacheKey(trainerId, s.durationMinutes, from, to);
    await redis.set(key, JSON.stringify(slots), 'EX', 60 * 30);
  }
}


