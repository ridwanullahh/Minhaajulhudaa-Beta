import type { APIRoute } from 'astro';
import { lightbase } from '../../../../lib/lightbase';
import { getSessionCookieValue, hasAccess } from '../../../../lib/auth';

const VALID_STATUSES = ['pending', 'reviewed', 'accepted', 'rejected'];

export const GET: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'school')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    if (id) {
      const doc = await lightbase.getById('school_admission_applications', id);
      return new Response(JSON.stringify(doc?.document || {}), { headers: { 'Content-Type': 'application/json' } });
    }

    const status = url.searchParams.get('status');
    const filter = status ? { field: 'status', op: 'eq', value: status } : undefined;
    const result = await lightbase.query('school_admission_applications', {
      filter,
      sort: 'submittedAt:desc',
      limit: 200,
    });
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'school')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    const { id, status, ...rest } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return new Response(JSON.stringify({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const patch: Record<string, any> = { ...rest, updatedAt: new Date().toISOString() };
    if (status) patch.status = status;
    if (status === 'accepted') patch.acceptedAt = new Date().toISOString();
    if (status === 'rejected') patch.rejectedAt = new Date().toISOString();
    patch.reviewedBy = session.email;

    const result = await lightbase.update('school_admission_applications', id, patch);
    return new Response(JSON.stringify({ success: true, document: result.document }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
