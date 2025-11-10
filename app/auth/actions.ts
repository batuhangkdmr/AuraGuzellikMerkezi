// Authentication Server Actions
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { UserRole } from '@/lib/types/UserRole';
import { 
  hashPassword, 
  comparePassword, 
  createToken, 
  verifyToken,
  JwtPayload
} from '@/lib/auth/auth';
import { 
  setAuthCookie, 
  getAuthCookie, 
  removeAuthCookie 
} from '@/lib/auth/cookies';

// Common weak passwords to reject
const weakPasswords = [
  '123456', 'password', '12345678', 'qwerty', 'abc123', 
  '1234567', '12345', '123456789', '1234', 'password1',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890'
];

// Validation schemas
const registerSchema = z
  .object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
      .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
      .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir')
      .refine((password) => !weakPasswords.includes(password.toLowerCase()), {
        message: 'Bu şifre çok yaygın kullanılıyor, lütfen daha güvenli bir şifre seçin',
      }),
    passwordConfirm: z.string().min(8, 'Şifre tekrarı en az 8 karakter olmalıdır'),
    role: z.enum([UserRole.USER, UserRole.ADMIN]).default(UserRole.USER),
    secretKey: z.string().optional(), // Allow undefined (null will be converted to undefined)
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Şifreler eşleşmiyor',
  })
  .refine(
    (data) => {
      // If role is ADMIN, secretKey must be provided and not empty
      if (data.role === UserRole.ADMIN) {
        return data.secretKey !== undefined && data.secretKey !== null && data.secretKey.trim().length > 0;
      }
      // If role is USER, secretKey is not required (can be undefined)
      return true;
    },
    {
      path: ['secretKey'],
      message: 'Yönetici kayıt anahtarı gereklidir',
    }
  );

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

// Server Action Response Type
export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Kayıt Olma (Register)
 */
export async function registerUser(
  formData: FormData
): Promise<ActionResponse<{ id: number; email: string; name: string; role: UserRole }>> {
  try {
    const role = (formData.get('role') as UserRole) || UserRole.USER;
    const secretKeyValue = formData.get('secretKey');
    
    // Convert null to undefined for USER role (field doesn't exist in form)
    // Only include secretKey if role is ADMIN or if it's actually provided
    const secretKey = role === UserRole.USER 
      ? undefined 
      : (secretKeyValue as string | null) || undefined;

    const rawData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      password: formData.get('password') as string,
      passwordConfirm: formData.get('passwordConfirm') as string,
      role,
      secretKey, // undefined for USER, string or undefined for ADMIN
    };

    // Validate
    const validated = registerSchema.parse(rawData);

    if (validated.role === UserRole.ADMIN) {
      const adminKey = process.env.ADMIN_REGISTER_KEY;
      if (!adminKey) {
        return {
          success: false,
          error: 'ADMIN_REGISTER_KEY ortam değişkeni tanımlı değil',
        };
      }

      if (!validated.secretKey || validated.secretKey !== adminKey) {
        return {
          success: false,
          error: 'Geçersiz kayıt anahtarı',
        };
      }
    }

    // Check if email already exists
    const existingUser = await UserRepository.findByEmail(validated.email);
    if (existingUser) {
      return {
        success: false,
        error: 'Bu e-posta adresi zaten kullanılıyor',
      };
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Create user
    const user = await UserRepository.create({
      email: validated.email,
      name: validated.name,
      passwordHash,
      role: validated.role,
    });

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    await setAuthCookie(token);

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error('Register error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Register error details:', { errorMessage, errorStack });
    
    return {
      success: false,
      error: `Kayıt işlemi sırasında bir hata oluştu: ${errorMessage}`,
    };
  }
}

/**
 * Giriş Yapma (Login)
 */
export async function loginUser(formData: FormData): Promise<ActionResponse<{ id: number; email: string; name: string; role: UserRole }>> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Validate
    const validated = loginSchema.parse(rawData);

    // Find user by email
    const user = await UserRepository.findByEmail(validated.email);
    if (!user) {
      return {
        success: false,
        error: 'E-posta veya şifre hatalı',
      };
    }

    // Verify password
    const isValid = await comparePassword(validated.password, user.passwordHash);
    if (!isValid) {
      return {
        success: false,
        error: 'E-posta veya şifre hatalı',
      };
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    await setAuthCookie(token);

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error('Login error:', error);
    return {
      success: false,
      error: 'Giriş işlemi sırasında bir hata oluştu',
    };
  }
}

/**
 * Çıkış Yapma (Logout)
 */
export async function logoutUser(): Promise<void> {
  await removeAuthCookie();
  redirect('/auth/login');
}

/**
 * Mevcut kullanıcıyı getir (Cookie'den)
 */
export async function getCurrentUser(): Promise<{ id: number; email: string; name: string; role: UserRole } | null> {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    // Get user from database
    const user = await UserRepository.findById(payload.userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}
