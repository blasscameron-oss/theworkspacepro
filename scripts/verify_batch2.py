#!/usr/bin/env python3
"""Verify batch 2 of candidate ASINs."""

import json, os, subprocess

CANDIDATES = [
    # best-standing-desks-under-500.html
    {"name": "SHW 55 Electric Desk", "asin": "B085KBN2DN"},
    {"name": "Under Desk Cable Tray (IKEA SIGNUM alt)", "asin": "B09J5HH2LR"},
    {"name": "ComfiLife Anti-Fatigue Mat", "asin": "B07SCWHLJT"},
    {"name": "Ergodriven Topo Mat", "asin": "B00V3TO9EK"},
    {"name": "VIVO Single Monitor Arm", "asin": "B01LYVCEIB"},
    {"name": "WALI Dual Monitor Mount", "asin": "B018MSDG84"},
    # back-pain-ergonomic-setup.html
    {"name": "HON Ignition 2.0", "asin": "B06Y3PGPR2"},
    {"name": "Amazon Basics Monitor Stand", "asin": "B07DHK5DHN"},
    {"name": "Ergotron LX Monitor Arm", "asin": "B07Q8TJ2KL"},
    {"name": "Vari Tall 40 Converter", "asin": "B076HB7NZS"},
    # home-office-lighting-guide.html
    {"name": "IKEA TERTIAL Lamp", "asin": "B07H2N84CM"},
    {"name": "Tomons LED Desk Lamp", "asin": "B071CXPSDN"},
    {"name": "Govee RGBIC Floor Lamp", "asin": "B099WTN2TR"},
    {"name": "BenQ ScreenBar", "asin": "B076VNFZJG"},
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

out = os.path.join(os.path.dirname(__file__), "batch2_verification.json")
with open(out, "w") as f:
    json.dump(results, f, indent=2)
print(f"Saved to {out}")
