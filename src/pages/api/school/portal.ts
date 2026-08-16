import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';

export const GET: APIRoute = async ({ url }) => {
  try {
    const studentId = url.searchParams.get('studentId');
    if (!studentId) {
      return new Response(JSON.stringify({ error: 'Student ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const [studentRes, resultsRes, assignmentsRes, enrollmentsRes, paymentsRes] = await Promise.all([
      lightbase.query('school_students', { filter: { field: 'studentId', op: 'eq', value: studentId }, limit: 1 }),
      lightbase.query('school_exam_results', { filter: { field: 'studentId', op: 'eq', value: studentId }, sort: 'createdAt:desc', limit: 50 }),
      lightbase.query('school_assignments', { sort: 'dueDate:desc', limit: 20 }),
      lightbase.query('school_enrollments', { filter: { field: 'studentId', op: 'eq', value: studentId }, limit: 20 }),
      lightbase.query('school_payments', { filter: { field: 'studentId', op: 'eq', value: studentId }, sort: 'createdAt:desc', limit: 20 }),
    ]);

    const student = studentRes.data?.[0] || { studentId };

    let courses: any[] = [];
    const enrollments = enrollmentsRes.data || [];
    if (enrollments.length > 0) {
      const courseIds = enrollments.map((e: any) => e.courseId).filter(Boolean);
      for (const cid of courseIds) {
        try {
          const doc = await lightbase.getById('school_courses', cid);
          if (doc?.document) courses.push(doc.document);
        } catch { /* skip */ }
      }
    }

    return new Response(JSON.stringify({
      student,
      results: resultsRes.data || [],
      assignments: assignmentsRes.data || [],
      courses,
      payments: paymentsRes.data || [],
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
