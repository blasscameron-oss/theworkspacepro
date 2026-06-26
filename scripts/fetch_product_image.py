#!/usr/bin/env python3
"""
fetch_product_image.py — Download Amazon product images for TheWorkspacePro

Uses agent-browser (headless Chrome) to extract image URLs from Amazon product
pages, then downloads the high-res images directly from Amazon's CDN.

Usage:
  python3 scripts/fetch_product_image.py B07C2T7B68
  python3 scripts/fetch_product_image.py --batch guides/best-standing-desks-under-500.html
  python3 scripts/fetch_product_image.py --all-guides

Requirements:
  - agent-browser CLI installed
  - AGENT_BROWSER_ARGS=--no-sandbox on Linux
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parent.parent
IMAGE_DIR = SITE_ROOT / "images" / "products"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

GUIDES_DIR = SITE_ROOT / "guides"

ASIN_RE = re.compile(r'amazon\.com/dp/([A-Z0-9]{10})')

# Image URL pattern from Amazon CDN
IMG_URL_RE = re.compile(r'(https://m\.media-amazon\.com/images/I/[A-Za-z0-9]+\._[A-Z0-9_]+_\.jpg)')

# Headers for downloading images from CDN
DL_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "image/*",
}


def get_image_urls_via_browser(asin: str) -> list[str]:
    """Use agent-browser to fetch the Amazon product page and extract image URLs."""
    url = f"https://www.amazon.com/dp/{asin}"
    env = os.environ.copy()
    env["AGENT_BROWSER_ARGS"] = "--no-sandbox"

    try:
        result = subprocess.run(
            ["agent-browser", "open", url],
            capture_output=True, text=True, timeout=30, env=env
        )
        # Check if page loaded successfully
        if "Page Not Found" in result.stdout or "404" in result.stdout:
            print(f"  ✗ Product page not found for {asin}", file=sys.stderr)
            return []

        # Get page HTML
        result = subprocess.run(
            ["agent-browser", "eval", "document.documentElement.outerHTML"],
            capture_output=True, text=True, timeout=20, env=env
        )
        html = result.stdout

        # Extract unique image URLs, sorted by size (larger first)
        urls = IMG_URL_RE.findall(html)
        # Filter to unique base IDs, prefer SL1500 (largest)
        seen_ids = set()
        unique = []
        for u in urls:
            # Extract the image ID part
            img_id = re.search(r'/images/I/([A-Za-z0-9]+)\.', u)
            if img_id:
                bid = img_id.group(1)
                if bid not in seen_ids:
                    seen_ids.add(bid)
                    unique.append((bid, u))

        # Build large versions for each unique image ID
        large_urls = []
        for bid, _ in unique:
            large_urls.append(f"https://m.media-amazon.com/images/I/{bid}._AC_SL1500_.jpg")

        return large_urls

    except subprocess.TimeoutExpired:
        print(f"  ✗ Browser timeout for {asin}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"  ✗ Browser error for {asin}: {e}", file=sys.stderr)
        return []


def download_image(url: str, dest: Path) -> bool:
    """Download an image to dest using urllib."""
    import urllib.request
    req = urllib.request.Request(url, headers=DL_HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            if len(data) < 500:
                print(f"  ✗ Image too small ({len(data)} bytes)", file=sys.stderr)
                return False
            dest.write_bytes(data)
            return True
    except Exception as e:
        print(f"  ✗ Download failed: {e}", file=sys.stderr)
        return False


def make_webp(src: Path) -> Path | None:
    """Convert image to WebP."""
    webp_path = src.with_suffix(".webp")
    for cmd in [
        ["cwebp", "-q", "82", str(src), "-o", str(webp_path)],
        ["magick", str(src), "-quality", "82", str(webp_path)],
    ]:
        try:
            subprocess.run(cmd, check=True, capture_output=True, timeout=15)
            return webp_path
        except (FileNotFoundError, subprocess.CalledProcessError):
            continue
    return None


def process_asin(asin: str, webp: bool = True, max_images: int = 1) -> dict:
    """Download product image(s) for a single ASIN."""
    print(f"  → Fetching {asin}...")

    # Skip if already downloaded
    existing = IMAGE_DIR / f"{asin}.jpg"
    if existing.exists() and existing.stat().st_size > 1000:
        print(f"  ✓ {asin} already downloaded, skipping")
        return {"asin": asin, "ok": True, "jpg": str(existing.relative_to(SITE_ROOT)), "skipped": True}

    image_urls = get_image_urls_via_browser(asin)
    if not image_urls:
        return {"asin": asin, "ok": False, "error": "no image URLs found (product may be delisted)"}

    results = []
    for i, url in enumerate(image_urls[:max_images]):
        suffix = f"_{i}" if i > 0 else ""
        dest = IMAGE_DIR / f"{asin}{suffix}.jpg"
        if download_image(url, dest):
            result = {"asin": asin, "ok": True, "jpg": str(dest.relative_to(SITE_ROOT)), "url": url}
            if webp:
                webp_path = make_webp(dest)
                if webp_path:
                    result["webp"] = str(webp_path.relative_to(SITE_ROOT))
                    print(f"  ✓ {asin}{suffix}.jpg + .webp saved ({dest.stat().st_size // 1024}KB)")
                else:
                    print(f"  ✓ {asin}{suffix}.jpg saved ({dest.stat().st_size // 1024}KB)")
            else:
                print(f"  ✓ {asin}{suffix}.jpg saved ({dest.stat().st_size // 1024}KB)")
            results.append(result)
        else:
            results.append({"asin": asin, "ok": False, "error": "download failed", "url": url})

    return results[0] if results else {"asin": asin, "ok": False, "error": "no downloads"}


def extract_asins_from_html(filepath: Path) -> list[str]:
    """Extract all unique Amazon ASINs from an HTML file."""
    text = filepath.read_text(errors="replace")
    asins = ASIN_RE.findall(text)
    seen = set()
    unique = []
    for a in asins:
        if a not in seen:
            seen.add(a)
            unique.append(a)
    return unique


def batch_process(html_file: str, webp: bool = True) -> list[dict]:
    """Process all ASINs found in an HTML guide file."""
    filepath = SITE_ROOT / html_file
    if not filepath.exists():
        print(f"  ✗ File not found: {filepath}", file=sys.stderr)
        return []

    asins = extract_asins_from_html(filepath)
    if not asins:
        print(f"  — No Amazon ASINs found in {html_file}")
        return []

    print(f"\n  📂 {html_file}: {len(asins)} unique products")
    results = []
    for asin in asins:
        results.append(process_asin(asin, webp))
    return results


def process_all_guides(webp: bool = True) -> list[dict]:
    """Process all guide HTML files."""
    all_results = []
    for f in sorted(GUIDES_DIR.glob("*.html")):
        results = batch_process(str(f.relative_to(SITE_ROOT)), webp)
        all_results.extend(results)
    return all_results


def main():
    parser = argparse.ArgumentParser(description="Download Amazon product images for TheWorkspacePro")
    parser.add_argument("target", nargs="?", default=None, help="ASIN (e.g. B07C2T7B68)")
    parser.add_argument("--batch", help="HTML file path to process all ASINs in it")
    parser.add_argument("--all-guides", action="store_true", help="Process all guide files")
    parser.add_argument("--no-webp", action="store_true", help="Skip WebP conversion")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    args = parser.parse_args()

    if args.all_guides:
        results = process_all_guides(not args.no_webp)
    elif args.batch:
        results = batch_process(args.batch, not args.no_webp)
    elif args.target:
        results = [process_asin(args.target, not args.no_webp)]
    else:
        parser.print_help()
        sys.exit(1)

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        ok = sum(1 for r in results if r.get("ok"))
        fail = len(results) - ok
        print(f"\n  Done: {ok} succeeded, {fail} failed")
        if fail:
            for r in results:
                if not r.get("ok"):
                    print(f"    ✗ {r['asin']}: {r.get('error', 'unknown')}")


if __name__ == "__main__":
    main()
