#!/usr/bin/env python3
"""
inject_product_images.py — Insert product images into TheWorkspacePro guide HTML

Usage:
  python3 scripts/inject_product_images.py guides/best-standing-desks-under-500.html
  python3 scripts/inject_product_images.py --all

For each Amazon affiliate link in the guide, this script:
  1. Extracts the ASIN from the link
  2. Checks if a local image exists at images/products/<ASIN>.jpg (or .webp)
  3. Inserts a <picture> element with the product image into the product card
  4. Wraps the image in the affiliate link so clicking the image also uses the affiliate tag

The script is idempotent — running it again won't duplicate images.
"""

import argparse
import re
import sys
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parent.parent
IMAGE_DIR = SITE_ROOT / "images" / "products"
GUIDES_DIR = SITE_ROOT / "guides"

# Match Amazon affiliate links: href="...amazon.com/dp/ASIN?..."
ASIN_RE = re.compile(r'(amazon\.com/dp/([A-Z0-9]{10}))')

# Match a product-card div opening
PRODUCT_CARD_OPEN_RE = re.compile(r'(<div\s+class="product-card">)')

# Match existing product-image divs (idempotency check)
EXISTING_IMAGE_RE = re.compile(r'class="product-card__image"')


def find_image_for_asin(asin: str) -> tuple[Path | None, Path | None]:
    """Return (jpg_path, webp_path) — whichever exist."""
    jpg = IMAGE_DIR / f"{asin}.jpg"
    webp = IMAGE_DIR / f"{asin}.webp"
    return (jpg if jpg.exists() else None, webp if webp.exists() else None)


def build_image_html(asin: str, affiliate_url: str) -> str:
    """Build the <picture> HTML for a product image."""
    jpg, webp = find_image_for_asin(asin)
    if not jpg and not webp:
        return ""

    jpg_src = f"/images/products/{asin}.jpg"
    webp_src = f"/images/products/{asin}.webp"

    parts = ['<div class="product-card__image">']
    parts.append(f'  <a href="{affiliate_url}" target="_blank" rel="sponsored noopener noreferrer">')
    parts.append('    <picture>')
    if webp:
        parts.append(f'      <source srcset="{webp_src}" type="image/webp">')
    parts.append(f'      <img src="{jpg_src}" alt="{asin} product photo" loading="lazy" decoding="async" width="400" height="400">')
    parts.append('    </picture>')
    parts.append('  </a>')
    parts.append('</div>')

    return "\n".join(parts)


def process_html_file(filepath: Path, dry_run: bool = False) -> dict:
    """Process a single HTML file, injecting images into product cards."""
    html = filepath.read_text(errors="replace")

    # Skip if already has images
    if EXISTING_IMAGE_RE.search(html):
        # Could update, but for now skip
        return {"file": str(filepath.relative_to(SITE_ROOT)), "status": "already_has_images", "injected": 0}

    # Find all product-card divs
    # Strategy: find each product-card opening, then find the first Amazon link inside it,
    # and insert the image right after the product-card opening div.

    # Split by product-card divs
    parts = PRODUCT_CARD_OPEN_RE.split(html)
    if len(parts) == 1:
        return {"file": str(filepath.relative_to(SITE_ROOT)), "status": "no_product_cards", "injected": 0}

    injected = 0
    skipped = 0
    result = parts[0]  # Before first product-card

    for i in range(1, len(parts), 2):
        opening_tag = parts[i]  # <div class="product-card">
        card_content = parts[i + 1] if i + 1 < len(parts) else ""

        # Find the first Amazon ASIN in this card
        asin_match = ASIN_RE.search(card_content)
        if asin_match:
            asin = asin_match.group(2)
            # Reconstruct the full affiliate URL
            # Find the full href
            href_match = re.search(r'href="(https://www\.amazon\.com/dp/[A-Z0-9]{10}/?\?[^"]*)"', card_content)
            if not href_match:
                href_match = re.search(r'href="(https://www\.amazon\.com/dp/[A-Z0-9]{10})"', card_content)
            affiliate_url = href_match.group(1) if href_match else f"https://www.amazon.com/dp/{asin}/?tag=workspacepro-20"

            img_html = build_image_html(asin, affiliate_url)
            if img_html:
                result += opening_tag + "\n" + img_html + "\n" + card_content
                injected += 1
            else:
                result += opening_tag + card_content
                skipped += 1
        else:
            result += opening_tag + card_content

    if injected > 0 and not dry_run:
        filepath.write_text(result)

    return {
        "file": str(filepath.relative_to(SITE_ROOT)),
        "status": "done" if injected > 0 else "no_images_available",
        "injected": injected,
        "skipped": skipped,
    }


def process_all(dry_run: bool = False) -> list[dict]:
    """Process all HTML files in guides/ directory."""
    results = []
    for f in sorted(GUIDES_DIR.glob("*.html")):
        results.append(process_html_file(f, dry_run))
    return results


def main():
    parser = argparse.ArgumentParser(description="Inject product images into TheWorkspacePro guide HTML")
    parser.add_argument("target", nargs="?", default=None, help="HTML file path (relative to site root) or omit with --all")
    parser.add_argument("--all", action="store_true", help="Process all guide files")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without writing")
    args = parser.parse_args()

    if args.all:
        results = process_all(args.dry_run)
    elif args.target:
        filepath = SITE_ROOT / args.target
        if not filepath.exists():
            print(f"  ✗ File not found: {filepath}", file=sys.stderr)
            sys.exit(1)
        results = [process_html_file(filepath, args.dry_run)]
    else:
        parser.print_help()
        sys.exit(1)

    print(f"\n  {'File':<55} {'Status':<25} {'Injected':>8} {'Skipped':>8}")
    print(f"  {'─'*55} {'─'*25} {'─'*8} {'─'*8}")
    total_injected = 0
    for r in results:
        print(f"  {r['file']:<55} {r['status']:<25} {r['injected']:>8} {r.get('skipped', 0):>8}")
        total_injected += r['injected']
    print(f"\n  Total images injected: {total_injected}")


if __name__ == "__main__":
    main()
