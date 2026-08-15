import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const required = ['donorName', 'donorEmail', 'amount', 'category'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount < 100) {
      return new Response(JSON.stringify({ error: 'Amount must be at least ₦100' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validCategories = ['zakaat', 'sadaqah', 'waqf', 'emergency', 'general', 'water', 'food', 'orphans', 'education', 'medical', 'shelter'];
    if (!validCategories.includes(body.category)) {
      return new Response(JSON.stringify({ error: 'Invalid donation category' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.reference) {
      body.reference = 'CHR-DON-' + Date.now().toString(36).toUpperCase();
    }
    body.status = 'pending';
    body.currency = 'NGN';
    body.method = body.method || 'card';
    body.isAnonymous = body.isAnonymous || false;
    body.donatedAt = body.donatedAt || new Date().toISOString();
    body.amount = amount;

    const result = await lightbase.insert('charity_donations', body);

    // Update campaign raised amount if campaignId provided
    if (body.campaignId) {
      const campaign = await lightbase.getById('charity_campaigns', body.campaignId);
      if (campaign.document) {
        const newRaised = (campaign.document.raisedAmount || 0) + amount;
        await lightbase.update('charity_campaigns', body.campaignId, { raisedAmount: newRaised });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      reference: body.reference,
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
