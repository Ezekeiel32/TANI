import { prisma } from '@/lib/prisma';

export default async function WaiverRepository() {
  const waivers = await prisma.waiverSignature.findMany({
    include: { booking: { include: { user: true, service: true } } },
    orderBy: { signedAt: 'desc' },
  });
  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '-80px', paddingTop: '96px' }}>
      <h1 className="text-2xl font-bold mb-4">Waiver Repository</h1>
      <div className="space-y-2">
        {waivers.map((w) => (
          <div key={w.id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">{w.booking.service.name}</div>
              <div className="text-sm text-muted-foreground">{w.booking.user?.email} • {w.signedAt.toLocaleString()}</div>
            </div>
            {w.pdfUrl && (
              <a className="underline" href={w.pdfUrl} target="_blank">View PDF</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


