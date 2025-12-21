import { Request, Response } from 'express';
import { SearchService } from './search.service';

const service = new SearchService();


export async function searchBuses(req: Request, res: Response) {
  try {
    const results = await service.search(req.body);

    res.json({
      success: true,
      searchId: results[0]?.searchId ?? null,
      results
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
}
