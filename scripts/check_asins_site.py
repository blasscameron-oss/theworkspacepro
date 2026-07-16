#!/usr/bin/env python3
"""Extract Amazon ASINs from site HTML/JS, check denylist, optional HTTP sample.

Usage:
  python3 scripts/check_asins_site.py
  python3 scripts/check_asins_site.py --fail-on-denylist
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASIN_RE = re.compile(r"/dp/([A-Z0-9]{10})", re.I)
DENY = ROOT / "scripts" / "asin_denylist.json"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fail-on-denylist", action="store_true")
    ap.add_argument("--json-out", type=Path, default=ROOT / "scripts" / "asin_inventory.json")
    args = ap.parse_args()

    deny = set()
    if DENY.exists():
        data = json.loads(DENY.read_text())
        deny = {a.upper() for a in data.get("asins", [])}

    locs: dict[str, list[str]] = defaultdict(list)
    for p in list(ROOT.glob("*.html")) + list((ROOT / "guides").glob("*.html")) + list(
        (ROOT / "compare").glob("*.html")
    ) + list((ROOT / "assets" / "js").glob("*.js")):
        text = p.read_text(errors="replace")
        for m in ASIN_RE.finditer(text):
            locs[m.group(1).upper()].append(str(p.relative_to(ROOT)))

    hits = sorted(a for a in locs if a in deny)
    report = {
        "asin_count": len(locs),
        "asins": sorted(locs.keys()),
        "denylist_hits": hits,
        "locations": {a: locs[a] for a in sorted(locs.keys())},
    }
    args.json_out.write_text(json.dumps(report, indent=2))
    print(f"ASINs: {len(locs)}")
    print(f"Denylist hits: {hits or 'none'}")
    print(f"Wrote {args.json_out}")

    if hits and args.fail_on_denylist:
        print("FAIL: denylisted ASINs present", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
