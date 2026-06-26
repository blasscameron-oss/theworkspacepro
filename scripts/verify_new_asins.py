#!/usr/bin/env python3
"""Verify new candidate ASINs using agent-browser."""

import json, os, subprocess, sys

CANDIDATES = [
    {"name": "SIHOO M57", "asin": "B07BDFW1Y7", "old_asin": "B08BFT9V3M", "price": "~$250"},
    {"name": "Hbada E3 Air 2026", "asin": "B0GX19V226", "old_asin": "B0C69TK89P", "price": "~$300"},
    {"name": "Branch Ergonomic", "asin": "B0C15B3HN1", "old_asin": "B09HQ8QFRP", "price": "~$350"},
    {"name": "Autonomous ErgoChair Pro", "asin": "B092ZNFF8P", "old_asin": "B08BLC6R2T", "price": "~$479"},
    {"name": "Ticova Ergonomic", "asin": "B08LBJXVSP", "old_asin": "B09B59TRGN", "price": "~$300"},
    {"name": "Steelcase Series 1", "asin": "B078HDP8NY", "old_asin": "B08BL9VY6M", "price": "~$700"},
    {"name": "Herman Miller Sayl", "asin": "B07R62FKFZ", "old_asin": "B09BG5VPDC", "price": "~$895"},
    {"name": "Haworth Soji", "asin": "B07MTMC6YY", "old_asin": "B0B5LG29WL", "price": "~$750"},
    {"name": "Herman Miller Aeron", "asin": "B007WU4NFO", "old_asin": "B07L39N8H5", "price": "~$1,395"},
    {"name": "Steelcase Gesture", "asin": "B016OIF2JU", "old_asin": "B07M63Q2ZP", "price": "~$1,495"},
    {"name": "Steelcase Leap V2", "asin": "B073G1K465", "old_asin": "B0B5L9HT27", "price": "~$1,349"},
    {"name": "Herman Miller Embody", "asin": "B005Y0LDW0", "old_asin": "B01N77N94H", "price": "~$1,795"},
]

env = os.environ.copy()
env["AGENT_BROWSER_ARGS"] = "--no-sandbox"

results = []
for i, c in enumerate(CANDIDATES, 1):
    url = f"https://www.amazon.com/dp/{c['asin']}"
    try:
        r = subprocess.run(
            ["agent-browser", "open", url],
            capture_output=True, text=True, timeout=20, env=env
        )
        title = r.stdout.strip()
        alive = "Page Not Found" not in title and "404" not in title and title != ""
        results.append({**c, "alive": alive, "title": title[:100] if alive else "DEAD"})
        status = "✓" if alive else "✗"
        print(f"  {status} [{i}/{len(CANDIDATES)}] {c['asin']} — {c['name']}: {title[:70]}")
    except Exception as e:
        results.append({**c, "alive": False, "title": f"ERROR: {e}"})
        print(f"  ✗ [{i}/{len(CANDIDATES)}] {c['asin']} — {c['name']}: ERROR: {e}")

alive = sum(1 for r in results if r["alive"])
print(f"\nResults: {alive} alive, {len(results) - alive} dead out of {len(results)}")

out = os.path.join(os.path.dirname(__file__), "new_asin_verification.json")
with open(out, "w") as f:
    json.dump(results, f, indent=2)
print(f"Saved to {out}")
