import { prisma } from '@/lib/prisma';

export default async function BookingDetail({ params }: { params: { id: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { service: true, trainer: true, user: true },
  });
  if (!booking) return <div className="container mx-auto px-4 py-8" style={{ marginTop: '-80px', paddingTop: '96px' }}>Not found</div>;
  const canCancel = (booking.start.getTime() - Date.now()) / (1000 * 60 * 60) >= 24;
  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '-80px', paddingTop: '96px' }}>
      <h1 className="text-2xl font-bold mb-2">{booking.service.name}</h1>
      <div className="text-muted-foreground mb-4">{booking.start.toLocaleString()} - {booking.end.toLocaleTimeString()}</div>
      <div>Status: {booking.status}</div>
      <div className="mt-6">
        <form action={`/api/bookings/${booking.id}/cancel`} method="post">
          <button className="underline" disabled={!canCancel}>Cancel Booking</button>
        </form>
      </div>
    </div>
  );
}


