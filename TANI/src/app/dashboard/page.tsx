import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const [trainer, bookings] = await Promise.all([
    prisma.trainer.findFirst({ include: { user: true } }),
    prisma.booking.findMany({ orderBy: { start: 'asc' }, take: 20, include: { user: true, service: true } }),
  ]);
  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '-80px', paddingTop: '96px' }}>
      <h1 className="text-3xl font-bold mb-4">Trainer Dashboard</h1>
      <div className="mb-6">
        <div className="text-muted-foreground">Signed-in Trainer</div>
        <div>{trainer?.user?.name} ({trainer?.user?.email})</div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Upcoming Bookings</h2>
        {bookings.map((b) => (
          <div key={b.id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">{b.service.name}</div>
              <div className="text-sm text-muted-foreground">{b.user?.email ?? 'Guest'}</div>
            </div>
            <div>{b.start.toLocaleString()} - {b.end.toLocaleTimeString()} ({b.status})</div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-4">
        <a className="underline" href={`/api/google/oauth/start?trainerId=${trainer?.id}`}>Connect Google Calendar</a>
        <a className="underline" href="/dashboard/availability">Manage Availability</a>
        <a className="underline" href="/dashboard/payments">Manage Payments</a>
      </div>
    </div>
  );
}



