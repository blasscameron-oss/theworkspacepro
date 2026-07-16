#!/bin/bash
# Build allowlisted Pages artifact — excludes operational files and unproven assets
# Called by Cloudflare Pages auto-build on push to main
set -e

rm -rf _site
mkdir -p _site/assets/css _site/assets/data _site/assets/fonts _site/assets/js
mkdir -p _site/assets/images _site/compare _site/embed _site/guides

echo "Building allowlisted Pages artifact..."

# Allowed CSS and data
cp -R assets/css/* _site/assets/css/
cp -R assets/data/* _site/assets/data/
cp -R assets/fonts/* _site/assets/fonts/

# Allowed JS (explicit list — no worker/, no operational scripts)
cp assets/js/analytics.js \
   assets/js/assessment.js \
   assets/js/bold.js \
   assets/js/build-your-office.js \
   assets/js/compare-matrix.js \
   assets/js/enhancements.js \
   assets/js/height-math.js \
   assets/js/perf-lite.js \
   assets/js/review-injector.js \
   assets/js/site.js \
   _site/assets/js/

# Allowed images (favicon + OG only; no product thumbnails)
cp assets/images/favicon.svg assets/images/og-default.jpg _site/assets/images/

# Allowed directories
cp -R compare/* _site/compare/
cp -R embed/* _site/embed/
cp -R guides/* _site/guides/

# Allowed root files (HTML, feeds, config — no .md, no worker/, no handoff)
cp ./*.html ./*.xml ./*.svg _headers _redirects robots.txt _site/ 2>/dev/null || true

echo "✅ Pages artifact built in _site/"
echo "Files: $(find _site -type f | wc -l)"
