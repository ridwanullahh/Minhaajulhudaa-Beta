#!/bin/bash
# Cloudflare Pages build script
# This script is run by Cloudflare Pages when auto-deploying from GitHub.
# It builds the Astro project and prepares the output for Pages deployment.

set -e

echo "=== Minhaajulhudaa Cloudflare Pages Build ==="

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the Astro project
echo "Building Astro project..."
npm run build

# Prepare the output for Pages deployment
echo "Preparing Pages deployment output..."
node scripts/prepare-pages-deploy.mjs

echo "=== Build complete ==="
echo "The dist/ directory is ready for Cloudflare Pages deployment."
