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

// Product database — real products with real prices
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
      name: "HON Ignition 2.0 Task Chair",
      price: 379,
      url: "https://www.amazon.com/dp/B07YFF3JG7/?tag=workspacepro-20",
      category: "Chair",
      desc: "Highly adjustable mid-back chair with 4-way armrests, adjustable lumbar, and breathable mesh. Best value ergonomic chair.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "developer", "writer", "ergonomics", "budget"]
    },
    {
      name: "Branch Ergonomic Chair",
      price: 329,
      url: "https://www.branchfurniture.com/products/ergonomic-chair",
      category: "Chair",
      desc: "Seven points of adjustment including lumbar, armrests, seat depth, and tilt. Strong warranty and modern design.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "creative", "writer", "ergonomics", "aesthetics"]
    },
    {
      name: "SIDIZ T50 Task Chair",
      price: 399,
      url: "https://www.amazon.com/dp/B07P1L5Y3V/?tag=workspacepro-20",
      category: "Chair",
      desc: "Forward tilt, 4D armrests, and excellent lumbar support. Popular with developers for long coding sessions.",
      tiers: ["mid"],
      bestFor: ["developer", "gaming", "ergonomics"]
    },
    {
      name: "Steelcase Leap V2 (Refurbished)",
      price: 649,
      url: "https://www.amazon.com/dp/B08D8W6F8C/?tag=workspacepro-20",
      category: "Chair",
      desc: "Refurbished premium chair with Natural Glide seat, adjustable lumbar, and 12-year design life. Half the price of new.",
      tiers: ["mid", "premium"],
      bestFor: ["general", "developer", "writer", "ergonomics", "productivity"]
    },
    {
      name: "Herman Miller Aeron (Refurbished, Size B)",
      price: 799,
      url: "https://www.amazon.com/dp/B0BV6Z3L3Q/?tag=workspacepro-20",
      category: "Chair",
      desc: "Iconic mesh chair with PostureFit SL support. Refurbished models offer 70% savings over new with years of life remaining.",
      tiers: ["premium"],
      bestFor: ["general", "developer", "creative", "ergonomics", "aesthetics", "productivity"]
    }
  ],

  desks: [
    {
      name: "IKEA LAGKAPTEN Desk",
      price: 89,
      url: "https://www.ikea.com/us/en/p/lagkapten-desk-black-brown-bamboo-00503604/",
      category: "Desk",
      desc: "Simple sitting desk with bamboo top. Budget-friendly for tight spaces. Pair with a monitor riser for height.",
      tiers: ["budget"],
      bestFor: ["general", "writer", "budget", "small"]
    },
    {
      name: "SHW Electric Standing Desk 55\"",
      price: 299,
      url: "https://www.amazon.com/dp/B07C2T7B68/?tag=workspacepro-20",
      category: "Desk",
      desc: "Budget electric standing desk with memory presets, 55\" desktop, and 176 lb capacity. Best value standing desk on Amazon.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "developer", "budget", "standing"]
    },
    {
      name: "FlexiSpot E1 Standing Desk",
      price: 257,
      url: "https://www.amazon.com/dp/B08TV2HWPW/?tag=workspacepro-20",
      category: "Desk",
      desc: "Ultra-budget electric standing desk with 48\" desktop. Slightly cheaper than SHW with comparable specs.",
      tiers: ["budget"],
      bestFor: ["general", "writer", "budget", "standing", "small"]
    },
    {
      name: "Branch Standing Desk",
      price: 499,
      url: "https://www.branchfurniture.com/products/standing-desk/?ref=the_workspace_pro",
      category: "Desk",
      desc: "Dual-motor, 4 memory presets, 243 lb capacity, bamboo top. 7-year warranty. Best overall standing desk under $500.",
      tiers: ["mid"],
      bestFor: ["general", "developer", "creative", "ergonomics", "aesthetics", "productivity", "standing", "large"]
    },
    {
      name: "Uplift V2 Standing Desk",
      price: 599,
      url: "https://www.upliftdesk.com/uplift-v2-standing-desk-v2-or-v2-commercial/",
      category: "Desk",
      desc: "Premium dual-motor desk with 355 lb capacity, 25.5-51.5\" height range, and dozens of desktop options. Best for tall/short users.",
      tiers: ["premium"],
      bestFor: ["developer", "ergonomics", "productivity", "standing", "large"]
    }
  ],

  deskConverters: [
    {
      name: "VIVO Standing Desk Converter",
      price: 119,
      url: "https://www.amazon.com/dp/B07PVG4Y4R/?tag=workspacepro-20",
      category: "Desk Converter",
      desc: "Gas-spring riser that converts any desk to standing. 36\" wide, holds dual monitors. Budget-friendly standing option.",
      tiers: ["budget"],
      bestFor: ["general", "writer", "budget", "standing", "small"]
    },
    {
      name: "FlexiSpot M2B Converter",
      price: 170,
      url: "https://www.amazon.com/dp/B075G5HJBB/?tag=workspacepro-20",
      category: "Desk Converter",
      desc: "Wider 35\" desktop with 12 height settings and keyboard tray. More stable than budget risers.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "developer", "standing", "small"]
    }
  ],

  monitors: [
    {
      name: "AOC 24G2 24\" 1080p",
      price: 120,
      url: "https://www.amazon.com/dp/B07WVN4CV9/?tag=workspacepro-20",
      category: "Monitor",
      desc: "Budget 24\" IPS monitor. Fine for basic office work, but consider upgrading to 27\" if budget allows.",
      tiers: ["budget"],
      bestFor: ["general", "budget", "small"]
    },
    {
      name: "ASUS ProArt 27\" 1440p",
      price: 299,
      url: "https://www.amazon.com/dp/B08DF6QD8N/?tag=workspacepro-20",
      category: "Monitor",
      desc: "27\" 1440p IPS panel with 100% sRGB. Excellent value for general office work and light creative work.",
      tiers: ["budget", "mid"],
      bestFor: ["general", "developer", "writer", "creative", "budget", "productivity"]
    },
    {
      name: "Dell U2723QE 27\" 4K USB-C",
      price: 480,
      url: "https://www.amazon.com/dp/B09QN2B6MJ/?tag=workspacepro-20",
      category: "Monitor",
      desc: "4K USB-C hub monitor with 90W power delivery, daisy-chain, and excellent color accuracy. Developer favorite.",
      tiers: ["mid", "premium"],
      bestFor: ["developer", "creative", "productivity", "large"]
    },
    {
      name: "LG 27UN850-W 27\" 4K USB-C",
      price: 396,
      url: "https://www.amazon.com/dp/B08P3LJ7VQ/?tag=workspacepro-20",
      category: "Monitor",
      desc: "4K USB-C monitor with 60W charging, IPS panel, and HDR10. Great all-around 4K pick.",
      tiers: ["mid"],
      bestFor: ["general", "developer", "creative", "productivity"]
    }
  ],

  monitorArms: [
    {
      name: "VIVO Single Monitor Gas-Spring Arm",
      price: 30,
      url: "https://www.amazon.com/dp/B07PVG4Y4R/?tag=workspacepro-20",
      category: "Monitor Arm",
      desc: "Budget gas-spring monitor arm. Full motion, clamp mount, holds up to 27\". Essential ergonomic upgrade.",
      tiers: ["budget"],
      bestFor: ["general", "developer", "writer", "ergonomics", "budget", "small"]
    },
    {
      name: "Ergotron LX Desk Mount",
      price: 139,
      url: "https://www.amazon.com/dp/B075G5HJBB/?tag=workspacepro-20",
      category: "Monitor Arm",
      desc: "Premium monitor arm with smoother motion and better durability. Worth it for heavy monitors or daily height changes.",
      tiers: ["mid", "premium"],
      bestFor: ["developer", "creative", "ergonomics", "productivity"]
    }
  ],

  lighting: [
    {
      name: "IKEA TERTIAL Work Lamp",
      price: 15,
      url: "https://www.ikea.com/us/en/p/tertial-work-lamp-gray-80342987/",
      category: "Lighting",
      desc: "Classic adjustable desk lamp. Add a warm LED bulb for evening use. Cheapest lighting option.",
      tiers: ["budget"],
      bestFor: ["general", "writer", "budget", "small"]
    },
    {
      name: "Tomons LED Desk Lamp",
      price: 27,
      url: "https://www.amazon.com/dp/B07QB4QW2H/?tag=workspacepro-20",
      category: "Lighting",
      desc: "LED desk lamp with 5 color temperatures and 5 brightness levels. Good all-around budget pick.",
      tiers: ["budget"],
      bestFor: ["general", "writer", "budget"]
    },
    {
      name: "BenQ ScreenBar Plus",
      price: 109,
      url: "https://www.amazon.com/dp/B07B4C6K2Q/?tag=workspacepro-20",
      category: "Lighting",
      desc: "Monitor light bar with adjustable color temperature and auto-dimming. Zero desk space, eliminates screen glare.",
      tiers: ["mid", "premium"],
      bestFor: ["developer", "creative", "writer", "ergonomics", "productivity", "aesthetics", "small"]
    },
    {
      name: "Govee RGBIC Floor Lamp",
      price: 60,
      url: "https://www.amazon.com/dp/B09KGNVC2L/?tag=workspacepro-20",
      category: "Lighting",
      desc: "Smart floor lamp with app control and RGB lighting. Great for ambient lighting and room aesthetics.",
      tiers: ["mid"],
      bestFor: ["creative", "gaming", "aesthetics", "large"]
    }
  ],

  keyboards: [
    {
      name: "Logitech MX Keys S",
      price: 109,
      url: "https://www.amazon.com/dp/B0BV6Z3L3Q/?tag=workspacepro-20",
      category: "Keyboard",
      desc: "Low-profile mechanical keyboard with backlit keys, multi-device pairing, and excellent typing feel.",
      tiers: ["mid"],
      bestFor: ["developer", "writer", "creative", "productivity"]
    },
    {
      name: "Keychron K2 Wireless Mechanical",
      price: 99,
      url: "https://www.amazon.com/dp/B08B3MQRC1/?tag=workspacepro-20",
      category: "Keyboard",
      desc: "Compact 75% mechanical keyboard with hot-swappable switches. Developer and writer favorite.",
      tiers: ["mid"],
      bestFor: ["developer", "writer", "gaming"]
    }
  ],

  mice: [
    {
      name: "Logitech MX Master 3S",
      price: 99,
      url: "https://www.amazon.com/dp/B09HM94VDS/?tag=workspacepro-20",
      category: "Mouse",
      desc: "Premium productivity mouse with MagSpeed scroll, app-specific shortcuts, and 70-day battery.",
      tiers: ["mid", "premium"],
      bestFor: ["developer", "creative", "writer", "productivity"]
    },
    {
      name: "Logitech G305 Lightspeed",
      price: 40,
      url: "https://www.amazon.com/dp/B07VGRJ7YT/?tag=workspacepro-20",
      category: "Mouse",
      desc: "Wireless gaming mouse that's great for productivity too. Budget-friendly, lightweight, long battery.",
      tiers: ["budget"],
      bestFor: ["general", "gaming", "budget"]
    }
  ],

  accessories: [
    {
      name: "ComfiLife Anti-Fatigue Mat",
      price: 33,
      url: "https://www.amazon.com/dp/B07JGFBKQ1/?tag=workspacepro-20",
      category: "Accessory",
      desc: "Cushioned floor mat for standing desk use. Reduces foot and back fatigue during standing sessions.",
      tiers: ["budget"],
      bestFor: ["general", "standing", "ergonomics"]
    },
    {
      name: "VIVO Under-Desk Cable Tray",
      price: 17,
      url: "https://www.amazon.com/dp/B08TV2HWPW/?tag=workspacepro-20",
      category: "Accessory",
      desc: "Cable management tray that mounts under your desk. Keeps cables hidden and organized.",
      tiers: ["budget"],
      bestFor: ["general", "developer", "aesthetics", "productivity"]
    },
    {
      name: "Ergodriven Topo Anti-Fatigue Mat",
      price: 60,
      url: "https://www.amazon.com/dp/B075G5HJBB/?tag=workspacepro-20",
      category: "Accessory",
      desc: "Textured standing mat with contoured surface that encourages micro-movement. Premium standing desk accessory.",
      tiers: ["mid"],
      bestFor: ["standing", "ergonomics", "productivity"]
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
  parent.querySelectorAll('.byo-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  const key = ['workStyle', 'space', 'priority', 'standing'][BYOState.step - 1];
  if (key) {
    BYOState.answers[key] = el.dataset.value;
    // Enable next button
    const nextBtn = document.getElementById('byoNext' + (BYOState.step - 1));
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
  const slider = document.getElementById('budgetSlider');
  if (slider) {
    slider.addEventListener('input', function() {
      BYOState.answers.budget = parseInt(this.value);
      document.getElementById('budgetDisplay').textContent = '$' + this.value.toLocaleString();
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
  grid.innerHTML = '';

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
  document.getElementById('budgetDisplay').textContent = '$1,000';
  document.querySelectorAll('.byo-option').forEach(o => o.classList.remove('selected'));
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
  text += `\nBuild yours: https://www.theworkspacepro.com/build-your-office/`;

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
