#!/bin/bash
# Build allowlisted Pages artifact — excludes operational files and unproven assets
# Called by local verification and GitHub Actions
set -euo pipefail

OUTPUT_DIR="${1:-_site}"
case "$OUTPUT_DIR" in
  _site|dist) ;;
  *)
    echo "Usage: $0 [_site|dist]" >&2
    exit 64
    ;;
  esac

rm -rf -- "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"/assets/css "$OUTPUT_DIR"/assets/data "$OUTPUT_DIR"/assets/fonts "$OUTPUT_DIR"/assets/js
mkdir -p "$OUTPUT_DIR"/assets/images "$OUTPUT_DIR"/compare "$OUTPUT_DIR"/embed "$OUTPUT_DIR"/guides

echo "Building allowlisted Pages artifact..."

# Allowed CSS and data
cp -R assets/css/* "$OUTPUT_DIR"/assets/css/
cp -R assets/data/* "$OUTPUT_DIR"/assets/data/
cp -R assets/fonts/* "$OUTPUT_DIR"/assets/fonts/

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
   "$OUTPUT_DIR"/assets/js/

# Allowed images (favicon + OG only; no product thumbnails)
cp assets/images/favicon.svg assets/images/og-default.jpg "$OUTPUT_DIR"/assets/images/

# Allowed directories
cp -R compare/* "$OUTPUT_DIR"/compare/
cp -R embed/* "$OUTPUT_DIR"/embed/
cp -R guides/* "$OUTPUT_DIR"/guides/

# Allowed root files (HTML, feeds, config — no .md, no worker/, no handoff)
cp ./*.html ./*.xml ./*.svg _headers _redirects robots.txt "$OUTPUT_DIR"/ 2>/dev/null || true

echo "✅ Pages artifact built in ${OUTPUT_DIR}/"
echo "Files: $(find "$OUTPUT_DIR" -type f | wc -l)"
