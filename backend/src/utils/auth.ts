// src/utils/auth.ts
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
// const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_secret';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'u2Q$7jF!wE9Zp%aL@T3rN6^xH8yK#cR$Jm4V!sQb9G*eP0U';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}
export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signJwt(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,   // <-- FIX HERE
  });
}
export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
