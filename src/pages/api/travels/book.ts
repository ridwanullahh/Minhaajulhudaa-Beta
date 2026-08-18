import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';
import { parseAndValidate, jsonResponse, errorResponse } from '../../../lib/validate';

export const POST: APIRoute = async ({ request }) => {
  try {
    const result = await parseAndValidate(request, {
      customerName: { type: 'string', required: true, maxLength: 200 },
      customerEmail: { type: 'email', required: true, maxLength: 200 },
      customerPhone: { type: 'phone', required: true },
      packageSlug: { type: 'string', required: true, maxLength: 200 },
      startDate: { type: 'date', required: true },
      travelerCount: { type: 'number', required: true, min: 1, max: 50 },
      nationality: { type: 'string', required: false, maxLength: 100 },
      additionalTravelers: { type: 'string', required: false, maxLength: 5000 },
      specialRequests: { type: 'string', required: false, maxLength: 2000 },
    });

    if (!result.ok) return result.response!;
    const body = result.data!;

    // Get package details
    const pkgResult = await lightbase.findOne('travels_packages', { field: 'slug', op: 'eq', value: body.packageSlug });
    if (!pkgResult) {
      return errorResponse('Package not found', 404);
    }

    // Generate booking number and customer ID
    body.bookingNumber = 'MHS-TRV/' + new Date().getFullYear() + '/' + Date.now().toString(36).toUpperCase();
    body.customerId = 'CUST-' + Date.now().toString(36).toUpperCase();
    body.packageId = pkgResult.id;
    body.packageTitle = pkgResult.title;
    body.status = 'pending';
    body.paymentStatus = 'unpaid';
    body.currency = 'NGN';
    body.bookedAt = new Date().toISOString();

    // Calculate total
    body.totalAmount = (pkgResult.basePrice || 0) * body.travelerCount;
    body.paidAmount = 0;

    const insertResult = await lightbase.insert('travels_bookings', body);

    // Upsert customer record
    try {
      await lightbase.upsert('travels_customers', { field: 'email', op: 'eq', value: body.customerEmail }, {
        email: body.customerEmail,
        name: body.customerName,
        phone: body.customerPhone,
        nationality: body.nationality || 'Nigerian',
        totalBookings: 1,
        totalSpent: body.totalAmount,
        lastBookingAt: body.bookedAt,
        firstBookingAt: body.bookedAt,
      });
    } catch { /* customer upsert non-critical */ }

    return jsonResponse({
      success: true,
      bookingNumber: body.bookingNumber,
      totalAmount: body.totalAmount,
      document: insertResult.document,
    }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Internal server error', 500);
  }
};
