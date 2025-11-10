import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery } from '../db';
import { UserRole } from '../types/UserRole';

// Re-export UserRole for backward compatibility
export { UserRole };

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export class UserRepository {
  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    const result = await executeQueryOne<User>(
      'SELECT id, email, password_hash as passwordHash, name, role, created_at as createdAt FROM users WHERE id = @id',
      { id }
    );
    return result;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const result = await executeQueryOne<User>(
      'SELECT id, email, password_hash as passwordHash, name, role, created_at as createdAt FROM users WHERE email = @email',
      { email }
    );
    return result;
  }

  // Create user
  static async create(userData: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
  }): Promise<User> {
    const role = userData.role || UserRole.USER;
    
    try {
      // First, try with OUTPUT INSERTED.id (works with most drivers)
      const result = await executeQueryOne<{ id: number }>(
        `INSERT INTO users (email, password_hash, name, role, created_at)
         OUTPUT INSERTED.id
         VALUES (@email, @passwordHash, @name, @role, GETDATE())`,
        {
          email: userData.email,
          passwordHash: userData.passwordHash,
          name: userData.name,
          role,
        }
      );
      
      if (result && result.id) {
        const user = await this.findById(result.id);
        if (!user) {
          throw new Error('Failed to retrieve created user');
        }
        return user;
      }
    } catch (error: any) {
      // If OUTPUT INSERTED.id fails, insert and then find by email
      console.warn('OUTPUT INSERTED.id failed, trying insert then find by email:', error.message);
      
      try {
        // Insert user
        await executeNonQuery(
          `INSERT INTO users (email, password_hash, name, role, created_at)
           VALUES (@email, @passwordHash, @name, @role, GETDATE())`,
          {
            email: userData.email,
            passwordHash: userData.passwordHash,
            name: userData.name,
            role,
          }
        );
        
        // Find user by email (email is unique, so this should work)
        const user = await this.findByEmail(userData.email);
        if (!user) {
          throw new Error('Failed to retrieve created user after insert');
        }
        return user;
      } catch (error2: any) {
        console.error('User creation failed:', error2);
        throw new Error(`Failed to create user: ${error2.message}`);
      }
    }
    
    throw new Error('Failed to create user: No ID returned');
  }

  // Update user
  static async update(id: number, updates: Partial<{
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
  }>): Promise<User | null> {
    const fields: string[] = [];
    const params: Record<string, any> = { id };

    if (updates.email !== undefined) {
      fields.push('email = @email');
      params.email = updates.email;
    }
    if (updates.passwordHash !== undefined) {
      fields.push('password_hash = @passwordHash');
      params.passwordHash = updates.passwordHash;
    }
    if (updates.name !== undefined) {
      fields.push('name = @name');
      params.name = updates.name;
    }
    if (updates.role !== undefined) {
      fields.push('role = @role');
      params.role = updates.role;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    await executeNonQuery(
      `UPDATE users SET ${fields.join(', ')} WHERE id = @id`,
      params
    );

    return await this.findById(id);
  }

  // Delete user
  static async delete(id: number): Promise<boolean> {
    const rowsAffected = await executeNonQuery(
      'DELETE FROM users WHERE id = @id',
      { id }
    );
    return rowsAffected > 0;
  }

  // Find all users
  static async findAll(): Promise<User[]> {
    return await executeQuery<User>(
      'SELECT id, email, password_hash as passwordHash, name, role, created_at as createdAt FROM users ORDER BY created_at DESC'
    );
  }
}
