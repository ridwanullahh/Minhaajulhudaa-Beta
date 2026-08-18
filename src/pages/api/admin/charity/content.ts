import type { APIRoute } from 'astro';
import { lightbase } from '../../../../lib/lightbase';
import { getSessionCookieValue, hasAccess } from '../../../../lib/auth';

export const GET: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'charity')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    const collection = url.searchParams.get('collection');
    if (!collection) {
      return new Response(JSON.stringify({ error: 'Collection is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (id) {
      const doc = await lightbase.getById(collection, id);
      return new Response(JSON.stringify(doc?.document || {}), { headers: { 'Content-Type': 'application/json' } });
    }
    const result = await lightbase.query(collection, { sort: 'createdAt:desc', limit: 100 });
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'charity')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const contentType = request.headers.get('Content-Type') || '';
    let body: Record<string, any>;

    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData();
      body = {};
      fd.forEach((v, k) => { body[k] = v; });
    } else {
      body = await request.json();
    }

    const collection = body.collection;
    if (!collection) {
      return new Response(JSON.stringify({ error: 'Collection is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    delete body.collection;
    body.createdAt = body.createdAt || new Date().toISOString();
    body.updatedAt = new Date().toISOString();

    const result = await lightbase.insert(collection, body);
    return new Response(JSON.stringify({ success: true, document: result.document }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const PATCH: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'charity')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const body = await request.json();
    const collection = body.collection;
    if (!collection) {
      return new Response(JSON.stringify({ error: 'Collection is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    delete body.collection;
    body.updatedAt = new Date().toISOString();

    const result = await lightbase.update(collection, id, body);
    return new Response(JSON.stringify({ success: true, document: result.document }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'charity')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    const collection = url.searchParams.get('collection');
    if (!id || !collection) {
      return new Response(JSON.stringify({ error: 'ID and collection are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await lightbase.delete(collection, id);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
