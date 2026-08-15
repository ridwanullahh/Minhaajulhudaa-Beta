import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['studentFirstName', 'studentLastName', 'studentDateOfBirth', 'studentGender', 'appliedClass', 'guardianName', 'guardianPhone', 'guardianEmail', 'address'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Generate application ID if not provided
    if (!body.applicationId) {
      body.applicationId = 'MHS-APP/' + new Date().getFullYear() + '/' + Date.now().toString(36).toUpperCase();
    }
    body.status = body.status || 'pending';
    body.submittedAt = body.submittedAt || new Date().toISOString();

    const result = await lightbase.insert('school_admission_applications', body);

    return new Response(JSON.stringify({ success: true, applicationId: body.applicationId, document: result.document }), {
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
