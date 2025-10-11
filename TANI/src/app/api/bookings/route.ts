import { NextRequest } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const idem = req.headers.get('idempotency-key') || '';
  if (idem) {
    const existing = await prisma.idempotencyKey.findUnique({ where: { requestId: idem } });
    if (existing) return Response.json(JSON.parse(existing.response));
  }
  const { trainerId, userId, serviceId, start, end, hold } = await req.json();
  // Optional reCAPTCHA verification if configured
  const token = req.headers.get('x-recaptcha-token');
  if (process.env.RECAPTCHA_SECRET_KEY && token) {
    try {
      const resp = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`);
      if (!resp.data.success) return Response.json({ error: 'Bot detected' }, { status: 403 });
    } catch {
      return Response.json({ error: 'Captcha verification failed' }, { status: 400 });
    }
  }
  if (!trainerId || !serviceId || !start || !end) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Proper conflict detection: check for overlapping time periods
  const conflict = await prisma.booking.findFirst({
    where: {
      trainerId,
      status: { in: ['TENTATIVE', 'CONFIRMED'] },
      OR: [
        // Any overlap condition
        { start: { lt: endDate }, end: { gt: startDate } },
      ],
    },
  });
  if (conflict) return Response.json({ error: 'Slot no longer available' }, { status: 409 });

  // Group capacity enforcement
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return Response.json({ error: 'Service not found' }, { status: 404 });
  if (service.type === 'GROUP') {
    const attendees = await prisma.booking.count({
      where: {
        trainerId,
        serviceId,
        status: { in: ['TENTATIVE', 'CONFIRMED'] },
        start: startDate,
        end: endDate,
      },
    });
    if (attendees >= service.maxCapacity) {
      return Response.json({ error: 'Session full' }, { status: 409 });
    }
  }

  const booking = await prisma.booking.create({
    data: {
      trainerId,
      userId,
      serviceId,
      start: startDate,
      end: endDate,
      status: hold ? 'TENTATIVE' : 'CONFIRMED',
      holdExpiresAt: hold ? new Date(Date.now() + 5 * 60 * 1000) : null,
    },
  });
  logger?.info?.({ event: 'booking.create', bookingId: booking.id });
  if (idem) await prisma.idempotencyKey.create({ data: { requestId: idem, response: JSON.stringify({ booking }) } });
  return Response.json({ booking });
}


