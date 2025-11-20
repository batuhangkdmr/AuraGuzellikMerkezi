import 'server-only';

import { OrderRepository } from '@/lib/repositories/OrderRepository';
import { ProductRepository } from '@/lib/repositories/ProductRepository';
import { executeQuery } from '@/lib/db';

interface OrderItemRecord {
  id: number;
  orderId: number;
  productId: number | null;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  productImages: string | null;
}

function parseProductImage(imagesString: string | null): string {
  if (!imagesString) {
    return '/placeholder-image.svg';
  }

  try {
    const images = ProductRepository.parseImages(imagesString);
    if (Array.isArray(images) && images.length > 0) {
      return images[0];
    }
  } catch (error) {
    console.error('Product image parse error:', error);
  }

  return '/placeholder-image.svg';
}

export async function getOrdersForUser(userId: number) {
  const orders = await OrderRepository.findByUserId(userId);

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await executeQuery<OrderItemRecord>(
        `SELECT oi.id, oi.order_id as orderId, oi.product_id as productId, 
                oi.name_snapshot as nameSnapshot, oi.price_snapshot as priceSnapshot, oi.quantity,
                p.images as productImages
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = @orderId`,
        { orderId: order.id }
      );

      const itemsWithImages = items.map(item => ({
        ...item,
        productImage: parseProductImage(item.productImages),
      }));

      let shippingAddress = null;
      try {
        shippingAddress = OrderRepository.parseShippingAddress(order.shippingAddressJson);
      } catch (error) {
        console.error(`Shipping address parse error for order ${order.id}:`, error);
      }

      return {
        ...order,
        shippingAddress,
        items: itemsWithImages,
      };
    })
  );

  return ordersWithItems;
}

