import { prisma } from "./prisma";


const TTL = Number(process.env.BLOCK_TTL_SECONDS || 600); // seconds

export const startBlockReleaser = () => {
  console.log('Starting block releaser, TTL:', TTL, 'seconds');
  setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - TTL * 1000);
      const old = await prisma.booking.findMany({
        where: {
          status: 'CREATED',
          createdAt: { lt: cutoff }
        }
      });

      for (const b of old) {
        console.log('Releasing block for booking', b.id);
        const seatCodes = JSON.parse(b.seats) as string[];
        await prisma.seat.updateMany({
          where: { busId: b.busId, seatCode: { in: seatCodes } },
          data: { available: true }
        });
        await prisma.booking.update({
          where: { id: b.id },
          data: { status: 'CANCELLED' }
        });
      }
    } catch (err) {
      console.error('Block releaser error', err);
    }
  }, 30 * 1000); // run every 30s
};
