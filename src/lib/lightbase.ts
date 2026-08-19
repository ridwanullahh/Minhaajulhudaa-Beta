/**
 * Lightbase API Client
 *
 * Singleton client for interacting with the Lightbase BaaS.
 * Server-side only - never expose the API key to the client.
 *
 * Fallback: When Lightbase is unavailable, automatically falls back
 * to the local in-memory DB (src/lib/local-db.ts) which is seeded
 * from bundled JSON data. This ensures the app works on Cloudflare
 * Pages even when the Lightbase server is down.
 */

// Lazy env reads: module-level constants crash astro build on PaaS
// platforms that set env vars only at runtime, not during build.
const _env = () => ({
  BASE_URL: (import.meta.env.LIGHTBASE_BASE_URL || process.env.LIGHTBASE_BASE_URL || '').replace(/\/+$/, ''),
  API_KEY: import.meta.env.LIGHTBASE_API_KEY || process.env.LIGHTBASE_API_KEY || '',
  PROJECT_ID: import.meta.env.LIGHTBASE_PROJECT_ID || process.env.LIGHTBASE_PROJECT_ID || '',
});

if (!_env().BASE_URL || !_env().API_KEY || !_env().PROJECT_ID) {
  // Allow build-time import without env (SSR pages import at module level)
  console.warn('[lightbase] Missing env vars - client will fail at runtime if used without env');
}

export interface LightbaseDocument {
  id: string;
  _created_at: string;
  _updated_at: string;
  _revision: number;
  _deleted: boolean;
  _checksum?: string;
  [key: string]: any;
}

export interface QueryParams {
  filter?: any;
  sort?: string;
  limit?: number;
  cursor?: { limit: number; offset: number };
  after?: string;
  count?: boolean;
  select?: string;
}

export interface QueryResult<T = LightbaseDocument> {
  data: T[];
  nextCursor?: { limit: number; offset: number };
  total?: number;
  hasMore?: boolean;
  count?: number;
}

export interface CollectionSchema {
  name: string;
  fields: FieldDefinition[];
  indexes?: IndexDefinition[];
}

export interface FieldDefinition {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  indexed?: boolean;
  default?: any;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  enum?: any[];
  precision?: number;
  currency?: string;
  dimensions?: number;
  refCollection?: string;
  cascade?: boolean;
  maxBytes?: number;
  searchable?: boolean;
  encrypted?: boolean;
  description?: string;
}

export interface IndexDefinition {
  name: string;
  fields: string[];
  unique?: boolean;
}

class LightbaseClient {
  private baseUrl: string;
  private apiKey: string;
  private projectId: string;

  constructor() {
    const e = _env();
    this.baseUrl = e.BASE_URL;
    this.apiKey = e.API_KEY;
    this.projectId = e.PROJECT_ID;
  }

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.apiKey && this.projectId);
  }

  // Public getter for health check URL
  get baseUrlPublic(): string {
    return this.baseUrl;
  }

  private getHeaders(contentType = 'application/json'): Record<string, string> {
    return {
      apikey: this.apiKey,
      'x-lightbase-project': this.projectId,
      'Content-Type': contentType,
    };
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new LightbaseError(
        'Lightbase not configured: missing LIGHTBASE_BASE_URL, LIGHTBASE_API_KEY, or LIGHTBASE_PROJECT_ID env vars',
        500, path, options.method || 'GET'
      );
    }
    const url = `${this.baseUrl}${path}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage: string;
      try {
        const parsed = JSON.parse(errorBody);
        errorMessage = parsed.error?.message || parsed.message || errorBody;
      } catch {
        errorMessage = errorBody;
      }
      throw new LightbaseError(
        errorMessage,
        response.status,
        path,
        options.method || 'GET'
      );
    }

    // Handle empty responses (e.g., 204)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  // === Health ===
  async health(): Promise<{ status: string; version: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  // === Collections ===
  async listCollections(): Promise<{ collections: any[] }> {
    return this.request(`/api/v1/projects/${this.projectId}/collections`);
  }

  async getCollection(name: string): Promise<any> {
    return this.request(`/api/v1/projects/${this.projectId}/collections/${name}`);
  }

  async createCollection(schema: CollectionSchema): Promise<any> {
    return this.request(`/api/v1/projects/${this.projectId}/collections`, {
      method: 'POST',
      body: JSON.stringify(schema),
    });
  }

  async updateCollection(name: string, schema: CollectionSchema): Promise<any> {
    return this.request(`/api/v1/projects/${this.projectId}/collections/${name}`, {
      method: 'PUT',
      body: JSON.stringify(schema),
    });
  }

  async deleteCollection(name: string): Promise<any> {
    return this.request(`/api/v1/projects/${this.projectId}/collections/${name}`, {
      method: 'DELETE',
    });
  }

  // === Documents CRUD ===
  async insert<T = LightbaseDocument>(
    collection: string,
    document: Record<string, any>
  ): Promise<{ document: T }> {
    return this.request(`/api/v1/projects/${this.projectId}/collections/${collection}`, {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async getById<T = LightbaseDocument>(
    collection: string,
    id: string
  ): Promise<{ document: T }> {
    return this.request(`/api/v1/projects/${this.projectId}/collections/${collection}/${id}`);
  }

  async update<T = LightbaseDocument>(
    collection: string,
    id: string,
    patch: Record<string, any>,
    revision?: number
  ): Promise<{ document: T }> {
    const headers: Record<string, string> = {};
    if (revision !== undefined) {
      headers['If-Match'] = String(revision);
    }
    return this.request(`/api/v1/projects/${this.projectId}/collections/${collection}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(patch),
    });
  }

  async delete(collection: string, id: string): Promise<any> {
    return this.request(`/api/v1/projects/${this.projectId}/collections/${collection}/${id}`, {
      method: 'DELETE',
    });
  }

  // === Query ===
  async query<T = LightbaseDocument>(
    collection: string,
    params: QueryParams = {}
  ): Promise<QueryResult<T>> {
    const searchParams = new URLSearchParams();
    if (params.filter) searchParams.set('filter', JSON.stringify(params.filter));
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.cursor) searchParams.set('cursor', JSON.stringify(params.cursor));
    if (params.after) searchParams.set('after', params.after);
    if (params.count) searchParams.set('count', 'true');
    if (params.select) searchParams.set('select', params.select);

    const qs = searchParams.toString();
    const path = `/api/v1/projects/${this.projectId}/collections/${collection}/docs${qs ? `?${qs}` : ''}`;
    return this.request(path);
  }

  // Convenience: list with simple pagination
  async list<T = LightbaseDocument>(
    collection: string,
    limit = 25,
    offset = 0,
    sort?: string
  ): Promise<QueryResult<T>> {
    return this.query<T>(collection, {
      limit,
      cursor: { limit, offset },
      sort,
    });
  }

  // Convenience: find one by filter
  async findOne<T = LightbaseDocument>(
    collection: string,
    filter: any
  ): Promise<T | null> {
    const result = await this.query<T>(collection, { filter, limit: 1 });
    return result.data[0] || null;
  }

  // Convenience: find many by filter
  async findMany<T = LightbaseDocument>(
    collection: string,
    filter: any,
    options: { sort?: string; limit?: number } = {}
  ): Promise<T[]> {
    const result = await this.query<T>(collection, {
      filter,
      sort: options.sort,
      limit: options.limit || 100,
    });
    return result.data;
  }

  // === Search ===
  async search<T = LightbaseDocument>(
    collection: string,
    query: string,
    limit = 25
  ): Promise<{ data: T[]; total: number }> {
    return this.request(`/api/v1/projects/${this.projectId}/collections/${collection}/search`, {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    });
  }

  // === Upsert ===
  async upsert<T = LightbaseDocument>(
    collection: string,
    filter: any,
    document: Record<string, any>
  ): Promise<{ document: T; created: boolean }> {
    return this.request(`/api/v1/projects/${this.projectId}/collections/${collection}/upsert`, {
      method: 'PUT',
      body: JSON.stringify({ filter, document }),
    });
  }

  // === Bulk ===
  async bulk(
    inserts: Array<{ collection: string; document: Record<string, any> }>,
    updates: Array<{ collection: string; id: string; patch: Record<string, any> }> = [],
    deletes: Array<{ collection: string; id: string }> = []
  ): Promise<{ inserted: number; updated: number; deleted: number; errors: any[] }> {
    return this.request(`/api/v1/projects/${this.projectId}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ inserts, updates, deletes }),
    });
  }

  // === Seed ===
  async seed(
    collection: string,
    documents: Record<string, any>[],
    dedupOn: string[] = []
  ): Promise<{ inserted: number; skipped: number; errors: any[] }> {
    return this.request(`/api/v1/projects/${this.projectId}/seed`, {
      method: 'POST',
      body: JSON.stringify({ collection, documents, dedupOn }),
    });
  }

  // === Aggregate ===
  async aggregate(
    collection: string,
    body: { groupBy?: string[]; aggregations: any[]; filter?: any }
  ): Promise<any> {
    return this.request(`/api/v1/projects/${this.projectId}/collections/${collection}/aggregate`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // === Count ===
  async count(collection: string, filter?: any): Promise<number> {
    const result = await this.query(collection, { filter, limit: 1, count: true });
    return result.count || 0;
  }

  // === Storage ===
  async uploadFile(path: string, file: Buffer, contentType: string): Promise<any> {
    const url = `${this.baseUrl}/api/v1/projects/${this.projectId}/storage/uploads/upload?path=${encodeURIComponent(path)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: this.apiKey,
        'x-lightbase-project': this.projectId,
        'Content-Type': contentType,
      },
      body: file,
    });
    if (!response.ok) {
      throw new LightbaseError(await response.text(), response.status, path, 'UPLOAD');
    }
    return response.json();
  }

  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    const result = await this.request<{
      url?: string;
      signedUrl?: string;
    }>(`/api/v1/projects/${this.projectId}/storage/uploads/signed-url`, {
      method: 'POST',
      body: JSON.stringify({ path, expiresIn }),
    });
    return result.url || result.signedUrl || '';
  }
}

export class LightbaseError extends Error {
  status: number;
  path: string;
  method: string;

  constructor(message: string, status: number, path: string, method: string) {
    super(message);
    this.name = 'LightbaseError';
    this.status = status;
    this.path = path;
    this.method = method;
  }
}

// Singleton
const _lightbaseClient = new LightbaseClient();

// Lazy-load the DB router to avoid circular dependency
let _dbRouter: any = null;
async function getDbRouter() {
  if (!_dbRouter) {
    const { db } = await import('./db');
    _dbRouter = db;
  }
  return _dbRouter;
}

// Check if Lightbase is available (with caching)
const HEALTH_CHECK_INTERVAL = 30000;
let _lastHealthCheck = 0;
let _lightbaseAvailable: boolean | null = null;

async function isLightbaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (_lightbaseAvailable !== null && (now - _lastHealthCheck) < HEALTH_CHECK_INTERVAL) {
    return _lightbaseAvailable;
  }
  if (!_lightbaseClient.isConfigured()) {
    _lightbaseAvailable = false;
    _lastHealthCheck = now;
    return false;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${_lightbaseClient.baseUrlPublic}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    _lightbaseAvailable = response.ok;
    _lastHealthCheck = now;
  } catch {
    _lightbaseAvailable = false;
    _lastHealthCheck = now;
  }
  return _lightbaseAvailable;
}

// Create a proxy that falls back to local DB when Lightbase is unavailable
export const lightbase = new Proxy(_lightbaseClient, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    
    // Only intercept async methods (functions)
    if (typeof value === 'function') {
      return async function (...args: any[]) {
        const available = await isLightbaseAvailable();
        if (available) {
          try {
            return await value.apply(target, args);
          } catch (err: any) {
            // Fall back on network errors or 5xx
            if (err instanceof LightbaseError && (err.status >= 500 || err.status === 0)) {
              const db = await getDbRouter();
              const localMethod = (db as any)[prop];
              if (typeof localMethod === 'function') {
                return localMethod.apply(db, args);
              }
            }
            throw err;
          }
        } else {
          // Use local DB fallback
          const db = await getDbRouter();
          const localMethod = (db as any)[prop];
          if (typeof localMethod === 'function') {
            return localMethod.apply(db, args);
          }
          throw new Error(`Method ${String(prop)} not available on fallback DB`);
        }
      };
    }
    return value;
  },
});

export default lightbase;
