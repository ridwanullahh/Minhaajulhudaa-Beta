// Bismillah - Patch wrangler.json for Cloudflare Pages compatibility
import fs from 'node:fs';

const wranglerPath = '/home/z/my-project/dist/server/wrangler.json';
if (!fs.existsSync(wranglerPath)) {
  console.log('wrangler.json not found, skipping patch');
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(wranglerPath, 'utf8'));

// For Pages deployment, we need to remove Worker-specific fields
// and keep only Pages-compatible configuration
delete config.main;
delete config.rules;
delete config.assets;
delete config.images;
delete config.kv_namespaces;
delete config.durable_objects;
delete config.workflows;
delete config.migrations;
delete config.exports;
delete config.cloudchamber;
delete config.send_email;
delete config.queues;
delete config.r2_buckets;
delete config.d1_databases;
delete config.vectorize;
delete config.ai_search_namespaces;
delete config.ai_search;
delete config.agent_memory;
delete config.hyperdrive;
delete config.services;
delete config.analytics_engine_datasets;
delete config.dispatch_namespaces;
delete config.mtls_certificates;
delete config.pipelines;
delete config.secrets_store_secrets;
delete config.artifacts;
delete config.unsafe_hello_world;
delete config.flagship;
delete config.worker_loaders;
delete config.ratelimits;
delete config.vpc_services;
delete config.vpc_networks;
delete config.logfwdr;
delete config.python_modules;
delete config.previews;
delete config.dev;
delete config.definedEnvironments;
delete config.triggers;
delete config.no_bundle;
delete config.topLevelName;
delete config.userConfigPath;
delete config.configPath;

// Keep only Pages-compatible fields
const pagesConfig = {
  name: config.name || 'minhaajulhudaa',
  compatibility_date: config.compatibility_date || '2024-09-23',
  compatibility_flags: config.compatibility_flags || ['nodejs_compat'],
  pages_build_output_dir: config.pages_build_output_dir || '/home/z/my-project/dist',
  vars: {
    DB_FALLBACK_ENABLED: 'true',
    DB_FALLBACK_ONLY: 'true',
    SITE_URL: 'https://minhaajulhudaa.pages.dev',
  },
  jsx_factory: config.jsx_factory,
  jsx_fragment: config.jsx_fragment,
};

fs.writeFileSync(wranglerPath, JSON.stringify(pagesConfig, null, 2));
console.log('Patched wrangler.json for Pages:');
console.log(JSON.stringify(pagesConfig, null, 2));

