'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { OrderRepository, OrderStatus, ShippingAddress } from '@/lib/repositories/OrderRepository';
import { OrderStatusHistoryRepository } from '@/lib/repositories/OrderStatusHistoryRepository';
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

// Payment information schema (format validation only, no real card validation)
const paymentInfoSchema = z.object({
  cardNumber: z.string().refine(
    (val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length === 16;
    },
    { message: 'Kart numarası 16 haneli olmalıdır' }
  ),
  cardHolder: z.string().min(2, 'Kart üzerindeki isim gereklidir'),
  expiryDate: z.string().refine(
    (val) => {
      const parts = val.split('/');
      return parts.length === 2 && parts[0].length === 2 && parts[1].length === 2;
    },
    { message: 'Son kullanma tarihi geçerli formatta değil (AA/YY)' }
  ),
  cvc: z.string().refine(
    (val) => val.length === 3 && /^\d+$/.test(val),
    { message: 'CVC 3 haneli olmalıdır' }
  ),
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

    // Parse and validate payment information
    const rawPayment = {
      cardNumber: formData.get('cardNumber') as string,
      cardHolder: formData.get('cardHolder') as string,
      expiryDate: formData.get('expiryDate') as string,
      cvc: formData.get('cvc') as string,
    };

    // Validate payment format (no real card validation, just format check)
    const validatedPayment = paymentInfoSchema.parse(rawPayment);

    // Note: In a real application, you would process the payment here
    // For now, we just validate the format and proceed
    // TODO: Integrate with real payment gateway (e.g., Stripe, iyzico, etc.)
    console.log('Payment information validated (test mode):', {
      cardNumber: validatedPayment.cardNumber.replace(/\d(?=\d{4})/g, '*'), // Mask all but last 4 digits
      cardHolder: validatedPayment.cardHolder,
      expiryDate: validatedPayment.expiryDate,
      cvc: '***', // Never log CVC
    });

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

      // Collect all product IDs first
      const productIds = cartItems.map(item => item.productId);

      // Fetch all products at once (more efficient, with shorter lock time)
      const productsRequest = new sql.Request(transaction);
      
      // Add parameters first
      productIds.forEach((id, i) => {
        productsRequest.input(`productId${i}`, sql.Int, id);
      });

      // Build IN clause with proper parameterization
      const placeholders = productIds.map((_, i) => `@productId${i}`).join(',');
      
      // Try to query with is_active, if it fails fall back to stock > 0
      let productsResult;
      try {
        productsResult = await productsRequest.query(`
          SELECT id, name, price, stock, is_active
          FROM products WITH (UPDLOCK, ROWLOCK)
          WHERE id IN (${placeholders})
          AND is_active = 1
        `);
      } catch (error: any) {
        // If is_active column doesn't exist (error 207), fall back to stock > 0
        if (error?.number === 207) {
          productsResult = await productsRequest.query(`
            SELECT id, name, price, stock, CASE WHEN stock > 0 THEN 1 ELSE 0 END as is_active
            FROM products WITH (UPDLOCK, ROWLOCK)
            WHERE id IN (${placeholders})
            AND stock > 0
          `);
        } else {
          throw error;
        }
      }

      const products = productsResult.recordset;
      const productMap = new Map(products.map((p: any) => [p.id, p]));

      // Validate stock for all items
      for (const cartItem of cartItems) {
        const product = productMap.get(cartItem.productId);
        
        if (!product) {
          throw new Error(`Ürün bulunamadı veya aktif değil: ${cartItem.productId}`);
        }

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
      }

      // Update stock for all products (one query per product, but with ROWLOCK for better concurrency)
      for (const cartItem of cartItems) {
        const updateStockRequest = new sql.Request(transaction);
        updateStockRequest.input('productId', sql.Int, cartItem.productId);
        updateStockRequest.input('quantity', sql.Int, cartItem.quantity);
        
        // Try to update with is_active, if it fails fall back to stock only
        try {
          await updateStockRequest.query(`
            UPDATE products WITH (ROWLOCK)
            SET 
              stock = stock - @quantity,
              is_active = CASE WHEN (stock - @quantity) > 0 THEN 1 ELSE 0 END,
              updated_at = GETDATE()
            WHERE id = @productId
          `);
        } catch (error: any) {
          // If is_active column doesn't exist (error 207), update only stock
          if (error?.number === 207) {
            await updateStockRequest.query(`
              UPDATE products WITH (ROWLOCK)
              SET 
                stock = stock - @quantity,
                updated_at = GETDATE()
              WHERE id = @productId
            `);
          } else {
            throw error;
          }
        }
      }

      // Calculate total
      const total = orderItems.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);

      // Create order directly in transaction (no nested transaction)
      const orderRequest = new sql.Request(transaction);
      orderRequest.input('userId', sql.Int, user.id);
      orderRequest.input('total', sql.Decimal(18, 2), total);
      orderRequest.input('status', sql.VarChar(50), 'PENDING');
      orderRequest.input('shippingAddressJson', sql.NVarChar(sql.MAX), JSON.stringify(validatedAddress));

      const orderResult = await orderRequest.query(`
        INSERT INTO orders (user_id, total, status, shipping_address_json, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES (@userId, @total, @status, @shippingAddressJson, GETDATE(), GETDATE())
      `);

      const orderId = orderResult.recordset[0].id;

      // Batch insert order items (much faster than individual inserts)
      for (const item of orderItems) {
        const itemRequest = new sql.Request(transaction);
        itemRequest.input('orderId', sql.Int, orderId);
        itemRequest.input('productId', sql.Int, item.productId);
        itemRequest.input('nameSnapshot', sql.NVarChar(255), item.nameSnapshot);
        itemRequest.input('priceSnapshot', sql.Decimal(18, 2), item.priceSnapshot);
        itemRequest.input('quantity', sql.Int, item.quantity);

        await itemRequest.query(`
          INSERT INTO order_items (order_id, product_id, name_snapshot, price_snapshot, quantity)
          VALUES (@orderId, @productId, @nameSnapshot, @priceSnapshot, @quantity)
        `);
      }

      // Clear cart
      const clearCartRequest = new sql.Request(transaction);
      clearCartRequest.input('userId', sql.Int, user.id);
      await clearCartRequest.query(`
        DELETE FROM cart_items WHERE user_id = @userId
      `);

      // Create initial status history record (PENDING status when order is created)
      const historyRequest = new sql.Request(transaction);
      historyRequest.input('orderId', sql.Int, orderId);
      historyRequest.input('adminUserId', sql.Int, user.id); // User who created the order
      historyRequest.input('oldStatus', sql.VarChar(50), null);
      historyRequest.input('newStatus', sql.VarChar(50), OrderStatus.PENDING);
      historyRequest.input('note', sql.NVarChar(500), 'Sipariş oluşturuldu');

      await historyRequest.query(`
        INSERT INTO order_status_history (order_id, admin_user_id, old_status, new_status, note, created_at)
        VALUES (@orderId, @adminUserId, @oldStatus, @newStatus, @note, GETDATE())
      `);

      // Return order data (don't fetch from DB to avoid another query)
      return {
        id: orderId,
        userId: user.id,
        total,
        status: 'PENDING' as OrderStatus,
        shippingAddressJson: JSON.stringify(validatedAddress),
        trackingNumber: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        confirmedAt: null,
        items: orderItems.map(item => ({
          id: 0, // Will be set by DB
          orderId,
          productId: item.productId,
          nameSnapshot: item.nameSnapshot,
          priceSnapshot: item.priceSnapshot,
          quantity: item.quantity,
        })),
      };
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

    // Fetch product images for order items
    const itemsWithImages = await Promise.all(
      order.items.map(async (item) => {
        if (item.productId) {
          try {
            const product = await ProductRepository.findById(item.productId, true); // Include inactive products
            if (product) {
              const images = ProductRepository.parseImages(product.images);
              return {
                ...item,
                productImage: images[0] || '/placeholder-image.svg',
              };
            }
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error);
          }
        }
        return {
          ...item,
          productImage: '/placeholder-image.svg',
        };
      })
    );

    return {
      success: true,
      data: {
        ...order,
        items: itemsWithImages,
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
 * Update order status with history tracking (admin only)
 */
export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
  trackingNumber?: string | null,
  note?: string | null
): Promise<ActionResponse> {
  try {
    // Require admin
    const admin = await requireUser('ADMIN');

    // Get current order to check old status
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      return {
        success: false,
        error: 'Sipariş bulunamadı',
      };
    }

    const oldStatus = order.status;

    // Update order status (and tracking number if provided)
    const updated = await OrderRepository.updateStatus(orderId, status, trackingNumber);
    if (!updated) {
      return {
        success: false,
        error: 'Sipariş durumu güncellenemedi',
      };
    }

    // Create status history record
    await OrderStatusHistoryRepository.create({
      orderId,
      adminUserId: admin.id,
      oldStatus,
      newStatus: status,
      note: note || null,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update order status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sipariş durumu güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Cancel order and restore stock (admin only, or user for their own orders)
 * Only PENDING and CONFIRMED orders can be cancelled
 */
export async function cancelOrder(orderId: number): Promise<ActionResponse> {
  try {
    const user = await requireUser();
    const order = await OrderRepository.findById(orderId);

    if (!order) {
      return {
        success: false,
        error: 'Sipariş bulunamadı',
      };
    }

    // Check if user is admin or order owner
    if (user.role !== 'ADMIN' && order.userId !== user.id) {
      return {
        success: false,
        error: 'Bu siparişi iptal etme yetkiniz yok',
      };
    }

    // Only PENDING and CONFIRMED orders can be cancelled
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      return {
        success: false,
        error: 'Bu sipariş iptal edilemez. Sadece beklemede veya onaylanmış siparişler iptal edilebilir.',
      };
    }

    // Cancel order and restore stock in transaction
    await executeTransaction(async (transaction) => {
      // Update order status to CANCELLED
      const updateRequest = new sql.Request(transaction);
      updateRequest.input('orderId', sql.Int, orderId);
      updateRequest.input('status', sql.VarChar(50), OrderStatus.CANCELLED);

      await updateRequest.query(`
        UPDATE orders 
        SET status = @status, updated_at = GETDATE()
        WHERE id = @orderId
      `);

      // Restore stock for all order items
      for (const item of order.items) {
        if (item.productId) {
          const restoreStockRequest = new sql.Request(transaction);
          restoreStockRequest.input('productId', sql.Int, item.productId);
          restoreStockRequest.input('quantity', sql.Int, item.quantity);

          // Try to update with is_active, if it fails fall back to stock only
          try {
            await restoreStockRequest.query(`
              UPDATE products WITH (ROWLOCK)
              SET 
                stock = stock + @quantity,
                is_active = CASE WHEN (stock + @quantity) > 0 THEN 1 ELSE 0 END,
                updated_at = GETDATE()
              WHERE id = @productId
            `);
          } catch (error: any) {
            // If is_active column doesn't exist (error 207), update only stock
            if (error?.number === 207) {
              await restoreStockRequest.query(`
                UPDATE products WITH (ROWLOCK)
                SET 
                  stock = stock + @quantity,
                  updated_at = GETDATE()
                WHERE id = @productId
              `);
            } else {
              throw error;
            }
          }
        }
      }

      // Create status history record
      const adminUserId = user.role === 'ADMIN' ? user.id : user.id; // User can cancel their own orders
      const historyRequest = new sql.Request(transaction);
      historyRequest.input('orderId', sql.Int, orderId);
      historyRequest.input('adminUserId', sql.Int, adminUserId);
      historyRequest.input('oldStatus', sql.VarChar(50), order.status);
      historyRequest.input('newStatus', sql.VarChar(50), OrderStatus.CANCELLED);
      historyRequest.input('note', sql.NVarChar(500), 'Sipariş iptal edildi');

      await historyRequest.query(`
        INSERT INTO order_status_history (order_id, admin_user_id, old_status, new_status, note, created_at)
        VALUES (@orderId, @adminUserId, @oldStatus, @newStatus, @note, GETDATE())
      `);
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Cancel order error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sipariş iptal edilirken bir hata oluştu',
    };
  }
}

/**
 * Get order status history (admin or order owner)
 */
export async function getOrderStatusHistory(orderId: number) {
  try {
    const user = await requireUser();
    const order = await OrderRepository.findById(orderId);

    if (!order) {
      return {
        success: false,
        error: 'Sipariş bulunamadı',
      };
    }

    // Check if user is admin or order owner
    if (user.role !== 'ADMIN' && order.userId !== user.id) {
      return {
        success: false,
        error: 'Bu siparişin durum geçmişine erişim yetkiniz yok',
      };
    }

    // Get status history (with admin info for admin users, without for regular users)
    const history = user.role === 'ADMIN'
      ? await OrderStatusHistoryRepository.findByOrderIdWithAdmin(orderId)
      : await OrderStatusHistoryRepository.findByOrderId(orderId);

    return {
      success: true,
      data: history,
    };
  } catch (error) {
    console.error('Get order status history error:', error);
    return {
      success: false,
      error: 'Sipariş durum geçmişi yüklenirken bir hata oluştu',
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

