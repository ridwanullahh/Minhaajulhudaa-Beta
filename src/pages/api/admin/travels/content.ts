import type { APIRoute } from 'astro';
import { lightbase } from '../../../../lib/lightbase';
import { getSessionCookieValue, hasAccess } from '../../../../lib/auth';

const ALLOWED_COLLECTIONS = [
  'travels_pages',
  'travels_pricing_rules',
  'travels_gallery',
  'travels_settings',
  'travels_resources',
];

function getCollection(url: URL): string {
  const col = url.searchParams.get('collection');
  if (col && ALLOWED_COLLECTIONS.includes(col)) return col;
  return 'travels_pages';
}

export const GET: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'travels')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const collection = getCollection(url);
    const id = url.searchParams.get('id');
    if (id) {
      const doc = await lightbase.getById(collection, id);
      return new Response(JSON.stringify(doc?.document || {}), { headers: { 'Content-Type': 'application/json' } });
    }
    const result = await lightbase.query(collection, { sort: '_created_at:desc', limit: 100 });
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'travels')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const collection = getCollection(url);
    const body = await request.json();
    body.createdAt = new Date().toISOString();
    body.updatedAt = new Date().toISOString();
    const result = await lightbase.insert(collection, body);
    return new Response(JSON.stringify({ success: true, document: result.document }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const PATCH: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'travels')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const collection = getCollection(url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const body = await request.json();
    body.updatedAt = new Date().toISOString();
    const result = await lightbase.update(collection, id, body);
    return new Response(JSON.stringify({ success: true, document: result.document }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'travels')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const collection = getCollection(url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await lightbase.delete(collection, id);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
