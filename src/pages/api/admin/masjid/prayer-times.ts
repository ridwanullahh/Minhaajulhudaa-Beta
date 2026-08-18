import type { APIRoute } from 'astro';
import { lightbase } from '../../../../lib/lightbase';
import { getSessionCookieValue, hasAccess } from '../../../../lib/auth';

export const GET: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'masjid')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const date = url.searchParams.get('date');
    const month = url.searchParams.get('month');

    if (date) {
      const doc = await lightbase.findOne('masjid_prayer_times', { field: 'date', op: 'eq', value: date });
      return new Response(JSON.stringify(doc || {}), { headers: { 'Content-Type': 'application/json' } });
    }

    const params: any = { sort: 'date:asc', limit: 35 };
    if (month) {
      const [y, m] = month.split('-').map(Number);
      const start = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      params.filter = { field: 'date', op: 'between', value: [start, end] };
    }

    const result = await lightbase.query('masjid_prayer_times', params);
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
    if (!body.date) {
      return new Response(JSON.stringify({ error: 'Date is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Upsert: check if entry exists for this date
    const existing = await lightbase.findOne('masjid_prayer_times', { field: 'date', op: 'eq', value: body.date });
    if (existing) {
      body.updatedAt = new Date().toISOString();
      const result = await lightbase.update('masjid_prayer_times', existing.id, body, existing._revision);
      return new Response(JSON.stringify({ success: true, document: result.document }), { headers: { 'Content-Type': 'application/json' } });
    }

    body.createdAt = new Date().toISOString();
    body.updatedAt = new Date().toISOString();
    const result = await lightbase.insert('masjid_prayer_times', body);
    return new Response(JSON.stringify({ success: true, document: result.document }), { status: 201, headers: { 'Content-Type': 'application/json' } });
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
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await lightbase.delete('masjid_prayer_times', id);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
