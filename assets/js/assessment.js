/* ============================================
   Workspace Assessment Tool
   The real product of The Workspace Pro
   ============================================ */

const AssessmentState = {
  step: 0,
  totalSteps: 6,
  answers: {}
};

const STEP_REQUIRED_ANSWERS = [
  ["workType"],
  ["hours", "pain"],
  ["standing", "space"],
  ["budget", "workTime"],
  ["priority"],
  ["height"]
];

const ALLOWED_ANSWERS = {
  workType: ["developer", "creative", "writing", "general"],
  hours: ["under-4", "4-6", "6-8", "8+"],
  pain: ["back", "neck", "wrist", "eyes", "none"],
  standing: ["yes", "sometimes", "no"],
  space: ["small", "medium", "large"],
  budget: ["under-500", "500-1000", "1000-2000", "2000+"],
  workTime: ["day", "evening", "night"],
  priority: ["budget", "health", "productivity", "space"]
};

function sanitizeStoredAnswers(answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return {};
  const clean = {};
  for (const [key, allowed] of Object.entries(ALLOWED_ANSWERS)) {
    if (allowed.includes(answers[key])) clean[key] = answers[key];
  }
  const height = Number(answers.height);
  if (Number.isInteger(height) && height >= 54 && height <= 78) clean.height = String(height);
  return clean;
}

function firstIncompleteStep(answers) {
  const incomplete = STEP_REQUIRED_ANSWERS.findIndex(keys =>
    keys.some(key => !Object.prototype.hasOwnProperty.call(answers, key))
  );
  return incomplete === -1 ? STEP_REQUIRED_ANSWERS.length - 1 : incomplete;
}

function isValidSharedAnswers(answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return false;
  const required = STEP_REQUIRED_ANSWERS.flat();
  if (!required.every(key => Object.prototype.hasOwnProperty.call(answers, key))) return false;
  for (const [key, allowed] of Object.entries(ALLOWED_ANSWERS)) {
    if (!allowed.includes(answers[key])) return false;
  }
  const height = Number(answers.height);
  return Number.isInteger(height) && height >= 54 && height <= 78;
}

// Product database — Amazon links verified live (browser, Jul 2026) with tag=workspacepro-20
// Non-Amazon maker links kept for Branch / IKEA / etc.
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
      name: "HON Ignition 2.0 Mid-Back",
      price: 379,
      url: "https://www.amazon.com/dp/B06Y3PGPR2/?tag=workspacepro-20",
      heightRange: "5'2\" - 6'4\"",
      adjustability: "medium",
      bestFor: ["budget", "general", "developer"]
    },
    {
      name: "HON Ignition 2.0 Low-Back",
      price: 349,
      url: "https://www.amazon.com/dp/B0C83YRK84/?tag=workspacepro-20",
      heightRange: "5'0\" - 6'2\"",
      adjustability: "medium",
      bestFor: ["budget", "general"]
    },
    {
      name: "Herman Miller Sayl",
      price: 545,
      url: "https://www.amazon.com/dp/B07R62FKFZ/?tag=workspacepro-20",
      heightRange: "5'0\" - 6'6\"",
      adjustability: "medium",
      bestFor: ["general", "design", "premium"]
    },
    {
      name: "Autonomous ErgoChair",
      price: 499,
      url: "https://www.amazon.com/dp/B092ZNFF8P/?tag=workspacepro-20",
      heightRange: "5'2\" - 6'4\"",
      adjustability: "high",
      bestFor: ["general", "back-pain", "developer"]
    },
    {
      name: "Herman Miller Embody",
      price: 1395,
      url: "https://www.amazon.com/dp/B07NH69TWB/?tag=workspacepro-20",
      heightRange: "5'3\" - 6'6\"",
      adjustability: "high",
      bestFor: ["long-hours", "premium", "back-pain"]
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
      name: "SHW Electric Standing Desk 55\"",
      price: 299,
      url: "https://www.amazon.com/dp/B085KBN2DN/?tag=workspacepro-20",
      type: "standing",
      bestFor: ["budget", "general"]
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
    }
  ],
  monitors: [
    {
      name: "ASUS ProArt PA278QV 27\" 1440p",
      price: 299,
      url: "https://www.amazon.com/dp/B088BC5HMM/?tag=workspacepro-20",
      bestFor: ["budget", "general"]
    },
    {
      name: "Dell S2722QC 27\" 4K USB-C",
      price: 350,
      url: "https://www.amazon.com/dp/B09DTDRJWP/?tag=workspacepro-20",
      bestFor: ["general", "developer"]
    },
    {
      name: "Dell UltraSharp U2723QE 27\" 4K",
      price: 480,
      url: "https://www.amazon.com/dp/B09TQZP9CL/?tag=workspacepro-20",
      bestFor: ["developer", "premium"]
    },
    {
      name: "LG 32UN880-B 32\" 4K Ergo",
      price: 550,
      url: "https://www.amazon.com/dp/B08BCR862L/?tag=workspacepro-20",
      bestFor: ["developer", "premium"]
    }
  ],
  monitorArms: [
    {
      name: "WALI Dual Monitor Stand",
      price: 35,
      url: "https://www.amazon.com/dp/B018MSDG84/?tag=workspacepro-20",
      bestFor: ["budget"]
    },
    {
      name: "Ergotron LX Single Monitor Arm",
      price: 189,
      url: "https://www.amazon.com/dp/B00358RIRC/?tag=workspacepro-20",
      bestFor: ["general", "premium", "back-pain"]
    },
    {
      name: "Ergotron LX Dual Monitor Arm",
      price: 299,
      url: "https://www.amazon.com/dp/B00P9JULWE/?tag=workspacepro-20",
      bestFor: ["developer", "premium"]
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
      name: "tomons LED Desk Lamp",
      price: 30,
      url: "https://www.amazon.com/dp/B071CXPSDN/?tag=workspacepro-20",
      bestFor: ["budget", "general"]
    },
    {
      name: "BenQ ScreenBar",
      price: 99,
      url: "https://www.amazon.com/dp/B076VNFZJG/?tag=workspacepro-20",
      bestFor: ["general", "night-shift"]
    },
    {
      name: "BenQ ScreenBar Plus",
      price: 129,
      url: "https://www.amazon.com/dp/B07DP7RYXV/?tag=workspacepro-20",
      bestFor: ["general", "night-shift", "premium"]
    }
  ],
  accessories: [
    {
      name: "Amazon Basics Anti-Fatigue Standing Mat",
      price: 30,
      url: "https://www.amazon.com/dp/B00OUFX0YY/?tag=workspacepro-20",
      bestFor: ["standing"]
    },
    {
      name: "KANGAROO Anti-Fatigue Mat",
      price: 45,
      url: "https://www.amazon.com/dp/B01H6AZC5Y/?tag=workspacepro-20",
      bestFor: ["standing", "premium"]
    },
    {
      name: "Kensington Solemate Plus Footrest",
      price: 45,
      url: "https://www.amazon.com/dp/B0002DR45E/?tag=workspacepro-20",
      bestFor: ["general", "short"]
    },
    {
      name: "Logitech MX Master 3S",
      price: 99,
      url: "https://www.amazon.com/dp/B09HM94VDS/?tag=workspacepro-20",
      bestFor: ["developer", "general"]
    },
    {
      name: "Logitech M720 Triathlon Mouse",
      price: 40,
      url: "https://www.amazon.com/dp/B087Z6LSHW/?tag=workspacepro-20",
      bestFor: ["budget", "general"]
    },
    {
      name: "Simple Cord Under-Desk Cable Channel",
      price: 15,
      url: "https://www.amazon.com/dp/B06Y1DVNQD/?tag=workspacepro-20",
      bestFor: ["general", "space-saver"]
    },
    {
      name: "VELCRO Brand Cable Ties (100-pack)",
      price: 12,
      url: "https://www.amazon.com/dp/B08BLCZDYL/?tag=workspacepro-20",
      bestFor: ["general", "budget"]
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
  // Migrate saved state defensively. Older builds could skip required questions.
  const saved = sessionStorage.getItem('assessmentState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const answers = sanitizeStoredAnswers(parsed && parsed.answers);
      const requestedStep = Number.isInteger(parsed && parsed.step)
        ? Math.max(0, Math.min(parsed.step, AssessmentState.totalSteps - 1))
        : 0;
      AssessmentState.answers = answers;
      AssessmentState.step = Math.min(requestedStep, firstIncompleteStep(answers));
    } catch(e) {}
  }
  const heightInput = document.querySelector('input[data-question="height"]');
  if (heightInput && !AssessmentState.answers.height) {
    AssessmentState.answers.height = heightInput.value;
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
  document.querySelectorAll('.choice-grid').forEach((grid, index) => {
    const question = grid.previousElementSibling;
    if (question && question.classList.contains('step-question')) {
      if (!question.id) question.id = 'assessment-question-' + index;
      grid.setAttribute('role', 'group');
      grid.setAttribute('aria-labelledby', question.id);
    }
  });
  document.querySelectorAll('.choice-card').forEach(card => {
    card.setAttribute('type', 'button');
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => selectChoice(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectChoice(card);
      }
    });
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
  
  group.querySelectorAll('.choice-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-pressed', 'false');
  });
  card.classList.add('selected');
  card.setAttribute('aria-pressed', 'true');
  AssessmentState.answers[key] = value;
  saveState();
  
  updateStepNavigation();
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
  updateStepNavigation();
}

function nextStep() {
  if (!isStepComplete(AssessmentState.step)) {
    announceMissingAnswers();
    return;
  }
  if (AssessmentState.step < AssessmentState.totalSteps - 1) {
    AssessmentState.step++;
    saveState();
    renderStep();
    focusCurrentQuestion();
    scrollToTop();
  } else {
    showResults();
  }
}

function focusCurrentQuestion() {
  const question = document.querySelector(".assessment-step.active .step-question");
  if (question) {
    question.setAttribute("tabindex", "-1");
    question.focus();
  }
}

function isStepComplete(step) {
  const required = STEP_REQUIRED_ANSWERS[step] || [];
  return required.every(key => AssessmentState.answers[key] !== undefined && AssessmentState.answers[key] !== "");
}

function updateStepNavigation() {
  const complete = isStepComplete(AssessmentState.step);
  document.querySelectorAll("[data-next]").forEach(btn => {
    const isVisible = btn.closest(".assessment-step") ? btn.closest(".assessment-step").classList.contains("active") : btn.offsetParent !== null;
    if (isVisible) btn.disabled = !complete;
  });
}

function announceMissingAnswers() {
  const label = document.getElementById("stepLabel");
  if (label) label.textContent += " — Please answer each question to continue";
}

function prevStep() {
  if (AssessmentState.step > 0) {
    AssessmentState.step--;
    saveState();
    renderStep();
    focusCurrentQuestion();
    scrollToTop();
  }
}

function renderStep() {
  document.querySelectorAll('.assessment-step').forEach(s => {
    const active = Number(s.dataset.step) === AssessmentState.step;
    s.classList.toggle('active', active);
    s.hidden = !active;
    s.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  
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
      card.setAttribute('aria-pressed', 'true');
    } else {
      card.classList.remove('selected');
      card.setAttribute('aria-pressed', 'false');
    }
  });
  
  // Restore ranges
  document.querySelectorAll('input[type="range"]').forEach(input => {
    if (AssessmentState.answers[input.dataset.question]) {
      input.value = AssessmentState.answers[input.dataset.question];
      updateRangeValue({ target: input });
    }
  });

  const floatingNav = document.getElementById('assessmentNav-floating');
  if (floatingNav) {
    floatingNav.style.display = AssessmentState.step < AssessmentState.totalSteps - 1 ? 'flex' : 'none';
  }
  updateStepNavigation();
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
    chair = (a.budget === '1000-2000' || a.budget === '2000+')
      ? PRODUCTS.chairs.find(item => item.name.includes('Embody'))
      : PRODUCTS.chairs.find(item => item.bestFor.includes('back-pain') && item.bestFor.includes('budget'));
  } else if (a.hours === '8+') {
    chair = PRODUCTS.chairs.find(item => item.bestFor.includes('long-hours'));
  } else {
    chair = PRODUCTS.chairs.find(item => item.name.includes('Branch Ergonomic'));
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
    light = PRODUCTS.lighting.find(item => item.bestFor.includes('night-shift'));
  } else if (a.budget === 'under-500') {
    light = PRODUCTS.lighting.find(item => item.bestFor.includes('budget'));
  } else {
    light = PRODUCTS.lighting.find(item => item.bestFor.includes('general')) || PRODUCTS.lighting[0];
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
    accessory = PRODUCTS.accessories.find(item => item.bestFor.includes('standing'));
  } else if (a.workType === 'developer') {
    accessory = PRODUCTS.accessories.find(item => item.bestFor.includes('developer'));
  } else if (a.pain === 'wrist') {
    accessory = PRODUCTS.accessories.find(item => item.name.includes('MX Master'));
  } else {
    accessory = PRODUCTS.accessories.find(item => item.name.includes('Footrest'));
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

function formatFitRange(range) {
  if (!range) return "Not available";
  return range.min.toFixed(1) + "–" + range.max.toFixed(1) + " in";
}

function getFitBlueprint() {
  var math = window.TWPHeightMath;
  var height = Number(AssessmentState.answers.height);
  if (!math || typeof math.computeRangesFromInches !== "function" || !isFinite(height)) return null;
  try { return math.computeRangesFromInches(height); } catch (e) { return null; }
}

function getBlueprintPriorities() {
  var a = AssessmentState.answers;
  var labels = {
    back: "Lumbar support and seat fit", neck: "Monitor alignment and shoulder relief",
    wrist: "Neutral keyboard and pointing posture", eyes: "Viewing distance and lighting",
    none: "Prevention and movement variety"
  };
  var work = a.hours === "8+" ? "Movement breaks for extended sessions" : "A repeatable neutral starting posture";
  var constraint = a.space === "small" ? "Compact adjustability" : (a.priority === "budget" ? "High-value upgrades first" : "Long-term adjustability");
  return [labels[a.pain] || labels.none, work, constraint];
}

function trackBlueprintAction(action, destination) {
  if (typeof gtag === "undefined") return;
  gtag("event", "blueprint_action", { action: action, destination: destination || "", persona: determinePersona() });
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
  const fit = getFitBlueprint();
  const priorities = getBlueprintPriorities();
  
  resultsEl.classList.add('active');
  resultsEl.setAttribute('tabindex', '-1');
  
  // Build results HTML
  let html = `
    <div class="result-hero">
      <span class="result-persona">${personaData.name}</span>
      <p class="result-kicker">Guided Fit Journey · Complete</p>
      <h2 class="result-title">My Workspace Blueprint</h2>
      <p class="result-summary">${personaData.desc}</p>
    </div>

    <section class="blueprint-fit" aria-labelledby="blueprint-fit-title">
      <div class="blueprint-section-heading"><span>01 · Body fit</span><h3 id="blueprint-fit-title">Verified starting measurements</h3></div>
      ${fit ? `
      <div class="blueprint-fit__grid">
        <div class="blueprint-metric"><span>Chair seat</span><strong>${formatFitRange(fit.chair)}</strong><small>Floor to seat</small></div>
        <div class="blueprint-metric"><span>Seated desk</span><strong>${formatFitRange(fit.sittingDesk)}</strong><small>Floor to work surface</small></div>
        <div class="blueprint-metric"><span>Standing desk</span><strong>${formatFitRange(fit.standingDesk)}</strong><small>Floor to work surface</small></div>
        <div class="blueprint-metric"><span>Monitor top</span><strong>${formatFitRange(fit.monitorTop)}</strong><small>Floor to top edge</small></div>
        <div class="blueprint-metric"><span>Viewing distance</span><strong>${formatFitRange(fit.monitorDistance)}</strong><small>Eyes to screen</small></div>
      </div>` : `<p>Open the height calculator to generate verified fit ranges.</p>`}
      <p class="blueprint-fit__note">Starting ranges, not medical advice. Adjust for footwear, proportions, equipment, and comfort.</p>
    </section>

    <section class="blueprint-priorities" aria-labelledby="blueprint-priorities-title">
      <div class="blueprint-section-heading"><span>02 · Focus</span><h3 id="blueprint-priorities-title">Your setup priorities</h3></div>
      <ol>${priorities.map(function (item) { return `<li>${item}</li>`; }).join("")}</ol>
    </section>

    <div class="blueprint-section-heading"><span>03 · Shortlist</span><h3>Research-led products to check against your measurements</h3></div>
    <p class="result-total__note result-affiliate-note">Some retailer links below are affiliate links; we may earn a commission at no extra cost to you. Check live specifications, seller, condition, warranty, and price before buying.</p>

    <div class="recommendation-list">
  `;
  
  recommendations.forEach(rec => {
    var thumb = `<div class="recommendation__icon"></div>`;
    html += `
      <div class="recommendation">
        ${thumb}
        <div class="recommendation__content">
          <div class="recommendation__category">${rec.category}</div>
          <div class="recommendation__name">${rec.name}</div>
          <div class="recommendation__why">${rec.why}</div>
          <div class="recommendation__price">~$${rec.price} <span class="recommendation__price-note">check live price</span></div>
          <a href="${rec.url}" target="_blank" rel="sponsored noopener noreferrer" class="recommendation__link" data-blueprint-action="product" data-blueprint-destination="${rec.name}">
            Check live price →
          </a>
        </div>
      </div>
    `;
  });
  
  html += `
    </div>
    
    <div class="result-total">
      <div class="result-total__label">Estimated Total</div>
      <div class="result-total__amount">~$${total}</div>
      <p class="result-total__note">This is a reference-price estimate, not a guaranteed bundle price.</p>
    </div>
    
    <div class="checklist">
      <h3 class="checklist__title">04 · Your ergonomic setup checklist</h3>
      ${checklist.map(item => `<div class="checklist__item">${item}</div>`).join('')}
    </div>
    
    <div class="result-next-steps">
      <h3 class="result-next-steps__title">What to do next</h3>
      <div class="result-next-steps__grid">
        <a href="/ergonomic-height-calculator" class="result-next-steps__card" data-blueprint-action="tool" data-blueprint-destination="height-calculator"><span>Measure</span>Dial in desk and chair height →</a>
        <a href="/guides" class="result-next-steps__card" data-blueprint-action="guide" data-blueprint-destination="guides"><span>Understand</span>Read the setup guides →</a>
        <a href="/deals" class="result-next-steps__card" data-blueprint-action="product" data-blueprint-destination="deals"><span>Shop</span>Check fit-aware value picks →</a>
      </div>
    </div>

    <div class="result-actions">
      <button type="button" id="restartAssessment" class="btn btn--secondary">Retake</button>
      <button type="button" id="printAssessmentResults" class="btn btn--secondary">Print / PDF</button>
      <button type="button" id="copyAssessmentResults" class="btn btn--secondary">Copy summary</button>
      <button type="button" id="shareAssessmentResults" class="btn btn--secondary">Share blueprint</button>
      <button type="button" id="saveAssessmentResults" class="btn btn--outline result-save-btn">Save blueprint</button>
      <a href="/guides" class="btn btn--primary">Explore practical guides</a>
    </div>
    <p class="result-actions__hint" id="resultActionHint" aria-live="polite"></p>
  `;
  
  resultsEl.innerHTML = html;
  resultsEl.focus();
  resultsEl.querySelectorAll("[data-blueprint-action]").forEach(function (link) {
    link.addEventListener("click", function () {
      trackBlueprintAction(link.dataset.blueprintAction, link.dataset.blueprintDestination);
    });
  });
  
  // Prepare an optional local save; persistence happens only when the user selects Save.
  var payload = {
    version: 2,
    persona: persona,
    personaName: personaData.name,
    recommendedProducts: recommendations.map(function (r) { return { name: r.name, price: r.price, category: r.category, url: r.url }; }),
    checklist: checklist,
    fit: fit,
    priorities: priorities,
    recommendationIds: recommendations.map(function (r) { return r.name; }),
    total: total,
    answers: AssessmentState.answers,
    timestamp: Date.now()
  };
  // Build a share URL in memory; the address bar changes only if the user shares it.
  var shareUrl = buildShareUrl(AssessmentState.answers, persona, recommendations, fit, priorities);

  function setHint(msg) {
    var el = document.getElementById('resultActionHint');
    if (el) el.textContent = msg || '';
  }

  function buildSummaryText() {
    var lines = [
      'The Workspace Pro — My Workspace Blueprint',
      "Profile: " + personaData.name,
      "Fit priorities: " + priorities.join("; "),
      'Estimated total: ~$' + total,
      '',
      'Recommendations:'
    ];
    recommendations.forEach(function (r) {
      lines.push('- ' + r.category + ': ' + r.name + ' (~$' + r.price + ')');
    });
    lines.push('', 'Checklist:');
    checklist.forEach(function (c) { lines.push('- ' + c); });
    lines.push('', 'Retake or share: ' + (shareUrl.indexOf('http') === 0 ? shareUrl : (location.origin + shareUrl)));
    return lines.join('\n');
  }

  document.getElementById('restartAssessment')?.addEventListener('click', restartAssessment);

  document.getElementById("printAssessmentResults")?.addEventListener("click", function () {
    trackBlueprintAction("print", "blueprint");
    window.print();
  });

  document.getElementById('copyAssessmentResults')?.addEventListener('click', function () {
    var text = buildSummaryText();
    function done() {
      setHint('Summary copied — paste into Notes, email, or a shopping list.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        window.prompt('Copy your summary:', text);
        done();
      });
    } else {
      window.prompt('Copy your summary:', text);
      done();
    }
  });

  document.getElementById('shareAssessmentResults')?.addEventListener('click', function () {
    var absolute = shareUrl.indexOf('http') === 0 ? shareUrl : (location.origin + shareUrl);
    var title = 'My workspace plan — ' + personaData.name;
    var text = 'I got “' + personaData.name + '” on The Workspace Pro free setup quiz. Estimated ~$' + total + '.';
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: absolute }).then(function () {
        setHint('Shared — thanks for spreading the free tools.');
        if (typeof gtag !== "undefined") gtag("event", "assessment_share", { method: "web_share" });
        trackBlueprintAction("share", "web_share");
      }).catch(function () { /* user cancelled */ });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(absolute).then(function () {
        setHint('Share link copied. Anyone with it can reopen these results.');
        if (typeof gtag !== "undefined") gtag("event", "assessment_share", { method: "copy_link" });
        trackBlueprintAction("share", "copy_link");
      });
    } else {
      window.prompt('Copy this share link:', absolute);
      setHint("Share link ready to paste.");
      trackBlueprintAction("share", "prompt");
    }
  });

  var saveBtn = document.getElementById('saveAssessmentResults');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      try {
        localStorage.setItem('twp-assessment-results', JSON.stringify(payload));
      } catch (e) {}
      var btn = this;
      btn.textContent = '✓ Saved on this device';
      btn.style.background = 'var(--c-accent)';
      btn.style.color = '#fff';
      btn.style.borderColor = 'var(--c-accent)';
      setHint("Saved in this browser. Use Share for a permanent link you can open later.");
      trackBlueprintAction("save", "local_storage");
      setTimeout(function () {
        btn.textContent = "Save blueprint";
        btn.style.background = 'transparent';
        btn.style.color = 'var(--c-primary)';
        btn.style.borderColor = 'var(--c-primary)';
      }, 3000);
    });
  }
  
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

/** Compact share URL: /#assessment&a=base64url(answers json) */
function buildShareUrl(answers, persona, recommendations, fit, priorities) {
  try {
    var data = {
      v: 2,
      a: answers,
      p: persona,
      f: fit,
      pr: priorities,
      r: (recommendations || []).map(function (item) { return item.name; })
    };
    var json = JSON.stringify(data);
    var b64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return '/#assessment&r=' + b64;
  } catch (e) {
    return '/#assessment';
  }
}

function parseSharePayload() {
  try {
    var hash = window.location.hash || '';
    var m = hash.match(/[?&]r=([A-Za-z0-9_-]+)/) || hash.match(/r=([A-Za-z0-9_-]+)/);
    // also support #assessment&r=
    if (!m) {
      var parts = hash.replace(/^#/, '').split(/[&]/);
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].indexOf('r=') === 0) {
          m = [null, parts[i].slice(2)];
          break;
        }
      }
    }
    if (!m || !m[1]) return null;
    var b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    var json = decodeURIComponent(escape(atob(b64)));
    var data = JSON.parse(json);
    if (!data || (data.v !== 1 && data.v !== 2) || !data.a) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function restartAssessment() {
  AssessmentState.step = 0;
  const heightInput = document.querySelector('input[data-question="height"]');
  AssessmentState.answers = { height: heightInput ? heightInput.value : '69' };
  sessionStorage.removeItem('assessmentState');
  
  document.getElementById('resultsScreen')?.classList.remove('active');
  document.querySelector('.step-indicator')?.classList.remove('hidden');
  document.getElementById('stepLabel')?.classList.remove('hidden');
  document.getElementById('assessmentNav')?.classList.remove('hidden');
  
  document.querySelectorAll('.choice-card').forEach(c => { c.classList.remove('selected'); c.setAttribute('aria-pressed', 'false'); });
  
  renderStep();
  scrollToTop();
}

// Theme + mobile menu live in site.js (loaded site-wide).
// Assessment only wires the quiz when present.

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('assessment')) return;

  // Restore from share link if present (answers only — no PII)
  var shared = parseSharePayload();
  if (shared && (shared.v === 1 || shared.v === 2) && isValidSharedAnswers(shared.a)) {
    AssessmentState.answers = shared.a;
    AssessmentState.step = AssessmentState.totalSteps - 1;
    try {
      sessionStorage.setItem('assessmentState', JSON.stringify(AssessmentState));
    } catch (e) {}
    initAssessment();
    // A validated share contains the complete answer set.
    showResults();
    return;
  }

  initAssessment();
});


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

