import { Router } from 'express';
import { getCities } from './location.controller';

const router = Router();
router.get('/cities', getCities);

export default router;
