/* ============================================
   Workspace Assessment Tool
   The real product of The Workspace Pro
   ============================================ */

const AssessmentState = {
  step: 0,
  totalSteps: 6,
  answers: {}
};

// Product database — real products with real specs
const PRODUCTS = {
  chairs: [
    {
      name: "IKEA Markus",
      price: 229,
      url: "https://www.ikea.com/us/en/p/markus-office-chair-vissle-dark-gray-70261150/",
      heightRange: "5'6\" - 6'2\"",
      adjustability: "low",
      bestFor: ["budget"]
    },
    {
      name: "Branch Ergonomic Chair",
      price: 329,
      url: "https://www.branchfurniture.com/products/ergonomic-chair",
      heightRange: "5'0\" - 6'3\"",
      adjustability: "high",
      bestFor: ["budget", "general", "back-pain"]
    },
    {
      name: "HON Ignition 2.0",
      price: 379,
      url: "https://www.amazon.com/dp/B07YFF3JG7?tag=workspacepro-20",
      heightRange: "5'2\" - 6'4\"",
      adjustability: "medium",
      bestFor: ["budget", "general"]
    },
    {
      name: "Herman Miller Sayl",
      price: 545,
      url: "https://www.hermanmiller.com/products/seating/office-chairs/sayl-chairs/",
      heightRange: "5'0\" - 6'6\"",
      adjustability: "medium",
      bestFor: ["general", "design"]
    },
    {
      name: "Steelcase Leap V2",
      price: 899,
      url: "https://www.steelcase.com/products/office-chairs/leap/",
      heightRange: "5'2\" - 6'5\"",
      adjustability: "high",
      bestFor: ["back-pain", "long-hours", "premium"]
    },
    {
      name: "Herman Miller Aeron (Size B)",
      price: 1395,
      url: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chairs/",
      heightRange: "5'3\" - 6'6\"",
      adjustability: "high",
      bestFor: ["long-hours", "premium", "back-pain"]
    },
    {
      name: "SIDIZ T50",
      price: 399,
      url: "https://www.amazon.com/dp/B07P1L5Y3V?tag=workspacepro-20",
      heightRange: "5'1\" - 6'3\"",
      adjustability: "high",
      bestFor: ["budget", "developer", "general"]
    },
    {
      name: " Nouhaus Ergo3D",
      price: 350,
      url: "https://www.amazon.com/dp/B08D8W6F8C?tag=workspacepro-20",
      heightRange: "5'3\" - 6'3\"",
      adjustability: "medium",
      bestFor: ["budget", "general"]
    }
  ],
  desks: [
    {
      name: "IKEA TROTTEN Standing Desk",
      price: 199,
      url: "https://www.ikea.com/us/en/p/trotten-desk-stand-up-black-s09322329/",
      type: "standing",
      bestFor: ["budget"]
    },
    {
      name: "Branch Standing Desk",
      price: 499,
      url: "https://www.branchfurniture.com/products/standing-desk",
      type: "standing",
      bestFor: ["general", "budget"]
    },
    {
      name: "Fully Jarvis Bamboo",
      price: 549,
      url: "https://www.fully.com/standing-desks/jarvis.html",
      type: "standing",
      bestFor: ["general", "premium"]
    },
    {
      name: "Uplift V2 Standing Desk",
      price: 599,
      url: "https://www.upliftdesk.com/uplift-v2-standing-desk-v2-or-v2-commercial/",
      type: "standing",
      bestFor: ["general", "premium", "tall"]
    },
    {
      name: "Vari Electric Standing Desk",
      price: 650,
      url: "https://www.vari.com/desks/standing-desks/electric-standing-desk/",
      type: "standing",
      bestFor: ["general", "premium"]
    },
    {
      name: "SHW Electric Standing Desk",
      price: 299,
      url: "https://www.amazon.com/dp/B07Z5K6DFM?tag=workspacepro-20",
      type: "standing",
      bestFor: ["budget"]
    }
  ],
  monitors: [
    {
      name: "ASUS ProArt 27\" 1440p",
      price: 299,
      url: "https://www.amazon.com/dp/B08DF6QD8N?tag=workspacepro-20",
      bestFor: ["budget", "general"]
    },
    {
      name: "LG 27UN850-W 27\" 4K",
      price: 396,
      url: "https://www.lg.com/us/monitors/lg-27un850-w-4k-uhd-led-monitor",
      bestFor: ["general", "developer"]
    },
    {
      name: "Dell U2723QE 27\" 4K",
      price: 480,
      url: "https://www.dell.com/en-us/shop/dell-ultrasharp-27-4k-usb-c-hub-monitor-u2723qe/apd/210-bclf/monitors-monitor-accessories",
      bestFor: ["developer", "premium"]
    },
    {
      name: "Samsung Odyssey G7 32\"",
      price: 700,
      url: "https://www.amazon.com/dp/B08DHH7M47?tag=workspacepro-20",
      bestFor: ["developer", "premium", "gaming"]
    }
  ],
  monitorArms: [
    {
      name: "Amazon Basics Single Monitor Arm",
      price: 22,
      url: "https://www.amazon.com/dp/B0725Q5L2M?tag=workspacepro-20",
      bestFor: ["budget"]
    },
    {
      name: "Ergotron LX Desk Mount",
      price: 139,
      url: "https://www.ergotron.com/en-us/products/product-details/45-241-026",
      bestFor: ["general", "premium"]
    }
  ],
  lighting: [
    {
      name: "IKEA TERTIAL Work Lamp",
      price: 15,
      url: "https://www.ikea.com/us/en/p/tertial-work-lamp-dark-gray-80342987/",
      bestFor: ["budget"]
    },
    {
      name: "Tomons LED Desk Lamp",
      price: 27,
      url: "https://www.amazon.com/dp/B07QB4QW2H?tag=workspacepro-20",
      bestFor: ["budget", "general"]
    },
    {
      name: "BenQ ScreenBar Plus",
      price: 109,
      url: "https://www.benq.com/en-us/monitor-light/bar/monitor-light-screenbar-plus.html",
      bestFor: ["general", "night-shift"]
    },
    {
      name: "Govee RGBIC Floor Lamp",
      price: 60,
      url: "https://www.amazon.com/dp/B09KGNVC2L?tag=workspacepro-20",
      bestFor: ["general", "design"]
    }
  ],
  accessories: [
    {
      name: "Cloudpeak Anti-Fatigue Mat",
      price: 33,
      url: "https://www.amazon.com/dp/B07VF3ZB5S?tag=workspacepro-20",
      bestFor: ["standing"]
    },
    {
      name: "Kensington Solemate Plus Footrest",
      price: 45,
      url: "https://www.kensington.com/p/products/ergonomics/footrests/solemate-plus-adjustable-footrest/",
      bestFor: ["general", "short"]
    },
    {
      name: "Logitech MX Master 3S",
      price: 99,
      url: "https://www.logitech.com/en-us/products/mice/mx-master-3s.html",
      bestFor: ["developer", "general"]
    },
    {
      name: "Kinesis Freestyle2 Split Keyboard",
      price: 89,
      url: "https://kinesis-ergo.com/shop/freestyle2-for-pc-us/",
      bestFor: ["ergonomic", "developer"]
    },
    {
      name: "Logitech MX Keys S",
      price: 109,
      url: "https://www.logitech.com/en-us/products/keyboards/mx-keys-s.html",
      bestFor: ["developer", "general"]
    },
    {
      name: "VIVO Under-Desk Cable Management Tray",
      price: 17,
      url: "https://www.amazon.com/dp/B07KG6Q4B5?tag=workspacepro-20",
      bestFor: ["general", "space-saver"]
    },
    {
      name: "Ergodriven Topo Mat",
      price: 119,
      url: "https://www.amazon.com/dp/B07P1L5Y3V?tag=workspacepro-20",
      bestFor: ["standing", "premium"]
    }
  ]
};

const PERSONAS = {
  "budget-builder": {
    name: "The Budget Builder",
    desc: "You're building a solid workspace without breaking the bank. Smart picks that punch above their weight."
  },
  "ergonomic-optimizer": {
    name: "The Ergonomic Optimizer",
    desc: "Your health comes first. You need gear that supports your body through long work sessions."
  },
  "standing-convert": {
    name: "The Standing Convert",
    desc: "You're ready to ditch the sitting-only life. Your setup revolves around movement and posture changes."
  },
  "power-user": {
    name: "The Power User",
    desc: "You spend 8+ hours at your desk. Premium comfort and adjustability are non-negotiable."
  },
  "space-saver": {
    name: "The Space Saver",
    desc: "Every inch counts. You need compact, multi-purpose gear that fits tight quarters."
  },
  "night-owl": {
    name: "The Night Owl",
    desc: "Late sessions mean lighting and eye strain are your top priorities."
  },
  "developer-setup": {
    name: "The Developer Setup",
    desc: "Multi-monitor, mechanical keyboard, maximum productivity. Your workspace is your command center."
  }
};

function initAssessment() {
  // Load saved state
  const saved = sessionStorage.getItem('assessmentState');
  if (saved) {
    try {
      Object.assign(AssessmentState, JSON.parse(saved));
    } catch(e) {}
  }
  renderStep();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', nextStep);
  });
  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', prevStep);
  });
  document.querySelectorAll('.choice-card').forEach(card => {
    card.addEventListener('click', () => selectChoice(card));
  });
  document.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('input', updateRangeValue);
  });
  document.getElementById('restartAssessment')?.addEventListener('click', restartAssessment);
  document.getElementById('emailResults')?.addEventListener('click', emailResults);
}

function selectChoice(card) {
  const group = card.parentElement;
  const key = card.dataset.question;
  const value = card.dataset.value;
  
  group.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  AssessmentState.answers[key] = value;
  saveState();
  
  // Auto-advance after 400ms
  setTimeout(() => {
    if (AssessmentState.step < AssessmentState.totalSteps - 1) {
      nextStep();
    }
  }, 400);
}

function updateRangeValue(e) {
  const input = e.target;
  const display = document.getElementById(input.dataset.display);
  if (display) {
    let val = input.value;
    // Convert inches to feet/inches format for height
    if (input.dataset.question === 'height') {
      const inches = parseInt(val);
      const feet = Math.floor(inches / 12);
      const remaining = inches % 12;
      val = feet + "'" + (remaining > 0 ? remaining + '"' : '"');
    } else if (input.dataset.suffix) {
      val += input.dataset.suffix;
    }
    display.textContent = val;
  }
  AssessmentState.answers[input.dataset.question] = input.value;
  saveState();
}

function nextStep() {
  if (AssessmentState.step < AssessmentState.totalSteps - 1) {
    AssessmentState.step++;
    saveState();
    renderStep();
    scrollToTop();
  } else {
    showResults();
  }
}

function prevStep() {
  if (AssessmentState.step > 0) {
    AssessmentState.step--;
    saveState();
    renderStep();
    scrollToTop();
  }
}

function renderStep() {
  document.querySelectorAll('.assessment-step').forEach(s => s.classList.remove('active'));
  const stepEl = document.querySelector(`.assessment-step[data-step="${AssessmentState.step}"]`);
  if (stepEl) stepEl.classList.add('active');
  
  // Update step indicator
  document.querySelectorAll('.step-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i < AssessmentState.step) dot.classList.add('done');
    else if (i === AssessmentState.step) dot.classList.add('active');
  });
  
  // Update step label
  const labels = ['Work Style', 'Body & Comfort', 'Your Space', 'Budget', 'Priorities', 'Results'];
  const labelEl = document.getElementById('stepLabel');
  if (labelEl) labelEl.textContent = `Step ${AssessmentState.step + 1} of ${AssessmentState.totalSteps} — ${labels[AssessmentState.step]}`;
  
  // Restore selections
  document.querySelectorAll('.choice-card').forEach(card => {
    if (AssessmentState.answers[card.dataset.question] === card.dataset.value) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
  
  // Restore ranges
  document.querySelectorAll('input[type="range"]').forEach(input => {
    if (AssessmentState.answers[input.dataset.question]) {
      input.value = AssessmentState.answers[input.dataset.question];
      updateRangeValue({ target: input });
    }
  });
}

function saveState() {
  sessionStorage.setItem('assessmentState', JSON.stringify(AssessmentState));
}

function scrollToTop() {
  const card = document.getElementById('assessment-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  // Only scroll if the card top is above the viewport (i.e. user scrolled down past it)
  if (rect.top < 0) {
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function determinePersona() {
  const a = AssessmentState.answers;
  let scores = {};
  
  Object.keys(PERSONAS).forEach(k => scores[k] = 0);
  
  // Work type
  if (a.workType === 'developer') scores['developer-setup'] += 3;
  if (a.workType === 'creative') scores['power-user'] += 1;
  if (a.workType === 'writing') scores['ergonomic-optimizer'] += 1;
  
  // Hours
  if (a.hours === '8+') { scores['power-user'] += 3; scores['ergonomic-optimizer'] += 2; }
  if (a.hours === '6-8') scores['power-user'] += 1;
  
  // Pain
  if (a.pain === 'back') scores['ergonomic-optimizer'] += 3;
  if (a.pain === 'neck') scores['ergonomic-optimizer'] += 2;
  if (a.pain === 'wrist') scores['developer-setup'] += 1;
  if (a.pain === 'eyes') scores['night-owl'] += 2;
  
  // Standing preference
  if (a.standing === 'yes') scores['standing-convert'] += 3;
  if (a.standing === 'sometimes') scores['standing-convert'] += 1;
  
  // Space
  if (a.space === 'small') scores['space-saver'] += 3;
  
  // Budget
  if (a.budget === 'under-500') scores['budget-builder'] += 3;
  if (a.budget === '500-1000') scores['budget-builder'] += 1;
  
  // Priorities
  if (a.priority === 'budget') scores['budget-builder'] += 2;
  if (a.priority === 'health') scores['ergonomic-optimizer'] += 2;
  if (a.priority === 'productivity') scores['developer-setup'] += 1;
  if (a.priority === 'space') scores['space-saver'] += 2;
  
  // Night shift
  if (a.workTime === 'night') scores['night-owl'] += 3;
  
  // Find winner
  let maxScore = 0;
  let persona = 'power-user';
  for (const [k, v] of Object.entries(scores)) {
    if (v > maxScore) { maxScore = v; persona = k; }
  }
  
  return persona;
}

function generateRecommendations() {
  const a = AssessmentState.answers;
  const persona = determinePersona();
  const recs = [];
  
  // Chair recommendation
  let chair;
  if (a.budget === 'under-500' || a.priority === 'budget') {
    chair = PRODUCTS.chairs.find(c => c.bestFor.includes('budget'));
  } else if (a.pain === 'back' || a.priority === 'health') {
    chair = a.budget === '1000-2000' ? PRODUCTS.chairs[3] : PRODUCTS.chairs[2];
  } else if (a.hours === '8+') {
    chair = PRODUCTS.chairs[2];
  } else {
    chair = PRODUCTS.chairs[1];
  }
  recs.push({
    category: 'Chair',
    icon: '🪑',
    name: chair.name,
    price: chair.price,
    why: chair.bestFor.includes('back-pain') 
      ? `Recommended for your ${a.pain || 'comfort'} needs. Excellent lumbar support and adjustability for ${a.hours || 'extended'} use.`
      : `Matches your budget tier and supports ${a.hours || 'your'} work hours with good adjustability.`,
    url: chair.url
  });
  
  // Desk recommendation
  let desk;
  if (a.standing === 'yes' || a.standing === 'sometimes') {
    desk = a.budget === 'under-500' ? PRODUCTS.desks[0] : PRODUCTS.desks[2];
  } else {
    desk = PRODUCTS.desks[1];
  }
  recs.push({
    category: 'Desk',
    icon: '🖥️',
    name: desk.name,
    price: desk.price,
    why: desk.type === 'standing' && a.standing === 'yes'
      ? `Standing desk for your preference to work on your feet. Adjustable height for ${a.height || 'your'} frame.`
      : `Solid work surface at the right height. ${a.space === 'small' ? 'Compact footprint for your space.' : 'Plenty of room for your setup.'}`,
    url: desk.url
  });
  
  // Monitor arm (if using external monitor)
  if (a.workType === 'developer' || a.workType === 'creative' || a.pain === 'neck') {
    const arm = a.budget === 'under-500' ? PRODUCTS.monitorArms[0] : PRODUCTS.monitorArms[1];
    recs.push({
      category: 'Monitor Arm',
      icon: '📐',
      name: arm.name,
      price: arm.price,
      why: a.pain === 'neck'
        ? `Critical for neck pain — positions your monitor at exact eye level. Don't skip this.`
        : `Ergonomic monitor positioning for ${a.workType} work. Frees desk space and reduces neck strain.`,
      url: arm.url
    });
  }
  
  // Lighting (always recommend)
  let light;
  if (a.workTime === 'night' || a.pain === 'eyes') {
    light = PRODUCTS.lighting[0]; // BenQ ScreenBar
  } else if (a.budget === 'under-500') {
    light = PRODUCTS.lighting[1]; // IKEA
  } else {
    light = PRODUCTS.lighting[0];
  }
  recs.push({
    category: 'Lighting',
    icon: '💡',
    name: light.name,
    price: light.price,
    why: a.workTime === 'night' || a.pain === 'eyes'
      ? `Reduces eye strain during ${a.workTime === 'night' ? 'late-night' : 'extended'} sessions. Bias lighting makes a real difference.`
      : `Proper task lighting prevents eye fatigue and improves focus.`,
    url: light.url
  });
  
  // Accessory based on persona
  let accessory;
  if (a.standing === 'yes') {
    accessory = PRODUCTS.accessories[0]; // Anti-fatigue mat
  } else if (a.workType === 'developer') {
    accessory = PRODUCTS.accessories[2]; // MX Master
  } else if (a.pain === 'wrist') {
    accessory = PRODUCTS.accessories[3]; // Split keyboard
  } else {
    accessory = PRODUCTS.accessories[1]; // Footrest
  }
  recs.push({
    category: 'Accessory',
    icon: '✨',
    name: accessory.name,
    price: accessory.price,
    why: a.standing === 'yes'
      ? `Essential for standing desk comfort — reduces foot and leg fatigue during standing periods.`
      : a.workType === 'developer'
      ? `Precision input device that reduces wrist strain during long coding sessions.`
      : `Small upgrade, big comfort difference for your daily work.`,
    url: accessory.url
  });
  
  // Calculate total
  const total = recs.reduce((sum, r) => sum + r.price, 0);
  
  return { persona, recommendations: recs, total };
}

function generateChecklist() {
  const a = AssessmentState.answers;
  const items = [];
  
  items.push("Set chair height so feet are flat on the floor (or footrest), knees at 90°");
  items.push("Position monitor so top of screen is at or slightly below eye level");
  items.push("Screen distance: about an arm's length (20-30 inches) from your face");
  
  if (a.standing === 'yes' || a.standing === 'sometimes') {
    items.push("Alternate between sitting and standing every 30-45 minutes");
    items.push("Use anti-fatigue mat when standing");
  }
  
  if (a.pain === 'back') {
    items.push("Ensure lumbar support fills the curve of your lower back");
    items.push("Consider a seat cushion for additional pressure relief");
  }
  
  if (a.pain === 'neck') {
    items.push("Use monitor arm to position screen at exact eye level");
    items.push("Keep laptop closed if using external monitor — don't look down");
  }
  
  if (a.pain === 'wrist') {
    items.push("Keep wrists straight when typing — use keyboard tray or adjust desk height");
    items.push("Consider a split or ergonomic keyboard");
  }
  
  if (a.pain === 'eyes' || a.workTime === 'night') {
    items.push("Follow the 20-20-20 rule: every 20 min, look 20 ft away for 20 seconds");
    items.push("Use bias/task lighting behind monitor to reduce contrast");
    items.push("Enable blue light filtering on all screens after sunset");
  }
  
  if (a.hours === '8+') {
    items.push("Take a 5-minute movement break every hour — set a timer");
    items.push("Do standing stretches: hip flexors, calves, shoulders");
  }
  
  items.push("Keep frequently used items within arm's reach to avoid repetitive reaching");
  items.push("Manage cables to prevent clutter and tripping hazards");
  
  return items;
}

function showResults() {
  // Hide steps, show results
  document.querySelectorAll('.assessment-step').forEach(s => s.classList.remove('active'));
  document.querySelector('.step-indicator')?.classList.add('hidden');
  document.getElementById('stepLabel')?.classList.add('hidden');
  document.getElementById('assessmentNav')?.classList.add('hidden');
  
  const resultsEl = document.getElementById('resultsScreen');
  if (!resultsEl) return;
  
  const { persona, recommendations, total } = generateRecommendations();
  const personaData = PERSONAS[persona];
  const checklist = generateChecklist();
  
  resultsEl.classList.add('active');
  
  // Build results HTML
  let html = `
    <div class="result-hero">
      <span class="result-persona">${personaData.name}</span>
      <h2 class="result-title">Your Personalized Workspace Setup</h2>
      <p class="result-summary">${personaData.desc}</p>
    </div>
    
    <div class="recommendation-list">
  `;
  
  recommendations.forEach(rec => {
    html += `
      <div class="recommendation">
        <div class="recommendation__icon">${rec.icon}</div>
        <div class="recommendation__content">
          <div class="recommendation__category">${rec.category}</div>
          <div class="recommendation__name">${rec.name}</div>
          <div class="recommendation__why">${rec.why}</div>
          <div class="recommendation__price">$${rec.price}</div>
          <a href="${rec.url}" target="_blank" rel="sponsored noopener noreferrer" class="recommendation__link">
            View on retailer site →
          </a>
        </div>
      </div>
    `;
  });
  
  html += `
    </div>
    
    <div style="text-align:center; margin: ${'var(--space-2xl)'} 0; padding: ${'var(--space-xl)'}; background: var(--c-bg-alt); border-radius: var(--radius-lg);">
      <div style="font-size: 0.8125rem; color: var(--c-text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Estimated Total</div>
      <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 700; color: var(--c-primary);">$${total}</div>
      <p style="margin-top: var(--space-sm); font-size: 0.875rem; color: var(--c-text-muted);">Prices are approximate and may vary by retailer. Some links are affiliate links — we may earn a commission at no cost to you.</p>
    </div>
    
    <div class="checklist">
      <h3 class="checklist__title">📋 Your Ergonomic Setup Checklist</h3>
      ${checklist.map(item => `<div class="checklist__item">${item}</div>`).join('')}
    </div>
    
    <div style="text-align: center; margin-top: var(--space-2xl);">
      <button id="restartAssessment" class="btn btn--secondary">↻ Retake Assessment</button>
      <a href="#newsletter" class="btn btn--primary" style="margin-left: var(--space-sm);">Get Weekly Tips</a>
    </div>
  `;
  
  resultsEl.innerHTML = html;
  
  // Rebind events
  document.getElementById('restartAssessment')?.addEventListener('click', restartAssessment);
  
  // Track completion
  if (typeof gtag !== 'undefined') {
    gtag('event', 'assessment_complete', {
      persona: persona,
      budget: AssessmentState.answers.budget,
      work_type: AssessmentState.answers.workType
    });
  }
  
  scrollToTop();
}

function restartAssessment() {
  AssessmentState.step = 0;
  AssessmentState.answers = {};
  sessionStorage.removeItem('assessmentState');
  
  document.getElementById('resultsScreen')?.classList.remove('active');
  document.querySelector('.step-indicator')?.classList.remove('hidden');
  document.getElementById('stepLabel')?.classList.remove('hidden');
  document.getElementById('assessmentNav')?.classList.remove('hidden');
  
  document.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
  
  renderStep();
  scrollToTop();
}

// Theme toggle
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  
  const icon = document.querySelector('.theme-toggle__icon');
  if (icon) icon.textContent = next === 'dark' ? '☀' : '☾';
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  // Restore theme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  
  const icon = document.querySelector('.theme-toggle__icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
  
  // Theme toggle
  document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);
  
  // Mobile menu — wire ALL menu-toggle buttons (open + close)
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  
  document.querySelectorAll('.menu-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      mobileNav?.classList.toggle('open');
      mobileOverlay?.classList.toggle('open');
    });
  });
  
  mobileOverlay?.addEventListener('click', () => {
    mobileNav?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
  });
  
  // Close mobile nav when a link is clicked
  document.querySelectorAll('.mobile-nav__link, .mobile-nav__cta').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav?.classList.remove('open');
      mobileOverlay?.classList.remove('open');
    });
  });
  
  // Init assessment
  if (document.getElementById('assessment')) {
    initAssessment();
  }
});
