'use server';

import { z } from 'zod';
import { UserAddressRepository } from '@/lib/repositories/UserAddressRepository';
import { requireUser } from '@/lib/requireUser';

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

// Validation schema
const addressSchema = z.object({
  title: z.string().min(2, 'Adres başlığı en az 2 karakter olmalıdır').max(100, 'Adres başlığı en fazla 100 karakter olabilir'),
  fullName: z.string().min(2, 'Ad soyad gereklidir'),
  phone: z.string().min(10, 'Telefon numarası gereklidir'),
  address: z.string().min(5, 'Adres gereklidir'),
  city: z.string().min(2, 'Şehir gereklidir'),
  postalCode: z.string().min(5, 'Posta kodu gereklidir'),
  country: z.string().min(2, 'Ülke gereklidir').default('Türkiye'),
  isDefault: z.boolean().optional(),
});

/**
 * Get user addresses
 */
export async function getUserAddresses(): Promise<ActionResponse<Array<{
  id: number;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}>>> {
  try {
    const user = await requireUser();
    const addresses = await UserAddressRepository.findByUserId(user.id);

    return {
      success: true,
      data: addresses.map(addr => ({
        id: addr.id,
        title: addr.title,
        fullName: addr.fullName,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        postalCode: addr.postalCode,
        country: addr.country,
        isDefault: addr.isDefault,
      })),
    };
  } catch (error: any) {
    console.error('Get user addresses error:', error);
    return {
      success: false,
      error: error.message || 'Adresler yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Create address
 */
export async function createAddress(formData: FormData): Promise<ActionResponse<{ id: number }>> {
  try {
    const user = await requireUser();

    const rawData = {
      title: formData.get('title') as string,
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string || 'Türkiye',
      isDefault: formData.get('isDefault') === 'true',
    };

    const validated = addressSchema.parse(rawData);

    const address = await UserAddressRepository.create({
      userId: user.id,
      title: validated.title,
      fullName: validated.fullName,
      phone: validated.phone,
      address: validated.address,
      city: validated.city,
      postalCode: validated.postalCode,
      country: validated.country,
      isDefault: validated.isDefault || false,
    });

    return {
      success: true,
      data: { id: address.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    console.error('Create address error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Adres oluşturulurken bir hata oluştu',
    };
  }
}

/**
 * Update address
 */
export async function updateAddress(id: number, formData: FormData): Promise<ActionResponse> {
  try {
    const user = await requireUser();

    // Verify address belongs to user
    const address = await UserAddressRepository.findById(id);
    if (!address || address.userId !== user.id) {
      return {
        success: false,
        error: 'Adres bulunamadı',
      };
    }

    const updates: any = {};
    if (formData.get('title')) updates.title = formData.get('title') as string;
    if (formData.get('fullName')) updates.fullName = formData.get('fullName') as string;
    if (formData.get('phone')) updates.phone = formData.get('phone') as string;
    if (formData.get('address')) updates.address = formData.get('address') as string;
    if (formData.get('city')) updates.city = formData.get('city') as string;
    if (formData.get('postalCode')) updates.postalCode = formData.get('postalCode') as string;
    if (formData.get('country')) updates.country = formData.get('country') as string;
    if (formData.get('isDefault') !== null) {
      updates.isDefault = formData.get('isDefault') === 'true';
    }

    await UserAddressRepository.update(id, updates);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update address error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Adres güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Delete address
 */
export async function deleteAddress(id: number): Promise<ActionResponse> {
  try {
    const user = await requireUser();

    // Verify address belongs to user
    const address = await UserAddressRepository.findById(id);
    if (!address || address.userId !== user.id) {
      return {
        success: false,
        error: 'Adres bulunamadı',
      };
    }

    await UserAddressRepository.delete(id);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete address error:', error);
    return {
      success: false,
      error: error.message || 'Adres silinirken bir hata oluştu',
    };
  }
}

/**
 * Set address as default
 */
export async function setDefaultAddress(id: number): Promise<ActionResponse> {
  try {
    const user = await requireUser();

    // Verify address belongs to user
    const address = await UserAddressRepository.findById(id);
    if (!address || address.userId !== user.id) {
      return {
        success: false,
        error: 'Adres bulunamadı',
      };
    }

    await UserAddressRepository.setAsDefault(id, user.id);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Set default address error:', error);
    return {
      success: false,
      error: error.message || 'Varsayılan adres ayarlanırken bir hata oluştu',
    };
  }
}

