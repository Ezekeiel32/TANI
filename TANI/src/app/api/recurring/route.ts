import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { expandRecurringSeries } from '@/lib/recurring';

export async function POST(req: NextRequest) {
  const { trainerId, userId, serviceId, rrule, startDate, endDate } = await req.json();
  if (!trainerId || !userId || !serviceId || !rrule || !startDate) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }
  const series = await prisma.recurringSeries.create({
    data: {
      trainerId,
      userId,
      serviceId,
      rrule,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });
  
  // Immediately expand the series
  await expandRecurringSeries(series.id);
  
  return Response.json({ series });
}



