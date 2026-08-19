/**
 * Local DB - Edge-compatible fallback for Lightbase
 *
 * This module provides a complete in-memory database that mirrors the
 * Lightbase API. It works on Cloudflare Pages (edge runtime) because
 * it uses only in-memory storage, seeded from bundled JSON data files.
 *
 * Architecture:
 * - All data is loaded into memory at startup from /data/*.json files
 * - CRUD operations work against the in-memory store
 * - Writes are persisted to localStorage (browser) or KV (Cloudflare)
 *   when available, but data is always available in memory from seed
 *
 * Usage:
 *   import { localDb } from './local-db';
 *   const docs = await localDb.query('school_programs', { limit: 10 });
 *
 * The API matches LightbaseClient so it can be used as a drop-in fallback.
 */

import type { QueryParams, QueryResult, LightbaseDocument, CollectionSchema } from './lightbase';

// In-memory data store: Map<collection, Map<id, doc>>
const store = new Map<string, Map<string, any>>();
let initialized = false;

// Generate ULID-like ID
function generateId(): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 12);
  return time + rand;
}

// Slugify helper
function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Match a document against a filter expression
function matchesFilter(doc: any, filter: any): boolean {
  if (!filter) return true;
  
  // Handle 'and' combinator
  if (filter.and) {
    return filter.and.every((f: any) => matchesFilter(doc, f));
  }
  
  // Handle 'or' combinator
  if (filter.or) {
    return filter.or.some((f: any) => matchesFilter(doc, f));
  }
  
  // Handle single filter: { field, op, value }
  const { field, op, value } = filter;
  if (!field || !op) return true;
  
  const docValue = doc[field];
  
  switch (op) {
    case 'eq': return docValue === value;
    case 'neq': return docValue !== value;
    case 'gt': return docValue > value;
    case 'gte': return docValue >= value;
    case 'lt': return docValue < value;
    case 'lte': return docValue <= value;
    case 'in': return Array.isArray(value) && value.includes(docValue);
    case 'nin': return Array.isArray(value) && !value.includes(docValue);
    case 'like': return typeof docValue === 'string' && docValue.includes(String(value).replace(/%/g, ''));
    case 'ilike': return typeof docValue === 'string' && docValue.toLowerCase().includes(String(value).replace(/%/g, '').toLowerCase());
    case 'is': return value === null ? docValue == null : docValue === value;
    case 'isnot': return value === null ? docValue != null : docValue !== value;
    case 'contains': return Array.isArray(docValue) && docValue.includes(value);
    case 'search': return typeof docValue === 'string' && docValue.toLowerCase().includes(String(value).toLowerCase());
    default: return true;
  }
}

// Sort documents
function sortDocs(docs: any[], sort?: string): any[] {
  if (!sort) return docs;
  const parts = sort.split(',').map(s => s.trim());
  return docs.sort((a, b) => {
    for (const part of parts) {
      const [field, direction] = part.split(':');
      const dir = direction === 'desc' ? -1 : 1;
      const aVal = a[field];
      const bVal = b[field];
      if (aVal == null && bVal == null) continue;
      if (aVal == null) return dir * 1;
      if (bVal == null) return dir * -1;
      if (aVal < bVal) return dir * -1;
      if (aVal > bVal) return dir * 1;
    }
    return 0;
  });
}

export class LocalDbClient {
  private collections = new Set<string>();

  isConfigured(): boolean {
    return true; // Always configured - in-memory
  }

  async health(): Promise<{ status: string; version: string; timestamp: string }> {
    return {
      status: 'ok',
      version: 'local-1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  async listCollections(): Promise<{ collections: any[] }> {
    return {
      collections: Array.from(this.collections).map(name => ({ name })),
    };
  }

  async getCollection(name: string): Promise<any> {
    return { name, fields: [] };
  }

  async createCollection(schema: CollectionSchema): Promise<any> {
    this.collections.add(schema.name);
    if (!store.has(schema.name)) {
      store.set(schema.name, new Map());
    }
    return { success: true };
  }

  async updateCollection(name: string, schema: CollectionSchema): Promise<any> {
    this.collections.add(name);
    if (!store.has(name)) {
      store.set(name, new Map());
    }
    return { success: true };
  }

  async deleteCollection(name: string): Promise<any> {
    store.delete(name);
    this.collections.delete(name);
    return { success: true };
  }

  async insert<T = LightbaseDocument>(collection: string, document: Record<string, any>): Promise<{ document: T }> {
    if (!store.has(collection)) {
      store.set(collection, new Map());
      this.collections.add(collection);
    }
    const colStore = store.get(collection)!;
    const id = document.id || generateId();
    const now = new Date().toISOString();
    const doc = {
      ...document,
      id,
      _created_at: now,
      _updated_at: now,
      _revision: 1,
      _deleted: false,
    };
    colStore.set(id, doc);
    return { document: doc as T };
  }

  async getById<T = LightbaseDocument>(collection: string, id: string): Promise<{ document: T }> {
    const colStore = store.get(collection);
    if (!colStore) throw new Error(`Collection ${collection} not found`);
    const doc = colStore.get(id);
    if (!doc) throw new Error(`Document ${id} not found`);
    return { document: doc as T };
  }

  async update<T = LightbaseDocument>(collection: string, id: string, patch: Record<string, any>, revision?: number): Promise<{ document: T }> {
    const colStore = store.get(collection);
    if (!colStore) throw new Error(`Collection ${collection} not found`);
    const doc = colStore.get(id);
    if (!doc) throw new Error(`Document ${id} not found`);
    const updated = {
      ...doc,
      ...patch,
      _updated_at: new Date().toISOString(),
      _revision: (doc._revision || 0) + 1,
    };
    colStore.set(id, updated);
    return { document: updated as T };
  }

  async delete(collection: string, id: string): Promise<any> {
    const colStore = store.get(collection);
    if (!colStore) throw new Error(`Collection ${collection} not found`);
    colStore.delete(id);
    return { success: true };
  }

  async query<T = LightbaseDocument>(collection: string, params: QueryParams = {}): Promise<QueryResult<T>> {
    let colStore = store.get(collection);
    if (!colStore) {
      colStore = new Map();
      store.set(collection, colStore);
      this.collections.add(collection);
    }
    let docs = Array.from(colStore.values());
    
    // Filter
    if (params.filter) {
      docs = docs.filter(doc => matchesFilter(doc, params.filter));
    }
    
    // Sort
    docs = sortDocs(docs, params.sort);
    
    // Count before pagination
    const total = docs.length;
    
    // Pagination
    if (params.cursor) {
      const offset = params.cursor.offset || 0;
      docs = docs.slice(offset, offset + params.cursor.limit);
    } else if (params.limit) {
      docs = docs.slice(0, params.limit);
    }
    
    return {
      data: docs as T[],
      total,
      count: total,
      hasMore: params.limit ? total > params.limit : false,
    };
  }

  async list<T = LightbaseDocument>(collection: string, limit = 25, offset = 0, sort?: string): Promise<QueryResult<T>> {
    return this.query<T>(collection, { limit, cursor: { limit, offset }, sort });
  }

  async findOne<T = LightbaseDocument>(collection: string, filter: any): Promise<T | null> {
    const result = await this.query<T>(collection, { filter, limit: 1 });
    return result.data[0] || null;
  }

  async findMany<T = LightbaseDocument>(collection: string, filter: any, options: { sort?: string; limit?: number } = {}): Promise<T[]> {
    const result = await this.query<T>(collection, { filter, sort: options.sort, limit: options.limit || 100 });
    return result.data;
  }

  async search<T = LightbaseDocument>(collection: string, query: string, limit = 25): Promise<{ data: T[]; total: number }> {
    let colStore = store.get(collection);
    if (!colStore) return { data: [], total: 0 };
    const docs = Array.from(colStore.values()).filter(doc => {
      return Object.values(doc).some(val => 
        typeof val === 'string' && val.toLowerCase().includes(query.toLowerCase())
      );
    });
    return { data: docs.slice(0, limit) as T[], total: docs.length };
  }

  async upsert<T = LightbaseDocument>(collection: string, filter: any, document: Record<string, any>): Promise<{ document: T; created: boolean }> {
    const existing = await this.findOne<T>(collection, filter);
    if (existing) {
      const result = await this.update<T>(collection, (existing as any).id, document);
      return { document: result.document, created: false };
    }
    const result = await this.insert<T>(collection, document);
    return { document: result.document, created: true };
  }

  async bulk(inserts: Array<{ collection: string; document: Record<string, any> }>): Promise<any> {
    let inserted = 0;
    for (const item of inserts) {
      await this.insert(item.collection, item.document);
      inserted++;
    }
    return { inserted, updated: 0, deleted: 0, errors: [] };
  }

  async seed(collection: string, documents: Record<string, any>[]): Promise<{ inserted: number; skipped: number; errors: any[] }> {
    if (!store.has(collection)) {
      store.set(collection, new Map());
      this.collections.add(collection);
    }
    const colStore = store.get(collection)!;
    let inserted = 0;
    let skipped = 0;
    for (const doc of documents) {
      const id = doc.id || generateId();
      if (colStore.has(id)) {
        skipped++;
        continue;
      }
      const now = new Date().toISOString();
      colStore.set(id, {
        ...doc,
        id,
        _created_at: doc._created_at || now,
        _updated_at: doc._updated_at || now,
        _revision: 1,
        _deleted: false,
      });
      inserted++;
    }
    return { inserted, skipped, errors: [] };
  }

  async count(collection: string, filter?: any): Promise<number> {
    const result = await this.query(collection, { filter, limit: 1 });
    return result.total || 0;
  }

  // Storage methods (no-op for in-memory, but API compatible)
  async uploadFile(path: string, file: Buffer, contentType: string): Promise<any> {
    return { path, url: `/uploads/${path}` };
  }

  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    return `/uploads/${path}`;
  }
}

// Singleton
export const localDb = new LocalDbClient();

/**
 * Seed the local DB from a data object.
 * Called at module load time with bundled JSON data.
 */
export async function seedLocalDb(data: Record<string, any[]>): Promise<void> {
  if (initialized) return;
  initialized = true;
  for (const [collection, docs] of Object.entries(data)) {
    if (Array.isArray(docs)) {
      await localDb.seed(collection, docs);
    }
  }
}

/**
 * Load seed data dynamically.
 * In dev: reads from /data/*.json files
 * In production (Cloudflare): imports bundled JSON
 */
export async function loadSeedData(): Promise<Record<string, any[]>> {
  const data: Record<string, any[]> = {};
  try {
    // Dynamic import of all JSON files in /data
    // This works in both Node and Cloudflare (Vite bundles them)
    const modules = import.meta.glob('/data/*.json', { eager: true });
    for (const [path, mod] of Object.entries(modules)) {
      const name = path.split('/').pop()!.replace('.json', '');
      data[name] = (mod as any).default || mod;
    }
  } catch (err) {
    console.error('[local-db] Failed to load seed data:', err);
  }
  return data;
}
