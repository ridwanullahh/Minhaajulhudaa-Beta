import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';
import { parseAndValidate, jsonResponse, errorResponse } from '../../../lib/validate';

export const POST: APIRoute = async ({ request }) => {
  try {
    const result = await parseAndValidate(request, {
      name: { type: 'string', required: true, maxLength: 200 },
      email: { type: 'email', required: true, maxLength: 200 },
      phone: { type: 'phone', required: true },
      role: { type: 'string', required: false, maxLength: 100 },
      skills: { type: 'array', required: false },
      availability: { type: 'string', required: false, maxLength: 500 },
      motivation: { type: 'string', required: false, maxLength: 2000 },
    });

    if (!result.ok) return result.response!;
    const body = result.data!;

    body.status = 'pending';
    body.joinedAt = new Date().toISOString();
    body.hoursLogged = 0;
    if (!body.skills) body.skills = [];

    const insertResult = await lightbase.insert('charity_volunteers', body);
    return jsonResponse({ success: true, document: insertResult.document }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Internal server error', 500);
  }
};
