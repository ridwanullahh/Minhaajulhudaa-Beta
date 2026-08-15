import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const required = ['customerName', 'customerEmail', 'customerPhone', 'packageSlug', 'startDate', 'travelerCount'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Get package details
    const pkgResult = await lightbase.findOne('travels_packages', { field: 'slug', op: 'eq', value: body.packageSlug });
    if (!pkgResult) {
      return new Response(JSON.stringify({ error: 'Package not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate booking number
    if (!body.bookingNumber) {
      body.bookingNumber = 'MHS-TRV/' + new Date().getFullYear() + '/' + Date.now().toString(36).toUpperCase();
    }

    body.packageId = pkgResult.id;
    body.packageTitle = pkgResult.title;
    body.status = 'pending';
    body.paymentStatus = 'unpaid';
    body.currency = 'NGN';
    body.bookedAt = body.bookedAt || new Date().toISOString();

    // Calculate total
    const count = parseInt(body.travelerCount) || 1;
    body.totalAmount = pkgResult.basePrice * count;
    body.paidAmount = 0;

    const result = await lightbase.insert('travels_bookings', body);

    // Upsert customer record
    await lightbase.upsert('travels_customers', { field: 'email', op: 'eq', value: body.customerEmail }, {
      email: body.customerEmail,
      name: body.customerName,
      phone: body.customerPhone,
      nationality: body.nationality || 'Nigerian',
      totalBookings: 1,
      totalSpent: body.totalAmount,
      lastBookingAt: body.bookedAt,
      firstBookingAt: body.bookedAt,
    }).catch(() => {}); // Ignore errors for simplicity

    return new Response(JSON.stringify({
      success: true,
      bookingNumber: body.bookingNumber,
      totalAmount: body.totalAmount,
      document: result.document,
    }), {
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
