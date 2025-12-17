// src/routes/auth.ts
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from "../utils/prisma";
import { hashPassword, comparePassword, signJwt } from '../utils/auth';
import { createOtpRecord, sendOtpToEmail, verifyOtpCode } from '../utils/otp';


const router = express.Router();

/** Signup */
router.post('/signup', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password, name } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email }});
    if (existing) return res.status(409).json({ error: 'Email exists' });
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, password: hashed, name }});
    const token = signJwt({ userId: user.id, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name }});
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

/** Login */
router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email }});
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signJwt({ userId: user.id, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name }});
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

/** Forgot: create OTP and "send" */
router.post('/forgot', [ body('email').isEmail() ], async (req: any, res: any) => {
  const { email } = req.body;
  try {
    const otp = await createOtpRecord(email);
    // sendOtpToEmail will just console.log for now (replace with real mail later)
    await sendOtpToEmail(email, otp);
    res.json({ ok: true, message: 'OTP sent (check server console in dev).' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

/** Verify OTP and reset password */
router.post('/forgot/verify', [
  body('email').isEmail(),
  body('code').isLength({ min: 4 }),
  body('newPassword').isLength({ min: 6 })
], async (req: any, res: any) => {
  const { email, code, newPassword } = req.body;
  try {
    const valid = await verifyOtpCode(email, code);
    if (!valid) return res.status(400).json({ error: 'Invalid or expired OTP' });
    const hashed = await hashPassword(newPassword);
    await prisma.user.updateMany({ where: { email }, data: { password: hashed }});
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'server' }); }
});

export default router;
