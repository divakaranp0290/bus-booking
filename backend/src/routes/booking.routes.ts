import { Router } from 'express';
import { blockSeats, confirmBooking, cancelBooking, getBooking } from '../controllers/booking.controller';
const router = Router();

router.post('/block', blockSeats);
router.post('/confirm', confirmBooking);
router.post('/:id/cancel', cancelBooking);
router.get('/:id', getBooking);

export default router;
