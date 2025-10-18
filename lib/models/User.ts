// User Model ve DTO'lar

export interface User {
  id: number;
  username: string;
  password: string; // Hash'lenmiş şifre
  role: 'admin' | 'user';
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Create DTO (Register için)
export interface CreateUserDto {
  username: string;
  password: string; // Plain text (hashlenecek)
  role?: 'admin' | 'user';
}

// Login DTO
export interface LoginDto {
  username: string;
  password: string;
}

// JWT Payload
export interface JwtPayload {
  userId: number;
  username: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

// Public User (şifre olmadan)
export interface PublicUser {
  id: number;
  username: string;
  role: 'admin' | 'user';
  lastLoginAt: Date | null;
  createdAt: Date;
}

