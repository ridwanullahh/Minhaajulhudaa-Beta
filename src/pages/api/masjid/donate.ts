import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['donorName', 'donorEmail', 'amount', 'category'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Validate amount
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount < 100) {
      return new Response(JSON.stringify({ error: 'Amount must be at least ₦100' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate category
    const validCategories = ['zakaat', 'sadaqah', 'waqf', 'construction', 'operational', 'emergency'];
    if (!validCategories.includes(body.category)) {
      return new Response(JSON.stringify({ error: 'Invalid donation category' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate reference if not provided
    if (!body.reference) {
      body.reference = 'MAS-DON-' + Date.now().toString(36).toUpperCase();
    }
    body.status = 'pending';
    body.currency = 'NGN';
    body.method = body.method || 'card';
    body.isAnonymous = body.isAnonymous || false;
    body.donatedAt = body.donatedAt || new Date().toISOString();
    body.amount = amount;

    const result = await lightbase.insert('masjid_donations', body);

    // In production, here we would initialize Paystack payment
    // and return the authorization URL for the client to redirect to

    return new Response(JSON.stringify({
      success: true,
      reference: body.reference,
      document: result.document,
      message: 'Donation initiated. In production, you would be redirected to Paystack.',
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
