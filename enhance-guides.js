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

const BADGE_LABELS = {
  'badge--best': "Editor's Choice",
  'badge--value': 'Best Value',
  'badge--budget': 'Budget Pick',
  'badge--premium': 'Premium Pick',
  'badge--ergonomic': 'Best for Ergonomics'
};

// Known product badge map
const PRODUCT_BADGE_MAP = {};
const PRODUCT_ITEMS = [
  // Chairs
  ['SIHOO M57', 'badge--budget'], ['SIHOO', 'badge--budget'], ['Hbada E3', 'badge--budget'], ['Hbada', 'badge--budget'],
  ['Branch Ergonomic', 'badge--best'], ['Branch', 'badge--best'],
  ['Autonomous ErgoChair Pro', 'badge--ergonomic'], ['ErgoChair Pro', 'badge--ergonomic'],
  ['Ticova Ergonomic', 'badge--value'], ['Ticova', 'badge--value'],
  ['Steelcase Series 1', 'badge--value'], ['Steelcase Series 2', 'badge--premium'],
  ['Herman Miller Sayl', 'badge--premium'], ['Sayl', 'badge--premium'],
  ['Haworth Soji', 'badge--value'], ['Soji', 'badge--value'],
  ['Herman Miller Aeron', 'badge--best'], ['Aeron', 'badge--best'],
  ['Steelcase Gesture', 'badge--premium'], ['Gesture', 'badge--premium'],
  ['Steelcase Leap v2', 'badge--ergonomic'], ['Leap v2', 'badge--ergonomic'],
  ['Herman Miller Embody', 'badge--premium'], ['Embody', 'badge--premium'],
  // Desks
  ['Flexispot', 'badge--value'], ['SHW', 'badge--budget'], ['Uplift', 'badge--premium'],
  ['Jarvis', 'badge--premium'], ['Ergotron', 'badge--premium'],
  ['Branch Standing Desk', 'badge--best'], ['Vivo', 'badge--value'],
  ['Amazon Basics', 'badge--budget'], ['IKEA', 'badge--budget'], ['TROTTEN', 'badge--budget'],
  ['MARKUS', 'badge--value'], ['Coleshome', 'badge--value'],
  ['Eureka Ergonomic', 'badge--value'], ['Tribesigns', 'badge--value'],
  ['ErGear', 'badge--value'], ['Bush Furniture', 'badge--value'], ['Bestar', 'badge--premium'],
  // Accessories
  ['Kensington Solemate', 'badge--best'], ['Kensington Orbit', 'badge--value'],
  ['Logitech MX Master', 'badge--best'], ['MX Master', 'badge--best'],
  ['Logitech ERGO M575', 'badge--value'], ['Kinesis Freestyle2', 'badge--best'],
  ['Glorious Gaming', 'badge--value'], ['Cloudpeak', 'badge--budget'],
  ['Ergodriven Topo', 'badge--premium'], ['SKADIS', 'badge--value'],
  ['SOULWIT', 'badge--value'], ['Mr IRONSTONE', 'badge--budget'],
  ['Taotronics', 'badge--value'], ['Govee', 'badge--value'],
  ['Humanscale Float', 'badge--premium'], ['Humanscale', 'badge--premium'],
  ['DEVAISE', 'badge--value'], ['Uxcell', 'badge--budget'],
  ['LACK', 'badge--budget'], ['SYNCHRON', 'badge--budget'],
  ['SIGNUM', 'badge--value'], ['Lepro', 'badge--value'],
  ['Anker Power', 'badge--value'], ['Monoprice', 'badge--value'],
  ['WALI', 'badge--value'], ['HUANUO', 'badge--value'], ['Mount-It!', 'badge--value'],
  ['ErgoFoam', 'badge--value'], ['Glorious', 'badge--value'],
  ['Hobst', 'badge--value'], ['Furinno', 'badge--budget'],
  ['Wall Control', 'badge--value']
];
PRODUCT_ITEMS.forEach(([name, cls]) => { PRODUCT_BADGE_MAP[name.toLowerCase()] = cls; });

// ==============================
// RELATED GUIDES PER GUIDE
// ==============================
function getRelatedGuides(currentSlug) {
  const all = Object.entries(GUIDE_DATA).filter(([slug]) => slug !== currentSlug);
  const current = GUIDE_DATA[currentSlug];
  if (!current) return [];
  
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
        <span class="guide-card__badge">${escapeAttr(data.category)}</span>
        <h3 class="guide-card__title">${escapeAttr(data.title)}</h3>
        <p class="guide-card__desc">${escapeAttr(data.desc.substring(0, 120))}${data.desc.length > 120 ? '…' : ''}</p>
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
// HTML HELPERS
// ==============================
function stripTags(str) {
  return str.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, c => {
    const m = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#8217;': "'", '&#8212;': '—', '&#8230;': '…', '&#x27;': "'", '&nbsp;': ' ', '&#8211;': '–' };
    return m[c] || c;
  }).replace(/\s+/g, ' ').trim();
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeJSON(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
}

// ==============================
// FAQ EXTRACTION - Robust approach
// ==============================
/**
 * Extract Q&A pairs from the FAQ section HTML.
 * Handles all patterns found across the 16 guides.
 */
function extractFAQPairs(faqSectionHTML) {
  const pairs = [];
  
  // Strategy: find question/answer pairs by looking for heading elements followed by paragraphs
  // within the FAQ section, matching all known patterns.
  
  // Pattern 1: <h3> followed by <p> (most common - faq-item or direct)
  // Pattern 2: <h4> followed by <p> (chair-buying-guide)
  // Pattern 3: <h3 itemprop="name"> followed by <div itemprop="text"> containing <p> (lighting guides)
  
  // Use a state machine approach - scan line by line
  const lines = faqSectionHTML.split('\n');
  let currentQ = null;
  let currentA = null;
  let inTextDiv = false;
  let textDivDepth = 0;
  let pDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Detect opening of itemprop="text" div for lighting guides
    if (/itemprop="text"/.test(trimmed)) {
      inTextDiv = true;
      textDivDepth = 1;
      // Count the opening <div> in this line
      const opens = (trimmed.match(/<div/g) || []).length;
      const closes = (trimmed.match(/<\/div>/g) || []).length;
      textDivDepth = opens - closes;
      continue;
    }
    
    if (inTextDiv) {
      const opens = (trimmed.match(/<div/g) || []).length;
      const closes = (trimmed.match(/<\/div>/g) || []).length;
      textDivDepth += opens - closes;
      
      // Extract content from <p> tags inside text div
      if (/<p>/.test(trimmed)) {
        const pContent = trimmed.replace(/<p>/g, '').replace(/<\/p>/g, '').trim();
        if (currentA !== null) currentA += ' ' + stripTags(pContent);
        else currentA = stripTags(pContent);
      }
      
      if (textDivDepth <= 0) {
        // End of text div
        if (currentQ && currentA) {
          pairs.push({ question: currentQ, answer: currentA });
        }
        currentQ = null;
        currentA = null;
        inTextDiv = false;
        textDivDepth = 0;
      }
      // Even inside text div, check for <h3> cause the h3 comes before the text div opens
      const h3Match = trimmed.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      if (h3Match && !inTextDiv) {
        if (currentQ && currentA) {
          pairs.push({ question: currentQ, answer: currentA });
        }
        currentQ = stripTags(h3Match[1]);
        currentA = null;
      }
      continue;
    }
    
    // Match <h3> or <h4> headers (the question)
    const h3Match = trimmed.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const h4Match = trimmed.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
    
    if (h3Match || h4Match) {
      // Save previous pair
      if (currentQ && currentA) {
        pairs.push({ question: currentQ, answer: currentA });
      }
      currentQ = stripTags(h3Match ? h3Match[1] : h4Match[1]);
      currentA = null;
      continue;
    }
    
    // Match <p> tags (the answer) - only if we have an active question
    if (currentQ && /<p>/.test(trimmed) && !trimmed.startsWith('--') && !trimmed.startsWith('<h')) {
      // Extract text from <p> tag(s)
      let pContent = trimmed;
      // Remove <p> and </p> tags
      pContent = pContent.replace(/<\/?p[^>]*>/g, '');
      pContent = stripTags(pContent);
      if (pContent) {
        if (currentA) currentA += ' ' + pContent;
        else currentA = pContent;
      }
      continue;
    }
    
    // Also collect continuation text (text without any block-level tags)
    if (currentQ && currentA && !trimmed.startsWith('<') && trimmed.length > 0 && !trimmed.startsWith('--')) {
      const text = stripTags(trimmed);
      if (text && text.length > 10) {
        currentA += ' ' + text;
      }
    }
  }
  
  // Save last pair
  if (currentQ && currentA) {
    pairs.push({ question: currentQ, answer: currentA });
  }
  
  // Deduplicate and clean
  const seen = new Set();
  return pairs.filter(p => {
    const key = p.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return p.question && p.answer && p.question.length > 5 && p.answer.length > 10;
  });
}

/**
 * Extract the FAQ section HTML block from the full document.
 */
function extractFAQSection(html) {
  // Find the FAQ heading
  const faqHeadingRegex = /<h2[^>]*id="faq"[^>]*>.*?<span[^>]*>.*?<\/span>\s*Frequently Asked Questions\s*<\/h2>|<h2[^>]*id="faq"[^>]*>\s*(?:\d+\.\s*)?Frequently Asked Questions\s*<\/h2>|<h2[^>]*id="faq"[^>]*>\s*Freq.*?<\/h2>|<h2[^>]*id="[^"]*"[^>]*>Frequently\s*Asked\s*Questions/i;
  
  let match = html.match(faqHeadingRegex);
  
  // Try simpler pattern
  if (!match) {
    const simpleRegex = /<h2[^>]*>(?:Frequently Asked Questions|FAQ)\s*<\/h2>/i;
    match = html.match(simpleRegex);
  }
  
  if (!match) {
    // Try with section id="faq"
    const sectionRegex = /<section[^>]*id="faq"[^>]*>[\s\S]*?<\/section>/i;
    match = html.match(sectionRegex);
    return match ? match[0] : null;
  }
  
  // Find where FAQ section ends: next <h2> or </article>
  const faqStart = match.index;
  const afterFAQ = html.slice(faqStart + match[0].length);
  
  const nextH2 = afterFAQ.search(/<h2[^>]*>/);
  const articleEnd = afterFAQ.search(/<\/article>/);
  
  let endIdx;
  if (nextH2 === -1) {
    endIdx = articleEnd;
  } else if (articleEnd === -1) {
    endIdx = nextH2;
  } else {
    endIdx = Math.min(nextH2, articleEnd);
  }
  
  if (endIdx === -1) return null;
  
  return html.slice(faqStart, faqStart + match[0].length + endIdx);
}

function buildFAQSchema(pairs) {
  const items = pairs.map(p => {
    const q = escapeJSON(p.question);
    const a = escapeJSON(p.answer);
    return `    {
      "@type": "Question",
      "name": "${q}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${a}"
      }
    }`;
  }).join(',\n');
  
  return `  <script type="application/ld+json">
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
    const q = escapeAttr(p.question);
    const a = p.answer;
    return `          <div class="faq-item">
            <button class="faq-question" aria-expanded="${isOpen ? 'true' : 'false'}" aria-controls="faq-answer-${i}">
              ${q}
              <span class="faq-chevron" aria-hidden="true">▾</span>
            </button>
            <div class="faq-answer" id="faq-answer-${i}"${isOpen ? '' : ' hidden'}>
              <p>${a}</p>
            </div>
          </div>`;
  }).join('\n');
  
  return `<h2 id="faq">Frequently Asked Questions</h2>
        <div class="faq-accordion">
${items}
        </div>`;
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
  
  let hadChanges = false;
  
  // ====================
  // FEATURE 1: FAQ ACCORDION + SCHEMA
  // ====================
  
  const faqSection = extractFAQSection(html);
  
  if (faqSection) {
    const pairs = extractFAQPairs(faqSection);
    
    if (pairs.length > 0) {
      const accordionHTML = buildFAQAccordionHTML(pairs);
      
      // Replace the FAQ section in the HTML
      const idx = html.indexOf(faqSection);
      if (idx !== -1) {
        html = html.slice(0, idx) + accordionHTML + html.slice(idx + faqSection.length);
      }
      
      // Add FAQPage schema before </head>
      const schema = buildFAQSchema(pairs);
      html = html.replace('</head>', `  ${schema}\n</head>`);
      
      console.log(`  ✅ FAQ accordion: ${pairs.length} questions extracted`);
      hadChanges = true;
    } else {
      console.log(`  ⚠️  FAQ section found but 0 question pairs extracted`);
    }
  } else {
    console.log(`  ⚠️  No FAQ section found`);
  }
  
  // ====================
  // FEATURE 2: RELATED GUIDES CAROUSEL
  // ====================
  
  const relatedHTML = buildRelatedGuidesHTML(basename);
  if (relatedHTML) {
    const newsletterRegex = /(\s*<section\s+class="newsletter-bar")/;
    if (newsletterRegex.test(html)) {
      html = html.replace(newsletterRegex, relatedHTML + '\n\n  $1');
      console.log(`  ✅ Related guides carousel added`);
      hadChanges = true;
    } else {
      console.log(`  ⚠️  No newsletter-bar found`);
    }
  }
  
  // ====================
  // FEATURE 3: BEST FOR BADGES ON TABLES
  // ====================
  // FEATURE 4: PRODUCT IMAGES ON TABLES
  // ====================
  
  // Process tables - match all <table> blocks
  const tableRegex = /(<table[\s\S]*?<\/table>)/gi;
  let tableCount = 0;
  
  const tables = [];
  let tm;
  while ((tm = tableRegex.exec(html)) !== null) {
    tables.push({ table: tm[1], index: tm.index });
  }
  
  // Process tables in reverse order to preserve indices
  for (let i = tables.length - 1; i >= 0; i--) {
    let { table, index } = tables[i];
    
    // Skip if already processed or not a product table
    if (table.includes('best-for-badge')) continue;
    
    // Check if this looks like a product comparison table
    const hasProduct = /amazon\.com\/dp\//i.test(table) || /amzn\.to/i.test(table);
    const hasPricing = /\$\d+/i.test(table);
    const hasBestFor = /Best\s+For/i.test(table);
    
    if (!hasProduct && !hasPricing) continue;
    
    tableCount++;
    let newTable = table;
    
    // Add Best For column header if not present
    if (!hasBestFor) {
      // Add column to thead header
      newTable = newTable.replace(/(<\/tr>\s*<\/thead>)/i, '<th style="padding:var(--space-sm);text-align:left;border-bottom:2px solid var(--color-border);">Best For</th>\n$1');
      
      // Add badge column to each tbody row
      newTable = newTable.replace(/(<tr[^>]*>[\s\S]*?)(<\/tr>)/gi, (rowMatch, rowStart, rowEnd) => {
        // Skip header row
        if (/<th>/i.test(rowStart) || /<th\s/i.test(rowStart)) return rowMatch;
        
        // Find product name in this row
        const productMatch = rowStart.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
        let name = productMatch ? stripTags(productMatch[1]) : '';
        if (!name) {
          // Try to find text content of first td
          const tdMatch = rowStart.match(/<td[^>]*>([\s\S]*?)<\/td>/);
          if (tdMatch) name = stripTags(tdMatch[1]).trim();
        }
        
        const badgeClass = findBadge(name.toLowerCase());
        const label = BADGE_LABELS[badgeClass] || 'Best Value';
        
        return rowStart + `<td style="padding:var(--space-sm);border-bottom:1px solid var(--color-border);text-align:center;"><span class="badge ${badgeClass} best-for-badge">${label}</span></td>\n` + rowEnd;
      });
    } else {
      // Table already has Best For column - add badges to the last column
      // More complex: find product name and add badge in the Best For column
      // For simplicity, add badge class to existing text
      newTable = newTable.replace(/(<tr[^>]*>[\s\S]*?)(<\/tr>)/gi, (rowMatch, rowStart, rowEnd) => {
        if (/<th>/i.test(rowStart) || /<th\s/i.test(rowStart)) return rowMatch;
        
        // Find the last td in the row (which should be Best For)
        const lastTdMatch = rowStart.match(/(.*)(<td[^>]*>)([\s\S]*?)(<\/td>)\s*$/i);
        if (!lastTdMatch) return rowMatch;
        
        const beforeTd = lastTdMatch[1];
        const tdOpen = lastTdMatch[2];
        const tdContent = lastTdMatch[3].trim();
        const tdClose = lastTdMatch[4];
        
        // Find product name
        const productMatch = rowStart.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
        let name = productMatch ? stripTags(productMatch[1]) : '';
        
        const badgeClass = findBadge(name.toLowerCase());
        const label = BADGE_LABELS[badgeClass] || 'Best Value';
        
        return beforeTd + tdOpen + `<span class="badge ${badgeClass} best-for-badge">${label}</span> ${tdContent}` + tdClose + '\n' + rowEnd;
      });
    }
    
    // Add product thumbnails
    newTable = addProductImages(newTable);
    
    // Replace in html
    html = html.replace(table, newTable);
    
    // Remove the just-processed table from tables list so next iteration doesn't find it
    tables.splice(i, 1);
  }
  
  if (tableCount > 0) {
    console.log(`  ✅ Badges/images added to ${tableCount} table(s)`);
    hadChanges = true;
  }
  
  // ====================
  // ADD CSS
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
  
  html = html.replace('</head>', cssBlock + '\n</head>');
  hadChanges = true;
  
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
  
  html = html.replace('</body>', faqScript + '\n</body>');
  
  // ====================
  // WRITE OUTPUT
  // ====================
  
  // Clean up: remove multiple blank lines
  html = html.replace(/\n{3,}/g, '\n\n');
  
  if (html !== origHtml) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  ✅ ${basename} enhanced`);
    return true;
  } else {
    console.log(`  ⚠️  No changes`);
    return false;
  }
}

// ==============================
// HELPERS
// ==============================
function findBadge(name) {
  for (const [key, cls] of Object.entries(PRODUCT_BADGE_MAP)) {
    if (name.includes(key)) return cls;
  }
  return 'badge--best';
}

function addProductImages(tableHTML) {
  return tableHTML.replace(/(<a[^>]*href=["']https:\/\/(?:www\.)?amazon\.com\/dp\/[^"']*["'][^>]*>)([\s\S]*?)(<\/a>)/gi, (match, linkOpen, linkText, linkClose) => {
    const name = stripTags(linkText).trim();
    const imgURL = getUnsplashURL(name);
    return linkOpen + `<img src="${imgURL}" alt="${escapeAttr(name)}" class="product-thumb" loading="lazy"> ` + linkText + linkClose;
  });
  
  // Also handle amzn.to links
  return tableHTML.replace(/(<a[^>]*href=["']https:\/\/(?:www\.)?amzn\.to\/[^"']*["'][^>]*>)([\s\S]*?)(<\/a>)/gi, (match, linkOpen, linkText, linkClose) => {
    const name = stripTags(linkText).trim();
    const imgURL = getUnsplashURL(name);
    return linkOpen + `<img src="${imgURL}" alt="${escapeAttr(name)}" class="product-thumb" loading="lazy"> ` + linkText + linkClose;
  });
}

function getUnsplashURL(productName) {
  const lower = productName.toLowerCase();
  
  if (/chair|aeron|gesture|embody|sayl|soji|leap|seating|sihoo|ticova|hbada|branch/.test(lower)) {
    return 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop';
  }
  if (/desk|flexispot|uplift|jarvis|shw|standing|trotten|coleshome|bush/.test(lower)) {
    return 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop';
  }
  if (/monitor|screen|display|ergear/.test(lower)) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&h=80&fit=crop';
  }
  if (/mouse|mx master|kensington.*orbit|logitech.*575|orbit|trackball/.test(lower)) {
    return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&h=80&fit=crop';
  }
  if (/keyboard|kinesis|freestyle/.test(lower)) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop';
  }
  if (/lamp|light|govee|taotronics|brightech|led/.test(lower)) {
    return 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6f6?w=80&h=80&fit=crop';
  }
  if (/cable|tray|raceway|velcro|signum/.test(lower)) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop';
  }
  if (/mat|cloudpeak|ergodriven|topo|anti-fatigue/.test(lower)) {
    return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=80&h=80&fit=crop';
  }
  if (/footrest|solemate/.test(lower)) {
    return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=80&h=80&fit=crop';
  }
  if (/pegboard|skadis|storage|organizer|soulwit|devise|uxcell|mr ironstone|wall.*control|furinno|hobst/.test(lower)) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop';
  }
  if (/wrist|glorious/.test(lower)) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop';
  }
  if (/headphone|headset/.test(lower)) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop';
  }
  if (/anker|power.*strip/.test(lower)) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop';
  }
  if (/amazon.*basic/.test(lower)) {
    // For Amazon Basics, determine what category
    return 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop';
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

// First, restore files from git if available (to undo first broken run)
console.log(`\nRestoring files from git to get clean state...`);
try {
  const result = require('child_process').execSync('cd ' + GUIDES_DIR + ' && git checkout -- *.html 2>&1 || true').toString();
  if (result.trim()) console.log(`  ${result.trim()}`);
} catch(e) {
  console.log('  No git backup available, continuing with current files');
}

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
    console.error(err.stack);
    fail++;
  }
}

console.log(`\n🎯 Done! ${success} enhanced, ${fail} failed\n`);
