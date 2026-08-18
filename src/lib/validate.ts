/**
 * Input Validation Utility
 *
 * Provides schema-based validation for API endpoints to prevent injection,
 * ensure data integrity, and return proper 400 errors for invalid input.
 *
 * Usage:
 *   const result = await validateBody(request, {
 *     name: { type: 'string', required: true, max: 100 },
 *     email: { type: 'email', required: true },
 *     amount: { type: 'number', required: true, min: 100 },
 *   });
 *   if (!result.ok) return result.response;
 *   const body = result.data;
 */

export type FieldType = 'string' | 'email' | 'number' | 'boolean' | 'phone' | 'url' | 'date' | 'array' | 'json';

export interface FieldSchema {
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  enum?: (string | number)[];
  sanitize?: boolean; // HTML-escape the value (default true for string/email/phone/url)
}

export interface Schema {
  [field: string]: FieldSchema;
}

export interface ValidationResult {
  ok: boolean;
  data?: Record<string, any>;
  response?: Response;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[1-9]\d{7,14}$/;
const URL_RE = /^https?:\/\/[^\s<>"{}|\\^`[\]]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeValue(val: any, shouldSanitize: boolean): any {
  if (!shouldSanitize || typeof val !== 'string') return val;
  return escapeHtml(val);
}

function validateField(name: string, val: any, schema: FieldSchema): string | null {
  const { type, required, min, max, maxLength, enum: enumValues } = schema;

  // Required check
  if (val === undefined || val === null || val === '') {
    if (required) return `Missing required field: ${name}`;
    return null; // optional field, skip
  }

  // Type validation
  switch (type) {
    case 'string':
      if (typeof val !== 'string') return `${name} must be a string`;
      if (maxLength && val.length > maxLength) return `${name} must be at most ${maxLength} characters`;
      break;
    case 'email':
      if (typeof val !== 'string' || !EMAIL_RE.test(val)) return `${name} must be a valid email address`;
      if (maxLength && val.length > maxLength) return `${name} must be at most ${maxLength} characters`;
      break;
    case 'phone':
      if (typeof val !== 'string') return `${name} must be a string`;
      const cleaned = val.replace(/[\s()-]/g, '');
      if (!PHONE_RE.test(cleaned)) return `${name} must be a valid phone number`;
      break;
    case 'url':
      if (typeof val !== 'string' || !URL_RE.test(val)) return `${name} must be a valid URL`;
      break;
    case 'number':
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (typeof num !== 'number' || isNaN(num)) return `${name} must be a number`;
      if (min !== undefined && num < min) return `${name} must be at least ${min}`;
      if (max !== undefined && num > max) return `${name} must be at most ${max}`;
      break;
    case 'boolean':
      if (typeof val !== 'boolean' && val !== 'true' && val !== 'false') return `${name} must be a boolean`;
      break;
    case 'date':
      if (typeof val !== 'string' || isNaN(new Date(val).getTime())) return `${name} must be a valid date`;
      break;
    case 'array':
      if (!Array.isArray(val)) return `${name} must be an array`;
      if (min !== undefined && val.length < min) return `${name} must have at least ${min} items`;
      if (max !== undefined && val.length > max) return `${name} must have at most ${max} items`;
      break;
    case 'json':
      if (typeof val === 'string') {
        try { JSON.parse(val); } catch { return `${name} must be valid JSON`; }
      } else if (typeof val !== 'object') {
        return `${name} must be an object or JSON string`;
      }
      break;
  }

  // Enum check
  if (enumValues && !enumValues.includes(val)) {
    return `${name} must be one of: ${enumValues.join(', ')}`;
  }

  return null;
}

export function validateBody(body: Record<string, any>, schema: Schema): ValidationResult {
  const errors: string[] = [];
  const cleaned: Record<string, any> = {};

  for (const [field, fieldSchema] of Object.entries(schema)) {
    const val = body[field];
    const err = validateField(field, val, fieldSchema);
    if (err) {
      errors.push(err);
    } else if (val !== undefined && val !== null && val !== '') {
      // Sanitize and coerce
      let processed = val;
      if (fieldSchema.type === 'number') {
        processed = typeof val === 'string' ? parseFloat(val) : val;
      } else if (fieldSchema.type === 'boolean') {
        processed = typeof val === 'string' ? val === 'true' : val;
      } else if (fieldSchema.type === 'phone') {
        processed = typeof val === 'string' ? val.replace(/[\s()-]/g, '') : val;
      }
      const shouldSanitize = fieldSchema.sanitize !== false && ['string', 'email', 'phone', 'url'].includes(fieldSchema.type);
      cleaned[field] = sanitizeValue(processed, shouldSanitize);
    }
  }

  // Pass through any extra fields that aren't in the schema (for backward compat
  // with frontend forms that send metadata like reference, status, currency, etc.)
  // These are server-generated anyway, so we strip them to prevent client-side injection
  // Only allow known safe extra fields
  const safeExtraFields = ['campaignId', 'additionalTravelers', 'specialRequests', 'nationality'];
  for (const field of safeExtraFields) {
    if (body[field] !== undefined && cleaned[field] === undefined) {
      const val = body[field];
      if (typeof val === 'string' && val.length < 5000) {
        cleaned[field] = sanitizeValue(val, true);
      } else if (typeof val === 'number') {
        cleaned[field] = val;
      }
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Validation failed', details: errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return { ok: true, data: cleaned };
}

/**
 * Helper to parse and validate a JSON request body.
 * Returns { ok, data, response } - if ok is false, return response directly.
 */
export async function parseAndValidate(request: Request, schema: Schema): Promise<ValidationResult> {
  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  return validateBody(body, schema);
}

/**
 * Validate query parameters against a schema.
 */
export function validateQuery(url: URL, schema: Schema): ValidationResult {
  const body: Record<string, any> = {};
  for (const key of Object.keys(schema)) {
    const val = url.searchParams.get(key);
    if (val !== null) body[key] = val;
  }
  return validateBody(body, schema);
}

/**
 * JSON response helper.
 */
export function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Error response helper.
 */
export function errorResponse(error: string, status = 400): Response {
  return jsonResponse({ error }, status);
}
