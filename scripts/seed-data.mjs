/**
 * seed-data.mjs
 *
 * Seeds all Lightbase collections with comprehensive production data.
 * Uses the Lightbase seed API (bulk insert with dedup).
 *
 * Usage: node scripts/seed-data.mjs
 */

import 'dotenv/config';
import { sharedSeedData } from './seed/shared.mjs';
import { schoolSeedData } from './seed/school.mjs';
import { masjidSeedData } from './seed/masjid.mjs';
import { charitySeedData } from './seed/charity.mjs';
import { travelsSeedData } from './seed/travels.mjs';

const BASE_URL = process.env.LIGHTBASE_BASE_URL || 'http://lightbase.80.225.189.74.sslip.io';
const API_KEY = process.env.LIGHTBASE_API_KEY;
const PROJECT_ID = process.env.LIGHTBASE_PROJECT_ID || 'minhaajulhuda-beta';

if (!API_KEY) {
  console.error('ERROR: LIGHTBASE_API_KEY environment variable is required');
  process.exit(1);
}

const allSeedData = [
  { platform: 'shared', data: sharedSeedData },
  { platform: 'school', data: schoolSeedData },
  { platform: 'masjid', data: masjidSeedData },
  { platform: 'charity', data: charitySeedData },
  { platform: 'travels', data: travelsSeedData },
];

async function seedCollection(collection, documents, dedupOn = []) {
  if (!documents || documents.length === 0) {
    return { inserted: 0, skipped: 0, errors: [] };
  }

  // Sanitize: convert empty strings to null for optional fields
  // Lightbase validates URL/email/phone fields strictly - empty strings fail
  const sanitizedDocs = documents.map(doc => {
    const cleaned = {};
    for (const [key, value] of Object.entries(doc)) {
      // Remove empty string values for URL, email, phone fields
      if (value === '' || value === undefined) {
        continue; // Omit empty fields entirely
      }
      cleaned[key] = value;
    }
    return cleaned;
  });

  const response = await fetch(
    `${BASE_URL}/api/v1/projects/${PROJECT_ID}/seed`,
    {
      method: 'POST',
      headers: {
        apikey: API_KEY,
        'x-lightbase-project': PROJECT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collection, documents: sanitizedDocs, dedupOn }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Seed failed for ${collection}: ${response.status} ${errorBody}`);
  }

  return response.json();
}

async function main() {
  console.log('=== Minhaajulhudaa Database Seeding ===');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Project: ${PROJECT_ID}`);
  console.log('');

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const results = [];

  for (const { platform, data } of allSeedData) {
    console.log(`\n--- Seeding ${platform} platform ---`);
    for (const [collection, documents] of Object.entries(data)) {
      // Determine dedup fields
      let dedupOn = [];
      if (collection.includes('admins') || collection.includes('donors') || collection.includes('customers') || collection.includes('volunteers')) {
        dedupOn = ['email'];
      } else if (collection.includes('pages') || collection.includes('blog_posts') || collection.includes('campaigns') || collection.includes('packages') || collection.includes('courses') || collection.includes('programs') || collection.includes('products') || collection.includes('success_stories') || collection.includes('resources') || collection.includes('wiki_articles')) {
        dedupOn = ['slug'];
      } else if (collection.includes('students') || collection.includes('staff')) {
        dedupOn = ['studentId', 'staffId'];
      } else if (collection.includes('prayer_times')) {
        dedupOn = ['date'];
      } else if (collection.includes('settings')) {
        dedupOn = ['platform'];
      } else if (collection.includes('applications')) {
        dedupOn = ['applicationId'];
      } else if (collection.includes('orders') || collection.includes('bookings') || collection.includes('invoices')) {
        dedupOn = ['orderNumber', 'bookingNumber', 'invoiceNumber'];
      } else if (collection.includes('donations') || collection.includes('payments')) {
        dedupOn = ['reference'];
      } else if (collection.includes('testimonials') || collection.includes('reviews')) {
        dedupOn = ['authorName', 'customerName'];
      }

      try {
        const result = await seedCollection(collection, documents, dedupOn);
        const inserted = result.inserted || 0;
        const skipped = result.skipped || 0;
        const errors = result.errors || [];
        totalInserted += inserted;
        totalSkipped += skipped;
        totalErrors += errors.length;

        const status = errors.length > 0 ? 'PARTIAL' : 'OK';
        console.log(`  [${status}] ${collection}: ${inserted} inserted, ${skipped} skipped${errors.length ? `, ${errors.length} errors` : ''}`);
        results.push({ collection, inserted, skipped, errors });
      } catch (err) {
        console.error(`  [FAIL] ${collection}: ${err.message}`);
        totalErrors++;
        results.push({ collection, error: err.message });
      }
    }
  }

  console.log('\n=== Seeding Summary ===');
  console.log(`Total inserted: ${totalInserted}`);
  console.log(`Total skipped:  ${totalSkipped}`);
  console.log(`Total errors:   ${totalErrors}`);

  if (totalErrors > 0) {
    console.log('\nErrors detail:');
    results.filter(r => r.errors?.length || r.error).forEach(r => {
      console.log(`  ${r.collection}: ${r.error || JSON.stringify(r.errors)}`);
    });
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
