#!/usr/bin/env python3
"""check_asins.py — Batch check which Amazon ASINs are alive vs dead.

Usage:
  python3 scripts/check_asins.py [--output results.json]
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parent.parent
GUIDES_DIR = SITE_ROOT / "guides"
ASIN_RE = re.compile(r'amazon\.com/dp/([A-Z0-9]{10})')


def get_all_asins():
    all_asins = set()
    for f in sorted(GUIDES_DIR.glob("*.html")):
        text = f.read_text(errors="replace")
        all_asins.update(ASIN_RE.findall(text))
    return sorted(all_asins)


def check_asin(asin: str) -> dict:
    """Check if an ASIN is alive by opening it in the browser."""
    url = f"https://www.amazon.com/dp/{asin}"
    env = os.environ.copy()
    env["AGENT_BROWSER_ARGS"] = "--no-sandbox"
    try:
        result = subprocess.run(
            ["agent-browser", "open", url],
            capture_output=True, text=True, timeout=20, env=env
        )
        title = result.stdout.strip()
        alive = "Page Not Found" not in title and "404" not in title
        return {"asin": asin, "alive": alive, "title": title[:100] if alive else "DEAD"}
    except Exception as e:
        return {"asin": asin, "alive": False, "title": f"ERROR: {e}"}


def main():
    asins = get_all_asins()
    print(f"Checking {len(asins)} unique ASINs...\n")
    
    results = []
    alive_count = 0
    dead_count = 0
    
    for i, asin in enumerate(asins, 1):
        r = check_asin(asin)
        results.append(r)
        if r["alive"]:
            alive_count += 1
            print(f"  ✓ [{i}/{len(asins)}] {asin} — {r['title'][:60]}")
        else:
            dead_count += 1
            print(f"  ✗ [{i}/{len(asins)}] {asin} — DEAD")
    
    print(f"\nResults: {alive_count} alive, {dead_count} dead out of {len(asins)}")
    
    # Save results
    output_file = SITE_ROOT / "scripts" / "asin_check_results.json"
    output_file.write_text(json.dumps(results, indent=2))
    print(f"Saved to {output_file}")
    
    # Print dead ASINs for easy review
    dead = [r["asin"] for r in results if not r["alive"]]
    if dead:
        print(f"\nDead ASINs ({len(dead)}):")
        for a in dead:
            print(f"  {a}")


if __name__ == "__main__":
    main()
