import type { APIRoute } from 'astro';
import { lightbase } from '../../../../lib/lightbase';
import { getSessionCookieValue, hasAccess } from '../../../../lib/auth';
import { slugify } from '../../../../lib/utils';

export const GET: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'school')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    if (id) {
      const doc = await lightbase.getById('school_classes', id);
      return new Response(JSON.stringify(doc?.document || {}), { headers: { 'Content-Type': 'application/json' } });
    }
    const result = await lightbase.query('school_classes', { sort: 'level:asc,name:asc', limit: 100 });
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'school')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();

    if (!body.name) {
      return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!body.slug) {
      body.slug = slugify(body.name);
    }

    body.createdAt = new Date().toISOString();
    body.updatedAt = new Date().toISOString();

    const result = await lightbase.insert('school_classes', body);
    return new Response(JSON.stringify({ success: true, document: result.document }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const PATCH: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'school')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json();
    body.updatedAt = new Date().toISOString();
    if (body.name) {
      body.slug = slugify(body.name);
    }

    const result = await lightbase.update('school_classes', id, body);
    return new Response(JSON.stringify({ success: true, document: result.document }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'school')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    await lightbase.delete('school_classes', id);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
