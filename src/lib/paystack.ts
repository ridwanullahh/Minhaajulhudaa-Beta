/**
 * Paystack payment service - server-side only
 * All Paystack API calls happen here; the secret key never reaches the client.
 */

const _env = () => ({
  SECRET_KEY: import.meta.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY || '',
  PUBLIC_KEY: import.meta.env.PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || '',
  BASE_URL: 'https://api.paystack.co',
});

export interface PaystackInitResult {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
}

export interface PaystackVerifyResult {
  status: 'success' | 'failed' | 'abandoned';
  reference: string;
  amount: number;
  currency: string;
  transactionId: string;
  paidAt: string;
  customerEmail: string;
  metadata: Record<string, any>;
}

function headers(): Record<string, string> {
  const { SECRET_KEY } = _env();
  return {
    'Authorization': `Bearer ${SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

export function isConfigured(): boolean {
  const { SECRET_KEY } = _env();
  return Boolean(SECRET_KEY);
}

export function generateReference(platform: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${platform.toUpperCase()}-${timestamp}-${random}`;
}

/**
 * Initialize a Paystack transaction
 */
export async function initializePayment(params: {
  email: string;
  amount: number; // in Naira (will be converted to kobo)
  currency?: string;
  reference?: string;
  platform: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}): Promise<PaystackInitResult> {
  if (!isConfigured()) {
    throw new Error('Paystack is not configured. Set PAYSTACK_SECRET_KEY env var.');
  }

  const { BASE_URL } = _env();
  const reference = params.reference || generateReference(params.platform);

  const response = await fetch(`${BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // Convert to kobo
      currency: params.currency || 'NGN',
      reference,
      callback_url: params.callbackUrl,
      metadata: {
        platform: params.platform,
        ...params.metadata,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Paystack init failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(`Paystack init failed: ${data.message}`);
  }

  return {
    reference: data.data.reference,
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
  };
}

/**
 * Verify a Paystack transaction
 */
export async function verifyPayment(reference: string): Promise<PaystackVerifyResult> {
  if (!isConfigured()) {
    throw new Error('Paystack is not configured');
  }

  const { BASE_URL } = _env();
  const response = await fetch(`${BASE_URL}/transaction/verify/${reference}`, {
    headers: headers(),
  });

  if (!response.ok) {
    throw new Error(`Paystack verify failed: ${response.status}`);
  }

  const data = await response.json();
  const tx = data.data;

  let status: PaystackVerifyResult['status'] = 'failed';
  if (tx.status === 'success') status = 'success';
  else if (tx.status === 'abandoned') status = 'abandoned';

  return {
    status,
    reference: tx.reference,
    amount: tx.amount / 100,
    currency: tx.currency,
    transactionId: tx.id.toString(),
    paidAt: tx.paid_at,
    customerEmail: tx.customer?.email || '',
    metadata: tx.metadata || {},
  };
}

/**
 * Verify Paystack webhook signature
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const { SECRET_KEY } = _env();
  const crypto = require('node:crypto');
  const expected = crypto.createHmac('sha512', SECRET_KEY).update(body).digest('hex');
  const expectedBuf = Buffer.from(expected);
  const sigBuf = Buffer.from(signature);
  if (expectedBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, sigBuf);
}

/**
 * Refund a transaction
 */
export async function refundTransaction(transactionId: string, amount?: number): Promise<boolean> {
  if (!isConfigured()) {
    throw new Error('Paystack is not configured');
  }

  const { BASE_URL } = _env();
  const body: any = { transaction: transactionId };
  if (amount) body.amount = Math.round(amount * 100);

  const response = await fetch(`${BASE_URL}/refund`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!response.ok) return false;
  const data = await response.json();
  return data.status === true;
}

/**
 * Record transaction in Lightbase
 */
import { lightbase } from './lightbase';

export async function recordTransaction(tx: {
  reference: string;
  platform: string;
  type: string;
  amount: number;
  currency: string;
  email: string;
  status: string;
  metadata?: Record<string, any>;
  transactionId?: string;
  paidAt?: string;
}) {
  await lightbase.insert('transactions', {
    reference: tx.reference,
    platform: tx.platform,
    type: tx.type,
    amount: tx.amount,
    currency: tx.currency || 'NGN',
    email: tx.email,
    status: tx.status,
    metadata: tx.metadata || {},
    paystackTransactionId: tx.transactionId || '',
    paidAt: tx.paidAt || '',
    createdAt: new Date().toISOString(),
  });
}

export async function updateTransactionStatus(reference: string, status: string, data?: Record<string, any>) {
  const tx = await lightbase.findOne('transactions', { field: 'reference', op: 'eq', value: reference });
  if (tx) {
    await lightbase.update('transactions', tx.id, { status, ...data, updatedAt: new Date().toISOString() });
  }
}