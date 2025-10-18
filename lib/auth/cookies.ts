// Cookie Helper Functions
import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 gün (saniye cinsinden)

/**
 * Auth token'ı HTTP-only cookie'ye set et
 * @param token - JWT token
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true, // JavaScript ile erişilemez
    secure: process.env.NODE_ENV === 'production', // Sadece HTTPS'de
    sameSite: 'lax', // CSRF koruması
    maxAge: COOKIE_MAX_AGE, // 7 gün
    path: '/', // Tüm sitede geçerli
  });
}

/**
 * Cookie'den auth token'ı al
 * @returns JWT token string veya null
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(AUTH_COOKIE_NAME);
  
  return cookie?.value || null;
}

/**
 * Auth cookie'yi sil (Logout)
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Cookie var mı kontrol et
 * @returns true/false
 */
export async function hasAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(AUTH_COOKIE_NAME);
}

