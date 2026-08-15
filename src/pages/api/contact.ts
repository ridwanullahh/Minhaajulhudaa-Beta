import type { APIRoute } from 'astro';
import { lightbase } from '../../lib/lightbase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['platform', 'name', 'email', 'subject', 'message'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Validate platform
    const validPlatforms = ['school', 'masjid', 'charity', 'travels'];
    if (!validPlatforms.includes(body.platform)) {
      return new Response(JSON.stringify({ error: 'Invalid platform' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    body.status = 'new';
    body.createdAt = body.createdAt || new Date().toISOString();

    const result = await lightbase.insert('contact_submissions', body);

    return new Response(JSON.stringify({ success: true, document: result.document }), {
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
