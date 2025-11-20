import { executeQuery, executeQueryOne, executeNonQuery, executeTransaction, sql } from '../db';
import { OrderStatus } from '../types/OrderStatus';

// Re-export OrderStatus for backward compatibility
export { OrderStatus };

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
  trackingNumber: string | null;
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

async function ensureTrackingNumberColumn(): Promise<void> {
  try {
    await executeNonQuery(`
      IF EXISTS (
        SELECT * FROM sys.tables WHERE name = 'orders'
      )
      BEGIN
        IF NOT EXISTS (
          SELECT * FROM sys.columns
          WHERE object_id = OBJECT_ID(N'dbo.orders')
            AND name = 'tracking_number'
        )
        BEGIN
          ALTER TABLE dbo.orders ADD tracking_number NVARCHAR(100) NULL;
        END
      END
    `);
  } catch (error) {
    console.warn('tracking_number column check/creation skipped:', error);
  }
}

export class OrderRepository {
  // Find order by ID
  static async findById(id: number): Promise<OrderWithItems | null> {
    let order: any = null;

    try {
      order = await executeQueryOne<any>(
        `SELECT id, user_id as userId, total, status, shipping_address_json as shippingAddressJson,
                tracking_number as trackingNumber,
                CONVERT(VARCHAR(23), created_at, 126) as createdAt,
                CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
                CASE WHEN confirmed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), confirmed_at, 126) END as confirmedAt
         FROM orders WHERE id = @id`,
        { id }
      );
    } catch (error: any) {
      if (error?.number === 207) {
        await ensureTrackingNumberColumn();
        order = await executeQueryOne<any>(
          `SELECT id, user_id as userId, total, status, shipping_address_json as shippingAddressJson,
                  tracking_number as trackingNumber,
                  CONVERT(VARCHAR(23), created_at, 126) as createdAt,
                  CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
                  CASE WHEN confirmed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), confirmed_at, 126) END as confirmedAt
           FROM orders WHERE id = @id`,
          { id }
        );
      } else {
        throw error;
      }
    }

    if (!order) return null;
    
    // Parse dates manually to avoid timezone issues
    // CONVERT format 126 returns ISO 8601: "2025-11-11T22:12:25.843"
    const parseSqlDate = (dateStr: string | null): Date | null => {
      if (!dateStr) return null;
      // SQL Server CONVERT format 126 already returns with T, but ensure it's correct
      // Parse as local time by treating it as local (no Z suffix means local time)
      const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
      return new Date(normalized);
    };
    
    const orderWithDates: Order = {
      ...order,
      createdAt: parseSqlDate(order.createdAt)!,
      updatedAt: parseSqlDate(order.updatedAt)!,
      confirmedAt: parseSqlDate(order.confirmedAt),
    };

    if (!orderWithDates) return null;

    const items = await executeQuery<OrderItem>(
      `SELECT id, order_id as orderId, product_id as productId, 
              name_snapshot as nameSnapshot, price_snapshot as priceSnapshot, quantity
       FROM order_items WHERE order_id = @orderId`,
      { orderId: id }
    );

    return {
      ...orderWithDates,
      items,
    };
  }

  // Find orders by user ID
  static async findByUserId(userId: number): Promise<Order[]> {
    let orders: any[] = [];

    try {
      orders = await executeQuery<any>(
        `SELECT id, user_id as userId, total, status, shipping_address_json as shippingAddressJson,
                tracking_number as trackingNumber,
                CONVERT(VARCHAR(23), created_at, 126) as createdAt,
                CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
                CASE WHEN confirmed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), confirmed_at, 126) END as confirmedAt
         FROM orders WHERE user_id = @userId
         ORDER BY created_at DESC`,
        { userId }
      );
    } catch (error: any) {
      if (error?.number === 207) {
        await ensureTrackingNumberColumn();
        orders = await executeQuery<any>(
          `SELECT id, user_id as userId, total, status, shipping_address_json as shippingAddressJson,
                  tracking_number as trackingNumber,
                  CONVERT(VARCHAR(23), created_at, 126) as createdAt,
                  CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
                  CASE WHEN confirmed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), confirmed_at, 126) END as confirmedAt
           FROM orders WHERE user_id = @userId
           ORDER BY created_at DESC`,
          { userId }
        );
      } else {
        throw error;
      }
    }

    // Parse dates manually
    const parseSqlDate = (dateStr: string | null): Date | null => {
      if (!dateStr) return null;
      return new Date(dateStr.replace(' ', 'T'));
    };
    
    return orders.map(order => ({
      ...order,
      createdAt: parseSqlDate(order.createdAt)!,
      updatedAt: parseSqlDate(order.updatedAt)!,
      confirmedAt: parseSqlDate(order.confirmedAt),
    }));
  }

  // Find all orders (admin)
  static async findAll(): Promise<Order[]> {
    let orders: any[] = [];

    try {
      orders = await executeQuery<any>(
        `SELECT id, user_id as userId, total, status, shipping_address_json as shippingAddressJson,
                tracking_number as trackingNumber,
                CONVERT(VARCHAR(23), created_at, 126) as createdAt,
                CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
                CASE WHEN confirmed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), confirmed_at, 126) END as confirmedAt
         FROM orders
         ORDER BY created_at DESC`
      );
    } catch (error: any) {
      if (error?.number === 207) {
        await ensureTrackingNumberColumn();
        orders = await executeQuery<any>(
          `SELECT id, user_id as userId, total, status, shipping_address_json as shippingAddressJson,
                  tracking_number as trackingNumber,
                  CONVERT(VARCHAR(23), created_at, 126) as createdAt,
                  CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
                  CASE WHEN confirmed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), confirmed_at, 126) END as confirmedAt
           FROM orders
           ORDER BY created_at DESC`
        );
      } else {
        throw error;
      }
    }

    // Parse dates manually
    const parseSqlDate = (dateStr: string | null): Date | null => {
      if (!dateStr) return null;
      return new Date(dateStr.replace(' ', 'T'));
    };
    
    return orders.map(order => ({
      ...order,
      createdAt: parseSqlDate(order.createdAt)!,
      updatedAt: parseSqlDate(order.updatedAt)!,
      confirmedAt: parseSqlDate(order.confirmedAt),
    }));
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
  static async updateStatus(id: number, status: OrderStatus, trackingNumber?: string | null): Promise<boolean> {
    const fields: string[] = ['status = @status', 'updated_at = GETDATE()'];
    const params: Record<string, any> = { id, status };
    const trackingField = 'tracking_number = @trackingNumber';
    const includeTrackingUpdate = trackingNumber !== undefined;

    // If confirming, set confirmed_at
    if (status === OrderStatus.CONFIRMED) {
      fields.push('confirmed_at = GETDATE()');
    }

    // If tracking number is provided, update it (especially for SHIPPED status)
    if (includeTrackingUpdate) {
      fields.push(trackingField);
      params.trackingNumber = trackingNumber || null;
    }

    try {
      const rowsAffected = await executeNonQuery(
        `UPDATE orders SET ${fields.join(', ')} WHERE id = @id`,
        params
      );
      return rowsAffected > 0;
    } catch (error: any) {
      if (includeTrackingUpdate && error?.number === 207) {
        await ensureTrackingNumberColumn();
        const rowsAffected = await executeNonQuery(
          `UPDATE orders SET ${fields.join(', ')} WHERE id = @id`,
          params
        );
        return rowsAffected > 0;
      }
      throw error;
    }
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


