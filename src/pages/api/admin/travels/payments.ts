import type { APIRoute } from 'astro';
import { lightbase } from '../../../../lib/lightbase';
import { getSessionCookieValue, hasAccess } from '../../../../lib/auth';

export const GET: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'travels')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const id = url.searchParams.get('id');
    if (id) {
      const doc = await lightbase.getById('travels_payments', id);
      return new Response(JSON.stringify(doc?.document || {}), { headers: { 'Content-Type': 'application/json' } });
    }
    const bookingId = url.searchParams.get('bookingId');
    const filter = bookingId ? { field: 'bookingId', op: 'eq', value: bookingId } : undefined;
    const result = await lightbase.query('travels_payments', { filter, sort: '_created_at:desc', limit: 100 });
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'travels')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    if (!body.bookingId) {
      return new Response(JSON.stringify({ error: 'Booking ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    body.reference = body.reference || 'PAY-' + Date.now().toString(36).toUpperCase();
    body.createdAt = new Date().toISOString();
    if (body.status === 'completed') body.paidAt = new Date().toISOString();
    const result = await lightbase.insert('travels_payments', body);

    // Update booking payment status
    if (body.status === 'completed') {
      try {
        const booking = await lightbase.getById('travels_bookings', body.bookingId);
        const b = booking?.document as any;
        if (b) {
          const newPaid = (b.paidAmount || 0) + (body.amount || 0);
          const newStatus = newPaid >= (b.totalAmount || 0) ? 'paid' : 'partial';
          await lightbase.update('travels_bookings', body.bookingId, { paidAmount: newPaid, paymentStatus: newStatus });
        }
      } catch {}
    }

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
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const body = await request.json();
    body.updatedAt = new Date().toISOString();
    const result = await lightbase.update('travels_payments', id, body);
    return new Response(JSON.stringify({ success: true, document: result.document }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
