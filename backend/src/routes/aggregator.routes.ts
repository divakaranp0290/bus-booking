import { Router } from 'express';
import { searchBuses, getSeatLayout } from '../controllers/aggregator.controller';
const router = Router();
router.get('/search', searchBuses);
router.get('/bus/:busId/seats', getSeatLayout);
export default router;
