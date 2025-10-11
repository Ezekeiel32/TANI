import { prisma } from '@/lib/prisma';

export async function GET() {
  const trainer = await prisma.trainer.findFirst({
    include: {
      user: true,
      availabilityTemplates: true,
    },
  });
  
  if (!trainer) {
    return Response.json({ error: 'No trainer found' }, { status: 404 });
  }
  
  return Response.json({
    trainer: {
      id: trainer.id,
      name: trainer.user.name,
      email: trainer.user.email,
      bufferMinutes: trainer.bufferMinutes,
      minNoticeMinutes: trainer.minNoticeMinutes,
    },
    templates: trainer.availabilityTemplates,
  });
}
