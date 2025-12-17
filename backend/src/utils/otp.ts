import { prisma } from "../utils/prisma";
import { randomInt } from 'crypto';
import { addMinutes } from "date-fns";

import dotenv from 'dotenv';
dotenv.config();

const OTP_EXPIRY_MIN = Number(process.env.OTP_EXPIRY_MIN || 10);

export async function createOtpRecord(email: string) {
  const code = String(randomInt(1000, 999999)).padStart(4, '0');
  const expiresAt = addMinutes(new Date(), OTP_EXPIRY_MIN);
  await prisma.otp.create({ data: { email, code, expiresAt } }).catch(async e => {
    // older prisma model name case? ensure correct model name: Otp
    await prisma.otp.create({ data: { email, code, expiresAt }});
  });
  // some prisma variants might have lowercase model helpers — do safe insert using raw fallback
  // but above will usually work; simpler: use create with model name as defined (Otp)
  return code;
}

export async function sendOtpToEmail(email: string, otp: string) {
  // TODO: integrate mail provider (SendGrid/Mailgun). For now log to server console.
  console.log(`[OTP] Send to ${email}: code=${otp}`);
}

export async function verifyOtpCode(email: string, code: string) {
  const record = await prisma.otp.findFirst({ where: { email, code, used: false }, orderBy: { createdAt: 'desc' } }).catch(async e => {
    return prisma.otp.findFirst({ where: { email, code, used: false }, orderBy: { createdAt: 'desc' }});
  });
  if (!record) return false;
  if (new Date(record.expiresAt) < new Date()) return false;
  // mark used
  await prisma.otp.update({ where: { id: record.id }, data: { used: true } }).catch(async e => {
    await prisma.otp.update({ where: { id: record.id }, data: { used: true }});
  });
  return true;
}


