import { prisma } from '@/lib/prisma';
import CalendarView from '@/components/dashboard/CalendarView';

export default async function CalendarPage() {
  const bookings = await prisma.booking.findMany({ include: { service: true } });
  const events = bookings.map((b) => ({ title: b.service.name, start: b.start, end: b.end }));
  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '-80px', paddingTop: '96px' }}>
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <CalendarView events={events as any} />
    </div>
  );
}


