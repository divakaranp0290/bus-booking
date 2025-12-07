import { prisma } from "./utils/prisma";


async function main() {
  console.log('Seeding DB...');
  const existing = await prisma.bus.findUnique({ where: { externalId: 'BUS-001' } });
  if (existing) {
    console.log('Bus already seeded:', existing.externalId);
    return;
  }

  const bus = await prisma.bus.create({
    data: {
      externalId: 'BUS-001',
      operator: 'SRS Travels',
      fromCity: 'Bengaluru',
      toCity: 'Chennai',
      depTime: new Date(Date.now() + 24 * 3600 * 1000),
      arrTime: new Date(Date.now() + 24 * 3600 * 1000 + 6 * 3600 * 1000),
      durationMin: 360,
      baseFare: 750,
      seats: {
        create: Array.from({ length: 20 }).map((_, i) => ({
          seatCode: `A${i + 1}`,
          row: Math.floor(i / 4) + 1,
          col: (i % 4) + 1,
          price: 750,
          available: i % 6 !== 0
        }))
      }
    }
  });

  console.log('Seeded bus', bus.externalId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
