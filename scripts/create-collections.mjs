/**
 * create-collections.mjs
 *
 * Creates all collection schemas in Lightbase for the Minhaajulhudaa platform.
 * Idempotent: skips collections that already exist.
 *
 * Usage: node scripts/create-collections.mjs
 */

import 'dotenv/config';
import { sharedSchemas } from './schemas/shared.mjs';
import { schoolSchemas } from './schemas/school.mjs';
import { masjidSchemas } from './schemas/masjid.mjs';
import { charitySchemas } from './schemas/charity.mjs';
import { travelsSchemas } from './schemas/travels.mjs';

const BASE_URL = process.env.LIGHTBASE_BASE_URL || 'http://lightbase.80.225.189.74.sslip.io';
const API_KEY = process.env.LIGHTBASE_API_KEY;
const PROJECT_ID = process.env.LIGHTBASE_PROJECT_ID || 'minhaajulhuda-beta';

if (!API_KEY) {
  console.error('ERROR: LIGHTBASE_API_KEY environment variable is required');
  process.exit(1);
}

const allSchemas = [
  ...sharedSchemas,
  ...schoolSchemas,
  ...masjidSchemas,
  ...charitySchemas,
  ...travelsSchemas,
];

async function listExistingCollections() {
  const response = await fetch(
    `${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections`,
    {
      headers: {
        apikey: API_KEY,
        'x-lightbase-project': PROJECT_ID,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to list collections: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  return new Set(data.collections.map((c) => c.name));
}

async function createCollection(schema) {
  const response = await fetch(
    `${BASE_URL}/api/v1/projects/${PROJECT_ID}/collections`,
    {
      method: 'POST',
      headers: {
        apikey: API_KEY,
        'x-lightbase-project': PROJECT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schema),
    }
  );
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create collection ${schema.name}: ${response.status} ${errorBody}`);
  }
  return response.json();
}

async function main() {
  console.log('=== Minhaajulhudaa Collection Creation ===');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Total schemas to create: ${allSchemas.length}`);
  console.log('');

  // Health check
  const healthResp = await fetch(`${BASE_URL}/health`);
  if (!healthResp.ok) {
    console.error('ERROR: Lightbase health check failed');
    process.exit(1);
  }
  const health = await healthResp.json();
  console.log(`Health: ${health.status} (v${health.version})`);
  console.log('');

  // Get existing collections
  console.log('Checking existing collections...');
  const existing = await listExistingCollections();
  console.log(`Found ${existing.size} existing collections.`);
  console.log('');

  // Create missing collections
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const schema of allSchemas) {
    if (existing.has(schema.name)) {
      console.log(`  [SKIP] ${schema.name} (already exists)`);
      skipped++;
      continue;
    }
    try {
      await createCollection(schema);
      console.log(`  [OK]   ${schema.name} (${schema.fields.length} fields)`);
      created++;
    } catch (err) {
      console.error(`  [FAIL] ${schema.name}: ${err.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed:  ${failed}`);
  console.log(`Total:   ${allSchemas.length}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
