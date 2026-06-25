#!/usr/bin/env python3
"""Convert existing guide pages to new template."""
import re
import os
import urllib.request

GUIDES = [
    "back-pain-ergonomic-setup",
    "best-ergonomic-office-chairs-2026",
    "best-standing-desk-mat-for-concrete-floors",
    "best-standing-desks-under-500",
    "cable-management-solutions",
    "dual-monitor-home-office",
    "dual-monitor-setup-productivity",
    "ergonomic-accessories-home-office",
    "ergonomic-office-chair-buying-guide",
    "ergonomic-setup-for-gamers",
    "home-office-budget-setup-under-1000",
    "home-office-desk-guide-2026",
    "home-office-lighting-guide",
    "night-shift-lighting-guide",
    "productive-workspace-mindset",
    "small-home-office-organization-hacks",
]

TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta property="og:title" content="{og_title}">
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
    "headline": "{og_title}",
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
          <span>📅 Updated 2026</span>
          <span>·</span>
          <a href="/guides/">All Guides</a>
        </div>
        <h1 class="article-title">{heading}</h1>
        <p class="article-lead">{lead}</p>
      </div>
      <div class="article-body">
{content}
      </div>
    </div>
  </article>

  <section class="cta-section" style="max-width:var(--max-width);margin:var(--space-2xl) auto;">
    <div class="container">
      <h2>Want a personalized setup?</h2>
      <p>Take the free 2-minute assessment for recommendations tailored to your body and budget.</p>
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

# Guide metadata
META = {
    "back-pain-ergonomic-setup": ("Best Ergonomic Setup for Back Pain", "Complete guide to fixing back pain with the right ergonomic desk setup — chair adjustments, desk height, posture, and product picks."),
    "best-ergonomic-office-chairs-2026": ("Best Ergonomic Office Chairs 2026", "Full comparison of the best ergonomic office chairs across every budget tier, from $200 to $1,500."),
    "best-standing-desk-mat-for-concrete-floors": ("Best Standing Desk Mats for Hard Floors", "Anti-fatigue mats compared by thickness, material, and durability for concrete and hard floors."),
    "best-standing-desks-under-500": ("Best Standing Desks Under $500", "Budget standing desks compared by stability, motor noise, height range, and warranty."),
    "cable-management-solutions": ("Cable Management Solutions", "From $5 cable ties to under-desk trays — clean cable management setups for any budget."),
    "dual-monitor-home-office": ("Dual Monitor Home Office Setup", "Complete guide to building a dual-monitor workstation on a budget."),
    "dual-monitor-setup-productivity": ("Dual Monitor Setup for Productivity", "Optimal monitor placement, angles, and heights for a two-screen workflow."),
    "ergonomic-accessories-home-office": ("Ergonomic Accessories for Home Office", "Footrests, keyboard trays, wrist pads, monitor arms — the small upgrades that make a big difference."),
    "ergonomic-office-chair-buying-guide": ("Ergonomic Office Chair Buying Guide", "Everything you need to know about seat height, lumbar support, armrests, and choosing the right chair."),
    "ergonomic-setup-for-gamers": ("Ergonomic Setup for Gamers", "Gaming and productivity can coexist. Build a setup that's great for both without sacrificing your back."),
    "home-office-budget-setup-under-1000": ("Home Office Setup Under $1,000", "A complete ergonomic workspace — chair, desk, monitor, lighting, accessories — for under $1,000."),
    "home-office-desk-guide-2026": ("Home Office Desk Guide 2026", "Desk height, depth, surface material, and stability. Choose between fixed, adjustable, and corner desks."),
    "home-office-lighting-guide": ("Home Office Lighting Guide", "Layer your lighting, reduce eye strain, and look great on video calls."),
    "night-shift-lighting-guide": ("Night Shift Lighting Guide", "Reduce blue light exposure and eye strain with the right lighting setup for nighttime work."),
    "productive-workspace-mindset": ("Productive Workspace Mindset", "Your physical environment shapes your mental state. Design choices that improve focus and flow."),
    "small-home-office-organization-hacks": ("Small Home Office Organization Hacks", "Maximize tight spaces with wall-mounted storage, fold-away desks, and vertical organization."),
}

BASE_URL = "https://theworkspacepro.com"
OUT_DIR = "/home/cameron/.openclaw/workspace/theworkspacepro-v2/guides"

def fetch(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f"  ERROR fetching {url}: {e}")
        return None

def extract_article_content(html):
    """Extract the article content from the HTML."""
    # Try to find the article content
    # Look for content between <article> tags or main content area
    m = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
    if m:
        content = m.group(1)
    else:
        # Try main content
        m = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
        if m:
            content = m.group(1)
        else:
            return None
    
    # Remove script and style tags
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL)
    content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL)
    content = re.sub(r'<noscript[^>]*>.*?</noscript>', '', content, flags=re.DOTALL)
    
    # Remove the "In This Guide" navigation
    content = re.sub(r'<nav[^>]*class="[^"]*table[^"]*"[^>]*>.*?</nav>', '', content, flags=re.DOTALL)
    
    # Remove print buttons, share buttons, etc
    content = re.sub(r'<button[^>]*>.*?</button>', '', content, flags=re.DOTALL)
    
    # Remove "Updated" and author meta that's inside article
    # Keep h2, h3, p, ul, ol, li, table, img, blockquote
    
    # Clean up Tailwind classes (we're using our own CSS now)
    # Remove class attributes from most elements
    content = re.sub(r'\s+class="[^"]*"', '', content)
    content = re.sub(r'\s+id="[^"]*"', '', content)
    
    # Remove data attributes
    content = re.sub(r'\s+data-[a-z-]+="[^"]*"', '', content)
    
    # Fix image srcs - keep as is (they're unsplash CDN URLs)
    # Add loading="lazy" to images
    content = re.sub(r'<img ', '<img loading="lazy" decoding="async" ', content)
    
    # Fix affiliate links - add rel
    content = re.sub(r'<a href="https://www\.amazon\.com[^"]*"', lambda m: m.group(0) + ' rel="sponsored noopener noreferrer" target="_blank"', content)
    
    # Remove empty paragraphs
    content = re.sub(r'<p>\s*</p>', '', content)
    
    # Clean up whitespace
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
    
    # Indent for template
    lines = content.strip().split('\n')
    indented = '\n'.join('        ' + line if line.strip() else line for line in lines)
    
    return indented

def extract_title(html):
    m = re.search(r'<title>([^<]+)</title>', html)
    if m:
        # Clean up the title
        title = m.group(1).split('|')[0].split('–')[0].strip()
        return title
    return "Guide"

def extract_heading(html):
    """Extract the main H1 heading."""
    m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    if m:
        heading = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        return heading
    return None

def extract_lead(html):
    """Extract the first paragraph after the heading as the lead."""
    # Look for the first substantial paragraph
    paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL)
    for p in paragraphs:
        text = re.sub(r'<[^>]+>', '', p).strip()
        if len(text) > 50 and not text.startswith('Updated') and not text.startswith('We tested'):
            return text[:200]
        if len(text) > 50:
            return text[:200]
    return ""

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    
    for slug in GUIDES:
        print(f"Processing: {slug}")
        url = f"{BASE_URL}/{slug}/"
        html = fetch(url)
        if not html:
            print(f"  SKIP - could not fetch")
            continue
        
        heading = extract_heading(html) or META.get(slug, (slug.replace('-', ' ').title(),))[0]
        title_full = extract_title(html)
        lead = extract_lead(html) or META.get(slug, ("", ""))[1]
        desc = META.get(slug, (slug, "Guide"))[1]
        content = extract_article_content(html)
        
        if not content:
            print(f"  SKIP - no article content found")
            continue
        
        # Truncate content if too long (for safety)
        if len(content) > 100000:
            content = content[:100000] + '\n        <!-- Content truncated -->'
        
        page = TEMPLATE.format(
            title=title_full + " | The Workspace Pro",
            og_title=heading,
            desc=desc,
            slug=slug,
            heading=heading,
            lead=lead,
            content=content,
        )
        
        outpath = os.path.join(OUT_DIR, f"{slug}.html")
        with open(outpath, 'w') as f:
            f.write(page)
        print(f"  OK - {len(page)} bytes -> {outpath}")
    
    print("\nDone!")

if __name__ == '__main__':
    main()
