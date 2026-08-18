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
    const action = url.searchParams.get('action');
    const id = url.searchParams.get('id');

    if (action === 'results') {
      if (id) {
        const doc = await lightbase.getById('school_exam_results', id);
        return new Response(JSON.stringify(doc?.document || {}), { headers: { 'Content-Type': 'application/json' } });
      }
      const result = await lightbase.query('school_exam_results', { sort: 'createdAt:desc', limit: 100 });
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (id) {
      const doc = await lightbase.getById('school_exam_schedules', id);
      return new Response(JSON.stringify(doc?.document || {}), { headers: { 'Content-Type': 'application/json' } });
    }
    const result = await lightbase.query('school_exam_schedules', { sort: 'examDate:asc', limit: 100 });
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'school')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    const action = url.searchParams.get('action');
    const collection = action === 'results' ? 'school_exam_results' : 'school_exam_schedules';
    const requiredField = action === 'results' ? 'studentName' : 'title';

    if (!body[requiredField]) {
      return new Response(JSON.stringify({ error: `${requiredField} is required` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!body.slug && body.title) {
      body.slug = slugify(body.title);
    }

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
  if (!session || !hasAccess(session, 'school')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await request.json();
    const action = url.searchParams.get('action');
    const collection = action === 'results' ? 'school_exam_results' : 'school_exam_schedules';

    body.updatedAt = new Date().toISOString();
    if (body.title) {
      body.slug = slugify(body.title);
    }

    const result = await lightbase.update(collection, id, body);
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

    const action = url.searchParams.get('action');
    const collection = action === 'results' ? 'school_exam_results' : 'school_exam_schedules';

    await lightbase.delete(collection, id);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
