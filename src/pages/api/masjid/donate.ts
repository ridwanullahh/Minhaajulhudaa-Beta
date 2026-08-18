import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';
import { parseAndValidate, jsonResponse, errorResponse } from '../../../lib/validate';

export const POST: APIRoute = async ({ request }) => {
  try {
    const result = await parseAndValidate(request, {
      donorName: { type: 'string', required: true, maxLength: 200 },
      donorEmail: { type: 'email', required: true, maxLength: 200 },
      amount: { type: 'number', required: true, min: 100 },
      category: { type: 'string', required: true, enum: ['zakaat', 'sadaqah', 'waqf', 'construction', 'operational', 'emergency'] },
      method: { type: 'string', required: false, enum: ['card', 'bank_transfer', 'cash', 'mobile_money', 'ussd'] },
      isAnonymous: { type: 'boolean', required: false },
    });

    if (!result.ok) return result.response!;
    const body = result.data!;

    body.reference = 'MAS-DON-' + Date.now().toString(36).toUpperCase();
    body.status = 'pending';
    body.currency = 'NGN';
    body.method = body.method || 'card';
    body.isAnonymous = body.isAnonymous || false;
    body.donatedAt = new Date().toISOString();

    const insertResult = await lightbase.insert('masjid_donations', body);

    return jsonResponse({
      success: true,
      reference: body.reference,
      document: insertResult.document,
    }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Internal server error', 500);
  }
};
