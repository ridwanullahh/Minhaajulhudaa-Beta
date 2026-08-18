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
    if (id) {
      const doc = await lightbase.getById('charity_impact_metrics', id);
      return new Response(JSON.stringify(doc?.document || {}), { headers: { 'Content-Type': 'application/json' } });
    }
    const result = await lightbase.query('charity_impact_metrics', { sort: 'value:desc', limit: 100 });
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
    const body = await request.json();
    if (!body.metricLabel || !body.metricKey) {
      return new Response(JSON.stringify({ error: 'metricLabel and metricKey are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    body.value = Number(body.value) || 0;
    body.createdAt = new Date().toISOString();
    body.updatedAt = new Date().toISOString();

    // Check if metric key already exists and update instead
    const existing = await lightbase.findOne('charity_impact_metrics', { field: 'metricKey', op: 'eq', value: body.metricKey });
    if (existing) {
      const result = await lightbase.update('charity_impact_metrics', existing.id, {
        value: body.value,
        metricLabel: body.metricLabel,
        category: body.category,
        updatedAt: new Date().toISOString(),
      });
      return new Response(JSON.stringify({ success: true, updated: true, document: result.document }), { headers: { 'Content-Type': 'application/json' } });
    }

    const result = await lightbase.insert('charity_impact_metrics', body);
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
    if (body.value !== undefined) body.value = Number(body.value);
    body.updatedAt = new Date().toISOString();

    const result = await lightbase.update('charity_impact_metrics', id, body);
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
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await lightbase.delete('charity_impact_metrics', id);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
