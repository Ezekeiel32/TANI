import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Ensure a trainer user exists (placeholder)
  const trainerUser = await prisma.user.upsert({
    where: { email: 'trainer@example.com' },
    update: {},
    create: {
      email: 'trainer@example.com',
      name: 'Head Coach',
      role: 'TRAINER',
      timezone: 'America/New_York',
      trainer: {
        create: {
          timezone: 'America/New_York',
          bufferMinutes: 10,
          minNoticeMinutes: 120,
        },
      },
    },
    include: { trainer: true },
  });

  // Seed services
  const services = [
    { name: 'Personal Training (30m)', durationMinutes: 30, priceCents: 6000, type: 'PERSONAL' },
    { name: 'Personal Training (45m)', durationMinutes: 45, priceCents: 8000, type: 'PERSONAL' },
    { name: 'Personal Training (60m)', durationMinutes: 60, priceCents: 10000, type: 'PERSONAL' },
    { name: 'Group Training', durationMinutes: 60, priceCents: 3500, type: 'GROUP', maxCapacity: 10 },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { name: s.name },
      update: {
        durationMinutes: s.durationMinutes,
        priceCents: s.priceCents,
        type: s.type,
        maxCapacity: s.maxCapacity ?? 1,
      },
      create: {
        name: s.name,
        durationMinutes: s.durationMinutes,
        priceCents: s.priceCents,
        type: s.type,
        maxCapacity: s.maxCapacity ?? 1,
      },
    });
  }

  // Seed a default weekly availability template (Mon-Fri 9am-5pm) for the trainer
  const trainerId = trainerUser.trainer!.id;
  const weekdays = [1, 2, 3, 4, 5];
  for (const weekday of weekdays) {
    await prisma.availabilityTemplate.upsert({
      where: { trainerId_weekday: { trainerId, weekday } },
      update: {},
      create: {
        trainerId,
        weekday,
        startMinutes: 9 * 60,
        endMinutes: 17 * 60,
        breaksJson: JSON.stringify([{ startMinutes: 12 * 60, endMinutes: 13 * 60 }]),
      },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


