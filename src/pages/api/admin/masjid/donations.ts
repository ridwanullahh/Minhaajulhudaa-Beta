import type { APIRoute } from 'astro';
import { lightbase } from '../../../../lib/lightbase';
import { getSessionCookieValue, hasAccess } from '../../../../lib/auth';
import { slugify } from '../../../../lib/utils';

// Campaign CRUD
export const GET: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'masjid')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type');

    if (id) {
      if (type === 'donation') {
        const doc = await lightbase.getById('masjid_donations', id);
        return new Response(JSON.stringify(doc?.document || {}), { headers: { 'Content-Type': 'application/json' } });
      }
      const doc = await lightbase.getById('masjid_donation_campaigns', id);
      return new Response(JSON.stringify(doc?.document || {}), { headers: { 'Content-Type': 'application/json' } });
    }

    if (type === 'donations') {
      const result = await lightbase.query('masjid_donations', { sort: 'donatedAt:desc', limit: 100 });
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    const result = await lightbase.query('masjid_donation_campaigns', { sort: 'createdAt:desc', limit: 100 });
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'masjid')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    if (!body.title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!body.slug) {
      body.slug = slugify(body.title);
    }
    body.createdBy = session.email;
    body.createdAt = new Date().toISOString();
    body.updatedAt = new Date().toISOString();
    body.raisedAmount = body.raisedAmount || 0;
    body.goalAmount = body.goalAmount || 0;
    body.status = body.status || 'active';

    const result = await lightbase.insert('masjid_donation_campaigns', body);
    return new Response(JSON.stringify({ success: true, document: result.document }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const PATCH: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'masjid')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const body = await request.json();
    body.updatedAt = new Date().toISOString();
    if (body.title) {
      body.slug = slugify(body.title);
    }
    const result = await lightbase.update('masjid_donation_campaigns', id, body);
    return new Response(JSON.stringify({ success: true, document: result.document }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'masjid')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const collection = type === 'donation' ? 'masjid_donations' : 'masjid_donation_campaigns';
    await lightbase.delete(collection, id);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
