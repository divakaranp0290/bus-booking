// backend/src/controllers/booking.controller.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from "../utils/prisma";
import { acquireSeatLock, releaseSeatLock, seatKey } from '../utils/redis';
import { getIO } from '../sockets';



function nowPlusMinutes(mins: number) {
  return new Date(Date.now() + mins * 60 * 1000);
}

/**
 * POST /api/booking/lock
 * body: { busId: string, seats: string[], ttlMinutes?: number }
 */
export async function lockSeats(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id ?? null; // adapt if you have auth middleware
    const { busId, seats, ttlMinutes = 10 } = req.body;
    if (!busId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // 1) DB-level check for active locks
    const active = await prisma.seatLock.findMany({
      where: { busId, seatNo: { in: seats }, expiresAt: { gt: new Date() } },
    });
    if (active.length) {
      return res.status(409).json({ conflictSeats: active.map(a => a.seatNo) });
    }

    // 2) Acquire Redis locks one-by-one (fail fast)
    const acquired: { seat: string; key: string; token: string }[] = [];
    for (const seat of seats) {
      const a = await acquireSeatLock(busId, seat, ttlMinutes * 60 * 1000);
      if (!a) {
        // release previous acquired
        for (const p of acquired) {
          try { await releaseSeatLock(p.key, p.token); } catch (e) { /* ignore */ }
        }
        return res.status(409).json({ conflictSeats: [seat] });
      }
      acquired.push({ seat, key: a.key, token: a.token });
    }

    // 3) Create booking row + seatLock rows in DB (transaction)
    const lockRef = crypto.randomUUID();
    const expiresAt = nowPlusMinutes(ttlMinutes);

    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({ data: { userId: userId ?? undefined, busId, lockRef, status: 'LOCKED', amount: 0 } });
      for (const a of acquired) {
        await tx.seatLock.create({
          data: { lockRef, busId, seatNo: a.seat, token: a.token, expiresAt, userId: userId ?? undefined }
        });
      }
      return b;
    });

    // 4) broadcast lock events via socket.io
    try {
      const io = getIO();
      for (const a of acquired) {
        io.to(`bus:${busId}`).emit('seat:update', { seatNo: a.seat, status: 'locked', busId });
      }
    } catch (e) {
      // socket may not be initialized — non-fatal
    }

    return res.json({ success: true, lockRef, bookingId: booking.id, expiresAt });
  } catch (err) {
    console.error('lockSeats error', err);
    return res.status(500).json({ error: 'server' });
  }
}

/**
 * POST /api/booking/release
 * body: { lockRef: string }
 */
export async function releaseLock(req: Request, res: Response) {
  try {
    const { lockRef } = req.body;
    if (!lockRef) return res.status(400).json({ error: 'Missing lockRef' });

    const locks = await prisma.seatLock.findMany({ where: { lockRef } });
    if (!locks.length) return res.json({ success: true, message: 'Nothing to release' });

    // delete DB rows and try to release Redis tokens
    for (const l of locks) {
      try {
        if (l.token) await releaseSeatLock(seatKey(l.busId, l.seatNo), l.token);
      } catch (e) { /* ignore release errors */ }
    }
    await prisma.seatLock.deleteMany({ where: { lockRef } });

    // broadcast available seats
    try {
      const io = getIO();
      for (const l of locks) io.to(`bus:${l.busId}`).emit('seat:update', { seatNo: l.seatNo, status: 'available', busId: l.busId });
    } catch (e) {}

    return res.json({ success: true });
  } catch (err) {
    console.error('releaseLock error', err);
    return res.status(500).json({ error: 'server' });
  }
}

/**
 * POST /api/booking/confirm
 * body: { lockRef: string, payment?: {...} }
 *
 * NOTE: This endpoint assumes payment verification is done.
 */
export async function confirmBooking(req: Request, res: Response) {
  try {
    const { lockRef } = req.body;
    if (!lockRef) return res.status(400).json({ error: 'Missing lockRef' });

    // load seat locks
    const seatLocks = await prisma.seatLock.findMany({ where: { lockRef } });
    if (!seatLocks.length) return res.status(404).json({ error: 'No locks found' });

    // Validate not expired (server time)
    const now = new Date();
    const expired = seatLocks.filter(s => s.expiresAt <= now);
    if (expired.length) return res.status(410).json({ error: 'Lock expired', seats: expired.map(e => e.seatNo) });

    // Perform transaction: create BookingSeat rows, remove seatLock rows, update booking status + pnr
    let pnr = `PNR${Math.floor(Math.random() * 1e9).toString().padStart(9, '0')}`;
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { lockRef }});
      if (!booking) throw new Error('Booking missing in transaction');

      // create seats
      for (const s of seatLocks) {
        await tx.bookingSeat.create({
          data: { bookingId: booking.id, seatNo: s.seatNo, fare: Math.round((booking.amount || 0) / seatLocks.length) }
        });
      }
      // delete seat locks
      await tx.seatLock.deleteMany({ where: { lockRef } });
      // update booking
      await tx.booking.update({ where: { id: booking.id }, data: { status: 'CONFIRMED', pnr }});
    });

    // release redis keys (best-effort)
    for (const s of seatLocks) {
      try { if (s.token) await releaseSeatLock(seatKey(s.busId, s.seatNo), s.token); } catch (e) {}
    }

    // broadcast seat booked events
    try {
      const io = getIO();
      for (const s of seatLocks) io.to(`bus:${s.busId}`).emit('seat:update', { seatNo: s.seatNo, status: 'booked', busId: s.busId });
    } catch (e) {}

    return res.json({ success: true, pnr });
  } catch (err) {
    console.error('confirmBooking error', err);
    return res.status(500).json({ error: 'server' });
  }
}
