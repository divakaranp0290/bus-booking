// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/auth';

export async function authMiddleware(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Bad auth header' });
  const token = parts[1];
  try {
    const payload = verifyJwt(token) as any;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
