import { redirect } from 'next/navigation';
import { getAuthCookie } from './auth/cookies';
import { verifyToken, JwtPayload } from './auth/auth';
import { UserRepository } from './repositories/UserRepository';
import { UserRole } from './types/UserRole';

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Require user to be authenticated
 * Throws redirect to /auth/login if not authenticated
 * Returns user data from database
 * 
 * @param requiredRole - Optional role requirement ('ADMIN' | 'USER')
 * @returns Authenticated user data
 */
export async function requireUser(requiredRole?: 'ADMIN' | 'USER'): Promise<AuthenticatedUser> {
  // Get token from cookie
  const token = await getAuthCookie();
  
  if (!token) {
    redirect('/auth/login');
  }

  // Verify token
  const payload = await verifyToken(token);
  
  if (!payload) {
    redirect('/auth/login');
  }

  // Get user from database
  const user = await UserRepository.findById(payload.userId);

  if (!user) {
    redirect('/auth/login');
  }

  // Check role requirement
  if (requiredRole === 'ADMIN' && user.role !== UserRole.ADMIN) {
    redirect('/profile');
  }
  if (requiredRole === 'USER' && user.role !== UserRole.USER) {
    redirect('/');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * Optional: Get user if authenticated, return null if not
 * Useful for pages that work for both authenticated and guest users
 */
export async function getOptionalUser(): Promise<AuthenticatedUser | null> {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}


