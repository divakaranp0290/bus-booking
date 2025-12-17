import express from 'express';
import { lockSeats, releaseLock, confirmBooking } from '../controllers/booking.controller';
const router = express.Router();

router.post('/lock', lockSeats);
router.post('/release', releaseLock);
router.post('/confirm', confirmBooking);

export default router;
