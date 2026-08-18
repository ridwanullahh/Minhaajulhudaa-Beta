/**
 * POST /api/payments/webhook
 * Paystack webhook receiver - verifies signature and updates transaction
 */
import type { APIRoute } from 'astro';
import { verifyWebhookSignature, verifyPayment, updateTransactionStatus } from '../../../lib/paystack';

export const POST: APIRoute = async ({ request }) => {
  try {
    const signature = request.headers.get('x-paystack-signature') || '';
    const body = await request.text();

    if (!verifyWebhookSignature(body, signature)) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);
    const ref = event.data?.reference;

    if (event.event === 'charge.success' && ref) {
      const result = await verifyPayment(ref);
      await updateTransactionStatus(ref, 'success', {
        paystackTransactionId: result.transactionId,
        paidAt: result.paidAt,
      });

      // Send confirmation email
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
      } catch { /* email failure should not block */ }
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('[webhook] error:', error);
    return new Response('Error', { status: 500 });
  }
};
