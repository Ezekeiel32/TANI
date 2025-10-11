import { prisma } from '@/lib/prisma';

export async function GET() {
  const services = await prisma.service.findMany({ where: { active: true }, orderBy: { durationMinutes: 'asc' } });
  const trainer = await prisma.trainer.findFirst();
  return Response.json({
    services: services.map((s) => ({ id: s.id, name: s.name, durationMinutes: s.durationMinutes })),
    trainerId: trainer?.id ?? null,
  });
}



