// Authentication Helper Functions - Node.js Runtime Only
// Note: bcryptjs is not Edge Runtime compatible, so this file is only used in Server Actions
// For Edge Runtime (middleware), use lib/auth/jwt.ts instead

import bcrypt from 'bcryptjs';

// Re-export JWT types and functions from jwt.ts for backward compatibility
export type { JwtPayload } from './jwt';
export { createToken, verifyToken } from './jwt';

/**
 * Şifreyi hash'le (bcrypt)
 * @param password - Plain text şifre
 * @returns Hash'lenmiş şifre
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
}

/**
 * Şifre doğrulama (bcrypt)
 * @param password - Plain text şifre
 * @param hashedPassword - Hash'lenmiş şifre
 * @returns true/false
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}


/**
 * Registration Secret Key kontrolü
 * @param secretKey - Kullanıcının girdiği secret key
 * @returns true/false
 */
export function verifyRegistrationSecret(secretKey: string): boolean {
  const REGISTRATION_SECRET = process.env.REGISTRATION_SECRET_KEY || 'aura0606';
  return secretKey === REGISTRATION_SECRET;
}

