#!/usr/bin/env python3
"""Generate clean guide placeholder pages."""
import os

OUT_DIR = "/home/cameron/.openclaw/workspace/theworkspacepro-v2/guides"

GUIDES = [
    ("ergonomic-office-chair-buying-guide", "Ergonomic Office Chair Buying Guide", "Chairs", "Everything you need to know about seat height, lumbar support, armrests, and choosing the right chair for your body and budget.", "12 min read"),
    ("best-ergonomic-office-chairs-2026", "Best Ergonomic Office Chairs 2026", "Chairs", "Full comparison of the best ergonomic office chairs across every budget tier, from $200 to $1,500.", "15 min read"),
    ("home-office-desk-guide-2026", "Home Office Desk Guide 2026", "Desks", "Desk height, depth, surface material, and stability. Choose between fixed, adjustable, and corner desks.", "11 min read"),
    ("best-standing-desks-under-500", "Best Standing Desks Under $500", "Desks", "Budget standing desks compared by stability, motor noise, height range, and warranty.", "10 min read"),
    ("best-standing-desk-mat-for-concrete-floors", "Best Standing Desk Mats for Hard Floors", "Accessories", "Anti-fatigue mats compared by thickness, material, and durability for concrete and hard floors.", "7 min read"),
    ("home-office-lighting-guide", "Home Office Lighting Guide", "Lighting", "Layer your lighting, reduce eye strain, and look great on video calls.", "11 min read"),
    ("night-shift-lighting-guide", "Night Shift Lighting Guide", "Lighting", "Reduce blue light exposure and eye strain with the right lighting setup for nighttime work.", "9 min read"),
    ("cable-management-solutions", "Cable Management Solutions", "Organization", "From $5 cable ties to under-desk trays — clean cable management setups for any budget.", "8 min read"),
    ("small-home-office-organization-hacks", "Small Home Office Organization Hacks", "Organization", "Maximize tight spaces with wall-mounted storage, fold-away desks, and vertical organization.", "10 min read"),
    ("dual-monitor-setup-productivity", "Dual Monitor Setup for Productivity", "Monitors", "Optimal monitor placement, angles, and heights for a two-screen workflow.", "9 min read"),
    ("dual-monitor-home-office", "Dual Monitor Home Office Setup", "Monitors", "Complete guide to building a dual-monitor workstation on a budget.", "11 min read"),
    ("ergonomic-accessories-home-office", "Ergonomic Accessories for Home Office", "Accessories", "Footrests, keyboard trays, wrist pads, monitor arms — the small upgrades that make a big difference.", "10 min read"),
    ("home-office-budget-setup-under-1000", "Home Office Setup Under $1,000", "Budget", "A complete ergonomic workspace — chair, desk, monitor, lighting, accessories — for under $1,000.", "12 min read"),
    ("back-pain-ergonomic-setup", "Best Ergonomic Setup for Back Pain", "Health", "If your desk is causing back pain, this guide walks through the exact adjustments and gear that help.", "13 min read"),
    ("ergonomic-setup-for-gamers", "Ergonomic Setup for Gamers", "Gaming", "Gaming and productivity can coexist. Build a setup that's great for both without sacrificing your back.", "10 min read"),
    ("productive-workspace-mindset", "Productive Workspace Mindset", "Productivity", "Your physical environment shapes your mental state. Design choices that improve focus and flow.", "8 min read"),
]

TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — The Workspace Pro</title>
  <meta name="description" content="{desc}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://www.theworkspacepro.com/guides/{slug}/">
  <link rel="canonical" href="https://www.theworkspacepro.com/guides/{slug}/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{title}",
    "description": "{desc}",
    "url": "https://www.theworkspacepro.com/guides/{slug}/",
    "publisher": {{
      "@type": "Organization",
      "name": "The Workspace Pro",
      "url": "https://www.theworkspacepro.com"
    }}
  }}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="site-header__inner">
      <a href="/" class="logo"><span class="logo__mark">W</span><span>The Workspace Pro</span></a>
      <nav class="nav">
        <a href="/" class="nav__link">Home</a>
        <a href="/guides/" class="nav__link nav__link--active">Guides</a>
        <a href="/tips/" class="nav__link">Tips</a>
        <a href="/podcasts/" class="nav__link">Podcasts</a>
        <a href="/about/" class="nav__link">About</a>
        <a href="/#assessment" class="nav__link nav__cta">Take the Quiz</a>
      </nav>
      <div class="header-actions">
        <button class="theme-toggle"><span class="theme-toggle__icon">☾</span></button>
        <button class="menu-toggle"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      </div>
    </div>
  </header>
  <div class="mobile-overlay"></div>
  <nav class="mobile-nav">
    <div class="mobile-nav__header"><span style="font-weight:700;">Menu</span><button class="menu-toggle" onclick="document.querySelector('.mobile-nav').classList.remove('open'); document.querySelector('.mobile-overlay').classList.remove('open');"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <a href="/" class="mobile-nav__link">Home</a><a href="/guides/" class="mobile-nav__link">Guides</a><a href="/tips/" class="mobile-nav__link">Tips</a><a href="/podcasts/" class="mobile-nav__link">Podcasts</a><a href="/about/" class="mobile-nav__link">About</a><a href="/#assessment" class="mobile-nav__cta">Take the Quiz</a>
  </nav>

  <article>
    <div class="container-prose">
      <div class="article-header">
        <div class="article-meta">
          <span>📁 {category}</span>
          <span>·</span>
          <span>⏱ {read_time}</span>
          <span>·</span>
          <a href="/guides/">All Guides</a>
        </div>
        <h1 class="article-title">{title}</h1>
        <p class="article-lead">{desc}</p>
      </div>
      <div class="article-body">
        <div class="disclosure-box disclosure-box--info">
          <strong>📝 We're rewriting this guide.</strong>
          <p style="margin-top:var(--space-sm);">Our previous version had some issues — broken images, outdated links, and content that didn't meet our standards. We're rebuilding it from scratch with current product data, real specs, and honest recommendations.</p>
          <p style="margin-top:var(--space-sm);">In the meantime, <a href="/#assessment">take the workspace assessment</a> — it'll give you personalized product recommendations based on your body, budget, and work style. It's free and takes about 2 minutes.</p>
        </div>

        <h2>What this guide will cover</h2>
        {preview}

        <h2>Get personalized recommendations now</h2>
        <p>Don't want to wait? Our <a href="/#assessment">ergonomic assessment tool</a> analyzes your work type, body, space, and budget to recommend specific products with ergonomic rationale and a setup checklist. It's the fastest way to find the right gear for your workspace.</p>

        <div style="text-align:center; margin: var(--space-2xl) 0;">
          <a href="/#assessment" class="btn btn--primary btn--lg">Take the Assessment →</a>
        </div>

        <h2>Related resources</h2>
        <ul>
          <li><a href="/tips/">Quick workspace tips</a> — 12 actionable improvements you can make today</li>
          <li><a href="/guides/">All guides</a> — browse other workspace topics</li>
          <li><a href="/about/">About The Workspace Pro</a> — how we research and recommend products</li>
        </ul>
      </div>
    </div>
  </article>

  <section class="cta-section" style="max-width:var(--max-width);margin:var(--space-2xl) auto;">
    <div class="container">
      <h2>Find your perfect setup in 2 minutes</h2>
      <p>Personalized product recommendations based on your body, budget, and work style.</p>
      <a href="/#assessment" class="btn btn--secondary btn--lg">Start Assessment →</a>
    </div>
  </section>

  <footer class="site-footer">
    <div class="site-footer__grid">
      <div class="footer-brand"><div style="display:flex;align-items:center;gap:var(--space-sm);font-family:var(--font-display);font-weight:700;font-size:1.125rem;"><span class="logo__mark">W</span><span>The Workspace Pro</span></div><p>Helping you build a workspace that fits your body, your work, and your budget.</p></div>
      <div class="footer-col"><h4>Explore</h4><ul><li><a href="/">Home</a></li><li><a href="/guides/">Guides</a></li><li><a href="/tips/">Tips</a></li><li><a href="/podcasts/">Podcasts</a></li></ul></div>
      <div class="footer-col"><h4>About</h4><ul><li><a href="/about/">About Us</a></li><li><a href="/contact/">Contact</a></li><li><a href="/affiliate-disclosure/">Affiliate Disclosure</a></li></ul></div>
      <div class="footer-col"><h4>Legal</h4><ul><li><a href="/privacy/">Privacy Policy</a></li><li><a href="/terms/">Terms of Service</a></li></ul></div>
    </div>
    <div class="site-footer__bottom"><span>© 2026 The Workspace Pro. All rights reserved.</span><span>This site uses affiliate links. We only recommend products we genuinely believe in.</span></div>
  </footer>
  <script src="/assets/js/assessment.js"></script>
</body>
</html>'''

PREVIEWS = {
    "ergonomic-office-chair-buying-guide": """<ul>
<li><strong>Anatomy of an ergonomic chair</strong> — lumbar support types, seat depth, armrest adjustability, tilt mechanisms, materials</li>
<li><strong>How to choose by body type</strong> — height ranges, weight capacity, seat width considerations</li>
<li><strong>Price tier breakdown</strong> — what you get at $200, $500, $900, and $1,500+</li>
<li><strong>Key specs to check</strong> — seat height range, seat depth, armrest dimensions, weight rating</li>
<li><strong>Setup guide</strong> — proper adjustment for your desk and body</li>
</ul>""",
    "best-ergonomic-office-chairs-2026": """<ul>
<li><strong>Testing criteria</strong> — how we evaluate adjustability, comfort, build quality, and value</li>
<li><strong>Top picks by budget</strong> — best under $300, $500, $1,000, and $1,500</li>
<li><strong>Comparison table</strong> — side-by-side specs for all recommended chairs</li>
<li><strong>Who each chair is for</strong> — matching chairs to body types and work styles</li>
</ul>""",
    "home-office-desk-guide-2026": """<ul>
<li><strong>Desk dimensions that matter</strong> — height, depth, width, and how to measure your space</li>
<li><strong>Standing vs. fixed desks</strong> — pros, cons, and who needs each</li>
<li><strong>Surface materials compared</strong> — bamboo, MDF, solid wood, laminate</li>
<li><strong>Stability factors</strong> — leg design, frame gauge, weight capacity</li>
</ul>""",
    "best-standing-desks-under-500": """<ul>
<li><strong>What to expect under $500</strong> — features, quality, and trade-offs</li>
<li><strong>Stability testing</strong> — how budget desks compare at full height</li>
<li><strong>Motor noise comparison</strong> — decibel readings and real-world feel</li>
<li><strong>Warranty and support</strong> — what's covered and for how long</li>
</ul>""",
    "best-standing-desk-mat-for-concrete-floors": """<ul>
<li><strong>Why mat material matters on hard floors</strong> — compression, recovery, durability</li>
<li><strong>Thickness guidelines</strong> — minimum thickness for concrete vs. wood</li>
<li><strong>Material comparison</strong> — polyurethane, PVC, cork, gel</li>
<li><strong>Top picks by budget</strong></li>
</ul>""",
    "home-office-lighting-guide": """<ul>
<li><strong>The three layers of lighting</strong> — ambient, task, and accent explained</li>
<li><strong>Reducing eye strain</strong> — brightness levels, color temperature, glare control</li>
<li><strong>Looking good on video calls</strong> — key light, fill light, and positioning</li>
<li><strong>Product recommendations</strong> — from $15 desk lamps to monitor light bars</li>
</ul>""",
    "night-shift-lighting-guide": """<ul>
<li><strong>Blue light and sleep</strong> — what the research actually says</li>
<li><strong>Warm light setup</strong> — color temperature recommendations for evening work</li>
<li><strong>Bias lighting</strong> — why backlighting your monitor helps</li>
<li><strong>Software solutions</strong> — f.lux, Night Shift, and monitor settings</li>
</ul>""",
    "cable-management-solutions": """<ul>
<li><strong>The $10 fix</strong> — zip ties, cable clips, and adhesive mounts</li>
<li><strong>Under-desk trays and channels</strong> — hiding cables completely</li>
<li><strong>Cable sleeves and raceways</strong> — for visible desk-to-wall runs</li>
<li><strong>Product recommendations</strong> by budget level</li>
</ul>""",
    "small-home-office-organization-hacks": """<ul>
<li><strong>Vertical storage strategies</strong> — shelves, pegboards, wall mounts</li>
<li><strong>Fold-away and multi-purpose furniture</strong> — desks that disappear</li>
<li><strong>Cable management in tight spaces</strong></li>
<li><strong>Maximizing a corner or closet office</strong></li>
</ul>""",
    "dual-monitor-setup-productivity": """<ul>
<li><strong>Optimal monitor placement</strong> — distance, height, and angle for two screens</li>
<li><strong>Primary vs. secondary positioning</strong> — which screen goes where</li>
<li><strong>Monitor arms vs. stands</strong> — when to upgrade</li>
<li><strong>Workflow tips</strong> — window management for dual monitors</li>
</ul>""",
    "dual-monitor-home-office": """<ul>
<li><strong>Choosing monitors</strong> — size, resolution, and panel type for a dual setup</li>
<li><strong>Desk requirements</strong> — depth and width for two monitors</li>
<li><strong>Cable management for dual setups</strong></li>
<li><strong>Budget build</strong> — complete dual-monitor setup under $800</li>
</ul>""",
    "ergonomic-accessories-home-office": """<ul>
<li><strong>Footrests</strong> — why they matter and which to get</li>
<li><strong>Monitor arms</strong> — the single biggest ergonomic upgrade</li>
<li><strong>Keyboard trays</strong> — when you need one and which to buy</li>
<li><strong>Wrist rests, mouse pads, and other small upgrades</strong></li>
</ul>""",
    "home-office-budget-setup-under-1000": """<ul>
<li><strong>The $1,000 budget breakdown</strong> — exactly how to split your money</li>
<li><strong>Chair recommendations under $350</strong></li>
<li><strong>Desk recommendations under $300</strong></li>
<li><strong>Monitor, lighting, and accessories for the remaining budget</strong></li>
<li><strong>What to skip and what not to compromise on</strong></li>
</ul>""",
    "back-pain-ergonomic-setup": """<ul>
<li><strong>Common causes of desk-related back pain</strong></li>
<li><strong>Chair adjustments that actually help</strong> — seat height, lumbar position, tilt</li>
<li><strong>Desk height and monitor positioning</strong></li>
<li><strong>Standing desk benefits for back pain</strong></li>
<li><strong>When to see a professional</strong></li>
</ul>""",
    "ergonomic-setup-for-gamers": """<ul>
<li><strong>Gaming chair vs. office chair</strong> — the honest comparison</li>
<li><strong>Monitor positioning for long sessions</strong></li>
<li><strong>Keyboard and mouse ergonomics for gaming</strong></li>
<li><strong>Lighting and eye strain during evening gaming</strong></li>
</ul>""",
    "productive-workspace-mindset": """<ul>
<li><strong>How environment shapes focus</strong> — what research says about workspace design</li>
<li><strong>Color psychology for offices</strong></li>
<li><strong>Plants, natural light, and biophilic design</strong></li>
<li><strong>Minimizing distractions through layout</strong></li>
</ul>""",
}

os.makedirs(OUT_DIR, exist_ok=True)

for slug, title, category, desc, read_time in GUIDES:
    preview = PREVIEWS.get(slug, "<ul><li>Coming soon</li></ul>")
    page = TEMPLATE.format(
        slug=slug, title=title, category=category, desc=desc,
        read_time=read_time, preview=preview
    )
    outpath = os.path.join(OUT_DIR, f"{slug}.html")
    with open(outpath, 'w') as f:
        f.write(page)
    print(f"  {slug} -> {len(page)} bytes")

print(f"\nGenerated {len(GUIDES)} guide pages")
