'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { OrderRepository, OrderStatus, ShippingAddress } from '@/lib/repositories/OrderRepository';
import { CartRepository } from '@/lib/repositories/CartRepository';
import { ProductRepository } from '@/lib/repositories/ProductRepository';
import { requireUser } from '@/lib/requireUser';
import { executeTransaction } from '@/lib/db';
import { sql } from '@/lib/db';

// Validation schema
const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Ad soyad gereklidir'),
  phone: z.string().min(10, 'Telefon numarası gereklidir'),
  address: z.string().min(5, 'Adres gereklidir'),
  city: z.string().min(2, 'Şehir gereklidir'),
  postalCode: z.string().min(5, 'Posta kodu gereklidir'),
  country: z.string().min(2, 'Ülke gereklidir'),
});

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Create order from cart
 */
export async function createOrder(formData: FormData): Promise<ActionResponse<{ orderId: number }>> {
  try {
    // Require user to be logged in
    const user = await requireUser();

    // Parse shipping address
    const rawAddress = {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string || 'Türkiye',
    };

    const validatedAddress = shippingAddressSchema.parse(rawAddress);

    // Get cart items
    const cartItems = await CartRepository.findByUserId(user.id);
    if (cartItems.length === 0) {
      return {
        success: false,
        error: 'Sepetiniz boş',
      };
    }

    // Create order with transaction
    const order = await executeTransaction(async (transaction) => {
      // Re-fetch products and check stock
      const orderItems: Array<{
        productId: number;
        nameSnapshot: string;
        priceSnapshot: number;
        quantity: number;
      }> = [];

      for (const cartItem of cartItems) {
        // Lock product row for update
        const productRequest = new sql.Request(transaction);
        productRequest.input('productId', sql.Int, cartItem.productId);
        const productResult = await productRequest.query(`
          SELECT id, name, price, stock 
          FROM products WITH (UPDLOCK, ROWLOCK)
          WHERE id = @productId
        `);

        if (productResult.recordset.length === 0) {
          throw new Error(`Ürün bulunamadı: ${cartItem.productId}`);
        }

        const product = productResult.recordset[0];
        const requestedQuantity = cartItem.quantity;

        if (product.stock < requestedQuantity) {
          throw new Error(
            `Yeterli stok yok: ${product.name}. Mevcut: ${product.stock}, İstenen: ${requestedQuantity}`
          );
        }

        orderItems.push({
          productId: product.id,
          nameSnapshot: product.name,
          priceSnapshot: parseFloat(product.price),
          quantity: requestedQuantity,
        });

        // Decrement stock
        const updateStockRequest = new sql.Request(transaction);
        updateStockRequest.input('productId', sql.Int, product.id);
        updateStockRequest.input('quantity', sql.Int, requestedQuantity);
        await updateStockRequest.query(`
          UPDATE products 
          SET stock = stock - @quantity, updated_at = GETDATE()
          WHERE id = @productId
        `);
      }

      // Create order
      const order = await OrderRepository.create({
        userId: user.id,
        items: orderItems,
        shippingAddress: validatedAddress,
      });

      // Clear cart
      await CartRepository.clearUserCart(user.id);

      return order;
    });

    return {
      success: true,
      data: { orderId: order.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    console.error('Create order error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sipariş oluşturulurken bir hata oluştu',
    };
  }
}

/**
 * Get user orders
 */
export async function getUserOrders() {
  try {
    const user = await requireUser();
    const orders = await OrderRepository.findByUserId(user.id);
    
    return {
      success: true,
      data: orders.map(order => ({
        ...order,
        shippingAddress: OrderRepository.parseShippingAddress(order.shippingAddressJson),
      })),
    };
  } catch (error) {
    console.error('Get user orders error:', error);
    return {
      success: false,
      error: 'Siparişler yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: number) {
  try {
    const user = await requireUser();
    const order = await OrderRepository.findById(orderId);
    
    if (!order) {
      return {
        success: false,
        error: 'Sipariş bulunamadı',
      };
    }

    // Check if order belongs to user (unless admin)
    if (order.userId !== user.id && user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Bu siparişe erişim yetkiniz yok',
      };
    }

    return {
      success: true,
      data: {
        ...order,
        shippingAddress: OrderRepository.parseShippingAddress(order.shippingAddressJson),
      },
    };
  } catch (error) {
    console.error('Get order error:', error);
    return {
      success: false,
      error: 'Sipariş yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<ActionResponse> {
  try {
    // Require admin
    await requireUser('ADMIN');

    const updated = await OrderRepository.updateStatus(orderId, status);
    if (!updated) {
      return {
        success: false,
        error: 'Sipariş bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update order status error:', error);
    return {
      success: false,
      error: 'Sipariş durumu güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrders() {
  try {
    // Require admin
    await requireUser('ADMIN');

    const orders = await OrderRepository.findAll();
    
    return {
      success: true,
      data: orders.map(order => ({
        ...order,
        shippingAddress: OrderRepository.parseShippingAddress(order.shippingAddressJson),
      })),
    };
  } catch (error) {
    console.error('Get all orders error:', error);
    return {
      success: false,
      error: 'Siparişler yüklenirken bir hata oluştu',
    };
  }
}

