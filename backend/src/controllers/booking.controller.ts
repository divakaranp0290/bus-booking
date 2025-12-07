import { Request, Response } from 'express';
import { prisma } from "../utils/prisma";
import crypto from 'crypto';


function generatePNR() {
  return 'PNR' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

export const blockSeats = async (req: Request, res: Response) => {
  try {
    const { busId, seatCodes, userPhone } = req.body;
    if (!busId || !seatCodes || !Array.isArray(seatCodes) || seatCodes.length === 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const bus = await prisma.bus.findUnique({ where: { externalId: busId }, include: { seats: true } });
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    const seatRecords = bus.seats.filter((s: any) => seatCodes.includes(s.seatCode));
    const unavailable = seatRecords.filter((s : any) => !s.available);
    if (unavailable.length) {
      return res.status(409).json({ error: 'Some seats not available', unavailable: unavailable.map((s : any) => s.seatCode) });
    }

    const totalAmount = seatRecords.reduce((s: number, seat: typeof bus.seats[0]) => s + seat.price, 0);

    let user = null;
    if (userPhone) {
      user = await prisma.user.upsert({
        where: { phone: userPhone },
        update: {},
        create: { phone: userPhone }
      });
    }

    const pnr = generatePNR();

    const booking = await prisma.$transaction(async (tx: any) => {
      await tx.seat.updateMany({
        where: { busId: bus.id, seatCode: { in: seatCodes }, available: true },
        data: { available: false }
      });

      const bk = await tx.booking.create({
        data: {
          pnr,
          busId: bus.id,
          userId: user?.id,
          seats: JSON.stringify(seatCodes),
          totalAmount,
          status: 'CREATED'
        }
      });
      return bk;
    });

    res.json({ blockId: booking.id, pnr: booking.pnr, totalAmount: booking.totalAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Block failed' });
  }
};

export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const { blockId } = req.body;
    if (!blockId) return res.status(400).json({ error: 'Missing blockId' });

    const booking = await prisma.booking.findUnique({ where: { id: blockId } });
    if (!booking) return res.status(404).json({ error: 'Block not found' });
    if (booking.status !== 'CREATED') return res.status(400).json({ error: 'Booking not in CREATED state' });

    const updated = await prisma.booking.update({
      where: { id: blockId },
      data: { status: 'CONFIRMED' }
    });

    res.json({ bookingId: updated.id, pnr: updated.pnr, status: updated.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Confirm failed' });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status === 'CANCELLED') return res.json({ status: 'ALREADY_CANCELLED' });

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    const seatCodes = JSON.parse(updated.seats) as string[];
    await prisma.seat.updateMany({
      where: { busId: updated.busId, seatCode: { in: seatCodes } },
      data: { available: true }
    });

    res.json({ status: 'CANCELLED', bookingId: updated.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cancel failed' });
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Get booking failed' });
  }
};
