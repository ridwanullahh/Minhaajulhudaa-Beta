import type { APIRoute } from 'astro';
import { lightbase } from '../../../../lib/lightbase';
import { getSessionCookieValue, hasAccess } from '../../../../lib/auth';

export const GET: APIRoute = async ({ request, url }) => {
  const session = getSessionCookieValue(request);
  if (!session || !hasAccess(session, 'charity')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const period = url.searchParams.get('period') || 'all';
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString(), 10);
    const month = parseInt(url.searchParams.get('month') || '0', 10);

    const result = await lightbase.query('charity_donations', { sort: 'createdAt:desc', limit: 10000 });
    let donations = result.data || [];

    if (period === 'month' && month > 0) {
      const startOfMonth = new Date(year, month - 1, 1).toISOString();
      const endOfMonth = new Date(year, month, 0, 23, 59, 59).toISOString();
      donations = donations.filter((d: any) => d.createdAt >= startOfMonth && d.createdAt <= endOfMonth);
    } else if (period === 'year') {
      const startOfYear = new Date(year, 0, 1).toISOString();
      const endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString();
      donations = donations.filter((d: any) => d.createdAt >= startOfYear && d.createdAt <= endOfYear);
    }

    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

    // Top categories
    const categoryMap: Record<string, number> = {};
    donations.forEach((d: any) => {
      const cat = d.category || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + (d.amount || 0);
    });
    const topCategories = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly breakdown
    const monthlyMap: Record<string, { amount: number; count: number }> = {};
    donations.forEach((d: any) => {
      const dt = new Date(d.createdAt);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { amount: 0, count: 0 };
      monthlyMap[key].amount += d.amount || 0;
      monthlyMap[key].count += 1;
    });
    const monthlyBreakdown = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, amount: data.amount, count: data.count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return new Response(JSON.stringify({
      totalDonations,
      totalAmount,
      averageDonation,
      topCategories,
      monthlyBreakdown,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
