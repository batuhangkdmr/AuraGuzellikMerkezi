// Authentication Helper Functions
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// JWT Payload interface
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = '7d'; // 7 gün

// Convert secret to Uint8Array for jose
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

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
 * JWT Token oluştur (jose - Edge Runtime uyumlu)
 * @param payload - User bilgileri
 * @returns JWT token string
 */
export async function createToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());
  
  return token;
}

/**
 * JWT Token doğrula (jose - Edge Runtime uyumlu)
 * @param token - JWT token string
 * @returns Decoded payload veya null
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    
    // Jose's JWTPayload'ı bizim custom JwtPayload tipine dönüştür
    if (payload && typeof payload === 'object' && 'userId' in payload) {
      return payload as unknown as JwtPayload;
    }
    
    return null;
  } catch (error) {
    console.error('JWT verify error:', error);
    return null;
  }
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

