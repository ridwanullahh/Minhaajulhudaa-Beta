import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';

export const GET: APIRoute = async ({ url }) => {
  try {
    const studentId = url.searchParams.get('studentId');
    if (!studentId) {
      return new Response(JSON.stringify({ error: 'Student ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const [invoices, payments] = await Promise.all([
      lightbase.query('school_invoices', {
        filter: { field: 'studentId', op: 'eq', value: studentId },
        sort: 'createdAt:desc',
        limit: 20,
      }),
      lightbase.query('school_payments', {
        filter: { field: 'studentId', op: 'eq', value: studentId },
        sort: 'createdAt:desc',
        limit: 20,
      }),
    ]);

    return new Response(JSON.stringify({
      invoices: invoices.data || [],
      payments: payments.data || [],
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body.studentId || !body.amount) {
      return new Response(JSON.stringify({ error: 'Student ID and amount are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    body.reference = body.reference || ('SCH-PAY-' + Date.now().toString(36).toUpperCase());
    body.status = 'pending';
    body.platform = 'school';
    body.createdAt = new Date().toISOString();
    body.updatedAt = new Date().toISOString();

    const paystackSecret = import.meta.env.PAYSTACK_SECRET_KEY;
    if (paystackSecret && body.paymentMethod === 'paystack') {
      const student = body.studentId;
      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + paystackSecret, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: body.email || 'admin@minhaajulhudaa.com',
          amount: Math.round(body.amount * 100),
          reference: body.reference,
          metadata: { custom_fields: [{ display_name: 'Student ID', variable_name: 'student_id', value: student }] },
        }),
      });
      const paystackData = await paystackRes.json();
      if (paystackData.status) {
        await lightbase.insert('school_payments', body);
        return new Response(JSON.stringify({ success: true, authorization_url: paystackData.data.authorization_url, reference: body.reference }), { status: 201, headers: { 'Content-Type': 'application/json' } });
      }
    }

    const result = await lightbase.insert('school_payments', body);
    return new Response(JSON.stringify({ success: true, payment: result.document }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
