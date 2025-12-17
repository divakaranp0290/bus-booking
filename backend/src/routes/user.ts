// src/routes/user.ts
import express from 'express';
import { prisma } from "../utils/prisma";
import { authMiddleware } from '../middleware/auth';



const router = express.Router();

router.get('/me', authMiddleware, async (req: any, res) => {
  const userId = req.user.userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id:true, email:true, name:true, phone:true, role:true }});
  res.json({ user });
});

router.post('/update', authMiddleware, async (req: any, res) => {
  const userId = req.user.userId;
  const { name, phone } = req.body;
  const user = await prisma.user.update({ where: { id: userId }, data: { name, phone }});
  res.json({ user });
});

export default router;
