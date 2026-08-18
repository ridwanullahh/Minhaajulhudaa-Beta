import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const required = ['name', 'email', 'phone'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    body.status = 'pending';
    body.joinedAt = body.joinedAt || new Date().toISOString();
    body.hoursLogged = 0;
    if (!body.skills) body.skills = [];
    const result = await lightbase.insert('charity_volunteers', body);
    return new Response(JSON.stringify({ success: true, document: result.document }), {
      status: 201, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
