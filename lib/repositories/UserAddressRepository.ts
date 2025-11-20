import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery } from '../db';

export interface UserAddress {
  id: number;
  userId: number;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserAddressRepository {
  // Parse SQL Server date string to Date object
  private static parseSqlDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  }

  // Find address by ID
  static async findById(id: number): Promise<UserAddress | null> {
    const result = await executeQueryOne<any>(
      `SELECT id, user_id as userId, title, full_name as fullName, phone, address, city,
              postal_code as postalCode, country, is_default as isDefault,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM user_addresses 
       WHERE id = @id`,
      { id }
    );

    if (!result) return null;

    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
      updatedAt: this.parseSqlDate(result.updatedAt)!,
    };
  }

  // Find all addresses for a user
  static async findByUserId(userId: number): Promise<UserAddress[]> {
    const results = await executeQuery<any>(
      `SELECT id, user_id as userId, title, full_name as fullName, phone, address, city,
              postal_code as postalCode, country, is_default as isDefault,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM user_addresses 
       WHERE user_id = @userId
       ORDER BY is_default DESC, created_at DESC`,
      { userId }
    );

    return results.map(item => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
      updatedAt: this.parseSqlDate(item.updatedAt)!,
    }));
  }

  // Get default address for a user
  static async findDefaultByUserId(userId: number): Promise<UserAddress | null> {
    const result = await executeQueryOne<any>(
      `SELECT id, user_id as userId, title, full_name as fullName, phone, address, city,
              postal_code as postalCode, country, is_default as isDefault,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM user_addresses 
       WHERE user_id = @userId AND is_default = 1`,
      { userId }
    );

    if (!result) return null;

    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
      updatedAt: this.parseSqlDate(result.updatedAt)!,
    };
  }

  // Create address
  static async create(addressData: {
    userId: number;
    title: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
    isDefault?: boolean;
  }): Promise<UserAddress> {
    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      await executeNonQuery(
        `UPDATE user_addresses 
         SET is_default = 0, updated_at = GETDATE()
         WHERE user_id = @userId`,
        { userId: addressData.userId }
      );
    }

    const result = await executeQueryOne<{ id: number }>(
      `INSERT INTO user_addresses (user_id, title, full_name, phone, address, city, postal_code, country, is_default, created_at, updated_at)
       OUTPUT INSERTED.id
       VALUES (@userId, @title, @fullName, @phone, @address, @city, @postalCode, @country, @isDefault, GETDATE(), GETDATE())`,
      {
        userId: addressData.userId,
        title: addressData.title,
        fullName: addressData.fullName,
        phone: addressData.phone,
        address: addressData.address,
        city: addressData.city,
        postalCode: addressData.postalCode,
        country: addressData.country || 'Türkiye',
        isDefault: addressData.isDefault ? 1 : 0,
      }
    );

    const address = await this.findById(result.id);
    if (!address) {
      throw new Error('Address oluşturulamadı');
    }

    return address;
  }

  // Update address
  static async update(id: number, updates: Partial<{
    title: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>): Promise<UserAddress | null> {
    const address = await this.findById(id);
    if (!address) return null;

    // If setting as default, unset other default addresses
    if (updates.isDefault === true) {
      await executeNonQuery(
        `UPDATE user_addresses 
         SET is_default = 0, updated_at = GETDATE()
         WHERE user_id = @userId AND id != @id`,
        { userId: address.userId, id }
      );
    }

    const fields: string[] = [];
    const params: Record<string, any> = { id };

    if (updates.title !== undefined) {
      fields.push('title = @title');
      params.title = updates.title;
    }
    if (updates.fullName !== undefined) {
      fields.push('full_name = @fullName');
      params.fullName = updates.fullName;
    }
    if (updates.phone !== undefined) {
      fields.push('phone = @phone');
      params.phone = updates.phone;
    }
    if (updates.address !== undefined) {
      fields.push('address = @address');
      params.address = updates.address;
    }
    if (updates.city !== undefined) {
      fields.push('city = @city');
      params.city = updates.city;
    }
    if (updates.postalCode !== undefined) {
      fields.push('postal_code = @postalCode');
      params.postalCode = updates.postalCode;
    }
    if (updates.country !== undefined) {
      fields.push('country = @country');
      params.country = updates.country;
    }
    if (updates.isDefault !== undefined) {
      fields.push('is_default = @isDefault');
      params.isDefault = updates.isDefault ? 1 : 0;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push('updated_at = GETDATE()');

    await executeNonQuery(
      `UPDATE user_addresses 
       SET ${fields.join(', ')}
       WHERE id = @id`,
      params
    );

    return await this.findById(id);
  }

  // Delete address
  static async delete(id: number): Promise<boolean> {
    const result = await executeNonQuery(
      `DELETE FROM user_addresses WHERE id = @id`,
      { id }
    );

    return result > 0;
  }

  // Set address as default
  static async setAsDefault(id: number, userId: number): Promise<boolean> {
    // Unset all other default addresses
    await executeNonQuery(
      `UPDATE user_addresses 
       SET is_default = 0, updated_at = GETDATE()
       WHERE user_id = @userId`,
      { userId }
    );

    // Set this address as default
    const result = await executeNonQuery(
      `UPDATE user_addresses 
       SET is_default = 1, updated_at = GETDATE()
       WHERE id = @id AND user_id = @userId`,
      { id, userId }
    );

    return result > 0;
  }
}

