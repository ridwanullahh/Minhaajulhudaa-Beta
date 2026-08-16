import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';
import { slugify } from '../../../lib/utils';

export const GET: APIRoute = async ({ url }) => {
  try {
    const reference = url.searchParams.get('reference');
    if (reference) {
      const result = await lightbase.query('school_orders', {
        filter: { field: 'reference', op: 'eq', value: reference },
        limit: 1,
      });
      const order = result.data?.[0];
      if (!order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify(order), { headers: { 'Content-Type': 'application/json' } });
    }
    const studentId = url.searchParams.get('studentId');
    if (studentId) {
      const result = await lightbase.query('school_orders', {
        filter: { field: 'studentId', op: 'eq', value: studentId },
        sort: 'createdAt:desc',
        limit: 50,
      });
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }
    const result = await lightbase.query('school_orders', { sort: 'createdAt:desc', limit: 100 });
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.phone || !body.address) {
      return new Response(JSON.stringify({ error: 'Name, email, phone, and address are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart items are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    body.status = body.paymentMethod === 'bank_transfer' ? 'awaiting_payment' : 'pending';
    body.createdAt = new Date().toISOString();
    body.updatedAt = new Date().toISOString();
    body.reference = body.reference || ('SCH-ORD-' + Date.now().toString(36).toUpperCase());

    const result = await lightbase.insert('school_orders', body);

    if (body.paymentMethod === 'paystack') {
      const paystackSecret = import.meta.env.PAYSTACK_SECRET_KEY;
      if (paystackSecret) {
        const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + paystackSecret, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: body.email,
            amount: Math.round(body.totalAmount * 100),
            reference: body.reference,
            metadata: { custom_fields: [{ display_name: 'Order Reference', variable_name: 'order_ref', value: body.reference }] },
          }),
        });
        const paystackData = await paystackRes.json();
        if (paystackData.status) {
          return new Response(JSON.stringify({ success: true, order: result.document, authorization_url: paystackData.data.authorization_url, access_code: paystackData.data.access_code }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, order: result.document }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
