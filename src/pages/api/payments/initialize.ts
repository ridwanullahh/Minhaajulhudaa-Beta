/**
 * POST /api/payments/initialize
 * Initialize a Paystack payment (server-side, per-platform)
 */
import type { APIRoute } from 'astro';
import { initializePayment, recordTransaction } from '../../../lib/paystack';
import { getSessionCookieValue, requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = getSessionCookieValue(request);
    const body = await request.json();
    const { email, amount, platform, type, metadata, callbackUrl } = body;

    if (!email || !amount || !platform) {
      return new Response(JSON.stringify({ error: 'email, amount, and platform are required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await initializePayment({
      email,
      amount: Number(amount),
      platform,
      metadata: { type: type || 'payment', ...metadata },
      callbackUrl: callbackUrl || `${new URL(request.url).origin}/${platform}/payments?reference=REF_REFERENCE`,
    });

    // Record pending transaction
    await recordTransaction({
      reference: result.reference,
      platform,
      type: type || 'payment',
      amount: Number(amount),
      currency: 'NGN',
      email,
      status: 'pending',
      metadata,
    });

    return new Response(JSON.stringify({
      success: true,
      reference: result.reference,
      authorizationUrl: result.authorizationUrl,
      accessCode: result.accessCode,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Payment initialization failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
