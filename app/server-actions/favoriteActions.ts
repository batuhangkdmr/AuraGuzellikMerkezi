'use server';

import { FavoritesRepository } from '@/lib/repositories/FavoritesRepository';
import { requireUser } from '@/lib/requireUser';

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Add product to favorites
 */
export async function addToFavorites(productId: number): Promise<ActionResponse> {
  try {
    const user = await requireUser('USER');
    
    // Check if already in favorites
    const isFavorite = await FavoritesRepository.isFavorite(user.id, productId);
    if (isFavorite) {
      return {
        success: false,
        error: 'Bu ürün zaten favorilerinizde',
      };
    }

    await FavoritesRepository.add(user.id, productId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Add to favorites error:', error);
    return {
      success: false,
      error: 'Favorilere eklenirken bir hata oluştu',
    };
  }
}

/**
 * Remove product from favorites
 */
export async function removeFromFavorites(productId: number): Promise<ActionResponse> {
  try {
    const user = await requireUser('USER');
    
    const removed = await FavoritesRepository.remove(user.id, productId);
    if (!removed) {
      return {
        success: false,
        error: 'Ürün favorilerinizde bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Remove from favorites error:', error);
    return {
      success: false,
      error: 'Favorilerden çıkarılırken bir hata oluştu',
    };
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(productId: number): Promise<ActionResponse<{ isFavorite: boolean }>> {
  try {
    const user = await requireUser('USER');
    
    const isFavorite = await FavoritesRepository.isFavorite(user.id, productId);
    
    if (isFavorite) {
      await FavoritesRepository.remove(user.id, productId);
      return {
        success: true,
        data: { isFavorite: false },
      };
    } else {
      await FavoritesRepository.add(user.id, productId);
      return {
        success: true,
        data: { isFavorite: true },
      };
    }
  } catch (error: any) {
    // Next.js redirect throws a special error, we should let it propagate
    if (error && typeof error === 'object' && 'digest' in error && error.digest?.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    
    console.error('Toggle favorite error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    return {
      success: false,
      error: error?.message || 'Favori durumu değiştirilirken bir hata oluştu',
    };
  }
}

/**
 * Check if product is in favorites (optional - works for guests too)
 */
export async function isFavorite(productId: number): Promise<ActionResponse<{ isFavorite: boolean }>> {
  try {
    const { getOptionalUser } = await import('@/lib/requireUser');
    const user = await getOptionalUser();
    
    if (!user) {
      // User is not logged in, return false
      return {
        success: true,
        data: { isFavorite: false },
      };
    }
    
    const isFav = await FavoritesRepository.isFavorite(user.id, productId);

    return {
      success: true,
      data: { isFavorite: isFav },
    };
  } catch (error: any) {
    // If any error occurs, return false (not an error)
    console.error('Check favorite error:', error);
    return {
      success: true,
      data: { isFavorite: false },
    };
  }
}

/**
 * Get all favorites for current user
 */
export async function getFavorites() {
  try {
    const user = await requireUser('USER');
    
    const favorites = await FavoritesRepository.findByUserId(user.id);

    // Parse product images safely
    const favoritesWithParsedImages = favorites.map(fav => {
      let images: string[] = [];
      
      try {
        if (fav.product.images) {
          // If it's already an array, use it directly
          if (Array.isArray(fav.product.images)) {
            images = fav.product.images;
          } else if (typeof fav.product.images === 'string') {
            // Try to parse as JSON
            const parsed = JSON.parse(fav.product.images);
            images = Array.isArray(parsed) ? parsed : [];
          }
        }
      } catch (parseError) {
        console.error('Error parsing product images in favorites:', parseError, 'Raw images:', fav.product.images);
        images = [];
      }

      return {
        ...fav,
        product: {
          ...fav.product,
          images,
        },
      };
    });

    return {
      success: true,
      data: favoritesWithParsedImages,
    };
  } catch (error: any) {
    // Next.js redirect throws a special error, we should let it propagate
    if (error && typeof error === 'object' && 'digest' in error && error.digest?.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    
    console.error('Get favorites error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      number: error?.number,
    });
    
    return {
      success: false,
      error: error?.message || 'Favoriler yüklenirken bir hata oluştu',
    };
  }
}

