import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeAvailability } from '@/lib/availability';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trainerId = searchParams.get('trainerId');
  const serviceId = searchParams.get('serviceId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (!trainerId || !serviceId || !from || !to) {
    return Response.json({ error: 'Missing required params' }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return Response.json({ error: 'Service not found' }, { status: 404 });
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId } });
  if (!trainer) return Response.json({ error: 'Trainer not found' }, { status: 404 });

  const slots = await computeAvailability({
    trainerId,
    serviceDurationMinutes: service.durationMinutes,
    from: new Date(from),
    to: new Date(to),
    minNoticeMinutes: trainer.minNoticeMinutes,
    bufferMinutes: trainer.bufferMinutes,
  });

  return Response.json({ slots });
}


