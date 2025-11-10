// Middleware - Route Protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/* yollarını koru
  if (pathname.startsWith('/admin')) {
    // Cookie'den token al
    const token = request.cookies.get('auth_token')?.value;

    // Token yoksa login'e yönlendir
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Token'ı doğrula
    const payload = await verifyToken(token);
    if (!payload) {
      // Geçersiz token, login'e yönlendir
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Role kontrolü - sadece admin girebilir
    // UserRole.ADMIN = 'ADMIN' (büyük harf)
    if (payload.role !== 'ADMIN') {
      // Yetkisiz erişim
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Her şey OK, devam et
    return NextResponse.next();
  }

  // /auth/login ve /auth/register sayfalarını kontrol et
  // Eğer zaten login olduysa /admin'e yönlendir
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
    const token = request.cookies.get('auth_token')?.value;
    
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  return NextResponse.next();
}

// Middleware'in hangi yollarda çalışacağını belirt
export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
};

