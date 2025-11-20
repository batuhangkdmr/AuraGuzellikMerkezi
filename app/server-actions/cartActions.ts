'use server';

import { z } from 'zod';
import { CartRepository } from '@/lib/repositories/CartRepository';
import { ProductRepository } from '@/lib/repositories/ProductRepository';
import { getOptionalUser } from '@/lib/requireUser';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Get or create session ID for guest users
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('cart_session_id')?.value;

  if (!sessionId) {
    sessionId = uuidv4();
    cookieStore.set('cart_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }

  return sessionId;
}

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Get cart items
 */
export async function getCartItems() {
  try {
    const user = await getOptionalUser();
    
    let items;
    if (user) {
      items = await CartRepository.findByUserId(user.id);
    } else {
      const sessionId = await getSessionId();
      items = await CartRepository.findBySessionId(sessionId);
    }

    // Format items with product data
    const formattedItems = items.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        name: item.productName || '',
        price: item.productPrice || 0,
        images: item.productImages ? ProductRepository.parseImages(item.productImages) : [],
        stock: item.productStock ?? 0,
      },
    }));

    return {
      success: true,
      data: formattedItems,
    };
  } catch (error) {
    console.error('Get cart items error:', error);
    return {
      success: false,
      error: 'Sepet yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Add item to cart
 */
export async function addToCart(productId: number, quantity: number = 1): Promise<ActionResponse> {
  try {
    // Validate quantity
    if (quantity < 1) {
      return {
        success: false,
        error: 'Miktar en az 1 olmalıdır',
      };
    }

    // Check product exists and has stock
    const product = await ProductRepository.findById(productId);
    if (!product) {
      return {
        success: false,
        error: 'Ürün bulunamadı',
      };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        error: `Yeterli stok yok. Mevcut stok: ${product.stock}`,
      };
    }

    const user = await getOptionalUser();
    let sessionId: string | null = null;

    if (!user) {
      sessionId = await getSessionId();
    }

    const existingItem = await CartRepository.findByUserAndProduct(
      user ? user.id : null,
      sessionId,
      productId
    );

    const newQuantity = (existingItem?.quantity || 0) + quantity;

    if (product.stock < newQuantity) {
      return {
        success: false,
        error: `Yeterli stok yok. Maksimum ${product.stock} adet ekleyebilirsiniz.`,
      };
    }

    if (user) {
      await CartRepository.addItem({
        userId: user.id,
        productId,
        quantity,
      });
    } else {
      await CartRepository.addItem({
        sessionId,
        productId,
        quantity,
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Add to cart error:', error);
    return {
      success: false,
      error: 'Ürün sepete eklenirken bir hata oluştu',
    };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(cartItemId: number, quantity: number): Promise<ActionResponse> {
  try {
    if (quantity < 1) {
      return {
        success: false,
        error: 'Miktar en az 1 olmalıdır',
      };
    }

    const cartItem = await CartRepository.findById(cartItemId);
    if (!cartItem) {
      return {
        success: false,
        error: 'Sepet öğesi bulunamadı',
      };
    }

    if (cartItem.productStock !== null && cartItem.productStock !== undefined && quantity > cartItem.productStock) {
      return {
        success: false,
        error: `Yeterli stok yok. Maksimum ${cartItem.productStock} adet ekleyebilirsiniz.`,
      };
    }

    const updated = await CartRepository.updateQuantity(cartItemId, quantity);
    if (!updated) {
      return {
        success: false,
        error: 'Sepet öğesi bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update cart item error:', error);
    return {
      success: false,
      error: 'Sepet öğesi güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: number): Promise<ActionResponse> {
  try {
    const removed = await CartRepository.removeItem(cartItemId);
    if (!removed) {
      return {
        success: false,
        error: 'Sepet öğesi bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Remove from cart error:', error);
    return {
      success: false,
      error: 'Sepet öğesi kaldırılırken bir hata oluştu',
    };
  }
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<ActionResponse> {
  try {
    const user = await getOptionalUser();
    
    if (user) {
      await CartRepository.clearUserCart(user.id);
    } else {
      const sessionId = await getSessionId();
      await CartRepository.clearSessionCart(sessionId);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Clear cart error:', error);
    return {
      success: false,
      error: 'Sepet temizlenirken bir hata oluştu',
    };
  }
}

/**
 * Merge guest cart with user cart (called after login)
 */
export async function mergeCart(): Promise<ActionResponse> {
  try {
    const user = await getOptionalUser();
    if (!user) {
      return {
        success: false,
        error: 'Kullanıcı giriş yapmamış',
      };
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session_id')?.value;
    
    if (sessionId) {
      await CartRepository.mergeCarts(user.id, sessionId);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Merge cart error:', error);
    return {
      success: false,
      error: 'Sepet birleştirilirken bir hata oluştu',
    };
  }
}

