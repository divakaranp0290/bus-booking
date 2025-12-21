import { Router } from 'express';
import { SearchService } from './search.service';
import { searchBuses } from './search.controller';

const router = Router();
const service = new SearchService();

// router.get('/bus/search', async (req, res) => {
//   try {
//     const bid = req.query.bid as string;

//     if (!bid) {
//       return res.status(400).json({ message: 'bid is required' });
//     }

//     const data = await service.search({ bid });
//     res.json(data);
//   } catch (e) {
//     res.status(500).json({ message: 'Search failed' });
//   }
// });

// Real API Integration (later)
 router.post('/bus/search', searchBuses);

export default router;
