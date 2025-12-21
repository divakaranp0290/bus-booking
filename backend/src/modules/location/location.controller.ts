import { Request, Response } from 'express';
import { LocationService } from './location.service';

const service = new LocationService();

export async function getCities(req: Request, res: Response) {
  const data = await service.getCities();
  res.json({ success: true, data });
}
