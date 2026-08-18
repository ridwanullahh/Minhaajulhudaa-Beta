import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';
import { parseAndValidate, jsonResponse, errorResponse } from '../../../lib/validate';

export const POST: APIRoute = async ({ request }) => {
  try {
    const result = await parseAndValidate(request, {
      studentFirstName: { type: 'string', required: true, maxLength: 100 },
      studentLastName: { type: 'string', required: true, maxLength: 100 },
      studentDateOfBirth: { type: 'date', required: true },
      studentGender: { type: 'string', required: true, enum: ['male', 'female'] },
      appliedClass: { type: 'string', required: true, maxLength: 100 },
      guardianName: { type: 'string', required: true, maxLength: 200 },
      guardianPhone: { type: 'phone', required: true },
      guardianEmail: { type: 'email', required: true, maxLength: 200 },
      address: { type: 'string', required: true, maxLength: 1000 },
      previousSchool: { type: 'string', required: false, maxLength: 200 },
      medicalConditions: { type: 'string', required: false, maxLength: 2000 },
      additionalNotes: { type: 'string', required: false, maxLength: 2000 },
    });

    if (!result.ok) return result.response!;
    const body = result.data!;

    // Generate application ID
    body.applicationId = 'MHS-APP/' + new Date().getFullYear() + '/' + Date.now().toString(36).toUpperCase();
    body.status = 'pending';
    body.submittedAt = new Date().toISOString();

    const insertResult = await lightbase.insert('school_admission_applications', body);

    return jsonResponse({ success: true, applicationId: body.applicationId, document: insertResult.document }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Internal server error', 500);
  }
};
