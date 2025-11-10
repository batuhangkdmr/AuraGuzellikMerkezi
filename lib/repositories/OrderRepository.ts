import { executeQuery, executeQueryOne, executeNonQuery, executeTransaction, sql } from '../db';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  status: OrderStatus;
  shippingAddressJson: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt: Date | null;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export class OrderRepository {
  // Find order by ID
  static async findById(id: number): Promise<OrderWithItems | null> {
    const order = await executeQueryOne<Order>(
      `SELECT id, user_id as userId, total, status, shipping_address_json as shippingAddressJson,
              created_at as createdAt, updated_at as updatedAt, confirmed_at as confirmedAt
       FROM orders WHERE id = @id`,
      { id }
    );

    if (!order) return null;

    const items = await executeQuery<OrderItem>(
      `SELECT id, order_id as orderId, product_id as productId, 
              name_snapshot as nameSnapshot, price_snapshot as priceSnapshot, quantity
       FROM order_items WHERE order_id = @orderId`,
      { orderId: id }
    );

    return {
      ...order,
      items,
    };
  }

  // Find orders by user ID
  static async findByUserId(userId: number): Promise<Order[]> {
    return await executeQuery<Order>(
      `SELECT id, user_id as userId, total, status, shipping_address_json as shippingAddressJson,
              created_at as createdAt, updated_at as updatedAt, confirmed_at as confirmedAt
       FROM orders WHERE user_id = @userId
       ORDER BY created_at DESC`,
      { userId }
    );
  }

  // Find all orders (admin)
  static async findAll(): Promise<Order[]> {
    return await executeQuery<Order>(
      `SELECT id, user_id as userId, total, status, shipping_address_json as shippingAddressJson,
              created_at as createdAt, updated_at as updatedAt, confirmed_at as confirmedAt
       FROM orders
       ORDER BY created_at DESC`
    );
  }

  // Create order with items (transaction)
  static async create(data: {
    userId: number;
    items: Array<{
      productId: number;
      nameSnapshot: string;
      priceSnapshot: number;
      quantity: number;
    }>;
    shippingAddress: ShippingAddress;
  }): Promise<OrderWithItems> {
    // Calculate total
    const total = data.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);

    return await executeTransaction(async (transaction) => {
      // Create order
      const orderRequest = new sql.Request(transaction);
      orderRequest.input('userId', sql.Int, data.userId);
      orderRequest.input('total', sql.Decimal(18, 2), total);
      orderRequest.input('status', sql.VarChar(50), OrderStatus.PENDING);
      orderRequest.input('shippingAddressJson', sql.NVarChar(sql.MAX), JSON.stringify(data.shippingAddress));

      const orderResult = await orderRequest.query(`
        INSERT INTO orders (user_id, total, status, shipping_address_json, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES (@userId, @total, @status, @shippingAddressJson, GETDATE(), GETDATE())
      `);

      const orderId = orderResult.recordset[0].id;

      // Create order items
      for (const item of data.items) {
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

      // Return created order
      const createdOrder = await this.findById(orderId);
      if (!createdOrder) {
        throw new Error('Failed to retrieve created order');
      }
      return createdOrder;
    });
  }

  // Update order status
  static async updateStatus(id: number, status: OrderStatus): Promise<boolean> {
    const fields: string[] = ['status = @status', 'updated_at = GETDATE()'];
    const params: Record<string, any> = { id, status };

    // If confirming, set confirmed_at
    if (status === OrderStatus.CONFIRMED) {
      fields.push('confirmed_at = GETDATE()');
    }

    const rowsAffected = await executeNonQuery(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = @id`,
      params
    );
    return rowsAffected > 0;
  }

  // Helper method to parse shipping address
  static parseShippingAddress(json: string): ShippingAddress {
    try {
      return JSON.parse(json);
    } catch {
      throw new Error('Invalid shipping address format');
    }
  }

  // Helper method to stringify shipping address
  static stringifyShippingAddress(address: ShippingAddress): string {
    return JSON.stringify(address);
  }
}


