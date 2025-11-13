// JWT Helper Functions - Edge Runtime Compatible
// This file only uses jose library which is Edge Runtime compatible
// bcryptjs functions are in auth.ts (Node.js Runtime only)

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

// Convert secret to Uint8Array for jose
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

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

