import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';


export const searchBuses = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const buses = await prisma.bus.findMany({
      where: { fromCity: String(from), toCity: String(to) },
      select: {
        externalId: true,
        operator: true,
        depTime: true,
        arrTime: true,
        durationMin: true,
        baseFare: true
      }
    });
    res.json({ results: buses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
};

export const getSeatLayout = async (req: Request, res: Response) => {
  try {
    const busExternalId = req.params.busId;
    const bus = await prisma.bus.findUnique({
      where: { externalId: busExternalId },
      include: { seats: true }
    });
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    res.json({ seats: bus.seats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Seat layout fetch failed' });
  }
};
