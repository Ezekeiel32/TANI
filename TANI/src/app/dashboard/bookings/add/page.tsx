import { prisma } from '@/lib/prisma';

export default async function AddBooking() {
  const services = await prisma.service.findMany({ where: { active: true } });
  const trainer = await prisma.trainer.findFirst();
  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '-80px', paddingTop: '96px' }}>
      <h1 className="text-2xl font-bold mb-4">Add Booking</h1>
      <form action="/api/bookings" method="post" className="space-y-3">
        <input type="hidden" name="trainerId" value={trainer?.id} />
        <div>
          <label className="block mb-1">Service</label>
          <select name="serviceId" className="border rounded p-2">
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">User ID (optional)</label>
          <input name="userId" className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block mb-1">Start</label>
          <input type="datetime-local" name="start" className="border rounded p-2" />
        </div>
        <div>
          <label className="block mb-1">End</label>
          <input type="datetime-local" name="end" className="border rounded p-2" />
        </div>
        <button className="underline">Create Booking</button>
      </form>
    </div>
  );
}


