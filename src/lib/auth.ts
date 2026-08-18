/**
 * Authentication utilities for Minhaajulhudaa Platform
 * Server-side only - uses HTTP-only HMAC-signed cookies for session management
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { lightbase } from './lightbase';

const SESSION_COOKIE_NAME = 'minhaaj_session';
const SESSION_MAX_AGE = 86400; // 24 hours
const SESSION_SECRET = (import.meta.env.SESSION_SECRET || process.env.SESSION_SECRET || 'change-this-secret-in-production-min-32-chars');

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

// === HMAC-signed sessions (replaces insecure base64) ===

function hmacSign(data: string): string {
  return createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
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
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const sig = hmacSign(payload);
  return `${payload}.${sig}`;
}

export function deserializeSession(cookie: string): Session | null {
  try {
    const dotIndex = cookie.lastIndexOf('.');
    if (dotIndex === -1) return null;
    const payload = cookie.substring(0, dotIndex);
    const sig = cookie.substring(dotIndex + 1);
    const expectedSig = hmacSign(payload);
    // Timing-safe comparison to prevent timing attacks
    if (sig.length !== expectedSig.length) return null;
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session;
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
  const isHttps = (import.meta.env.SITE_URL || process.env.SITE_URL || '').startsWith('https://');
  return `${SESSION_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}${isHttps ? '; Secure' : ''}`;
}

export function createLogoutCookie(): string {
  const isHttps = (import.meta.env.SITE_URL || process.env.SITE_URL || '').startsWith('https://');
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isHttps ? '; Secure' : ''}`;
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

// === Env-based admin credentials ===
// Format: ADMIN_USERS_<PLATFORM>=email:password:role:firstName:lastName,email2:password2:...
// Example: ADMIN_USERS_SCHOOL=admin@school.com:pass123:platform_admin:Admin:User

const PLATFORMS = ['school', 'masjid', 'charity', 'travels'] as const;

type Platform = typeof PLATFORMS[number];

interface EnvAdmin {
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  platform: string;
}

function parseEnvAdmins(envValue: string | undefined, platform: string): EnvAdmin[] {
  if (!envValue) return [];
  return envValue.split(',').map(entry => {
    const parts = entry.trim().split(':');
    if (parts.length < 2) return null;
    return {
      email: parts[0].trim(),
      password: parts[1].trim(),
      role: parts[2]?.trim() || 'platform_admin',
      firstName: parts[3]?.trim() || 'Admin',
      lastName: parts[4]?.trim() || platform.charAt(0).toUpperCase() + platform.slice(1),
      platform,
    };
  }).filter((a): a is EnvAdmin => a !== null && a.email && a.password);
}

function getAllEnvAdmins(): EnvAdmin[] {
  const admins: EnvAdmin[] = [];
  for (const p of PLATFORMS) {
    const envVal = import.meta.env[`ADMIN_USERS_${p.toUpperCase()}`] || process.env[`ADMIN_USERS_${p.toUpperCase()}`] || '';
    admins.push(...parseEnvAdmins(envVal, p));
  }
  // Super admins
  const superEnv = import.meta.env.ADMIN_USERS_SUPER || process.env.ADMIN_USERS_SUPER || '';
  if (superEnv) {
    const supers = superEnv.split(',').map(entry => {
      const parts = entry.trim().split(':');
      if (parts.length < 2) return null;
      return {
        email: parts[0].trim(),
        password: parts[1].trim(),
        role: 'super_admin',
        firstName: parts[2]?.trim() || 'Super',
        lastName: parts[3]?.trim() || 'Admin',
        platform: 'all',
      };
    }).filter((a): a is EnvAdmin => a !== null && a.email && a.password);
    admins.push(...supers);
  }
  return admins;
}

export async function authenticateAdmin(email: string, password: string, platform?: string): Promise<AdminUser | null> {
  // 1. Check env-based admins first
  const envAdmins = getAllEnvAdmins();
  // Use constant-time comparison to prevent timing attacks
  const envAdmin = envAdmins.find(a =>
    a.email.toLowerCase() === email.toLowerCase() &&
    (a.role === 'super_admin' || !platform || a.platform === platform)
  );

  if (envAdmin) {
    // Timing-safe password comparison
    const isPasswordValid = safeEqual(aToBuf(envAdmin.password), aToBuf(password));
    if (!isPasswordValid) return null;
    const platforms = envAdmin.role === 'super_admin'
      ? ['school', 'masjid', 'charity', 'travels']
      : [envAdmin.platform];
    return {
      id: `env_${envAdmin.email}`,
      email: envAdmin.email,
      firstName: envAdmin.firstName,
      lastName: envAdmin.lastName,
      role: envAdmin.role as AdminUser['role'],
      platforms,
      isActive: true,
    };
  }

  // 2. Fallback: check DB-based admins (legacy support)
  try {
    const admin = await lightbase.findOne('platform_admins', { field: 'email', op: 'eq', value: email });
    if (!admin || !admin.isActive) return null;
    // bcrypt comparison is already timing-safe
    const bcrypt = await import('bcryptjs');
    const isValid = bcrypt.compareSync(password, admin.passwordHash);
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
  } catch {
    return null;
  }
}

// Convert string to Uint8Array for timing-safe comparison
function aToBuf(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

// Constant-time string comparison (length-safe)
function safeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to avoid leaking length info via timing
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function requireAuth(session: Session | null): Session {
  if (!session) throw new Error('Authentication required');
  return session;
}
