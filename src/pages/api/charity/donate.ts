import type { APIRoute } from 'astro';
import { lightbase } from '../../../lib/lightbase';
import { parseAndValidate, jsonResponse, errorResponse } from '../../../lib/validate';

export const POST: APIRoute = async ({ request }) => {
  try {
    const result = await parseAndValidate(request, {
      donorName: { type: 'string', required: true, maxLength: 200 },
      donorEmail: { type: 'email', required: true, maxLength: 200 },
      amount: { type: 'number', required: true, min: 100 },
      category: { type: 'string', required: true },
      campaignId: { type: 'string', required: false, maxLength: 100 },
      method: { type: 'string', required: false, enum: ['card', 'bank_transfer', 'cash', 'mobile_money', 'ussd'] },
      isAnonymous: { type: 'boolean', required: false },
    });

    if (!result.ok) return result.response!;
    const body = result.data!;

    // Map campaign categories to donation categories
    const validCategories = ['zakaat', 'sadaqah', 'waqf', 'emergency', 'general'];
    if (!validCategories.includes(body.category)) {
      const categoryMap: Record<string, string> = {
        water: 'sadaqah', food: 'sadaqah', orphans: 'sadaqah', education: 'sadaqah',
        medical: 'emergency', shelter: 'emergency',
      };
      body.category = categoryMap[body.category] || 'general';
    }

    body.reference = 'CHR-DON-' + Date.now().toString(36).toUpperCase();
    body.status = 'pending';
    body.currency = 'NGN';
    body.method = body.method || 'card';
    body.isAnonymous = body.isAnonymous || false;
    body.donatedAt = new Date().toISOString();

    const insertResult = await lightbase.insert('charity_donations', body);

    // Update campaign raised amount if campaignId provided
    if (body.campaignId) {
      try {
        const campaign = await lightbase.getById('charity_campaigns', body.campaignId);
        if (campaign.document) {
          const newRaised = (campaign.document.raisedAmount || 0) + body.amount;
          await lightbase.update('charity_campaigns', body.campaignId, { raisedAmount: newRaised });
        }
      } catch { /* campaign update non-critical */ }
    }

    return jsonResponse({
      success: true,
      reference: body.reference,
      document: insertResult.document,
    }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Internal server error', 500);
  }
};
