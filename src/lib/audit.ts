/**
 * Audit Logging Utility
 *
 * Logs admin actions for security auditing and compliance.
 * All admin CRUD operations should be logged with user ID, action, and resource.
 *
 * Schema (audit_logs collection):
 * - actor (string, required) - user email
 * - action (string, required) - e.g., 'create', 'update', 'delete', 'login'
 * - platform (string, optional) - e.g., 'school', 'masjid'
 * - collection (string, optional) - affected collection name
 * - documentId (string, optional) - affected document ID
 * - ipAddress (ip, optional) - client IP
 * - userAgent (string, optional) - client user agent
 * - details (json, optional) - additional details
 * - timestamp (datetime, optional) - action timestamp
 */

import { lightbase } from './lightbase';
import type { Session } from './auth';

export interface AuditLogEntry {
  actor: string; // user email (required)
  action: string; // e.g., 'create', 'update', 'delete', 'login', 'logout'
  platform?: string;
  collection?: string; // affected collection name
  documentId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Log an admin action to the audit_logs collection.
 * Non-blocking - errors are silently ignored to not break the main operation.
 */
export async function logAction(session: Session | null, entry: Partial<AuditLogEntry> & { action: string }): Promise<void> {
  if (!session) return;
  try {
    const logEntry: AuditLogEntry = {
      actor: session.email,
      action: entry.action,
      platform: entry.platform,
      collection: entry.collection,
      documentId: entry.documentId,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      details: entry.details,
      timestamp: new Date().toISOString(),
    };
    await lightbase.insert('audit_logs', logEntry);
  } catch {
    // Audit log failure should not break the main operation
  }
}

/**
 * Extract client IP from request headers.
 */
export function getClientIP(request: Request): string | undefined {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         undefined;
}

/**
 * Get user agent from request.
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
}
