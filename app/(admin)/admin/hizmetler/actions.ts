// Admin Hizmetler - Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import ServiceRepository from '@/lib/repositories/ServiceRepository';
import type { Service } from '@/lib/models/Service';

// Tüm hizmetleri getir
export async function getServices(): Promise<Service[]> {
  try {
    return await ServiceRepository.findAll();
  } catch (error) {
    console.error('getServices error:', error);
    return [];
  }
}

// Tek hizmet getir (düzenleme için)
export async function getService(id: number): Promise<Service | null> {
  try {
    return await ServiceRepository.findById(id);
  } catch (error) {
    console.error('getService error:', error);
    return null;
  }
}

// Yeni hizmet oluştur
export async function createService(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const image = formData.get('image') as string;
    const published = formData.get('published') === 'on';

    // Validation
    if (!title || title.trim().length < 3) {
      return { success: false, error: 'Hizmet başlığı en az 3 karakter olmalıdır.' };
    }

    if (!content || content.trim().length < 10) {
      return { success: false, error: 'Hizmet içeriği en az 10 karakter olmalıdır.' };
    }

    // Create service
    await ServiceRepository.create({
      title: title.trim(),
      excerpt: excerpt?.trim() || '',
      content: content.trim(),
      image: image?.trim() || undefined,
      published,
    });

    // Cache invalidation
    revalidatePath('/admin/hizmetler');
    revalidatePath('/hizmetlerimiz');

    return { success: true, message: 'Hizmet başarıyla oluşturuldu!' };
  } catch (error: any) {
    console.error('createService error:', error);
    return { 
      success: false, 
      error: error.message || 'Hizmet oluşturulurken bir hata oluştu.' 
    };
  }
}

// Hizmet güncelle
export async function updateService(id: number, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const image = formData.get('image') as string;
    const published = formData.get('published') === 'on';

    // Validation
    if (!title || title.trim().length < 3) {
      return { success: false, error: 'Hizmet başlığı en az 3 karakter olmalıdır.' };
    }

    if (!content || content.trim().length < 10) {
      return { success: false, error: 'Hizmet içeriği en az 10 karakter olmalıdır.' };
    }

    // Update service
    const updatedService = await ServiceRepository.update(id, {
      title: title.trim(),
      excerpt: excerpt?.trim() || '',
      content: content.trim(),
      image: image?.trim() || null, // null = resmi kaldır
      published,
    });

    if (!updatedService) {
      return { success: false, error: 'Hizmet bulunamadı.' };
    }

    // Cache invalidation
    revalidatePath('/admin/hizmetler');
    revalidatePath('/hizmetlerimiz');

    return { success: true, message: 'Hizmet başarıyla güncellendi!' };
  } catch (error: any) {
    console.error('updateService error:', error);
    return { 
      success: false, 
      error: error.message || 'Hizmet güncellenirken bir hata oluştu.' 
    };
  }
}

// Hizmet sil
export async function deleteService(id: number) {
  try {
    const deleted = await ServiceRepository.delete(id);

    if (!deleted) {
      return { success: false, error: 'Hizmet bulunamadı.' };
    }

    // Cache invalidation
    revalidatePath('/admin/hizmetler');
    revalidatePath('/hizmetlerimiz');

    return { success: true, message: 'Hizmet başarıyla silindi!' };
  } catch (error: any) {
    console.error('deleteService error:', error);
    return { 
      success: false, 
      error: error.message || 'Hizmet silinirken bir hata oluştu.' 
    };
  }
}

