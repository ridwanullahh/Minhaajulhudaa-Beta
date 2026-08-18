/**
 * GET /api/payments/verify?reference=REF
 * Verify a Paystack payment (called after redirect)
 */
import type { APIRoute } from 'astro';
import { verifyPayment, updateTransactionStatus } from '../../../lib/paystack';

export const GET: APIRoute = async ({ url }) => {
  try {
    const reference = url.searchParams.get('reference');
    if (!reference) {
      return new Response(JSON.stringify({ error: 'reference query param is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await verifyPayment(reference);

    // Update transaction in DB
    await updateTransactionStatus(reference, result.status, {
      paystackTransactionId: result.transactionId,
      paidAt: result.paidAt,
    });

    // Send confirmation email if successful
    if (result.status === 'success') {
      try {
        const { sendPlatformEmail } = await import('../../../lib/email');
        await sendPlatformEmail(result.metadata?.platform || 'general', 'payment_receipt', {
          email: result.customerEmail,
          variables: {
            name: result.customerEmail,
            amount: result.amount.toLocaleString(),
            currency: result.currency,
            reference: result.reference,
            platform: (result.metadata?.platform || '').charAt(0).toUpperCase() + (result.metadata?.platform || '').slice(1),
            date: new Date().toLocaleDateString(),
          },
        });
      } catch {
        // Email failure should not block payment verification
      }
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Verification failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
