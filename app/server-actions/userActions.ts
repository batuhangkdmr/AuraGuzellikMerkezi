'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireUser } from '@/lib/requireUser';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { UserRole } from '@/lib/types/UserRole';
import { executeNonQuery } from '@/lib/db';

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

// Validation schema for user registration
const registerSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(100, 'Ad en fazla 100 karakter olabilir'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  role: z.enum([UserRole.ADMIN, UserRole.USER]).default(UserRole.USER),
});

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  try {
    await requireUser('ADMIN');
    const users = await UserRepository.findAll();
    return {
      success: true,
      data: users,
    };
  } catch (error: any) {
    console.error('Get all users error:', error);
    return {
      success: false,
      error: 'Kullanıcılar yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get user by ID with detailed information (admin only)
 */
export async function getUserById(userId: number) {
  try {
    await requireUser('ADMIN');
    const user = await UserRepository.findById(userId);
    
    if (!user) {
      return {
        success: false,
        error: 'Kullanıcı bulunamadı',
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    return {
      success: false,
      error: error?.message || 'Kullanıcı yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Create user (admin only)
 */
export async function createUser(formData: FormData): Promise<ActionResponse<{ id: number }>> {
  try {
    await requireUser('ADMIN');

    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: (formData.get('role') as string) || UserRole.USER,
    };

    const validated = registerSchema.parse(rawData);

    // Check if email already exists
    const existingUser = await UserRepository.findByEmail(validated.email);
    if (existingUser) {
      return {
        success: false,
        error: 'Bu e-posta adresi zaten kullanılıyor',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await UserRepository.create({
      name: validated.name,
      email: validated.email,
      passwordHash: hashedPassword,
      role: validated.role as UserRole,
    });

    return {
      success: true,
      data: { id: user.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    console.error('Create user error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Kullanıcı oluşturulurken bir hata oluştu',
    };
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: number, role: UserRole) {
  try {
    await requireUser('ADMIN');
    
    // Prevent admin from removing their own admin role
    const currentUser = await requireUser('ADMIN');
    if (currentUser.id === userId && role !== UserRole.ADMIN) {
      return {
        success: false,
        error: 'Kendi admin yetkinizi kaldıramazsınız',
      };
    }
    
    const updated = await UserRepository.update(userId, { role });
    
    if (!updated) {
      return {
        success: false,
        error: 'Kullanıcı bulunamadı',
      };
    }
    
    return {
      success: true,
      data: updated,
    };
  } catch (error: any) {
    console.error('Update user role error:', error);
    return {
      success: false,
      error: error?.message || 'Rol güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: number) {
  try {
    await requireUser('ADMIN');
    
    // Prevent admin from deleting themselves
    const currentUser = await requireUser('ADMIN');
    if (currentUser.id === userId) {
      return {
        success: false,
        error: 'Kendi hesabınızı silemezsiniz',
      };
    }
    
    const deleted = await UserRepository.delete(userId);
    
    if (!deleted) {
      return {
        success: false,
        error: 'Kullanıcı bulunamadı veya silinemedi',
      };
    }
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete user error:', error);
    return {
      success: false,
      error: error?.message || 'Kullanıcı silinirken bir hata oluştu',
    };
  }
}
