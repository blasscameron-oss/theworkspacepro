/* ============================================
   Build Your Office — Budget Calculator
   Interactive product recommender
   ============================================ */

const BYOState = {
  step: 0,
  totalSteps: 5,
  answers: {
    budget: 1000,
    workStyle: null,
    space: null,
    priority: null,
    standing: null
  }
};

// Product database — Amazon ASINs browser-verified live (Jul 2026), tag=workspacepro-20
const BYO_PRODUCTS = {
  chairs: [
    {
      name: "IKEA MARKUS Office Chair",
      price: 229,
      url: "https://www.ikea.com/us/en/p/markus-office-chair-vissle-dark-gray-70261150/",
      category: "Chair",
      desc: "Basic ergonomic office chair with built-in lumbar support and mesh back. Good entry-level option.",
      tiers: ["budget"],
      bestFor: ["general", "writer", "budget"]
    },
    {
      name: "HON Ignition 2.0 Mid-Back",
      price: 379,
      url: "https://www.amazon.com/dp/B06Y3PGPR2/?tag=workspacepro-20",
      category: "Chair",
      desc: "Mesh task chair with lumbar support — strong value pick for full workdays. Confirm current price on Amazon.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "developer", "writer", "ergonomics", "budget"]
    },
    {
      name: "Branch Ergonomic Chair",
      price: 329,
      url: "https://www.branchfurniture.com/products/ergonomic-chair",
      category: "Chair",
      desc: "Seven points of adjustment including lumbar, armrests, seat depth, and tilt. Modern design from Branch.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "creative", "writer", "ergonomics", "aesthetics"]
    },
    {
      name: "Autonomous ErgoChair",
      price: 499,
      url: "https://www.amazon.com/dp/B092ZNFF8P/?tag=workspacepro-20",
      category: "Chair",
      desc: "Feature-rich ergonomic chair often compared to premium models at a lower street price.",
      tiers: ["mid"],
      bestFor: ["developer", "gaming", "ergonomics"]
    },
    {
      name: "Herman Miller Sayl",
      price: 545,
      url: "https://www.amazon.com/dp/B07R62FKFZ/?tag=workspacepro-20",
      category: "Chair",
      desc: "Designer mid-range Herman Miller with a distinctive Y-Tower back. Check seller condition and warranty.",
      tiers: ["mid", "premium"],
      bestFor: ["general", "developer", "writer", "ergonomics", "aesthetics"]
    },
    {
      name: "Herman Miller Embody",
      price: 1395,
      url: "https://www.amazon.com/dp/B07NH69TWB/?tag=workspacepro-20",
      category: "Chair",
      desc: "Premium posture-focused chair for long sessions. High price — only if budget allows.",
      tiers: ["premium"],
      bestFor: ["general", "developer", "creative", "ergonomics", "productivity"]
    }
  ],

  desks: [
    {
      name: "IKEA LAGKAPTEN Desk",
      price: 89,
      url: "https://www.ikea.com/us/en/p/lagkapten-desk-black-brown-bamboo-00503604/",
      category: "Desk",
      desc: "Simple sitting desk. Budget-friendly for tight spaces. Pair with a monitor arm for height.",
      tiers: ["budget"],
      bestFor: ["general", "writer", "budget", "small"]
    },
    {
      name: "SHW Electric Standing Desk 55\"",
      price: 299,
      url: "https://www.amazon.com/dp/B085KBN2DN/?tag=workspacepro-20",
      category: "Desk",
      desc: "Budget electric standing desk with drawer options. Popular Amazon pick — verify capacity and height range for your body.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "developer", "budget", "standing"]
    },
    {
      name: "Branch Standing Desk",
      price: 499,
      url: "https://www.branchfurniture.com/products/standing-desk",
      category: "Desk",
      desc: "Dual-motor standing desk from Branch with solid warranty and clean design.",
      tiers: ["mid"],
      bestFor: ["general", "developer", "creative", "ergonomics", "aesthetics", "productivity", "standing", "large"]
    },
    {
      name: "Uplift V2 Standing Desk",
      price: 599,
      url: "https://www.upliftdesk.com/uplift-v2-standing-desk-v2-or-v2-commercial/",
      category: "Desk",
      desc: "Highly configurable dual-motor frame. Check live configuration pricing on Uplift.",
      tiers: ["premium"],
      bestFor: ["developer", "ergonomics", "productivity", "standing", "large"]
    }
  ],

  deskConverters: [
    {
      name: "Amazon Basics Monitor Stand (height)",
      price: 25,
      url: "https://www.amazon.com/dp/B07DHK5DHN/?tag=workspacepro-20",
      category: "Monitor Stand",
      desc: "Simple riser for eye-level monitors when a full arm isn’t in budget. Not a sit-stand converter.",
      tiers: ["budget"],
      bestFor: ["general", "writer", "budget", "small"]
    },
    {
      name: "WALI Dual Monitor Stand",
      price: 35,
      url: "https://www.amazon.com/dp/B018MSDG84/?tag=workspacepro-20",
      category: "Monitor Stand",
      desc: "Freestanding dual monitor stand — frees desk depth without clamp mounts.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "developer", "small"]
    }
  ],

  monitors: [
    {
      name: "ASUS ProArt PA278QV 27\" 1440p",
      price: 299,
      url: "https://www.amazon.com/dp/B088BC5HMM/?tag=workspacepro-20",
      category: "Monitor",
      desc: "27\" 1440p IPS with strong color coverage for office and light creative work.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "developer", "writer", "creative", "budget", "productivity"]
    },
    {
      name: "Dell S2722QC 27\" 4K USB-C",
      price: 350,
      url: "https://www.amazon.com/dp/B09DTDRJWP/?tag=workspacepro-20",
      category: "Monitor",
      desc: "4K with USB-C — sharper text and laptop charging for a cleaner setup.",
      tiers: ["mid"],
      bestFor: ["general", "developer", "creative", "productivity"]
    },
    {
      name: "Dell UltraSharp U2723QE 27\" 4K",
      price: 480,
      url: "https://www.amazon.com/dp/B09TQZP9CL/?tag=workspacepro-20",
      category: "Monitor",
      desc: "4K USB-C hub monitor — strong productivity pick. Prices fluctuate; check Amazon.",
      tiers: ["mid", "premium"],
      bestFor: ["developer", "creative", "productivity", "large"]
    },
    {
      name: "LG 32UN880-B 32\" 4K Ergo",
      price: 550,
      url: "https://www.amazon.com/dp/B08BCR862L/?tag=workspacepro-20",
      category: "Monitor",
      desc: "32\" 4K with Ergo stand — lots of space for multi-window work.",
      tiers: ["premium"],
      bestFor: ["developer", "creative", "productivity", "large"]
    }
  ],

  monitorArms: [
    {
      name: "WALI Dual Monitor Stand",
      price: 35,
      url: "https://www.amazon.com/dp/B018MSDG84/?tag=workspacepro-20",
      category: "Monitor Arm",
      desc: "Budget dual-monitor stand for two screens up to ~27\". Essential height upgrade.",
      tiers: ["budget"],
      bestFor: ["general", "developer", "writer", "ergonomics", "budget", "small"]
    },
    {
      name: "Ergotron LX Single Monitor Arm",
      price: 189,
      url: "https://www.amazon.com/dp/B00358RIRC/?tag=workspacepro-20",
      category: "Monitor Arm",
      desc: "Premium gas-spring arm with smooth motion. Worth it for heavy monitors or frequent height changes.",
      tiers: ["mid", "premium"],
      bestFor: ["developer", "creative", "ergonomics", "productivity"]
    },
    {
      name: "Ergotron LX Dual Monitor Arm",
      price: 299,
      url: "https://www.amazon.com/dp/B00P9JULWE/?tag=workspacepro-20",
      category: "Monitor Arm",
      desc: "Dual-arm Ergotron for two monitors — clean dual setup without freestanding base bulk.",
      tiers: ["premium"],
      bestFor: ["developer", "productivity"]
    }
  ],

  lighting: [
    {
      name: "IKEA TERTIAL Work Lamp",
      price: 15,
      url: "https://www.ikea.com/us/en/p/tertial-work-lamp-gray-80342987/",
      category: "Lighting",
      desc: "Classic adjustable desk lamp. Add a warm LED bulb for evening use.",
      tiers: ["budget"],
      bestFor: ["general", "writer", "budget", "small"]
    },
    {
      name: "tomons LED Desk Lamp",
      price: 30,
      url: "https://www.amazon.com/dp/B071CXPSDN/?tag=workspacepro-20",
      category: "Lighting",
      desc: "Multi-angle LED desk lamp — solid budget task light.",
      tiers: ["budget"],
      bestFor: ["general", "writer", "budget"]
    },
    {
      name: "BenQ ScreenBar",
      price: 99,
      url: "https://www.amazon.com/dp/B076VNFZJG/?tag=workspacepro-20",
      category: "Lighting",
      desc: "Monitor light bar — zero desk footprint, reduces glare.",
      tiers: ["mid"],
      bestFor: ["developer", "writer", "ergonomics", "small"]
    },
    {
      name: "BenQ ScreenBar Plus",
      price: 129,
      url: "https://www.amazon.com/dp/B07DP7RYXV/?tag=workspacepro-20",
      category: "Lighting",
      desc: "ScreenBar with desktop dial for brightness/color temp. Strong for late sessions.",
      tiers: ["mid", "premium"],
      bestFor: ["developer", "creative", "writer", "ergonomics", "productivity", "aesthetics", "small"]
    }
  ],

  keyboards: [
    {
      name: "Glorious Gaming Wrist Rest (TKL)",
      price: 25,
      url: "https://www.amazon.com/dp/B07C7WJSQL/?tag=workspacepro-20",
      category: "Keyboard Acc",
      desc: "Wrist pad for TKL keyboards — small comfort upgrade if you type all day.",
      tiers: ["budget", "mid"],
      bestFor: ["developer", "writer", "gaming"]
    }
  ],

  mice: [
    {
      name: "Logitech MX Master 3S",
      price: 99,
      url: "https://www.amazon.com/dp/B09HM94VDS/?tag=workspacepro-20",
      category: "Mouse",
      desc: "Premium productivity mouse with MagSpeed scroll and multi-device pairing.",
      tiers: ["mid", "premium"],
      bestFor: ["developer", "creative", "writer", "productivity"]
    },
    {
      name: "Logitech M720 Triathlon",
      price: 40,
      url: "https://www.amazon.com/dp/B087Z6LSHW/?tag=workspacepro-20",
      category: "Mouse",
      desc: "Multi-device wireless mouse — solid budget productivity pick.",
      tiers: ["budget"],
      bestFor: ["general", "budget"]
    }
  ],

  accessories: [
    {
      name: "Amazon Basics Anti-Fatigue Standing Mat",
      price: 30,
      url: "https://www.amazon.com/dp/B00OUFX0YY/?tag=workspacepro-20",
      category: "Accessory",
      desc: "Cushioned standing mat for standing-desk sessions.",
      tiers: ["budget"],
      bestFor: ["general", "standing", "ergonomics"]
    },
    {
      name: "KANGAROO Anti-Fatigue Mat",
      price: 45,
      url: "https://www.amazon.com/dp/B01H6AZC5Y/?tag=workspacepro-20",
      category: "Accessory",
      desc: "Thicker cushioned mat for longer standing periods.",
      tiers: ["mid"],
      bestFor: ["standing", "ergonomics"]
    },
    {
      name: "Simple Cord Under-Desk Cable Channel",
      price: 15,
      url: "https://www.amazon.com/dp/B06Y1DVNQD/?tag=workspacepro-20",
      category: "Accessory",
      desc: "J-channel cable management for a cleaner desk underside.",
      tiers: ["budget"],
      bestFor: ["general", "developer", "aesthetics", "productivity"]
    },
    {
      name: "Kensington Solemate Plus Footrest",
      price: 45,
      url: "https://www.amazon.com/dp/B0002DR45E/?tag=workspacepro-20",
      category: "Accessory",
      desc: "Adjustable footrest for better seated posture when feet don’t plant flat.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "ergonomics"]
    }
  ]
};

// --- Navigation ---

function byoNext() {
  if (BYOState.step < BYOState.totalSteps - 1) {
    BYOState.step++;
    byoRenderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    byoShowResults();
  }
}

function byoPrev() {
  if (BYOState.step > 0) {
    BYOState.step--;
    byoRenderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function byoSelect(el) {
  const parent = el.parentElement;
  parent.querySelectorAll('.byo-option').forEach(o => {
    o.classList.remove('selected');
    o.setAttribute('aria-checked', 'false');
  });
  el.classList.add('selected');
  el.setAttribute('aria-checked', 'true');
  const key = ['workStyle', 'space', 'priority', 'standing'][BYOState.step - 1];
  if (key) {
    BYOState.answers[key] = el.dataset.value;
    // Enable next button
    const nextBtn = document.getElementById('byoNext' + BYOState.step);
    if (nextBtn) nextBtn.disabled = false;
  }
}

function byoRenderStep() {
  document.querySelectorAll('.byo-step').forEach(s => s.classList.remove('active'));
  const step = document.querySelector('[data-step="' + BYOState.step + '"]');
  if (step) step.classList.add('active');

  // Update progress bars
  const bars = document.querySelectorAll('.byo-progress__bar');
  bars.forEach((bar, i) => {
    bar.classList.toggle('filled', i <= BYOState.step);
  });
}

// --- Budget slider ---

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.byo-options').forEach(group => {
    group.setAttribute('role', 'radiogroup');
    const question = group.closest('.byo-step')?.querySelector('.byo-question');
    if (question) group.setAttribute('aria-label', question.textContent.trim());
  });
  document.querySelectorAll('.byo-option').forEach(option => {
    option.setAttribute('role', 'radio');
    option.setAttribute('tabindex', '0');
    option.setAttribute('aria-checked', option.classList.contains('selected') ? 'true' : 'false');
    option.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        byoSelect(option);
      }
    });
  });
  const slider = document.getElementById('budgetSlider');
  if (slider) {
    slider.addEventListener('input', function() {
      BYOState.answers.budget = parseInt(this.value, 10);
      var formattedBudget = '$' + BYOState.answers.budget.toLocaleString();
      document.getElementById('budgetDisplay').textContent = formattedBudget;
      this.setAttribute('aria-valuetext', formattedBudget);
    });
  }
});

// --- Results engine ---

function byoShowResults() {
  // Hide steps, show results
  document.querySelectorAll('.byo-step').forEach(s => s.classList.remove('active'));
  document.getElementById('byoResults').classList.add('active');

  // Update progress
  const bars = document.querySelectorAll('.byo-progress__bar');
  bars.forEach(bar => bar.classList.add('filled'));

  // Build the product selection
  const setup = byoBuildSetup();
  byoRenderResults(setup);
}

function byoBuildSetup() {
  const budget = BYOState.answers.budget;
  const workStyle = BYOState.answers.workStyle;
  const space = BYOState.answers.space;
  const priority = BYOState.answers.priority;
  const standing = BYOState.answers.standing;

  // Determine budget tier
  let tier = 'budget';
  if (budget >= 1500) tier = 'premium';
  else if (budget >= 700) tier = 'mid';

  // Allocate budget based on priority
  let alloc = { chair: 0.35, desk: 0.25, monitor: 0.20, lighting: 0.08, accessories: 0.12 };
  if (priority === 'ergonomics') {
    alloc = { chair: 0.42, desk: 0.22, monitor: 0.18, lighting: 0.08, accessories: 0.10 };
  } else if (priority === 'productivity') {
    alloc = { chair: 0.28, desk: 0.22, monitor: 0.30, lighting: 0.08, accessories: 0.12 };
  } else if (priority === 'aesthetics') {
    alloc = { chair: 0.30, desk: 0.25, monitor: 0.18, lighting: 0.12, accessories: 0.15 };
  } else if (priority === 'budget') {
    alloc = { chair: 0.32, desk: 0.20, monitor: 0.22, lighting: 0.08, accessories: 0.08 };
  }

  // If standing = no, shift desk budget to chair and monitor
  if (standing === 'no') {
    alloc.chair += 0.05;
    alloc.monitor += 0.05;
    alloc.desk = 0.10;
  }
  if (standing === 'converter') {
    alloc.desk = 0.12; // converters are cheaper
    alloc.chair += 0.05;
    alloc.monitor += 0.05;
  }

  const setup = {};

  // Pick chair
  setup.chair = byoPickProduct('chairs', alloc.chair * budget, tier, workStyle, priority, space);

  // Pick desk or converter
  if (standing === 'yes') {
    setup.desk = byoPickProduct('desks', alloc.desk * budget, tier, workStyle, priority, space);
  } else if (standing === 'converter') {
    setup.desk = byoPickProduct('deskConverters', alloc.desk * budget, tier, workStyle, priority, space);
  } else {
    setup.desk = byoPickProduct('desks', alloc.desk * budget, 'budget', workStyle, priority, space);
  }

  // Pick monitor
  setup.monitor = byoPickProduct('monitors', alloc.monitor * budget, tier, workStyle, priority, space);

  // Pick monitor arm (if budget allows and not converter)
  if (budget >= 500 && standing !== 'converter') {
    setup.monitorArm = byoPickProduct('monitorArms', Math.min(alloc.accessories * budget * 0.5, 140), tier, workStyle, priority, space);
  }

  // Pick lighting
  setup.lighting = byoPickProduct('lighting', alloc.lighting * budget, tier, workStyle, priority, space);

  // Pick keyboard + mouse for developers/creatives
  if ((workStyle === 'developer' || workStyle === 'writer' || workStyle === 'creative') && budget >= 600) {
    const inputBudget = alloc.accessories * budget * 0.5;
    setup.keyboard = byoPickProduct('keyboards', inputBudget * 0.5, tier, workStyle, priority, space);
    setup.mouse = byoPickProduct('mice', inputBudget * 0.5, tier, workStyle, priority, space);
  }

  // Pick accessories (cable management, anti-fatigue mat)
  const accessoryBudget = alloc.accessories * budget * 0.3;
  if (budget >= 400) {
    if (standing === 'yes') {
      setup.accessory1 = byoPickProduct('accessories', accessoryBudget, tier, workStyle, 'ergonomics', space);
    } else {
      setup.accessory1 = byoPickProduct('accessories', accessoryBudget, 'budget', workStyle, 'aesthetics', space);
    }
  }

  return setup;
}

function byoPickProduct(category, targetPrice, tier, workStyle, priority, space) {
  const products = BYO_PRODUCTS[category];
  if (!products || products.length === 0) return null;

  // Score each product
  let scored = products.map(p => {
    let score = 0;

    // Price proximity to target (closer is better, but under is better than over)
    const priceDiff = p.price - targetPrice;
    if (priceDiff <= 0) {
      score += 100 - Math.abs(priceDiff) / targetPrice * 50; // under budget, closer is better
    } else {
      score += 50 - priceDiff / targetPrice * 50; // over budget, penalize heavily
    }

    // Tier match
    if (p.tiers.includes(tier)) score += 30;
    if (p.tiers.includes('budget') && tier !== 'budget') score += 5; // budget products are always fine

    // Work style match
    if (p.bestFor.includes(workStyle)) score += 25;

    // Priority match
    if (p.bestFor.includes(priority)) score += 20;

    // Space match
    if (space === 'small' && p.bestFor.includes('small')) score += 15;
    if (space === 'large' && p.bestFor.includes('large')) score += 10;

    // Never go over budget significantly
    if (p.price > targetPrice * 1.5) score -= 50;

    return { product: p, score: Math.max(0, score) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.product || null;
}

function byoRenderResults(setup) {
  const budget = BYOState.answers.budget;
  let total = 0;
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '<p class="affiliate-notice">Some product links are affiliate links. We may earn a commission at no extra cost to you.</p>';

  const categories = ['chair', 'desk', 'monitor', 'monitorArm', 'lighting', 'keyboard', 'mouse', 'accessory1'];

  categories.forEach(key => {
    const p = setup[key];
    if (!p) return;
    total += p.price;

    const card = document.createElement('div');
    card.className = 'byo-product-card';
    card.innerHTML = `
      <div class="byo-product-card__category">${p.category}</div>
      <div class="byo-product-card__name">${p.name}</div>
      <div class="byo-product-card__price">$${p.price.toLocaleString()}</div>
      <div class="byo-product-card__desc">${p.desc}</div>
      <a href="${p.url}" target="_blank" rel="sponsored noopener noreferrer" class="byo-product-card__cta">View Product →</a>
    `;
    grid.appendChild(card);
  });

  // Update budget tracker
  document.getElementById('trackerBudget').textContent = '$' + budget.toLocaleString();
  document.getElementById('trackerTotal').textContent = '$' + total.toLocaleString();
  const remaining = budget - total;
  const remainingEl = document.getElementById('trackerRemaining');
  const remainingLabel = document.getElementById('trackerRemainingLabel');
  if (remaining >= 0) {
    remainingEl.textContent = '$' + remaining.toLocaleString();
    remainingEl.className = 'byo-budget-amount under';
    remainingLabel.textContent = 'Remaining';
  } else {
    remainingEl.textContent = '-$' + Math.abs(remaining).toLocaleString();
    remainingEl.className = 'byo-budget-amount over';
    remainingLabel.textContent = 'Over Budget';
  }

  // Budget bar
  const pct = Math.min(100, (total / budget) * 100);
  const fill = document.getElementById('budgetFill');
  fill.style.width = pct + '%';
  fill.className = 'byo-budget-fill' + (total > budget ? ' over' : '');

  // Summary
  const summary = document.getElementById('setupSummary');
  let summaryHTML = '<h3>Your Setup Summary</h3>';
  summaryHTML += '<p style="margin-bottom:var(--space-md);line-height:1.6;">';
  summaryHTML += `<strong>Budget:</strong> $${budget.toLocaleString()} · <strong>Work Style:</strong> ${BYOState.answers.workStyle} · <strong>Space:</strong> ${BYOState.answers.space}<br>`;
  summaryHTML += `<strong>Priority:</strong> ${BYOState.answers.priority} · <strong>Total Estimated:</strong> $${total.toLocaleString()}`;

  if (remaining >= 0) {
    summaryHTML += ` · <span style="color:var(--c-accent);font-weight:700;">$${remaining.toLocaleString()} under budget</span>`;
    if (remaining > 150) {
      summaryHTML += `<br><br>💡 You have $${remaining.toLocaleString()} left. Consider upgrading your chair or adding a second monitor.`;
    }
  } else {
    summaryHTML += ` · <span style="color:var(--c-error);font-weight:700;">$${Math.abs(remaining).toLocaleString()} over budget</span>`;
    summaryHTML += `<br><br>💡 Consider choosing a budget option for one category, or increasing your budget by $${Math.abs(remaining).toLocaleString()}.`;
  }

  summaryHTML += '</p>';

  // Work style specific advice
  const advice = {
    developer: "For developer setups, prioritize monitor quality and desk stability. Dual monitors or an ultrawide dramatically improve productivity.",
    creative: "Creative work benefits from color-accurate monitors and good lighting. The BenQ ScreenBar eliminates glare on your screen.",
    writer: "Writers benefit from ergonomic keyboards and chairs. Your hands and back are your tools — invest in them.",
    general: "A balanced setup works best for general office work. Don't overspend on any single category.",
    gaming: "Gaming setups benefit from higher refresh rate monitors and mechanical keyboards. Don't neglect the chair — gaming sessions are long.",
    hybrid: "For hybrid work, flexibility is key. A standing desk and good chair cover the most scenarios."
  };
  if (advice[BYOState.answers.workStyle]) {
    summaryHTML += `<p style="color:var(--c-text-light);font-style:italic;">${advice[BYOState.answers.workStyle]}</p>`;
  }

  summary.innerHTML = summaryHTML;

  // Scroll to results
  setTimeout(() => {
    document.getElementById('byoResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function byoRestart() {
  BYOState.step = 0;
  BYOState.answers = { budget: 1000, workStyle: null, space: null, priority: null, standing: null };
  document.getElementById('byoResults').classList.remove('active');
  document.getElementById('budgetSlider').value = 1000;
  document.getElementById('budgetSlider').setAttribute('aria-valuetext', '$1,000');
  document.getElementById('budgetDisplay').textContent = '$1,000';
  document.querySelectorAll('.byo-option').forEach(o => { o.classList.remove('selected'); o.setAttribute('aria-checked', 'false'); });
  document.querySelectorAll('[id^="byoNext"]').forEach(b => {
    if (b.id !== 'byoNext0') b.disabled = true;
  });
  byoRenderStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function byoShare() {
  const setup = byoBuildSetup();
  let text = "My Home Office Setup (via The Workspace Pro)\n\n";
  let total = 0;
  Object.values(setup).filter(Boolean).forEach(p => {
    text += `• ${p.category}: ${p.name} — $${p.price}\n`;
    total += p.price;
  });
  text += `\nTotal: $${total}\nBudget: $${BYOState.answers.budget}\n`;
  text += `\nBuild yours: https://www.theworkspacepro.com/build-your-office`;

  navigator.clipboard.writeText(text).then(() => {
    alert('Setup copied to clipboard!');
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Setup copied to clipboard!');
  });
}


/* Optional catalog.json refresh (PR12) — fails open to inline PRODUCTS */
(function loadCatalogOptional() {
  if (typeof fetch === 'undefined') return;
  fetch('/assets/data/catalog.json', { credentials: 'same-origin' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.products || !data.products.length) return;
      window.__TWP_CATALOG__ = data;
      // Non-destructive: attach for tools; inline DBs remain authoritative for quiz logic
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('[TWP] catalog loaded', data.products.length, 'products');
      }
    })
    .catch(function () { /* offline / first paint — ignore */ });
})();

