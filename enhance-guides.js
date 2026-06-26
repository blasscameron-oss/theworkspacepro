#!/usr/bin/env node
/**
 * Enhance all 16 guide HTML files with 4 features:
 * 1. FAQ Accordion with Schema
 * 2. Related Guides Carousel
 * 3. "Best For" Badges on Comparison Tables
 * 4. Product Images on Comparison Tables
 */

const fs = require('fs');
const path = require('path');

const GUIDES_DIR = '/home/cameron/.openclaw/workspace/theworkspacepro-v2/guides';

// ==============================
// UNSOURCE IMAGE MAP by category
// ==============================
const UNSOURCE_IMAGES = {
  chair: {
    'sihoo': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'hbada': 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=80&h=80&fit=crop',
    'branch': 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=80&h=80&fit=crop',
    'autonomous': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'ticova': 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=80&h=80&fit=crop',
    'steelcase series 1': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'steelcase series 2': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'herman miller sayl': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'sayl': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'haworth soji': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'soji': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'aeron': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'gesture': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'leap v2': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'embody': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop',
    'default': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop'
  },
  standing_desk: {
    'default': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop',
    'flexispot': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop',
    'shw': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop',
    'uplift': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop',
    'jarvis': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop',
    'autonomous smartdesk': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop'
  },
  desk_mat: {
    'default': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=80&h=80&fit=crop'
  },
  monitor: {
    'default': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&h=80&fit=crop'
  },
  keyboard: {
    'default': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop'
  },
  mouse: {
    'default': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&h=80&fit=crop',
    'logitech mx master': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&h=80&fit=crop',
    'kensington orbit': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&h=80&fit=crop',
    'logitech ergo': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&h=80&fit=crop'
  },
  lamp: {
    'default': 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6f6?w=80&h=80&fit=crop'
  },
  footrest: {
    'default': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=80&h=80&fit=crop'
  },
  cable: {
    'default': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop'
  },
  headphone: {
    'default': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop'
  },
  lighting: {
    'default': 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6f6?w=80&h=80&fit=crop',
    'govee': 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6f6?w=80&h=80&fit=crop',
    'taotronics': 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6f6?w=80&h=80&fit=crop',
    'brightech': 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6f6?w=80&h=80&fit=crop'
  },
  storage: {
    'default': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop',
    'ikea': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop',
    'pegboard': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop'
  },
  mat: {
    'default': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=80&h=80&fit=crop'
  },
  desk: {
    'default': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop'
  }
};

// ==============================
// GUIDE DATA: titles, descriptions, categories
// ==============================
const GUIDE_DATA = {
  'back-pain-ergonomic-setup': {
    title: 'Back Pain Ergonomic Setup',
    desc: 'Set up your workspace to prevent and manage back pain with proper ergonomics.',
    category: 'Ergonomics',
    tags: ['back pain', 'ergonomics', 'posture']
  },
  'best-ergonomic-office-chairs-2026': {
    title: 'Best Ergonomic Office Chairs 2026',
    desc: 'Full comparison of the best ergonomic office chairs across every budget tier.',
    category: 'Chairs',
    tags: ['office chairs', 'ergonomic chairs', 'seating']
  },
  'best-standing-desk-mat-for-concrete-floors': {
    title: 'Best Standing Desk Mats for Concrete Floors',
    desc: 'Top anti-fatigue mats for standing desks on concrete floors.',
    category: 'Accessories',
    tags: ['standing desk', 'mats', 'anti-fatigue']
  },
  'best-standing-desks-under-500': {
    title: 'Best Standing Desks Under $500',
    desc: 'Best budget-friendly standing desks under $500 for your home office.',
    category: 'Desks',
    tags: ['standing desk', 'budget', 'desks']
  },
  'cable-management-solutions': {
    title: 'Cable Management Solutions',
    desc: 'Tame the cable chaos with the best cable management solutions for your workspace.',
    category: 'Organization',
    tags: ['cable management', 'organization', 'desk setup']
  },
  'dual-monitor-home-office': {
    title: 'Dual Monitor Home Office Setup',
    desc: 'Everything you need for a productive dual-monitor home office setup.',
    category: 'Monitors',
    tags: ['dual monitor', 'home office', 'productivity']
  },
  'dual-monitor-setup-productivity': {
    title: 'Dual Monitor Setup for Productivity',
    desc: 'Boost your productivity with the ideal dual monitor setup and workflow tips.',
    category: 'Monitors',
    tags: ['dual monitor', 'productivity', 'workflow']
  },
  'ergonomic-accessories-home-office': {
    title: 'Ergonomic Accessories for Home Office',
    desc: 'Must-have ergonomic accessories for a comfortable and healthy home office.',
    category: 'Accessories',
    tags: ['ergonomics', 'accessories', 'home office']
  },
  'ergonomic-office-chair-buying-guide': {
    title: 'Ergonomic Office Chair Buying Guide',
    desc: 'Complete guide to buying the right ergonomic office chair for your needs.',
    category: 'Chairs',
    tags: ['office chairs', 'buying guide', 'ergonomics']
  },
  'ergonomic-setup-for-gamers': {
    title: 'Ergonomic Setup for Gamers',
    desc: 'Build an ergonomic gaming setup that keeps you comfortable during long sessions.',
    category: 'Gaming',
    tags: ['gaming', 'ergonomics', 'setup']
  },
  'home-office-budget-setup-under-1000': {
    title: 'Home Office Budget Setup Under $1,000',
    desc: 'Build a complete home office on a budget of under $1,000.',
    category: 'Budget',
    tags: ['budget', 'home office', 'setup']
  },
  'home-office-desk-guide-2026': {
    title: 'Home Office Desk Guide 2026',
    desc: 'The complete guide to choosing the right desk for your home office.',
    category: 'Desks',
    tags: ['desks', 'home office', 'workspace']
  },
  'home-office-lighting-guide': {
    title: 'Home Office Lighting Guide',
    desc: 'The definitive guide to lighting your home office for productivity and comfort.',
    category: 'Lighting',
    tags: ['lighting', 'home office', 'productivity']
  },
  'night-shift-lighting-guide': {
    title: 'Night Shift Lighting Guide',
    desc: 'Optimize your workspace lighting for late-night and night shift work.',
    category: 'Lighting',
    tags: ['lighting', 'night shift', 'circadian']
  },
  'productive-workspace-mindset': {
    title: 'Productive Workspace Mindset',
    desc: 'Cultivate a mindset and workspace that maximizes productivity and focus.',
    category: 'Mindset',
    tags: ['productivity', 'mindset', 'workspace']
  },
  'small-home-office-organization-hacks': {
    title: 'Small Home Office Organization Hacks',
    desc: 'Maximize tight spaces with wall-mounted storage, fold-away desks, and vertical organization.',
    category: 'Organization',
    tags: ['organization', 'small space', 'storage']
  }
};

// ==============================
// BADGE DATA for products
// ==============================
const PRODUCT_BADGES = {
  default: 'badge--best',
  // Chair badges
  'SIHOO M57': 'badge--budget',
  'SIHOO': 'badge--budget',
  'Hbada E3': 'badge--budget',
  'Branch Ergonomic': 'badge--best',
  'Branch': 'badge--best',
  'Autonomous ErgoChair Pro': 'badge--ergonomic',
  'ErgoChair Pro': 'badge--ergonomic',
  'Ticova Ergonomic': 'badge--value',
  'Ticova': 'badge--value',
  'Steelcase Series 1': 'badge--value',
  'Steelcase Series 2': 'badge--premium',
  'Herman Miller Sayl': 'badge--premium',
  'Sayl': 'badge--premium',
  'Haworth Soji': 'badge--value',
  'Soji': 'badge--value',
  'Herman Miller Aeron': 'badge--best',
  'Aeron': 'badge--best',
  'Steelcase Gesture': 'badge--premium',
  'Gesture': 'badge--premium',
  'Steelcase Leap v2': 'badge--ergonomic',
  'Leap v2': 'badge--ergonomic',
  'Herman Miller Embody': 'badge--premium',
  'Embody': 'badge--premium',
  // Desk badges
  'Flexispot': 'badge--value',
  'SHW': 'badge--budget',
  'Uplift': 'badge--premium',
  'Jarvis': 'badge--premium',
  'Ergotron': 'badge--premium',
  'Branch Standing Desk': 'badge--best',
  'Vivo': 'badge--value',
  'Amazon Basics': 'badge--budget',
  'Kensington Solemate': 'badge--best',
  'Kensington Orbit': 'badge--value',
  'Logitech MX Master': 'badge--best',
  'MX Master': 'badge--best',
  'Logitech ERGO M575': 'badge--value',
  'Kinesis Freestyle2': 'badge--best',
  'Glorious Gaming': 'badge--value',
  'Cloudpeak': 'badge--budget',
  'Ergodriven Topo': 'badge--premium',
  'IKEA': 'badge--budget',
  'SKADIS': 'badge--value',
  'ErGear': 'badge--value',
  'Tribesigns': 'badge--value',
  'SOULWIT': 'badge--value',
  'Mr IRONSTONE': 'badge--budget',
  'Taotronics': 'badge--value',
  'Govee': 'badge--value',
  'Humanscale Float': 'badge--premium',
  'Humanscale': 'badge--premium',
  'DEVAISE': 'badge--value',
  'Uxcell': 'badge--budget',
  'LACK': 'badge--budget',
  'SYNCHRON': 'badge--budget',
  'Coleshome': 'badge--value',
  'Eureka Ergonomic': 'badge--value'
};

const BADGE_LABELS = {
  'badge--best': "Editor's Choice",
  'badge--value': 'Best Value',
  'badge--budget': 'Budget Pick',
  'badge--premium': 'Premium Pick',
  'badge--ergonomic': 'Best for Ergonomics'
};

const BADGE_CLASSES = {
  'badge--best': 'editor',
  'badge--value': 'value',
  'badge--budget': 'budget',
  'badge--premium': 'premium',
  'badge--ergonomic': 'ergonomic'
};

// ==============================
// RELATED GUIDES PER GUIDE
// ==============================
function getRelatedGuides(currentSlug) {
  const all = Object.entries(GUIDE_DATA).filter(([slug]) => slug !== currentSlug);
  const current = GUIDE_DATA[currentSlug];
  if (!current) return [];
  
  // Score by shared tags and category
  const scored = all.map(([slug, data]) => {
    let score = 0;
    if (data.category === current.category) score += 3;
    const sharedTags = data.tags.filter(t => current.tags.includes(t));
    score += sharedTags.length * 2;
    return { slug, data, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4);
}

function buildRelatedGuidesHTML(slug) {
  const related = getRelatedGuides(slug);
  if (related.length === 0) return '';
  
  const cards = related.map(({ slug: rSlug, data }) => {
    return `<a href="/guides/${rSlug}/" class="guide-card" style="text-decoration:none;color:inherit;display:block;">
      <div class="guide-card__content">
        <span class="guide-card__badge">${data.category}</span>
        <h3 class="guide-card__title">${data.title}</h3>
        <p class="guide-card__desc">${data.desc.substring(0, 120)}${data.desc.length > 120 ? '…' : ''}</p>
        <span class="guide-card__link">Read guide →</span>
      </div>
    </a>`;
  }).join('\n          ');
  
  return `
        <section class="related-guides">
          <h2 class="related-guides__title">Related Guides</h2>
          <div class="related-guides__carousel">
            ${cards}
          </div>
        </section>`;
}

// ==============================
// FAQ ACCORDION HELPERS
// ==============================
function extractFAQPairs(html) {
  const pairs = [];
  
  // Pattern 1: <div class="faq-item"> (with or without style) containing <h3> and <p>
  const faqItemRegex = /<div\s+class="faq-item"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
  let match;
  while ((match = faqItemRegex.exec(html)) !== null) {
    const inner = match[1];
    const h3Match = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const pMatch = inner.match(/<p>([\s\S]*?)<\/p>/);
    if (h3Match && pMatch) {
      pairs.push({ question: stripTags(h3Match[1].trim()), answer: pMatch[1].trim() });
    }
  }
  
  // If no pairs found yet, try other patterns
  if (pairs.length === 0) {
    // Pattern 2: <div style="background:..."> with <h4> and <p> (chair buying guide)
    const divBgRegex = /<div\s+style="background:var\(--color-surface\)[^>]*>([\s\S]*?)<\/div>/g;
    while ((match = divBgRegex.exec(html)) !== null) {
      const inner = match[1];
      const h4Match = inner.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
      const pMatch = inner.match(/<p>([\s\S]*?)<\/p>/);
      if (h4Match && pMatch) {
        pairs.push({ question: stripTags(h4Match[1].trim()), answer: pMatch[1].trim() });
      }
    }
  }
  
  if (pairs.length === 0) {
    // Pattern 3: <div itemscope> with <h3 itemprop="name"> (lighting guides)
    const itemscopeRegex = /<div\s+itemscope=[^>]*>([\s\S]*?)<\/div>/g;
    while ((match = itemscopeRegex.exec(html)) !== null) {
      const inner = match[1];
      const h3Match = inner.match(/<h3[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/h3>/);
      const textMatch = inner.match(/<div\s+itemprop="text">([\s\S]*?)<\/div>/);
      if (h3Match && textMatch) {
        pairs.push({ question: stripTags(h3Match[1].trim()), answer: stripTags(textMatch[1].trim()) });
      }
    }
  }
  
  if (pairs.length === 0) {
    // Pattern 4: Direct <h3> + <p> pairs (no wrapping div)
    const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g;
    while ((match = h3Regex.exec(html)) !== null) {
      pairs.push({ question: stripTags(match[1].trim()), answer: stripTags(match[2].trim()) });
    }
  }
  
  return pairs;
}

function stripTags(str) {
  return str.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, c => {
    const m = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#8217;': "'", '&#8212;': '—', '&#8230;': '…' };
    return m[c] || c;
  }).trim();
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildFAQSchema(pairs) {
  const items = pairs.map(p => JSON.stringify({
    '@type': 'Question',
    'name': p.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': p.answer
    }
  })).join(',\n      ');
  
  return `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      ${items}
    ]
  }
  </script>`;
}

function buildFAQAccordionHTML(pairs) {
  if (pairs.length === 0) return '';
  
  const items = pairs.map((p, i) => {
    const isOpen = i === 0;
    return `          <div class="faq-item">
            <button class="faq-question" aria-expanded="${isOpen ? 'true' : 'false'}" aria-controls="faq-answer-${i}">
              ${escapeAttr(p.question)}
              <span class="faq-chevron" aria-hidden="true">▾</span>
            </button>
            <div class="faq-answer" id="faq-answer-${i}"${isOpen ? '' : ' hidden'}>
              <p>${p.answer}</p>
            </div>
          </div>`;
  }).join('\n');
  
  return items;
}

// ==============================
// MAIN TRANSFORMATION FUNCTION
// ==============================
function enhanceGuide(filePath) {
  const basename = path.basename(filePath, '.html');
  let html = fs.readFileSync(filePath, 'utf8');
  const origHtml = html;
  const data = GUIDE_DATA[basename];
  
  if (!data) {
    console.log(`  ⚠️  No data entry for ${basename}, skipping`);
    return false;
  }
  
  // ====================
  // FEATURE 1: FAQ ACCORDION + SCHEMA
  // ====================
  
  // Extract FAQ section
  const faqRegex = /<h2[^>]*id="faq"[^>]*>.*?Frequently Asked Questions.*?<\/h2>([\s\S]*?)(?=<h2|<\/article>)/i;
  const faqMatch = html.match(faqRegex);
  
  if (faqMatch) {
    const faqSection = faqMatch[0];
    const faqContent = faqMatch[1];
    
    // Extract Q&A pairs
    const pairs = extractFAQPairs(faqSection);
    
    if (pairs.length > 0) {
      // Build accordion HTML
      const accordionItems = buildFAQAccordionHTML(pairs);
      const accordionHTML = `<h2 id="faq">Frequently Asked Questions</h2>
        <div class="faq-accordion">
${accordionItems}
        </div>`;
      
      // Replace FAQ section with accordion version
      // But first, handle case where it ends with </section>
      let faqSectionEnd = faqSection;
      if (/<\/section>\s*$/.test(faqSection)) {
        // Rebuild with proper section
        const newSection = `<section id="faq" class="faq-section">
        ${accordionHTML}
        </section>`;
        html = html.replace(faqSection, newSection);
      } else {
        // Check if there's a closing </div> from faq-list
        const cleanedSection = faqSection.replace(/<div\s+class="faq-list">\s*/, '');
        // Find the full FAQ section and replace it
        const fullSectionRegex = /<h2[^>]*id="faq"[^>]*>.*?Frequently Asked Questions.*?<\/h2>[\s\S]*?(?=<h2|<\/article>)/i;
        const fullMatch = html.match(fullSectionRegex);
        if (fullMatch) {
          html = html.replace(fullMatch[0], accordionHTML);
        }
      }
      
      // Build FAQPage schema
      const schema = buildFAQSchema(pairs);
      
      // Add schema before </head>
      html = html.replace('</head>', `  ${schema}\n</head>`);
      
      console.log(`  ✅ FAQ accordion: ${pairs.length} questions in ${basename}`);
    } else {
      console.log(`  ⚠️  No FAQ pairs extracted from ${basename}`);
    }
  } else {
    console.log(`  ⚠️  No FAQ section found in ${basename}`);
  }
  
  // ====================
  // FEATURE 2: RELATED GUIDES CAROUSEL
  // ====================
  
  const relatedHTML = buildRelatedGuidesHTML(basename);
  if (relatedHTML) {
    // Insert BEFORE newsletter-bar but after </article> or cta-section
    const newsletterRegex = /(\s*<section\s+class="newsletter-bar")/;
    if (newsletterRegex.test(html)) {
      html = html.replace(newsletterRegex, relatedHTML + '\n\n  $1');
      console.log(`  ✅ Related guides carousel added to ${basename}`);
    } else {
      console.log(`  ⚠️  No newsletter-bar found in ${basename}`);
    }
  }
  
  // ====================
  // FEATURE 3: BEST FOR BADGES ON TABLES
  // ====================
  
  // Find tables and add badge column/images
  let tableCount = 0;
  let lastHtml = '';
  
  while (html !== lastHtml) {
    lastHtml = html;
    
    const tableRegex = /(<table[^>]*>[\s\S]*?<\/table>)/gi;
    let tableMatch;
    
    // Reset regex
    const tables = [];
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      tables.push({ table: tableMatch[1], index: tableMatch.index });
    }
    
    if (tables.length === 0) break;
    
    // Process each table, but only ones that look like comparison/product tables
    for (let i = tables.length - 1; i >= 0; i--) {
      const { table, index } = tables[i];
      
      // Skip tables that are already processed
      if (table.includes('best-for-badge')) continue;
      
      // Check if this is a product comparison table (has product names, price columns, etc.)
      const hasPricing = /\$\d|Price/i.test(table);
      const hasProduct = /<a[^>]*href=[^>]*amazon/i.test(table) || /Best For/i.test(table);
      const hasBestForCol = /Best\s+For/i.test(table);
      
      if (!hasPricing && !hasProduct) {
        continue; // Skip non-product tables (like TOC)
      }
      
      tableCount++;
      
      // Parse table rows
      let newTable = table;
      
      // Add Best For column header if not present
      if (!hasBestForCol) {
        // Add column to thead
        newTable = newTable.replace('</tr>\n</thead>', '<th style="padding:var(--space-sm);text-align:left;border-bottom:2px solid var(--color-border);">Best For</th>\n</tr>\n</thead>');
        
        // Add badges to tbody rows
        newTable = newTable.replace(/<td[^>]*>[\s\S]*?<\/td>/gm, (td) => {
          // Only add to last column of each row
          return td;
        });
        
        // More precise approach: add badge column to each row
        newTable = newTable.replace(/(<tr[^>]*>\s*<td[^>]*>[\s\S]*?<\/td>\s*<td[^>]*>[\s\S]*?<\/td>\s*<td[^>]*>[\s\S]*?<\/td>\s*<td[^>]*>[\s\S]*?<\/td>\s*<td[^>]*>[\s\S]*?<\/td>\s*<td[^>]*>[\s\S]*?<\/td>\s*<td[^>]*>[\s\S]*?<\/td>\s*<td[^>]*>[\s\S]*?<\/td>)/gm, '$1' + getBadgeColumnForRow);
      }
      
      // Add product thumbnails to first column of each row
      newTable = addProductImages(newTable);
      
      // Replace old table with new
      html = html.replace(table, newTable);
    }
  }
  
  if (tableCount > 0) {
    console.log(`  ✅ Badges/images added to ${tableCount} table(s) in ${basename}`);
  }
  
  // ====================
  // ADD CSS TO HEAD
  // ====================
  
  const cssBlock = `
  <style>
    /* FAQ Accordion */
    .faq-accordion {
      margin: var(--space-lg) 0;
    }
    .faq-item {
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: var(--radius, 8px);
      margin-bottom: var(--space-sm, 8px);
      overflow: hidden;
      background: var(--color-surface, #fff);
    }
    .faq-question {
      width: 100%;
      padding: var(--space-md, 12px) var(--space-lg, 16px);
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-display, inherit);
      font-size: 1rem;
      font-weight: 600;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--color-text, #1a202c);
      line-height: 1.4;
    }
    .faq-question:hover {
      background: var(--color-bg-alt, #f7fafc);
    }
    .faq-chevron {
      transition: transform 0.3s ease;
      font-size: 0.75rem;
      flex-shrink: 0;
      margin-left: var(--space-sm, 8px);
    }
    .faq-question[aria-expanded="true"] .faq-chevron {
      transform: rotate(180deg);
    }
    .faq-answer {
      padding: 0 var(--space-lg, 16px) var(--space-md, 12px);
      color: var(--color-muted, #718096);
      line-height: 1.6;
    }
    .faq-answer p {
      margin: 0;
    }
    
    /* Best For Badges */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      white-space: nowrap;
      letter-spacing: 0.02em;
    }
    .badge--best {
      background: #dbeafe;
      color: #1e40af;
    }
    .badge--value {
      background: #dcfce7;
      color: #166534;
    }
    .badge--budget {
      background: #fed7aa;
      color: #9a3412;
    }
    .badge--premium {
      background: #fef3c7;
      color: #92400e;
    }
    .badge--ergonomic {
      background: #e9d5ff;
      color: #6b21a8;
    }
    
    /* Product Thumbnails */
    .product-thumb {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      vertical-align: middle;
      margin-right: 8px;
    }
    
    /* Related Guides Carousel */
    .related-guides {
      max-width: var(--max-width, 1200px);
      margin: var(--space-2xl, 32px) auto;
      padding: 0 var(--space-lg, 16px);
    }
    .related-guides__title {
      font-family: var(--font-display, serif);
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: var(--space-lg, 16px);
    }
    .related-guides__carousel {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--space-md, 12px);
    }
    @media (max-width: 640px) {
      .related-guides__carousel {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        gap: var(--space-sm, 8px);
        padding-bottom: var(--space-sm, 8px);
      }
      .related-guides__carousel .guide-card {
        min-width: 240px;
        scroll-snap-align: start;
        flex-shrink: 0;
      }
    }
    .related-guides .guide-card {
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: var(--radius, 8px);
      padding: var(--space-lg, 16px);
      background: var(--color-surface, #fff);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    .related-guides .guide-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    .guide-card__badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--color-primary-light, #e0f2fe);
      color: var(--color-primary, #0369a1);
      margin-bottom: var(--space-xs, 4px);
    }
    .guide-card__title {
      font-family: var(--font-display, serif);
      font-size: 1rem;
      font-weight: 600;
      margin: var(--space-xs, 4px) 0;
      line-height: 1.3;
    }
    .guide-card__desc {
      font-size: 0.85rem;
      color: var(--color-muted, #718096);
      line-height: 1.4;
      margin: var(--space-xs, 4px) 0;
    }
    .guide-card__link {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-primary, #0369a1);
      margin-top: var(--space-xs, 4px);
    }
  </style>`;
  
  // Add CSS before </head>
  html = html.replace('</head>', cssBlock + '\n</head>');
  
  // ====================
  // ADD FAQ ACCORDION SCRIPT
  // ====================
  
  const faqScript = `
  <script is:inline>
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.faq-question').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var expanded = this.getAttribute('aria-expanded') === 'true';
        var answer = this.nextElementSibling;
        
        this.setAttribute('aria-expanded', !expanded);
        if (answer) {
          answer.hidden = expanded;
        }
      });
    });
  });
  </script>`;
  
  // Add script before </body>
  html = html.replace('</body>', faqScript + '\n</body>');
  
  // ====================
  // WRITE OUTPUT
  // ====================
  
  if (html !== origHtml) {
    // Clean up double-blank lines
    html = html.replace(/\n{3,}/g, '\n\n');
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  ✅ ${basename} enhanced successfully`);
    return true;
  } else {
    console.log(`  ⚠️  No changes made to ${basename}`);
    return false;
  }
}

// ==============================
// HELPER: Get badge column for a row
// ==============================
function getBadgeColumnForRow(match) {
  // Find product name in the row
  const productNameMatch = match.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
  if (!productNameMatch) {
    return match.replace('</tr>', '<td style="padding:var(--space-sm);border-bottom:1px solid var(--color-border);text-align:center;"><span class="badge badge--value">Best Value</span></td>\n</tr>');
  }
  
  const name = productNameMatch[1].trim();
  const badgeClass = PRODUCT_BADGES[name] || PRODUCT_BADGES['default'] || 'badge--value';
  const label = BADGE_LABELS[badgeClass] || 'Best Value';
  
  return match.replace('</tr>', `<td style="padding:var(--space-sm);border-bottom:1px solid var(--color-border);text-align:center;"><span class="badge ${badgeClass} best-for-badge">${label}</span></td>\n</tr>`);
}

// ==============================
// HELPER: Add product images
// ==============================
function addProductImages(tableHTML) {
  // Find product name links in rows and add thumbnails
  return tableHTML.replace(/(<td[^>]*style="padding:var\(--space-sm\)[^"]*"[^>]*>)\s*(<a[^>]*>([\s\S]*?)<\/a>)/gi, (match, tdOpen, link, linkText) => {
    const name = linkText ? linkText.trim() : '';
    const imgURL = getUnsplashURL(name);
    return `${tdOpen}<img src="${imgURL}" alt="${escapeAttr(name)}" class="product-thumb" loading="lazy"> ${link}`;
  });
}

function getUnsplashURL(productName) {
  const lower = productName.toLowerCase();
  
  // Chair keywords
  if (/chair|aeron|gesture|embody|sayl|soji|leap|seating|sihoo|ticova|hbada|branch/.test(lower)) {
    return 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop';
  }
  // Desk keywords
  if (/desk|flexispot|uplift|jarvis|shw|standing/.test(lower)) {
    return 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop';
  }
  // Monitor keywords
  if (/monitor|screen|display/.test(lower)) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&h=80&fit=crop';
  }
  // Mouse keywords
  if (/mouse|mx master|kensington|logitech.*575|orbit|trackball/.test(lower)) {
    return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&h=80&fit=crop';
  }
  // Keyboard keywords
  if (/keyboard|kinesis|freestyle/.test(lower)) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop';
  }
  // Lighting keywords
  if (/lamp|light|govee|taotronics|brightech/.test(lower)) {
    return 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6f6?w=80&h=80&fit=crop';
  }
  // Cable management
  if (/cable|tray|raceway|velcro/.test(lower)) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop';
  }
  // Mat
  if (/mat|cloudpeak|ergodriven|topo|anti-fatigue/.test(lower)) {
    return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=80&h=80&fit=crop';
  }
  // Footrest
  if (/footrest|solemate|foot/.test(lower)) {
    return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=80&h=80&fit=crop';
  }
  // Cable raceway
  if (/pegboard|skadis|storage|organizer|soulwit|devise|uxcell|mr ironstone/.test(lower)) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop';
  }
  // Wrist rest
  if (/wrist|glorious/.test(lower)) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop';
  }
  // Headphone
  if (/headphone|headset/.test(lower)) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop';
  }
  
  return 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop';
}

// ==============================
// MAIN
// ==============================
const files = fs.readdirSync(GUIDES_DIR)
  .filter(f => f.endsWith('.html'))
  .sort()
  .map(f => path.join(GUIDES_DIR, f));

console.log(`\nEnhancing ${files.length} guide files...\n`);

let success = 0;
let fail = 0;

for (const file of files) {
  const basename = path.basename(file);
  console.log(`\n📄 ${basename}`);
  try {
    const result = enhanceGuide(file);
    if (result) success++;
    else fail++;
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    fail++;
  }
}

console.log(`\n🎯 Done! ${success} enhanced, ${fail} failed\n`);
