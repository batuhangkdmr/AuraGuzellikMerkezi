'use server';

import { z } from 'zod';
import { ReturnRepository, ReturnStatus, ReturnRequestType } from '@/lib/repositories/ReturnRepository';
import { OrderRepository, OrderStatus } from '@/lib/repositories/OrderRepository';
import { cancelOrder } from '@/app/server-actions/orderActions';
import { requireUser } from '@/lib/requireUser';

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

// Validation schema
const createReturnSchema = z.object({
  orderId: z.number().int().positive('Sipariş ID gereklidir'),
  reason: z.string().min(10, 'İade nedeni en az 10 karakter olmalıdır').max(500, 'İade nedeni en fazla 500 karakter olabilir'),
  items: z.array(z.object({
    orderItemId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    reason: z.string().max(500).optional().nullable(),
  })).min(1, 'En az bir ürün seçmelisiniz'),
});

/**
 * Create return request
 */
export async function createReturn(formData: FormData): Promise<ActionResponse<{ id: number }>> {
  try {
    const user = await requireUser();

    const orderId = parseInt(formData.get('orderId') as string, 10);
    const reason = formData.get('reason') as string;

    // Get order to verify ownership
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      return {
        success: false,
        error: 'Sipariş bulunamadı',
      };
    }

    if (order.userId !== user.id) {
      return {
        success: false,
        error: 'Bu siparişe ait değilsiniz',
      };
    }

    // Only allow returns for DELIVERED orders
    if (order.status !== 'DELIVERED') {
      return {
        success: false,
        error: 'Sadece teslim edilmiş siparişler için iade talebi oluşturabilirsiniz',
      };
    }

    // Parse return items
    const items: Array<{ orderItemId: number; quantity: number; reason?: string | null }> = [];
    const itemIds = formData.getAll('itemIds') as string[];
    const itemQuantities = formData.getAll('itemQuantities') as string[];
    const itemReasons = formData.getAll('itemReasons') as string[];

    for (let i = 0; i < itemIds.length; i++) {
      const orderItemId = parseInt(itemIds[i], 10);
      const quantity = parseInt(itemQuantities[i], 10);
      const itemReason = itemReasons[i] || null;

      if (orderItemId && quantity > 0) {
        // Verify item belongs to order
        const orderItem = order.items.find(item => item.id === orderItemId);
        if (orderItem && quantity <= orderItem.quantity) {
          items.push({
            orderItemId,
            quantity,
            reason: itemReason,
          });
        }
      }
    }

    const validated = createReturnSchema.parse({
      orderId,
      reason,
      items,
    });

    const returnRequest = await ReturnRepository.create({
      orderId: validated.orderId,
      userId: user.id,
      reason: validated.reason,
      items: validated.items,
    });

    return {
      success: true,
      data: { id: returnRequest.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    console.error('Create return error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'İade talebi oluşturulurken bir hata oluştu',
    };
  }
}

/**
 * Request order cancellation (user)
 */
export async function requestOrderCancellation(orderId: number, reason?: string): Promise<ActionResponse> {
  try {
    const user = await requireUser();
    const order = await OrderRepository.findById(orderId);

    if (!order) {
      return { success: false, error: 'Sipariş bulunamadı' };
    }

    if (order.userId !== user.id) {
      return { success: false, error: 'Bu siparişe ait değilsiniz' };
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      return {
        success: false,
        error: 'Sadece bekleyen veya onaylanmış siparişler için iptal talebi gönderebilirsiniz',
      };
    }

    const alreadyPending = await ReturnRepository.hasPendingCancellation(orderId, user.id);
    if (alreadyPending) {
      return { success: false, error: 'Zaten bekleyen bir iptal talebiniz var' };
    }

    const finalReason =
      reason?.trim() && reason.trim().length >= 5
        ? reason.trim()
        : 'Siparişimin iptal edilmesini talep ediyorum.';

    await ReturnRepository.create({
      orderId,
      userId: user.id,
      reason: finalReason,
      items: [],
      requestType: 'CANCELLATION',
    });

    return { success: true };
  } catch (error: any) {
    console.error('requestOrderCancellation error:', error);
    return {
      success: false,
      error: error?.message || 'İptal talebi oluşturulurken bir hata oluştu',
    };
  }
}

/**
 * Get user returns
 */
export async function getUserReturns(): Promise<ActionResponse<Array<{
  id: number;
  orderId: number;
  reason: string;
  status: ReturnStatus;
  adminNote: string | null;
  refundAmount: number | null;
  createdAt: Date;
  requestType: ReturnRequestType;
}>>> {
  try {
    const user = await requireUser();
    const returns = await ReturnRepository.findByUserId(user.id);

    return {
      success: true,
      data: returns.map(r => ({
        id: r.id,
        orderId: r.orderId,
        reason: r.reason,
        status: r.status,
        adminNote: r.adminNote,
        refundAmount: r.refundAmount,
        createdAt: r.createdAt,
        requestType: r.requestType,
      })),
    };
  } catch (error: any) {
    console.error('Get user returns error:', error);
    return {
      success: false,
      error: error.message || 'İade talepleri yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get all returns (admin)
 */
export async function getAllReturns(): Promise<ActionResponse<Array<{
  id: number;
  orderId: number;
  userId: number;
  reason: string;
  status: ReturnStatus;
  adminNote: string | null;
  refundAmount: number | null;
  createdAt: Date;
  requestType: ReturnRequestType;
}>>> {
  try {
    await requireUser('ADMIN');
    const returns = await ReturnRepository.findAll();

    return {
      success: true,
      data: returns.map(r => ({
        id: r.id,
        orderId: r.orderId,
        userId: r.userId,
        reason: r.reason,
        status: r.status,
        adminNote: r.adminNote,
        refundAmount: r.refundAmount,
        createdAt: r.createdAt,
        requestType: r.requestType,
      })),
    };
  } catch (error: any) {
    console.error('Get all returns error:', error);
    return {
      success: false,
      error: error.message || 'İade talepleri yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Update return status (admin)
 */
export async function updateReturnStatus(
  returnId: number,
  status: ReturnStatus,
  adminNote?: string | null,
  refundAmount?: number | null
): Promise<ActionResponse> {
  try {
    await requireUser('ADMIN');
    const returnRequest = await ReturnRepository.findById(returnId);
    if (!returnRequest) {
      return {
        success: false,
        error: 'İade talebi bulunamadı',
      };
    }

    const isCancellation = returnRequest.requestType === 'CANCELLATION';
    let statusToSave: ReturnStatus = status;
    let adminNoteToSave = adminNote;

    if (isCancellation && status === 'APPROVED') {
      const cancelResult = await cancelOrder(returnRequest.orderId, {
        initiatedBy: 'ADMIN',
        skipReturnLog: true,
      });
      if (!cancelResult.success) {
        return cancelResult;
      }
      statusToSave = 'COMPLETED';
      if (!adminNoteToSave) {
        adminNoteToSave = 'İptal talebi onaylandı ve sipariş iptal edildi.';
      }
    }

    const success = await ReturnRepository.updateStatus(returnId, statusToSave, adminNoteToSave, refundAmount);
    if (!success) {
      return {
        success: false,
        error: 'İade talebi bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Update return status error:', error);
    return {
      success: false,
      error: error.message || 'İade durumu güncellenirken bir hata oluştu',
    };
  }
}

