/**
 * Database Router
 *
 * Automatically routes database operations to Lightbase (primary) or
 * Local DB (fallback) based on availability.
 *
 * - Checks Lightbase health periodically (every 30s)
 * - If Lightbase is down, uses Local DB (in-memory, seeded from JSON)
 * - If Lightbase comes back up, switches back automatically
 * - All operations are async with graceful fallback
 *
 * Usage (instead of importing lightbase directly):
 *   import { db } from '../lib/db';
 *   const result = await db.query('school_programs', { limit: 10 });
 */

import { lightbase, LightbaseError } from './lightbase';
import { localDb, seedLocalDb, loadSeedData } from './local-db';

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
let lastHealthCheck = 0;
let lightbaseAvailable: boolean | null = null;
let localDbSeeded = false;

/**
 * Check if Lightbase is available (with caching).
 */
async function checkLightbaseHealth(): Promise<boolean> {
  const now = Date.now();
  
  // Use cached result if recent
  if (lightbaseAvailable !== null && (now - lastHealthCheck) < HEALTH_CHECK_INTERVAL) {
    return lightbaseAvailable;
  }
  
  // Don't check if not configured
  if (!lightbase.isConfigured()) {
    lightbaseAvailable = false;
    lastHealthCheck = now;
    return false;
  }
  
  try {
    // Quick health check with 5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${lightbase.baseUrlPublic}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    lightbaseAvailable = response.ok;
    lastHealthCheck = now;
    
    if (lightbaseAvailable) {
      console.log('[db] Lightbase available - using primary DB');
    } else {
      console.log('[db] Lightbase health check failed - using fallback');
    }
  } catch (err) {
    lightbaseAvailable = false;
    lastHealthCheck = now;
    console.log('[db] Lightbase unreachable - using fallback');
  }
  
  return lightbaseAvailable;
}

/**
 * Ensure local DB is seeded with data.
 */
async function ensureLocalDbSeeded(): Promise<void> {
  if (localDbSeeded) return;
  try {
    const data = await loadSeedData();
    await seedLocalDb(data);
    localDbSeeded = true;
    console.log(`[db] Local DB seeded with ${Object.keys(data).length} collections`);
  } catch (err) {
    console.error('[db] Failed to seed local DB:', err);
  }
}

/**
 * BismiLLAH (2026-09-27, LIGHTBASE-ONLY MANDATE) — execute the Lightbase
 * operation. The Local DB fallback is FULLY DISABLED (functionless): the
 * localOp parameter is retained only for call-site compatibility and is
 * NEVER invoked. Failures surface as real errors (display reads use the
 * fail-soft safe* variants at the call sites instead).
 */
async function withFallback<T>(
  lightbaseOp: () => Promise<T>,
  _localOp: () => Promise<T>
): Promise<T> {
  return lightbaseOp();
}

/**
 * Database router that matches the LightbaseClient API.
 * Uses Lightbase when available, falls back to Local DB otherwise.
 */
class DbRouter {
  isConfigured(): boolean {
    return lightbase.isConfigured();
  }

  async health(): Promise<{ status: string; version: string; timestamp: string; source?: string }> {
    try {
      const h = await lightbase.health();
      return { ...h, source: 'lightbase' };
    } catch {
      // BismiLLAH — health reports the TRUTH (degraded), never pretends the
      // local DB is a healthy replacement.
      return { status: 'degraded', version: 'lightbase-unreachable', timestamp: new Date().toISOString(), source: 'none' };
    }
  }

  async listCollections(): Promise<{ collections: any[] }> {
    return withFallback(
      () => lightbase.listCollections(),
      () => localDb.listCollections()
    );
  }

  async getCollection(name: string): Promise<any> {
    return withFallback(
      () => lightbase.getCollection(name),
      () => localDb.getCollection(name)
    );
  }

  async createCollection(schema: any): Promise<any> {
    return withFallback(
      () => lightbase.createCollection(schema),
      () => localDb.createCollection(schema)
    );
  }

  async updateCollection(name: string, schema: any): Promise<any> {
    return withFallback(
      () => lightbase.updateCollection(name, schema),
      () => localDb.updateCollection(name, schema)
    );
  }

  async deleteCollection(name: string): Promise<any> {
    return withFallback(
      () => lightbase.deleteCollection(name),
      () => localDb.deleteCollection(name)
    );
  }

  async insert<T = any>(collection: string, document: Record<string, any>): Promise<{ document: T }> {
    return withFallback(
      () => lightbase.insert<T>(collection, document),
      () => localDb.insert<T>(collection, document)
    );
  }

  async getById<T = any>(collection: string, id: string): Promise<{ document: T }> {
    return withFallback(
      () => lightbase.getById<T>(collection, id),
      () => localDb.getById<T>(collection, id)
    );
  }

  async update<T = any>(collection: string, id: string, patch: Record<string, any>, revision?: number): Promise<{ document: T }> {
    return withFallback(
      () => lightbase.update<T>(collection, id, patch, revision),
      () => localDb.update<T>(collection, id, patch, revision)
    );
  }

  async delete(collection: string, id: string): Promise<any> {
    return withFallback(
      () => lightbase.delete(collection, id),
      () => localDb.delete(collection, id)
    );
  }

  async query<T = any>(collection: string, params: any = {}): Promise<any> {
    return withFallback(
      () => lightbase.query<T>(collection, params),
      () => localDb.query<T>(collection, params)
    );
  }

  async list<T = any>(collection: string, limit = 25, offset = 0, sort?: string): Promise<any> {
    return withFallback(
      () => lightbase.list<T>(collection, limit, offset, sort),
      () => localDb.list<T>(collection, limit, offset, sort)
    );
  }

  async findOne<T = any>(collection: string, filter: any): Promise<T | null> {
    return withFallback(
      () => lightbase.findOne<T>(collection, filter),
      () => localDb.findOne<T>(collection, filter)
    );
  }

  async findMany<T = any>(collection: string, filter: any, options: { sort?: string; limit?: number } = {}): Promise<T[]> {
    return withFallback(
      () => lightbase.findMany<T>(collection, filter, options),
      () => localDb.findMany<T>(collection, filter, options)
    );
  }

  async search<T = any>(collection: string, query: string, limit = 25): Promise<{ data: T[]; total: number }> {
    return withFallback(
      () => lightbase.search<T>(collection, query, limit),
      () => localDb.search<T>(collection, query, limit)
    );
  }

  async upsert<T = any>(collection: string, filter: any, document: Record<string, any>): Promise<{ document: T; created: boolean }> {
    return withFallback(
      () => lightbase.upsert<T>(collection, filter, document),
      () => localDb.upsert<T>(collection, filter, document)
    );
  }

  async bulk(inserts: any[], updates: any[] = [], deletes: any[] = []): Promise<any> {
    return withFallback(
      () => lightbase.bulk(inserts, updates, deletes),
      () => localDb.bulk(inserts)
    );
  }

  async seed(collection: string, documents: Record<string, any>[], dedupOn: string[] = []): Promise<any> {
    return withFallback(
      () => lightbase.seed(collection, documents, dedupOn),
      () => localDb.seed(collection, documents)
    );
  }

  async count(collection: string, filter?: any): Promise<number> {
    return withFallback(
      () => lightbase.count(collection, filter),
      () => localDb.count(collection, filter)
    );
  }

  async uploadFile(path: string, file: Buffer, contentType: string): Promise<any> {
    return withFallback(
      () => lightbase.uploadFile(path, file, contentType),
      () => localDb.uploadFile(path, file, contentType)
    );
  }

  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    return withFallback(
      () => lightbase.getSignedUrl(path, expiresIn),
      () => localDb.getSignedUrl(path, expiresIn)
    );
  }

  // Expose for health checks
  get isUsingFallback(): boolean {
    return lightbaseAvailable === false;
  }
}

// Singleton
export const db = new DbRouter();
export default db;
