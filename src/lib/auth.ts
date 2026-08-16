/**
 * Authentication utilities for Minhaajulhudaa Platform
 * Server-side only - uses HTTP-only cookies for session management
 */

import bcrypt from 'bcryptjs';
import { lightbase } from './lightbase';

const SESSION_COOKIE_NAME = 'minhaaj_session';
const SESSION_MAX_AGE = 86400; // 24 hours

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'platform_admin' | 'editor' | 'author';
  platforms: string[];
  isActive: boolean;
}

export interface Session {
  userId: string;
  email: string;
  role: string;
  platforms: string[];
  expiresAt: number;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function createSession(user: AdminUser): Session {
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    platforms: user.platforms || [],
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };
}

export function serializeSession(session: Session): string {
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

export function deserializeSession(cookie: string): Session | null {
  try {
    const session = JSON.parse(Buffer.from(cookie, 'base64').toString()) as Session;
    if (session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function getSessionCookieValue(request: Request): Session | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const sessionCookie = cookies[SESSION_COOKIE_NAME];
  if (!sessionCookie) return null;
  return deserializeSession(sessionCookie);
}

export function createSessionCookie(session: Session): string {
  const value = serializeSession(session);
  return `${SESSION_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`;
}

export function createLogoutCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((pair) => {
    const [key, ...rest] = pair.trim().split('=');
    if (key) cookies[key] = rest.join('=');
  });
  return cookies;
}

export function hasAccess(session: Session, requiredPlatform?: string, requiredRoles?: string[]): boolean {
  if (!session) return false;
  if (session.role === 'super_admin') return true;
  if (requiredRoles && !requiredRoles.includes(session.role)) return false;
  if (requiredPlatform && !session.platforms.includes(requiredPlatform) && session.role !== 'super_admin') return false;
  return true;
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  const admin = await lightbase.findOne('platform_admins', { field: 'email', op: 'eq', value: email });
  if (!admin || !admin.isActive) return null;
  const isValid = verifyPassword(password, admin.passwordHash);
  if (!isValid) return null;
  return {
    id: admin.id,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    role: admin.role,
    platforms: admin.platforms || [],
    isActive: admin.isActive,
  };
}

export function requireAuth(session: Session | null): Session {
  if (!session) throw new Error('Authentication required');
  return session;
}
