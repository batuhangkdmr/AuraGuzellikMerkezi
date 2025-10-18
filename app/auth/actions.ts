// Authentication Server Actions
'use server';

import { redirect } from 'next/navigation';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { 
  hashPassword, 
  comparePassword, 
  createToken, 
  verifyToken,
  verifyRegistrationSecret 
} from '@/lib/auth/auth';
import { 
  setAuthCookie, 
  getAuthCookie, 
  removeAuthCookie 
} from '@/lib/auth/cookies';
import { PublicUser } from '@/lib/models/User';

// Server Action Response Type
interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Kayıt Olma (Register)
 */
export async function register(formData: FormData): Promise<ActionResponse> {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;
    const secretKey = formData.get('secretKey') as string;

    // Validasyon
    if (!username || !password || !passwordConfirm || !secretKey) {
      return {
        success: false,
        error: 'Tüm alanları doldurun!',
      };
    }

    // Username uzunluk kontrolü
    if (username.length < 3 || username.length > 20) {
      return {
        success: false,
        error: 'Kullanıcı adı 3-20 karakter arasında olmalıdır!',
      };
    }

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
      return {
        success: false,
        error: 'Şifre en az 6 karakter olmalıdır!',
      };
    }

    // Şifre eşleşme kontrolü
    if (password !== passwordConfirm) {
      return {
        success: false,
        error: 'Şifreler eşleşmiyor!',
      };
    }

    // Secret key kontrolü
    if (!verifyRegistrationSecret(secretKey)) {
      return {
        success: false,
        error: 'Geçersiz kayıt anahtarı!',
      };
    }

    // Şifreyi hashle
    const hashedPassword = await hashPassword(password);

    // Kullanıcı oluştur
    const user = await UserRepository.create({
      username,
      password: hashedPassword,
      role: 'admin', // İlk kullanıcı admin olsun
    });

    // JWT token oluştur
    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Cookie'ye set et
    await setAuthCookie(token);

    // Son giriş zamanını güncelle
    await UserRepository.updateLastLogin(user.id);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Register error:', error);
    return {
      success: false,
      error: error.message || 'Kayıt sırasında bir hata oluştu!',
    };
  }
}

/**
 * Giriş Yapma (Login)
 */
export async function login(formData: FormData): Promise<ActionResponse> {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Validasyon
    if (!username || !password) {
      return {
        success: false,
        error: 'Kullanıcı adı ve şifre gerekli!',
      };
    }

    // Kullanıcıyı bul
    const user = await UserRepository.findByUsername(username);
    if (!user) {
      return {
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı!',
      };
    }

    // Şifre kontrolü
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı!',
      };
    }

    // JWT token oluştur
    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Cookie'ye set et
    await setAuthCookie(token);

    // Son giriş zamanını güncelle
    await UserRepository.updateLastLogin(user.id);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Giriş sırasında bir hata oluştu!',
    };
  }
}

/**
 * Çıkış Yapma (Logout)
 */
export async function logout(): Promise<void> {
  await removeAuthCookie();
  redirect('/auth/login');
}

/**
 * Mevcut kullanıcıyı getir (Cookie'den)
 */
export async function getCurrentUser(): Promise<PublicUser | null> {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Kullanıcıyı DB'den al (güncel bilgiler için)
    const user = await UserRepository.findById(payload.userId);
    if (!user) {
      return null;
    }

    return UserRepository.toPublicUser(user);
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

/**
 * Admin kontrolü
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

