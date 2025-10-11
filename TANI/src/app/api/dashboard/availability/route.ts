import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { trainerId, templates, bufferMinutes, minNoticeMinutes } = await req.json();
  
  // Update trainer settings
  await prisma.trainer.update({
    where: { id: trainerId },
    data: { bufferMinutes, minNoticeMinutes },
  });
  
  // Update templates
  for (const template of templates) {
    if (template.id) {
      // Update existing
      await prisma.availabilityTemplate.update({
        where: { id: template.id },
        data: {
          startMinutes: template.startMinutes,
          endMinutes: template.endMinutes,
          breaksJson: template.breaksJson,
        },
      });
    } else {
      // Create new
      await prisma.availabilityTemplate.create({
        data: {
          trainerId,
          weekday: template.weekday,
          startMinutes: template.startMinutes,
          endMinutes: template.endMinutes,
          breaksJson: template.breaksJson,
        },
      });
    }
  }
  
  // Delete removed templates
  const activeWeekdays = templates.map((t: any) => t.weekday);
  await prisma.availabilityTemplate.deleteMany({
    where: {
      trainerId,
      weekday: { notIn: activeWeekdays },
    },
  });
  
  return Response.json({ success: true });
}
