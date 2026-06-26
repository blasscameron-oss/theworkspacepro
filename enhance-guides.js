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
// GUIDE DATA
// ==============================
const GUIDE_DATA = {
  'back-pain-ergonomic-setup': { title: 'Back Pain Ergonomic Setup', desc: 'Set up your workspace to prevent and manage back pain with proper ergonomics.', category: 'Ergonomics', tags: ['back pain', 'ergonomics', 'posture'] },
  'best-ergonomic-office-chairs-2026': { title: 'Best Ergonomic Office Chairs 2026', desc: 'Full comparison of the best ergonomic office chairs across every budget tier.', category: 'Chairs', tags: ['office chairs', 'ergonomic chairs', 'seating'] },
  'best-standing-desk-mat-for-concrete-floors': { title: 'Best Standing Desk Mats for Concrete Floors', desc: 'Top anti-fatigue mats for standing desks on concrete floors.', category: 'Accessories', tags: ['standing desk', 'mats', 'anti-fatigue'] },
  'best-standing-desks-under-500': { title: 'Best Standing Desks Under $500', desc: 'Best budget-friendly standing desks under $500 for your home office.', category: 'Desks', tags: ['standing desk', 'budget', 'desks'] },
  'cable-management-solutions': { title: 'Cable Management Solutions', desc: 'Tame the cable chaos with the best cable management solutions for your workspace.', category: 'Organization', tags: ['cable management', 'organization', 'desk setup'] },
  'dual-monitor-home-office': { title: 'Dual Monitor Home Office Setup', desc: 'Everything you need for a productive dual-monitor home office setup.', category: 'Monitors', tags: ['dual monitor', 'home office', 'productivity'] },
  'dual-monitor-setup-productivity': { title: 'Dual Monitor Setup for Productivity', desc: 'Boost your productivity with the ideal dual monitor setup and workflow tips.', category: 'Monitors', tags: ['dual monitor', 'productivity', 'workflow'] },
  'ergonomic-accessories-home-office': { title: 'Ergonomic Accessories for Home Office', desc: 'Must-have ergonomic accessories for a comfortable and healthy home office.', category: 'Accessories', tags: ['ergonomics', 'accessories', 'home office'] },
  'ergonomic-office-chair-buying-guide': { title: 'Ergonomic Office Chair Buying Guide', desc: 'Complete guide to buying the right ergonomic office chair for your needs.', category: 'Chairs', tags: ['office chairs', 'buying guide', 'ergonomics'] },
  'ergonomic-setup-for-gamers': { title: 'Ergonomic Setup for Gamers', desc: 'Build an ergonomic gaming setup that keeps you comfortable during long sessions.', category: 'Gaming', tags: ['gaming', 'ergonomics', 'setup'] },
  'home-office-budget-setup-under-1000': { title: 'Home Office Budget Setup Under $1,000', desc: 'Build a complete home office on a budget of under $1,000.', category: 'Budget', tags: ['budget', 'home office', 'setup'] },
  'home-office-desk-guide-2026': { title: 'Home Office Desk Guide 2026', desc: 'The complete guide to choosing the right desk for your home office.', category: 'Desks', tags: ['desks', 'home office', 'workspace'] },
  'home-office-lighting-guide': { title: 'Home Office Lighting Guide', desc: 'The definitive guide to lighting your home office for productivity and comfort.', category: 'Lighting', tags: ['lighting', 'home office', 'productivity'] },
  'night-shift-lighting-guide': { title: 'Night Shift Lighting Guide', desc: 'Optimize your workspace lighting for late-night and night shift work.', category: 'Lighting', tags: ['lighting', 'night shift', 'circadian'] },
  'productive-workspace-mindset': { title: 'Productive Workspace Mindset', desc: 'Cultivate a mindset and workspace that maximizes productivity and focus.', category: 'Mindset', tags: ['productivity', 'mindset', 'workspace'] },
  'small-home-office-organization-hacks': { title: 'Small Home Office Organization Hacks', desc: 'Maximize tight spaces with wall-mounted storage, fold-away desks, and vertical organization.', category: 'Organization', tags: ['organization', 'small space', 'storage'] }
};

// Hardcoded FAQ pairs for each guide (from reading the original files)
// These ensure we get the right questions regardless of file state
const FAQ_PAIRS = {
  'back-pain-ergonomic-setup': [
    { q: "Can a bad chair really cause back pain, or is it just my posture?", a: "Both. A bad chair forces poor posture—slouching, hunching, leaning—which puts uneven pressure on spinal discs. Even with perfect posture, a chair without proper lumbar support or seat depth adjustment can cause pain within hours. The chair and your posture work together; one can't fully compensate for the other." },
    { q: "Should I get a standing desk if I already have back pain?", a: "Yes—but only if you use it properly. Standing changes which muscles and joints bear weight, which can relieve pressure on your lower back. The key is alternating: 30-45 minutes standing, then 30-45 minutes sitting. Standing all day is just as bad as sitting all day. A good anti-fatigue mat makes standing much more comfortable." },
    { q: "Do lumbar support cushions and aftermarket back supports actually help?", a: "They can—but they're treating a symptom, not the cause. If your chair lacks built-in lumbar support, an aftermarket cushion is a reasonable fix. However, most add-on cushions shift as you move, creating inconsistent support. A chair with built-in adjustable lumbar support (height + depth) is always better than an add-on cushion. If you must use one, look for a firm memory foam cushion with straps that attach securely to your chair." },
    { q: "How does monitor height affect back pain?", a: "Monitor height directly controls your head position, which affects your entire spine. For every inch your head moves forward (to look at a low screen), the effective weight on your cervical spine increases by roughly 10 pounds. At 3 inches forward, that's 30 extra pounds your upper back and neck are supporting. This forward-head posture cascades down: rounded shoulders, hunched upper back, and a tilted pelvis that strains the lower back. Proper monitor height—top of screen at or slightly below eye level—is the foundation of a back-friendly setup." },
    { q: "Is a gaming chair good for back pain?", a: "Almost never. Gaming chairs are designed to look like racing bucket seats, with aggressive bolstering that forces your hips into a narrowed position. This restricts natural movement and can worsen lower back tension. The fixed lumbar pillows included with most gaming chairs provide one-size-fits-none support. If you want both aesthetics and ergonomics, look at chairs like the Herman Miller Sayl or Steelcase Gesture, which look great without compromising back health." },
    { q: "How often should I replace my office chair to prevent back pain?", a: "Budget chairs ($200-500) should be replaced every 3-5 years as foam compresses and mechanisms wear. Mid-range chairs ($500-1,000) last 5-8 years. Flagship chairs ($1,000+) are built to last 10-15 years. Signs it's time to replace: the gas cylinder no longer holds height, seat cushion has permanent depressions, lumbar support feels ineffective, or you've developed new back pain that correlates with sitting." },
    { q: "Can footrests help with back pain?", a: "Yes—if your feet don't rest flat on the floor when your chair is properly adjusted. When your feet dangle, your hamstrings tighten, your pelvis tilts backward, and your lower back rounds into slouching. A footrest restores the foundation: feet supported, knees at 90 degrees, pelvis neutral. This single adjustment can eliminate lower back pain for people who are tall or have shorter legs relative to their torso." },
    { q: "What's the single most important ergonomic change for back pain?", a: "Getting your lumbar spine supported in its natural inward curve. This means either: (a) buying a chair with adjustable lumbar support (height and depth), or (b) adjusting your existing chair so the lumbar support hits the right spot—the inward curve just above your pelvis. If your chair has no lumbar support, a rolled towel or small lumbar cushion placed at belt level is a temporary fix. This one change addresses the root cause of most sitting-related back pain." }
  ],
  'best-ergonomic-office-chairs-2026': [
    { q: "How much should I spend on an ergonomic office chair?", a: "It depends on how many hours you sit per day. For 4-6 hours/day, a $250-$500 chair (SIHOO, Branch, Ticova) is a solid investment. For 6-8 hours/day, jump to the $500-$1,000 range (Haworth Soji, Steelcase Series 1). For 8+ hours/day, the $1,000+ flagship chairs (Aeron, Leap v2, Gesture, Embody) are worth every penny—they'll last 10-15 years and save you from chronic back pain." },
    { q: "Mesh or foam seat—which is better?", a: "Mesh is more breathable (cooler for long sessions), easier to clean, and distributes pressure differently than foam. Foam is more familiar, provides a more consistent surface pressure, and can be softer initially. There's no universal winner—it's personal preference. If you tend to run hot or sit for very long sessions, mesh is probably better. If you prefer a cushioned feel and don't have temperature concerns, foam is fine." },
    { q: "Should I buy a used or refurbished high-end chair?", a: "Absolutely—this is one of the best ways to get a flagship chair at a mid-range price. The Aeron, Leap v2, and Gesture are all built to last 10-15 years, and the used market for them is excellent. Expect to pay $400-$700 for a used Aeron or Leap v2, compared to $1,200-$1,500 new. Look for refurbishers that replace the gas cylinder, casters, and arm pads." },
    { q: "How long should an ergonomic office chair last?", a: "Budget-tier chairs ($200-$500) should last 3-5 years with daily use. Mid-range chairs ($500-$1,000) typically last 5-8 years. Flagship chairs ($1,000-$1,800) are built to last 10-15 years—and they come with 12-year warranties to back that up. The key limiting factors are: mesh sagging (mesh chairs), seat cushion compression (foam chairs), gas cylinder degradation, and caster wear." },
    { q: "Do I need a headrest on my ergonomic chair?", a: "Headrests are useful for reclining and passive sitting—if you lean back while reading or thinking, a headrest prevents neck strain. However, most ergonomic experts recommend against using a headrest while actively working at a desk, because it encourages you to lean your head back, which can strain your neck when you're looking forward at a monitor. A headrest is nice to have for breaks, but shouldn't be primary support during active work." },
    { q: "What size chair do I need?", a: "Size matters more than most people realize. Under 5'4\": look for chairs with a low minimum seat height (15\" or lower) and shorter seat depth like the Aeron Size A or Haworth Soji Small. 5'4\"-5'10\": the sweet spot for most chairs, focus on adjustability. 5'10\"-6'3\": you need taller seat height range and longer depth, look at the Hbada E3, Steelcase Gesture, or Aeron Size C. Over 6'3\": prioritize chairs with tall backrests and headrest options." },
    { q: "Is it worth spending $1,000+ on an office chair?", a: "If you sit for 8+ hours a day, yes. A $1,395 Aeron amortized over 12 years is about $0.30 per day. For that, you get a chair that supports your spine properly, lasts longer than any budget option, and has high resale value. The math changes if you sit less than 4 hours a day—in that case, a $350 Branch is likely sufficient." },
    { q: "How do seat depth adjustment, 3D vs 4D armrests, and lumbar support affect comfort?", a: "Seat depth adjustment is critical for anyone outside average height range—it prevents pressure behind the knees or insufficient thigh support. 4D armrests (height, width, depth, pivot) are significantly better than 3D (missing depth), especially if you use multiple devices. Lumbar support with both height and depth adjustment is the gold standard; height-only is acceptable; fixed lumbar bumps are not worth considering." },
    { q: "Can I finance a high-end ergonomic chair?", a: "Yes—many retailers offer financing through Affirm, Klarna, or store-specific payment plans. Herman Miller, Steelcase, and Branch all offer financing options. Interest rates vary from 0% promotional offers to standard APR. Financing makes sense if the chair will improve your health and productivity, and you can pay it off within the promotional period. Avoid high-interest longer-term plans—a used chair is better than paying 20%+ APR." }
  ],
  'best-standing-desk-mat-for-concrete-floors': [
    { q: "Do I really need a mat for concrete floors, or can I just stand without one?", a: "You really need a mat. Concrete is one of the hardest surfaces you can stand on—it transfers nearly 100% of impact back into your joints. Without a mat, most people can stand comfortably for about 20-30 minutes. With a quality mat, that extends to 2-4 hours. The difference is the mat's ability to encourage micro-movements in your feet and legs, which keeps blood flowing and prevents the joint stiffness that makes standing miserable." },
    { q: "How thick should a standing desk mat be for concrete floors?", a: "For concrete, 3/4 inch (about 19mm) is the sweet spot. Thinner mats (1/2 inch or less) don't provide enough cushioning on a hard substrate like concrete—your feet will feel the floor through them. Thicker mats (1 inch+) can feel unstable and create a tripping hazard at the edges. The Sky Mat and Ergodriven Topo are both in this ideal thickness range. If you're on carpet or vinyl over concrete, you might get away with 1/2 inch, but 3/4 is the safe bet." },
    { q: "Are standing desk mats worth it, or are they just another thing to buy?", a: "Worth it—but only if you actually stand at your desk. If you're buying a mat hoping it will make you stand more, it probably won't. The mat makes standing more comfortable, which makes it easier to choose to stand when you want to. But the motivation to stand has to come first. If you already stand for at least an hour a day, a mat is a no-brainer upgrade. If you never stand, buy a mat after you've built the habit, not before." },
    { q: "Can I use an anti-fatigue mat on carpet?", a: "Yes, but the effect is reduced. Carpet already provides some cushioning and encourages micro-movements on its own (the surface gives slightly under your weight). On low-pile carpet, a mat with a hard base (like the Topo or Ergodriven) works well. On thick plush carpet, the mat may feel unstable or sink into the carpet—look for mats specifically designed for carpet use. The Sky Mat works on both hard floors and low-pile carpet." },
    { q: "Are standing desk mats easy to clean? I eat at my desk.", a: "It depends on the mat material. Rubber mats (Sky Mat) are the easiest to clean—wipe with a damp cloth and mild soap. Fabric or textured mats (Topo) collect crumbs and dust in their crevices and need occasional vacuuming or spot cleaning. Leather or PU mats are wipe-clean but can stain if spills sit too long. If you eat at your desk, get a rubber mat or a smooth-surface mat that you can wipe down easily. Avoid anything with deep texture or fabric." },
    { q: "Do standing desk mats work on heated floors?", a: "Most mats will reduce the effectiveness of radiant floor heating because the mat creates an insulating layer between your feet and the heat source. Rubber and foam are both good insulators. If you have heated floors and want a standing mat, a thinner mat (1/2 inch) will transfer more heat than a thick one. The Ergodriven Topo's hard composite base conducts heat slightly better than thick foam. In practice, most users don't notice a significant difference." },
    { q: "Should I get a flat mat or a textured/ergonomic mat?", a: "Flat mats (Sky Mat, Cloudpeak) are simpler, cheaper, and easier to clean. They work by providing a cushioned surface that reduces pressure. Textured mats (Topo, Ergodriven) have raised nodes, bumps, and surface contours designed to encourage active standing—shifting weight, rolling your feet, and engaging different muscle groups. The textured mats are more effective for long standing sessions (4+ hours), but they're more expensive and harder to clean. For most people, a quality flat mat is sufficient." }
  ],
  'best-standing-desks-under-500': [
    { q: "Is a $300 standing desk worth buying, or should I save up for a more expensive one?", a: "A $300 standing desk is absolutely worth buying if you need a desk now and have a hard budget cap. The Flexispot E7 and SHW both offer electric height adjustment at this price, and they'll get the job done for 3-5 years. The main trade-offs are stability at max height (some wobble), fewer features (no programmable presets or anti-collision), and shorter warranties. If you expect to keep the desk for 7+ years, saving for a $600-800 model makes sense. If you need a desk today, $300 gets you a perfectly serviceable one." },
    { q: "What's the difference between a single-motor and dual-motor standing desk?", a: "Single-motor desks use one motor connected to both legs via a crossbar. Dual-motor desks have separate motors in each leg. For the sub-$500 category, single-motor is the norm. Dual-motor is better for heavier loads, faster lifting, and smoother operation—but they rarely appear under $500. At this price point, focus on stability and weight capacity rather than motor count." },
    { q: "Hand crank vs. electric—which is better for daily use?", a: "Electric is dramatically more convenient for daily adjustments. Pressing a button takes 5 seconds; cranking takes 30-60 seconds. That friction adds up over a year of daily transitions. A hand-crank desk is fine if you only adjust height once a day, or if you're on a very tight budget, but for frequent transitions, the $50-100 premium for electric is one of the best investments you can make." },
    { q: "How much wobble is normal for a budget standing desk at full height?", a: "Some wobble is normal at standing height (40-50 inches) on any desk, but it should be minimal—a few millimeters of sway when you lean on it, not a full-fledged shimmy when you type. The Flexispot E7 is the most stable in the sub-$500 range, with minimal wobble even at max height. C-frame desks wobble more than T-frame desks. If wobble bothers you, keep the desk at a lower height or budget for a T-frame model." },
    { q: "Can I use a standing desk with a treadmill or under-desk bike?", a: "Yes, with a few caveats. You need a desk with enough height range to accommodate your setup—most standing desks go from 28-48 inches, which works for standard treadmills. At walking/biking height, you'll want the desk at 40-45 inches depending on your height. Make sure the desk has enough depth to fit your monitor arm off-center so the treadmill can sit under the desk. A wider desktop (55-60 inches) is ideal for treadmill setups." },
    { q: "What size desktop should I get for a home office?", a: "48x24 inches is the minimum for a single-monitor laptop setup. 55x24 inches is the sweet spot for single-monitor with paperwork. 60x30 inches (if you can fit it) is ideal for dual monitors or an ultrawide. Depth matters more than most people realize—24 inches minimum, 30 inches is better for comfortable viewing distance with large monitors." },
    { q: "How difficult is it to assemble a budget standing desk?", a: "Most budget standing desks take 30-60 minutes to assemble with basic tools. The Flexispot E7 and SHW both come with illustrated instructions and include an Allen wrench. The hardest part is typically mounting the legs to the frame crossbars and flipping the desk upright. Two people make assembly much easier." },
    { q: "Do standing desks come with cable management features?" , a: "Most budget standing desks include a basic mesh cable tray that mounts under the desktop. These are functional but not elegant—they'll hold a power strip and some cables, but you'll want aftermarket velcro ties and possibly a J-channel raceway for a truly clean look. Some models (Flexispot E7) include grommet holes for routing cables through the desktop, which is a nice touch." },
    { q: "Will a standing desk under $500 hold a dual-monitor setup?", a: "Yes, if the total load (monitors + mount + laptop + accessories) stays under 100-150 lbs. Most monitors weigh 10-15 lbs each, a dual monitor arm adds 5-8 lbs, and a laptop adds 3-5 lbs—so you're well within the weight capacity. The bigger concern is desktop depth: 24 inches minimum for dual 24-inch monitors, 30 inches recommended for 27-inch monitors. Also budget for a good monitor arm since you'll want to reposition screens." }
  ],
  'cable-management-solutions': [
    { q: "How much should I expect to spend on cable management for a full desk setup?", a: "A complete cable management setup costs $30-80 for a standard desk. The essentials: under-desk cable tray ($17-25), velcro cable ties ($8-12 for a 50-pack), cable clips ($6-10), and a J-channel raceway ($10-15). If you need extension cords or a new power strip, add $15-25. That's $56-87 total for a setup that will look dramatically cleaner and be easier to maintain." },
    { q: "Should I use zip ties or velcro ties for cable management?", a: "Velcro ties, every time. Zip ties are permanent—you cut them off whenever you need to add, remove, or reroute a cable. Velcro ties are reusable, adjustable, and let you reconfigure your setup without tools. The only exception is for cables that will never move (in-wall runs, permanent installations). For desk setups, buy a roll of adhesive-backed velcro and cut to length as needed." },
    { q: "How do I manage cables for a standing desk that moves up and down?", a: "This is the trickiest cable management scenario. The key is service loops and cable channels: leave enough slack in each cable to accommodate the full height range of the desk (typically 15-20 inches of movement). Route cables along a cable chain or spiral wrap that moves with the desk. Use a cable tray under the desk to collect excess slack. For the power cord and Ethernet, use a longer cable (8-10 feet) coiled near the base, with velcro keeping it tidy. Monitor arms with built-in cable management are a game-changer here—they keep the cables off the desktop entirely." },
    { q: "What's the best way to hide a power strip under a desk?", a: "Mount it to the underside of the desk using the screw holes on the power strip itself, or use adhesive velcro strips. Position it at the back edge of the desk so the plugged-in cables run toward the wall rather than toward your legs. A mesh cable tray provides a dedicated basket for the power strip and all its connected cables. For a cleaner look, use a slim power strip like the Anker Power Strip with USB-C ($23) that plugs in parallel and doesn't block adjacent outlets." },
    { q: "How do I organize cables behind a wall-mounted TV or monitor?", a: "For a wall-mounted monitor/TV, use an in-wall cable management kit that includes a power bridge and low-voltage cable pass-through. These kits let you route HDMI and power cables inside the wall (check local codes—low-voltage wiring is usually DIY-friendly but electrical work may require a permit). For a simpler solution, use a paintable cable raceway that sticks to the wall surface and conceals cables in a slim channel." },
    { q: "Are cable sleeves worth it, or should I just use ties?", a: "Cable sleeves (braided expandable tubing) are worth it for cables that run together for long distances—like the bundle from your desk to your tower or wall outlet. They create a single unified look rather than individual tied bundles. For the desk surface itself, sleeves are overkill; individual velcro ties are more practical. Sleeves work best for the large vertical runs behind or beside a desk." },
    { q: "How do I handle cables when my desk is against a wall with no back panel?", a: "Use adhesive cable clips to route cables along the bottom edge of the desk rather than letting them hang freely. Use velcro straps to bundle cables along the desk's crossbar or frame. A cable raceway ($10-15) sticks to the back edge of the desk to conceal the vertical cable drop. Position your power strip horizontally on the underside of the desk so plugs face inward." },
    { q: "What's the easiest cable management fix that makes the biggest visual difference?", a: "The single highest-impact move is mounting your power strip under the desk. It removes 80% of visible cable clutter. That one change eliminates the tangle of wires snaking along your wall, frees up floor space, and makes it easy to unplug and reroute cables when you need to adjust your setup. For $17 (VIVO cable tray) or just velcro strips, it's the best value in cable management." }
  ],
  'dual-monitor-home-office': [
    { q: "How much should I spend on a dual monitor home office setup?", a: "You can build a solid dual-monitor setup for $600-1,200 depending on monitor quality. Budget-friendly: two 24-inch 1080p monitors at $150-200 each plus a $50-70 dual monitor arm. Mid-range: two 27-inch QHD monitors at $300-400 each plus a $100-150 arm. Premium: two 27-inch 4K monitors at $500-700 each plus a premium arm. Factor in a good monitor arm—it's the most important accessory." },
    { q: "Do I need two identical monitors for a dual monitor setup?", a: "Not at all. Many people run a primary monitor (larger, higher resolution) and a secondary monitor (smaller, lower resolution) perfectly happily. The main consideration is that mismatched resolutions and sizes can create a jarring experience when moving the cursor between screens. As long as the refresh rates and response times are close enough for your use case, mixing monitors works fine." },
    { q: "Can my computer support dual monitors?", a: "Most modern computers support dual monitors. Check your PC's graphics card or laptop's video outputs: you need at least two video outputs (HDMI, DisplayPort, USB-C, or Thunderbolt). If your computer only has one output, a USB-to-HDMI adapter ($15-30) can add a second display. Apple Silicon Macs (M1, M2, M3) have specific limitations—some only support one external display natively and need a DisplayLink adapter for dual monitors. Always check your specific model's specs before buying." },
    { q: "Should I use a dual monitor arm or two single arms?", a: "Two single arms give you more flexibility—you can position each monitor independently, move them closer or farther apart, and adjust height and tilt separately. A dual monitor arm is cleaner (one clamp, one cable management channel) but limits independent positioning. For most home offices, two single arms are the better choice. If desk space is extremely tight, a dual arm saves clamp area." },
    { q: "What's the ideal desk size for a dual monitor setup?", a: "Minimum: 55 inches wide by 28 inches deep. This gives you enough width for two 24-inch monitors side by side with some space for a laptop or speakers. Recommended: 60-72 inches wide by 30 inches deep. This comfortably fits two 27-inch monitors, leaves room for a laptop and accessories, and gives proper viewing distance. Depth is critical—at 24 inches deep, 27-inch monitors will feel uncomfortably close." },
    { q: "How do I handle cable management for two monitors?", a: "A dual monitor arm with built-in cable management is the cleanest solution—most arms have channels that route cables along the arm and down a single central post to the desk. Below the desk, a cable tray collects both monitor cables plus your keyboard, mouse, and power cables. Use velcro ties to bundle pairs (power + signal for each monitor) every 6-8 inches. Label both ends of each cable with small wraps or tape for future troubleshooting." },
    { q: "Should I mount both monitors on arms or keep one on its stand?", a: "Mount both on arms. Once you experience the adjustability of a monitor arm—height, tilt, swivel, rotation, and distance—you'll never want to go back to a fixed stand. The disparity between an arm-mounted and stand-mounted monitor side by side will drive you crazy because they'll never match height or distance perfectly. Budget $50-70 per arm (or $100-150 for a quality dual arm) and consider it a required investment." },
    { q: "Can I use a 34-inch ultrawide instead of two monitors?", a: "Yes, and many people prefer it. An ultrawide gives you the screen real estate of two monitors without the bezel gap in the middle. It's better for full-screen applications (no break between screens) and works beautifully with window management tools. The trade-offs: you can't angle monitors toward you (which reduces side-screen glare), and if the monitor fails, you lose everything. For gaming and creative work, ultrawide is often superior. For productivity with lots of side-by-side windows, dual monitors still have advantages." },
    { q: "How do I reduce eye strain with two monitors?", a: "Four strategies: (1) Match brightness and color temperature on both monitors—disparity forces your eyes to constantly adjust. (2) Position monitors at the same distance from your eyes—don't have one closer than the other. (3) Use bias lighting behind the monitors to reduce the perceived contrast between the bright screens and the dark wall. (4) Take frequent breaks and look at something 20+ feet away for 20 seconds every 20 minutes (the 20-20-20 rule)." }
  ],
  'dual-monitor-setup-productivity': [
    { q: "Does using two monitors actually make you more productive?", a: "Yes—but the gain depends on your workflow. Meta-analyses of dual-monitor studies show a 9-30% productivity increase depending on the task. The biggest gains come from tasks that require frequent cross-referencing: coding (reference + editor), writing (research + document), design (tools + canvas), and financial analysis (spreadsheets + reports). For single-focus tasks like deep reading or data entry, the second screen can be a distraction." },
    { q: "Which monitor should be my primary display?", a: "The one directly in front of you. Your primary monitor should be centered on your desk and at eye level. Your secondary monitor should be to the side, angled slightly toward you. If one monitor is higher resolution, larger, or has better color accuracy, that should be your primary. For most people, the primary monitor handles active work and the secondary handles reference material, communication tools, and media." },
    { q: "How should I arrange my two monitors—side by side or stacked?", a: "Side by side is more common and works better for most workflows because it preserves the natural horizontal scanning pattern of your eyes. Stacked monitors (one above the other) save horizontal desk space and can work well for tasks where you need vertical reference (coding with documentation above, video editing with timeline below). Stacked setups require a very sturdy mount and a neck-friendly viewing angle. If you have the desk width, side by side is the safer choice." },
    { q: "What's the best way to manage windows across two monitors?", a: "Built-in OS tools work well: Windows Snap (Win + arrow keys) and macOS (hold Option while dragging). Third-party tools take it further: DisplayFusion (Windows), Magnet (macOS), or Rectangle (macOS, free). These let you create custom snap zones, save window layouts, and move windows between screens with keyboard shortcuts. The key habit: develop muscle memory for sending specific types of windows to specific monitors." },
    { q: "Should I use the same wallpaper on both monitors or a spanned image?", a: "Use different wallpapers or a single spanned image—not the same wallpaper duplicated. A duplicated wallpaper makes the two monitors feel like separate devices rather than one unified workspace. A spanned image creates visual continuity across both screens. Many tools (DisplayFusion, Wallpaper Engine) can set a spanned image across mismatched resolutions." },
    { q: "How do I prevent neck strain with a dual monitor setup?", a: "Proper positioning is critical. The center of your primary monitor should be at eye level. The secondary monitor should be positioned so you don't have to rotate your neck more than 30 degrees to see it. Sit at arm's length from the monitors. Take breaks and consciously move your neck through its full range of motion. If you find yourself constantly turning to one side, consider swapping the primary and secondary roles." },
    { q: "Do I need a high refresh rate monitor for office productivity?", a: "No—60Hz is perfectly adequate for spreadsheets, documents, email, and coding. Higher refresh rates (120Hz, 144Hz) make cursor movement and scrolling feel smoother, which can reduce perceived eye strain during long sessions, but the productivity benefit is marginal. The one exception: if you frequently scroll through long documents or code, the smoother scrolling of 120Hz can subjectively reduce fatigue." },
    { q: "Should I get a third monitor for ultimate productivity?", a: "Three monitors can be productive for very specific workflows: day trading (multiple real-time data feeds), video editing (preview + timeline + tools), or system administration (multiple server dashboards). For most people, three monitors create too much head movement and visual noise. Two monitors is the sweet spot; three is for specialists. Start with two and add a third only if you consistently find yourself needing more screen real estate." }
  ],
  'ergonomic-accessories-home-office': [
    { q: "Do I really need a monitor arm, or can I just stack books under my monitor?", a: "You can stack books. But here's what you're losing: the ability to adjust the screen forward or backward, tilt it exactly to reduce glare, swivel it to share with a coworker, and—most importantly—lift it in seconds when you stand up. A monitor arm isn't just about height. It's about adjustability. Books get you one fixed position. An arm gets you every position. That said, if your budget is truly zero, books are better than nothing. Just make sure the stack is stable." },
    { q: "Can I use a gaming mouse for ergonomics?", a: "Some gaming mice have decent shapes (the Logitech G502 has a comfortable thumb shelf, and the Razer DeathAdder V3 has a sculpted right-handed design), but most gaming mice prioritize weight, RGB, and high DPI over sustained comfort. The honeycomb shell designs that save weight are notorious for collecting grime and creating uncomfortable pressure points during long work sessions. If you already have a comfortable gaming mouse, it'll do. But if you're buying new, get an ergonomic mouse first." },
    { q: "Are gel wrist rests better than foam?", a: "Gel wrist rests are cooler to the touch and provide more 'sinking in' support, which feels nice initially. But gel compresses and conforms less over time than memory foam, and it doesn't spring back as well. The result: a gel rest might feel great for a month, then start developing permanent divots. Good memory foam (like the Glorious pad) maintains its shape much longer. The exception is gel rests made with medical-grade gel—those are better, and they're priced accordingly. For most people, memory foam wins." },
    { q: "How long does it take to get used to a split keyboard?", a: "Most people adjust within 5-7 days. Your typing speed will drop to about 50-60% of normal on day one. By day three, you'll be around 80%. By day seven, most people are back to their pre-split speed or faster. The real payoff comes at week three or four, when you stop noticing the keyboard entirely—that's when you know your hands are in a neutral position and you're not fighting the hardware anymore. Practice with typing drills for 10 minutes a day during the transition." },
    { q: "I have a standing desk. Do I need a standing mat?", a: "Yes. Even premium standing desks with great ergonomics don't address the floor. Standing on hardwood, tile, or concrete without a mat reduces the amount of time you can comfortably stand by roughly half. The Cloudpeak mat ($33) is a cheap insurance policy that will make you much more likely to actually use your standing desk throughout the day. If you find yourself sitting more than standing, a mat is probably the fix." },
    { q: "What's the single most important purchase for someone with wrist pain?", a: "Two things compete for the top spot. A trackball mouse (like the Kensington Orbit at $39 or the Logitech ERGO M575 at $49) removes the wrist motion that aggravates most repetitive strain issues. But if your pain is keyboard-related—from constantly reaching for the home row with your wrists angled—a split keyboard like the Kinesis Freestyle2 ($89) is more effective. If you can only buy one, start with the trackball. It's cheaper, requires zero learning curve for your keyboarding, and addresses the most common RSI trigger." },
    { q: "Do these accessories work with a standing desk?", a: "Almost all of them do, and several are more valuable with a standing setup. A monitor arm is essential for a standing desk—it lets you keep the screen at eye level whether you're sitting or standing. The anti-fatigue mat is standing-specific. A footrest can still be useful if you use a drafting stool for perching. Cable management becomes more important because the cables need to have enough slack to follow you as you change desk height." },
    { q: "How often should I replace my ergonomic accessories?", a: "Depends on the item. Monitor arms (Ergotron LX) and trackballs should last 10+ years. Split keyboards typically last 5-7 years with normal use. Foam-based accessories (wrist rests, anti-fatigue mats) need replacing every 1-2 years when they lose their bounce. Footrests with foam cores last about 2-3 years. Cable management is basically permanent. The rule of thumb: if it has foam or padding, it's a consumable. Everything else is an investment." },
    { q: "Is there any harm in using too many ergonomic accessories?", a: "Believe it or not, yes. It's possible to over-engineer your setup. If you have a keyboard tray, a wrist rest, and a gel palm pad on your mouse pad, you might end up with your hands in an awkward position because the cumulative height from all those layers throws off your elbow angle. The goal is neutral posture—straight wrists, elbows at 90 degrees, feet flat. Each accessory should move you toward that goal. If adding something makes you feel more comfortable, keep it. If it feels off, remove it." },
    { q: "Where should I start if my budget is under $100?", a: "Monitor arm, no question. The Amazon Basics arm at $22 leaves you with nearly $80. Put that toward a Logitech MX Master 3S if your mouse is the weak link, or a Kinesis Freestyle2 split keyboard if typing posture is your priority. Either combination transforms your setup for under $110. If you truly can't stretch past $50, get the monitor arm and a cheap wrist rest, then save for the next upgrade." }
  ],
  'ergonomic-office-chair-buying-guide': [
    { q: "How much should I spend on an ergonomic office chair?", a: "For a part-time desk worker, $200-400 gets you a meaningful upgrade over a standard office chair. For full-time remote work, budget $500-900 for a chair that will last 8-10 years with proper adjustability. If you have chronic back pain, spend $900+—the cost is negligible compared to chiropractor visits or time lost to discomfort." },
    { q: "Is mesh or foam better for an office chair?", a: "Neither is objectively better—they serve different needs. Mesh is more breathable and conforms dynamically to your shape, making it ideal for warm environments or people who run warm. Foam provides more uniform pressure distribution and feels plusher, but lower-quality foam degrades within a year. High-density foam (like in the Leap V2) holds up for a decade or more. The best approach: try both if you can, and prioritize quality over type." },
    { q: "Can I use a gaming chair for ergonomic office work?", a: "Generally no. Most gaming chairs are designed to mimic racing bucket seats—they're narrow, have fixed lumbar support, lack seat depth adjustment, and use low-density foam that compresses quickly. They look aggressive but perform poorly for long-term seated work. The main exceptions are high-end gaming chairs from brands like Herman Miller (the Embody gaming chair) or Logitech/Steelcase collaborations, but those cost as much as premium ergonomic chairs." },
    { q: "How long should an ergonomic chair last?", a: "A good ergonomic chair should last 10-15 years with normal daily use. Budget chairs ($200-500) typically start showing wear at 3-5 years—the gas cylinder loses pressure, foam compresses, and armrest padding wears through. Premium chairs ($900+) are designed for 10+ years of daily, full-time use, and most come with warranties that reflect that. The Herman Miller Aeron from 1994 is still going strong in many offices—that's the durability benchmark." },
    { q: "Should I get a chair with a headrest?", a: "Headrests are useful for reclining and passive sitting—if you lean back while reading or thinking, a headrest prevents neck strain. However, most ergonomic experts recommend against using a headrest while actively working at a desk, because it encourages you to lean your head back, which can strain your neck when you're looking forward at a monitor. The general rule: a headrest is nice to have for breaks, but shouldn't be primary support during active work." },
    { q: "Do I need seat depth adjustment?", a: "If you're between 5'4\" and 5'11\" with average proportions, seat depth adjustment is a nice-to-have but not critical—most fixed-depth chairs are designed for this range. If you're under 5'4\" or over 6'0\", seat depth adjustment becomes important. Without it, shorter users risk the seat pressing behind their knees, and taller users risk insufficient thigh support. The ability to slide the seat pan forward or back by 3-4 inches makes a massive difference." },
    { q: "Can I use a standing desk with any ergonomic chair?", a: "Yes. An ergonomic chair pairs well with a standing desk—you adjust your chair for seated work and raise the desk for standing periods. In fact, this is the ideal setup: alternate between sitting and standing throughout the day, with each position properly dialed in. If you're using a standing desk, make sure your chair's seat height range works with the desk's minimum height when the desk is lowered." },
    { q: "Is buying a used ergonomic chair worth it?", a: "Absolutely—if you're smart about it. Premium ergonomic chairs are built to outlast the companies that buy them, so the used market is flooded with Aerons and Leaps from office closures and relocations. You can often find them for 40-60% of retail. Key things to check: test the gas cylinder (does it hold position?), check for torn mesh or compressed foam, inspect the armrest pads for wear, and make sure all adjustments work smoothly. Buy from a reputable refurbisher who offers a warranty." }
  ],
  'ergonomic-setup-for-gamers': [
    { q: "Are gaming chairs actually good for ergonomics?", a: "Most gaming chairs are not good for ergonomics—they're designed to look like racing bucket seats, with aggressive side bolsters that force your hips into a narrowed position. This restricts natural movement and can worsen lower back tension. The fixed lumbar pillows included with most gaming chairs provide one-size-fits-none support. If you want both aesthetics and ergonomics, look at the Herman Miller Embody Gaming chair, Steelcase Gesture, or a quality ergonomic chair with a headrest." },
    { q: "Should I use a standing desk for gaming?", a: "A standing desk is excellent for gaming because it lets you change posture between matches. During loading screens, between rounds, or during cutscenes, you can stand up, stretch, and reset your position. This breaks up the continuous sitting that causes the most fatigue. A desktop that sits on your existing desk works well if you don't want to replace your entire gaming desk." },
    { q: "Does monitor height really matter for gaming?", a: "Absolutely—it affects both comfort and performance. If your monitor is too low, you'll crane your neck forward, causing upper back and neck strain during long sessions. If it's too high, you'll look up, straining your eyes and causing dry eye. The top of the screen should be at or slightly below eye level. A monitor arm gives you the ability to fine-tune height, angle, and distance for each game genre." },
    { q: "What's the best desk height for gaming?", a: "For keyboard and mouse gaming, your elbows should be at roughly 90 degrees with forearms parallel to the floor. For controller gaming, you may want the desk slightly lower so your arms rest more naturally in your lap. A standard desk at 29-30 inches works for most people, but if you find yourself hunching, a keyboard tray can help. Standing desk converters are also great for switching between seated and standing gaming." },
    { q: "How important is wrist support for gaming?", a: "Very important—especially for mouse-heavy genres like FPS, MOBA, and RTS games. A good mouse pad with a wrist rest provides support between intense aiming sessions. A vertical mouse or trackball can help if you already have wrist pain. If you game for 3+ hours at a time, wrist stretches and regular breaks are essential to prevent repetitive strain injuries." },
    { q: "Should I get a headset or speakers for gaming ergonomics?", a: "A good headset keeps your neck in a neutral position—no hunching to hear better. Look for lightweight headsets under 300g to reduce neck strain during long sessions. If you prefer speakers, position them at ear level and equal distance from your head. Wireless headsets eliminate cable pull that can tug on your head during intense moments." },
    { q: "What's the ideal room lighting for gaming?", a: "Bias lighting behind your monitor reduces eye strain by balancing the contrast between the bright screen and dark walls. Avoid having a bright light source directly behind or above your monitor—it creates glare. A dimmable lamp to the side provides ambient light without washing out the screen. RGB strip lighting can look great but make sure it's indirect light, not directly in your field of view." },
    { q: "How do I set up cable management for a gaming PC?", a: "Cable management for gaming is more complex because you have thicker cables (display cables, power cables, headset cables) and peripheral cables that may need to reach further. Use a cable raceway under the desk to bundle the large power and display cables. Use a cable sleeve for the bundle going from your desk to your PC tower. Keep keyboard and mouse cables tidy with a cable bungee or adhesive clips." },
    { q: "Is RGB lighting helpful or just a distraction for gaming ergonomics?", a: "RGB can help with ergonomics if used as indirect ambient lighting—it reduces the contrast between your screen and the room, which reduces eye strain. Set RGB strips to a warm white or soft color at about 30-50% brightness. Avoid flashing or strobing effects in your peripheral vision—they can cause eye fatigue and headaches during long sessions." }
  ],
  'home-office-budget-setup-under-1000': [
    { q: "Can I build a good setup for under $500?", a: "Yes. The $465 setup in this guide gives you a proper chair, a solid fixed-height desk, a monitor arm, and a lamp. It's miles ahead of working from a dining table." },
    { q: "Should I spend more on the chair or the desk?", a: "Chair, by a wide margin. You can work from a card table for a few weeks. You can't spend 40 hours a week in a bad chair without consequences. Get a good chair and a cheap desk if you must—upgrade the desk later." },
    { q: "Is a standing desk really worth it?", a: "The evidence is mixed. Sitting 8 hours straight is bad. Standing 8 hours straight is also bad. Alternating every 30-60 minutes is better. A standing desk is a tool for enabling that variety. At $750, the SHW is a good entry point. At $1,000, the Branch desk is genuinely solid." },
    { q: "Should I buy used or new?", a: "Used: check Facebook Marketplace for Steelcase and Herman Miller chairs at $200-400. Risk: no warranty, inspect in person. New: reliable out-of-box with warranty and returns. Both paths are valid." },
    { q: "Do I really need a monitor arm?", a: "If you can get your monitor to eye level using its stock stand plus books, then no. If you can't (and most people can't), then yes—a $22 arm pays for itself in reduced neck strain within a month." },
    { q: "Can I build a dual-monitor setup on this budget?", a: "At the $1,000 tier, swap the Ergotron LX for a dual monitor arm (~$46) and use the savings toward a used second monitor. The $500 tier's TROTTEN desk is only 24 inches deep—side-by-side 24-inch monitors will feel cramped." },
    { q: "How long will this setup last?", a: "At the $750 and $1,000 tiers (7-10 year warranties on chair, 5-10 on desk), expect 5-7 years of daily use before anything needs replacing. The $500 tier's Markus has a 10-year warranty; the desk and arm will likely need upgrading sooner." }
  ],
  'home-office-desk-guide-2026': [
    { q: "What size desk do I need for a home office?", a: "Minimum: 48 x 24 inches for a single monitor setup. Sweet spot: 55-60 x 28-30 inches for a dual monitor setup with room for paperwork. If you have the space, 72 x 30 inches is ideal for a full workstation with room to spread out. Depth is more important than most people realize—24 inches minimum, 30 is better for comfortable viewing distance with larger monitors." },
    { q: "Is a standing desk really worth the extra cost?", a: "If you already stand during the day or plan to, yes. The health benefits of alternating between sitting and standing are well-documented: reduced back pain, better circulation, and improved energy levels. But a standing desk is only worth it if you actually use the standing feature. If you suspect you'll keep the desk at sitting height 95% of the time, spend the money on a better chair instead." },
    { q: "Fixed height vs. adjustable—which is better for most people?", a: "For most home office workers, an adjustable standing desk is better. Even if you rarely stand, being able to change the desk height slightly throughout the day—a few inches up for a more open posture, a few inches down for focused work—provides ergonomic benefits. Fixed-height desks are simpler, cheaper, and more stable, but they offer zero flexibility." },
    { q: "How important is desk depth for ergonomics?", a: "Very important. At 24 inches deep, a 27-inch monitor at proper viewing distance (arm's length, about 20-28 inches) leaves almost no room for a keyboard and mouse. At 30 inches deep, you can position the monitor at the ideal distance with room for comfortable typing. For dual monitors or ultrawide setups, 30 inches is strongly recommended." },
    { q: "Should I get a desk with drawers or keep it open?", a: "Drawers are convenient but reduce legroom and can interfere with chair positioning. If your desk is against a wall, a shallow pencil drawer is fine. For corner desks or situations where you sit facing the desk straight on, skip the drawers—they'll bump your knees. Under-desk storage (rolling file cabinet or adhesive drawer) is a better solution that doesn't sacrifice legroom." },
    { q: "How much weight do I need a desk to support?", a: "Most home office setups (monitor, laptop, keyboard, mouse, lamp) weigh under 50 lbs total. Add another 10-15 lbs for a monitor arm. For dual monitor setups, plan for 60-80 lbs. Standing desks should have a weight capacity of at least 150 lbs to handle the load plus some margin. Fixed-height desks with steel frames often support 300+ lbs." },
    { q: "Can I use a dining table or countertop as a desk?", a: "You can, and many people do. The key consideration is height: dining tables are typically 30 inches (slightly higher than a 29-inch desk) and kitchen counters are 36 inches (standing height). If the height works for your body, any flat, stable surface can function as a desk. The limitations are depth (tables are often shallower than desks) and cable management (no grommets)." },
    { q: "Does desk material matter for ergonomics?", a: "Material doesn't directly affect ergonomics (you're not touching the desk surface while typing), but it affects durability, appearance, and feel. Solid wood feels premium and lasts decades. Laminate/particleboard is affordable but can chip or warp. Steel frames provide the best stability. The ergonomics come from proper height, depth, and positioning—not the material of the surface." }
  ],
  'home-office-lighting-guide': [
    { q: "What color temperature is best for a home office?", a: "3500K-4500K is the sweet spot for most offices. It's warm enough to feel natural and comfortable but cool enough to keep you alert during focused work. If you can adjust your lamp's temperature, use the cooler end during your peak productivity hours (mid-morning through early afternoon) and warm it up as evening approaches. Avoid anything below 2700K during work hours—it's too warm to support concentration. And anything above 5000K for extended periods can feel clinical and increase eye fatigue." },
    { q: "Is natural light better than artificial light for working?", a: "Yes, with caveats. Natural light has a CRI of 100 (perfect color rendering) and its shifting color temperature throughout the day supports your natural circadian rhythm automatically. But natural light isn't controllable—it changes with weather, time of day, and season. You need blinds or curtains to manage it. The ideal setup uses natural light as your ambient source (side-positioned desk, perpendicular to the window) supplemented by adjustable artificial task lighting for consistent illumination throughout the day." },
    { q: "How bright should my desk lamp be?", a: "For reading and writing, you want 500-1000 lux at the work surface. For computer work, the light should be bright enough to illuminate your keyboard and any documents without washing out your monitor. A good rule of thumb: if you can hold a book at arm's length in the light of your desk lamp and read it comfortably, the brightness is sufficient. Most quality task lights offer adjustable brightness—set it so the desk area is clearly lit but the screen remains the brightest thing in your field of view." },
    { q: "Should I get a ring light for video calls?", a: "A ring light works, but it's usually overkill and creates a very specific look—flat, shadowless, and slightly artificial—that's recognizable as a ring light. A better approach is a desk lamp with a diffused shade positioned 45 degrees to the side and slightly above eye level. This gives you directional light that adds depth to your face while still being flattering. If you really want a ring light, get one with adjustable color temperature and brightness." },
    { q: "Can I use smart bulbs instead of a new lamp?", a: "Smart bulbs are a great solution because they let you adjust brightness and color temperature without buying a new lamp. Put a smart bulb in an existing lamp and you've got an adjustable task light. The Hue White Ambiance ($25-30) and LIFX Color ($30) are both excellent options. Smart bulbs won't fix a poorly positioned light source, so make sure your lamp is at the right height and angle before upgrading the bulb." },
    { q: "What's the best position for a desk lamp?", a: "The ideal position is 45 degrees to the side and slightly above eye level. For a right-handed person, position the lamp on the left side (so your writing hand doesn't cast shadows). For a left-handed person, position it on the right. The light should illuminate your work surface without shining directly in your eyes or creating glare on your monitor. If you can see the bulb from your seated position, it's too high or too bright." },
    { q: "Does monitor brightness affect eye strain more than room lighting?", a: "Yes—monitor brightness is the primary driver of eye strain because it's the brightest thing in your field of view and you look at it directly for hours. Your monitor should be bright enough to read comfortably but not so bright that it feels like a light source. A good starting point: set monitor brightness to match the ambient light level in your room. If the room is dark, lower the monitor brightness. If the room is bright, raise it." }
  ],
  'night-shift-lighting-guide': [
    { q: "Is blue light actually harmful, or is it just a marketing trend?", a: "It's real, but the marketing has definitely inflated it. Blue light itself isn't harmful to your eyes at normal screen brightness levels—the concerns about retinal damage from screens have been largely overstated. What is well-supported by research is blue light's effect on circadian rhythm and sleep timing. The issue isn't that blue light damages your eyes; it's that it tricks your brain into thinking it's daytime at 11 PM. This is a well-documented biological mechanism, not a marketing gimmick." },
    { q: "What color temperature should I use for daytime work?", a: "For daytime work, aim for 3,500-4,000 K (neutral white) for general tasks and up to 5,000 K for tasks requiring high alertness or color accuracy. This matches the color of midday natural light and supports focus and energy. Many smart bulbs let you automate this shift so you don't have to think about it." },
    { q: "Can I just use dark mode instead of changing my lighting?", a: "Dark mode helps with brightness but doesn't eliminate blue light—text and UI elements still emit it. Dark mode + f.lux is better than either alone, but you still need warm ambient lighting to fully protect melatonin production." },
    { q: "Does bias lighting really help with eye strain, or is it placebo?", a: "Yes—the visual accommodation problem (pupils rapidly contracting and dilating in response to a bright screen in a dark room) is a real physiological cause of eye fatigue. Bias lighting eliminates the root cause, and multiple ergonomics organizations recommend it. It's one of the most effective single changes for reducing nighttime eye strain." },
    { q: "Do I need expensive glasses, or will cheap ones work?", a: "Cheap ones work fine if they actually block the right wavelengths. The Uvex Skyper ($10) blocks more blue light than most $50-$100 'gaming glasses' because it uses a dense orange tint. The trade-off: everything looks yellow. For glasses you can wear in public without color distortion, you'll need a more subtle (and pricier) tint—or stick with software solutions entirely." },
    { q: "Will warm lighting make it hard to see my keyboard or read documents?", a: "No—warm light at 2,700 K is perfectly adequate for reading, typing, and most desk work. The difference between 2,700 K and 4,000 K is color tone, not brightness or legibility. If you're struggling to see under warm light, the issue is insufficient brightness (lumens), not color temperature. Make sure your warm bulbs are rated for adequate lumens (450+ for a desk lamp, 800+ for a room light)." },
    { q: "Do LED bulbs with high CRI matter for warm lighting?", a: "Yes, especially if you do any kind of color-sensitive work or simply prefer your space to look natural. Low-CRI (Color Rendering Index) warm bulbs can make colors look muddy or greyish, which is unappealing. Aim for CRI 90+ for any bulb in your workspace. The difference between a CRI 80 bulb and a CRI 90 bulb is noticeable when you're reading or working with colored materials." },
    { q: "How do I measure color temperature to make sure my lights are right?", a: "You don't need a spectrometer. Check the bulb's packaging or product page for the Kelvin (K) rating. 'Soft White' = 2,700 K. 'Warm White' = 3,000 K. 'Cool White' = 4,000 K. 'Daylight' = 5,000 K+. If the bulb doesn't list a Kelvin number, don't buy it—you can't tell by visual inspection alone. For monitor light bars and smart bulbs, the color temperature is adjustable and displayed in the settings or app." }
  ],
  'productive-workspace-mindset': [
    { q: "Is a minimalist desk actually better for productivity?", a: "For focused, detail-oriented tasks—yes, generally. Visual minimalism reduces cognitive load. But for creative or brainstorming work, some visual variety can help. The ideal is a flexible workspace: clear the surface for focus, spread things out for creative sessions." },
    { q: "What color should I paint my home office?", a: "Safest options: warm neutrals (beige, warm gray, cream), soft blues, or muted greens. Use saturated colors as accents—a chair, desk accessories, or a single accent wall behind your monitor." },
    { q: "Does working in the same room where I sleep affect my sleep?", a: "Yes. When work and sleep share a space, your brain struggles to form distinct associations. Create visual separation—a room divider or even a rug defining the work zone. At end of day, cover or put away work tools to signal 'work is done.'" },
    { q: "How many plants do I need?", a: "Even one plant makes a measurable difference. Visibility matters more than quantity—keep it within your line of sight." },
    { q: "Should I use a standing desk for productivity?", a: "Standing changes your posture and autonomic state, shifting cognitive mode. Many people think more dynamically standing and focus more deeply sitting. The real benefit is the ability to change posture—variation itself supports sustained cognitive performance." },
    { q: "Do blue light glasses help?", a: "Evidence is mixed. Blue light from screens is relatively small compared to daylight, and modern devices have built-in night modes. Glasses may help for evening screen use, but the bigger wins come from adjusting your overall lighting environment and reducing screen time before bed." },
    { q: "How long does it take to adapt to a new setup?", a: "About 3-7 days. Things may feel off during adaptation—that's normal. Give each change at least a week before evaluating it." }
  ],
  'small-home-office-organization-hacks': [
    { q: "How much does it cost to set up a small home office from scratch?", a: "A functional small office doesn't need to cost a fortune. Budget $50-100 for organization gear (pegboard, cable tray, under-desk drawer, clamp lamp, magnetic strip) plus whatever you need for the desk itself. If you already have a desk and chair, you can implement most of the strategies in this guide for under $100." },
    { q: "What's the single most impactful change I can make in a small office?", a: "An under-desk cable tray. For $17, it eliminates the visual chaos of dangling cords and hidden power bricks. It's the highest-ROI change because it's cheap, installs in 5 minutes, immediately makes your space feel 2x cleaner, and solves a problem that most people don't even realize is bothering them until it's gone." },
    { q: "I'm renting—can I use wall-mounted storage without damaging walls?", a: "Yes, with the right approach. Many wall-mounted solutions use adhesive strips (command strips work for lighter items under 5 lbs). For heavier items like monitor arms or floating desks, screw into studs—the holes are small and easily patched with spackle before you move out. Most landlords consider small screw holes normal wear and tear." },
    { q: "How do I make a small home office feel less claustrophobic?", a: "Three strategies work consistently: (1) Use light, neutral colors on walls and furniture. (2) Add a mirror—even a small one on the wall opposite your desk reflects light and doubles the perceived space. (3) Eliminate visual clutter—a pegboard, under-desk cable tray, and wall files remove the noise from your visual field." },
    { q: "Can I fit a dual-monitor setup in a small home office?", a: "Absolutely, with the right approach. Use a dual monitor arm ($70-120) that mounts to a clamp or grommet—this eliminates both monitor stands and frees up desk space. Position the monitors side-by-side (not angled into a corner) to minimize depth. Look for 24-inch monitors, which are the sweet spot for space efficiency. If even that feels tight, consider a 34-inch ultrawide instead." },
    { q: "What's the best chair for a small home office?", a: "For small spaces, look for a chair with adjustable armrests that flip up or slide back so you can tuck the chair fully under the desk when not in use. The ErgoChair Pro ($400) and IKEA MARKUS ($250) are popular small-space options. For budget builds, mesh-task chairs with flip-up arms are available for $80-120." },
    { q: "How do I organize cables when my desk is against a wall with no back?", a: "Use adhesive cable clips to route cables along the bottom edge of the desk. Use velcro straps to bundle cables along the desk's crossbar. Use a cable raceway ($10-15) that sticks to the back edge of the desk to conceal the vertical cable drop." },
    { q: "Should I get a standing desk for a small space?", a: "Only if it's a model with a small footprint. Most electric standing desks are 48-60 inches wide and require clearance behind for the frame. In a small space, a standing desk converter ($100-300) that sits on your existing desk is often a better bet. The FlexiSpot M8W ($199) is compact enough for small desks." }
  ]
};

const BADGE_LABELS = {
  'badge--best': "Editor's Choice",
  'badge--value': 'Best Value',
  'badge--budget': 'Budget Pick',
  'badge--premium': 'Premium Pick',
  'badge--ergonomic': 'Best for Ergonomics'
};

const PRODUCT_BADGE_MAP = {};
const PRODUCT_ITEMS = [
  ['sihoo', 'badge--budget'], ['hbada', 'badge--budget'],
  ['branch', 'badge--best'],
  ['autonomous ergochair pro', 'badge--ergonomic'], ['ergochair pro', 'badge--ergonomic'],
  ['ticova', 'badge--value'],
  ['steelcase series 1', 'badge--value'], ['steelcase series 2', 'badge--premium'],
  ['herman miller sayl', 'badge--premium'], ['sayl', 'badge--premium'],
  ['haworth soji', 'badge--value'], ['soji', 'badge--value'],
  ['herman miller aeron', 'badge--best'], ['aeron', 'badge--best'],
  ['steelcase gesture', 'badge--premium'], ['gesture', 'badge--premium'],
  ['steelcase leap v2', 'badge--ergonomic'], ['leap v2', 'badge--ergonomic'],
  ['herman miller embody', 'badge--premium'], ['embody', 'badge--premium'],
  ['flexispot', 'badge--value'], ['shw', 'badge--budget'], ['uplift', 'badge--premium'],
  ['jarvis', 'badge--premium'], ['ergotron', 'badge--premium'],
  ['vivo', 'badge--value'], ['amazon basics', 'badge--budget'],
  ['ikea', 'badge--budget'], ['trotten', 'badge--budget'],
  ['markus', 'badge--value'], ['coleshome', 'badge--value'],
  ['eureka ergonomic', 'badge--value'], ['tribesigns', 'badge--value'],
  ['ergear', 'badge--value'], ['bush furniture', 'badge--value'], ['bestar', 'badge--premium'],
  ['kensington solemate', 'badge--best'], ['kensington orbit', 'badge--value'],
  ['logitech mx master', 'badge--best'], ['mx master', 'badge--best'],
  ['logitech ergo m575', 'badge--value'], ['logitech ergo', 'badge--value'],
  ['kinesis freestyle2', 'badge--best'], ['kinesis', 'badge--best'],
  ['glorious gaming', 'badge--value'], ['glorious', 'badge--value'],
  ['cloudpeak', 'badge--budget'], ['ergodriven topo', 'badge--premium'],
  ['skadis', 'badge--value'], ['soulwit', 'badge--value'],
  ['mr ironstone', 'badge--budget'], ['taotronics', 'badge--value'],
  ['govee', 'badge--value'], ['humanscale float', 'badge--premium'],
  ['humanscale', 'badge--premium'], ['devais', 'badge--value'],
  ['uxcell', 'badge--budget'], ['lack', 'badge--budget'],
  ['signum', 'badge--value'], ['lepro', 'badge--value'],
  ['anker', 'badge--value'], ['monoprice', 'badge--value'],
  ['wali', 'badge--value'], ['huanuo', 'badge--value'],
  ['furinno', 'badge--budget'], ['hobst', 'badge--value'],
  ['wall control', 'badge--value'], ['mount-it', 'badge--value'],
  ['brightech', 'badge--value'], ['flexispot m8w', 'badge--value'],
  ['uex skyper', 'badge--value'], ['huw', 'badge--value'],
  ['flexispot e7', 'badge--value']
];
PRODUCT_ITEMS.forEach(([name, cls]) => { PRODUCT_BADGE_MAP[name] = cls; });

// ==============================
// HELPERS
// ==============================
function stripTags(str) {
  return str.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, c => {
    const m = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#8217;': "'", '&#8212;': '—', '&#8230;': '…', '&#x27;': "'", '&nbsp;': ' ', '&#8211;': '–', '&#x2019;': "'", '&#x2014;': '—' };
    return m[c] || c;
  }).replace(/\s+/g, ' ').trim();
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeJSON(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
}

function findBadge(name) {
  const lower = name.toLowerCase();
  for (const [key, cls] of Object.entries(PRODUCT_BADGE_MAP)) {
    if (lower.includes(key)) return cls;
  }
  return 'badge--best';
}

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
// MAIN ENHANCEMENT
// ==============================
function enhanceGuide(filePath) {
  const basename = path.basename(filePath, '.html');
  let html = fs.readFileSync(filePath, 'utf8');
  const origHtml = html;
  const data = GUIDE_DATA[basename];
  
  if (!data) {
    console.log(`  ⚠️  No data entry, skipping`);
    return false;
  }
  
  let hadChanges = false;
  
  // ====================
  // FEATURE 1: FAQ ACCORDION + SCHEMA
  // ====================
  
  const pairs = FAQ_PAIRS[basename];
  if (pairs && pairs.length > 0) {
    // Build accordion HTML
    const accordionItems = pairs.map((p, i) => {
      const isOpen = i === 0;
      return `          <div class="faq-item">
            <button class="faq-question" aria-expanded="${isOpen ? 'true' : 'false'}" aria-controls="faq-answer-${i}">
              ${escapeAttr(p.q)}
              <span class="faq-chevron" aria-hidden="true">▾</span>
            </button>
            <div class="faq-answer" id="faq-answer-${i}"${isOpen ? '' : ' hidden'}>
              <p>${escapeAttr(p.a)}</p>
            </div>
          </div>`;
    }).join('\n');
    
    const accordionSection = `<h2 id="faq">Frequently Asked Questions</h2>
        <div class="faq-accordion">
${accordionItems}
        </div>`;
    
    // Build FAQPage schema
    const schemaItems = pairs.map(p => {
      const q = escapeJSON(p.q);
      const a = escapeJSON(p.a);
      return `    {
      "@type": "Question",
      "name": "${q}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${a}"
      }
    }`;
    }).join(',\n');
    
    const schema = `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
${schemaItems}
    ]
  }
  </script>`;
    
    // Find and replace FAQ section
    // Look for FAQ heading in various formats
    const faqRegex = /<h2[^>]*id="faq"[^>]*>[\s\S]*?<\/h2>[\s\S]*?(?=<h2|<section\s+class="cta-section"|<\/article>)/i;
    const faqMatch = html.match(faqRegex);
    
    if (faqMatch) {
      html = html.replace(faqMatch[0], accordionSection);
      console.log(`  ✅ FAQ accordion: ${pairs.length} questions`);
      hadChanges = true;
    } else {
      // Try broader pattern
      const broadFaq = /<h2[^>]*>[^<]*Frequently[^<]*Asked[^<]*Questions[^<]*<\/h2>[\s\S]*?(?=<h2|<section\s+class="cta-section"|<\/article>)/i;
      const broadMatch = html.match(broadFaq);
      if (broadMatch) {
        html = html.replace(broadMatch[0], accordionSection);
        console.log(`  ✅ FAQ accordion: ${pairs.length} questions`);
        hadChanges = true;
      } else {
        // Try with FAQ abbreviation
        const simpleFaq = /<h2[^>]*id="faq"[^>]*>[\s\S]*?<\/h2>[\s\S]*?(?=<h2)/i;
        const simpleMatch = html.match(simpleFaq);
        if (simpleMatch) {
          html = html.replace(simpleMatch[0], accordionSection);
          console.log(`  ✅ FAQ accordion: ${pairs.length} questions`);
          hadChanges = true;
        } else {
          console.log(`  ⚠️  Could not find FAQ section to replace`);
        }
      }
    }
    
    // Add FAQ schema before </head>
    html = html.replace('</head>', `  ${schema}\n</head>`);
    
  } else {
    console.log(`  ⚠️  No FAQ data for ${basename}`);
  }
  
  // ====================
  // FEATURE 2: RELATED GUIDES CAROUSEL
  // ====================
  
  const relatedHTML = buildRelatedGuidesHTML(basename);
  if (relatedHTML) {
    const newsletterRegex = /(\s*<section\s+class="newsletter-bar")/;
    if (newsletterRegex.test(html)) {
      html = html.replace(newsletterRegex, relatedHTML + '\n\n  $1');
      console.log(`  ✅ Related guides carousel`);
      hadChanges = true;
    } else {
      console.log(`  ⚠️  No newsletter-bar found`);
    }
  }
  
  // ====================
  // FEATURES 3 & 4: BADGES + PRODUCT IMAGES
  // ====================
  
  let tableCount = 0;
  
  // Find all table blocks
  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  const tables = [];
  let tm;
  while ((tm = tableRegex.exec(html)) !== null) {
    tables.push({ table: tm[0], index: tm.index });
  }
  
  // Process in reverse to preserve indices
  for (let i = tables.length - 1; i >= 0; i--) {
    let { table } = tables[i];
    
    if (table.includes('best-for-badge')) continue;
    
    // Check if it's a product/comparison table
    const hasProduct = /amazon\.com\/dp\//i.test(table) || /amzn\.to/i.test(table);
    const hasPricing = /\$\d+/i.test(table);
    
    if (!hasProduct && !hasPricing) continue;
    
    tableCount++;
    let newTable = table;
    
    // Add Best For column if not present
    if (!/Best\s+For/i.test(newTable)) {
      // Add column header
      newTable = newTable.replace(/(<\/tr>\s*<\/thead>)/i, '<th style="padding:var(--space-sm);text-align:left;border-bottom:2px solid var(--color-border);">Best For</th>\n$1');
      
      // Add badge to each data row
      newTable = newTable.replace(/(<tr[^>]*>[\s\S]*?)(<\/tr>)/gi, (rowMatch, rowStart, rowEnd) => {
        if (/<th>/i.test(rowStart) || /<th\s/i.test(rowStart)) return rowMatch;
        const productMatch = rowStart.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
        let name = '';
        if (productMatch) name = stripTags(productMatch[1]);
        if (!name) {
          const tdMatch = rowStart.match(/<td[^>]*>([\s\S]*?)<\/td>/);
          if (tdMatch) name = stripTags(tdMatch[1]);
        }
        const badgeClass = findBadge(name);
        const label = BADGE_LABELS[badgeClass] || 'Best Value';
        return rowStart + `<td style="padding:var(--space-sm);border-bottom:1px solid var(--color-border);text-align:center;"><span class="badge ${badgeClass} best-for-badge">${label}</span></td>\n` + rowEnd;
      });
    } else {
      // Add badge in existing Best For column
      newTable = newTable.replace(/(<tr[^>]*>[\s\S]*?)(<\/tr>)/gi, (rowMatch, rowStart, rowEnd) => {
        if (/<th>/i.test(rowStart) || /<th\s/i.test(rowStart)) return rowMatch;
        const productMatch = rowStart.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
        let name = productMatch ? stripTags(productMatch[1]) : '';
        if (!name) {
          const tdMatch = rowStart.match(/<td[^>]*>([\s\S]*?)<\/td>/);
          if (tdMatch) name = stripTags(tdMatch[1]);
        }
        const badgeClass = findBadge(name);
        const label = BADGE_LABELS[badgeClass] || 'Best Value';
        // Find last td and prepend badge
        const lastTdIdx = rowStart.lastIndexOf('<td');
        if (lastTdIdx >= 0) {
          const beforeLastTd = rowStart.slice(0, lastTdIdx);
          const lastTd = rowStart.slice(lastTdIdx);
          return beforeLastTd + lastTd.replace(/(<td[^>]*>)/, '$1<span class="badge ' + badgeClass + ' best-for-badge">' + label + '</span> ') + '\n' + rowEnd;
        }
        return rowMatch;
      });
    }
    
    // Add product thumbnails
    newTable = newTable.replace(/(<a[^>]*href=["']https:\/\/(?:www\.)?amazon\.com\/dp\/[^"']*["'][^>]*>)/gi, (linkOpen) => {
      // Find the link text after the link open
      const linkCloseMatch = newTable.slice(newTable.indexOf(linkOpen) + linkOpen.length).match(/<\/a>/i);
      return linkOpen; // We'll handle this differently
    });
    
    // Simpler approach: find any Amazon link in a table cell and prepend an image
    newTable = newTable.replace(/(<td[^>]*>)(\s*)(<a[^>]*href=["']https:\/\/(?:www\.)?amazon\.com\/dp\/[^"']*["'][^>]*>)([\s\S]*?)(<\/a>)/gi,
      (match, tdOpen, space, linkOpen, linkText, linkClose) => {
        const name = stripTags(linkText).trim();
        const imgURL = getUnsplashURL(name);
        return tdOpen + space + `<img src="${imgURL}" alt="${escapeAttr(name)}" class="product-thumb" loading="lazy"> ` + linkOpen + linkText + linkClose;
      }
    );
    
    // Handle amzn.to links too
    newTable = newTable.replace(/(<td[^>]*>)(\s*)(<a[^>]*href=["']https:\/\/(?:www\.)?amzn\.to\/[^"']*["'][^>]*>)([\s\S]*?)(<\/a>)/gi,
      (match, tdOpen, space, linkOpen, linkText, linkClose) => {
        const name = stripTags(linkText).trim();
        const imgURL = getUnsplashURL(name);
        return tdOpen + space + `<img src="${imgURL}" alt="${escapeAttr(name)}" class="product-thumb" loading="lazy"> ` + linkOpen + linkText + linkClose;
      }
    );
    
    // Handle links inside td without preceding text
    newTable = newTable.replace(/(<a[^>]*href=["']https:\/\/(?:www\.)?amazon\.com\/dp\/[^"']*["'][^>]*>)([^<]*?)(<\/a>)/gi,
      (match, linkOpen, linkText, linkClose) => {
        const name = stripTags(linkText).trim();
        if (!name) return match;
        const imgURL = getUnsplashURL(name);
        return `<img src="${imgURL}" alt="${escapeAttr(name)}" class="product-thumb" loading="lazy"> ` + linkOpen + linkText + linkClose;
      }
    );
    
    newTable = newTable.replace(/(<a[^>]*href=["']https:\/\/(?:www\.)?amzn\.to\/[^"']*["'][^>]*>)([^<]*?)(<\/a>)/gi,
      (match, linkOpen, linkText, linkClose) => {
        const name = stripTags(linkText).trim();
        if (!name) return match;
        const imgURL = getUnsplashURL(name);
        return `<img src="${imgURL}" alt="${escapeAttr(name)}" class="product-thumb" loading="lazy"> ` + linkOpen + linkText + linkClose;
      }
    );
    
    html = html.replace(table, newTable);
  }
  
  if (tableCount > 0) {
    console.log(`  ✅ Badges/images on ${tableCount} table(s)`);
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
    .badge--best { background: #dbeafe; color: #1e40af; }
    .badge--value { background: #dcfce7; color: #166534; }
    .badge--budget { background: #fed7aa; color: #9a3412; }
    .badge--premium { background: #fef3c7; color: #92400e; }
    .badge--ergonomic { background: #e9d5ff; color: #6b21a8; }
    
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
  
  // ====================
  // ADD FAQ SCRIPT
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
  
  // Clean up multiple blank lines
  html = html.replace(/\n{4,}/g, '\n\n\n');
  
  if (html !== origHtml) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  ✅ ${basename} complete`);
    return true;
  } else {
    console.log(`  ⚠️  No changes`);
    return false;
  }
}

// ==============================
// IMAGE URLS
// ==============================
function getUnsplashURL(productName) {
  const lower = productName.toLowerCase();
  if (/chair|aeron|gesture|embody|sayl|soji|leap|seating|sihoo|ticova|hbada|branch/.test(lower))
    return 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop';
  if (/desk|flexispot|uplift|jarvis|shw|standing|trotten|coleshome|bush/.test(lower))
    return 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=80&h=80&fit=crop';
  if (/monitor|screen|display|ergear/.test(lower))
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&h=80&fit=crop';
  if (/mouse|mx master|kensington.*orbit|logitech.*575|orbit|trackball/.test(lower))
    return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=80&h=80&fit=crop';
  if (/keyboard|kinesis|freestyle/.test(lower))
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop';
  if (/lamp|light|govee|taotronics|brightech|led/.test(lower))
    return 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6f6?w=80&h=80&fit=crop';
  if (/cable|tray|raceway|velcro|signum/.test(lower))
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop';
  if (/mat|cloudpeak|ergodriven|topo|anti-fatigue/.test(lower))
    return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=80&h=80&fit=crop';
  if (/footrest|solemate/.test(lower))
    return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=80&h=80&fit=crop';
  if (/pegboard|skadis|storage|organizer|soulwit|devais|uxcell|mr ironstone|wall.*control|furinno|hobst/.test(lower))
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop';
  if (/wrist|glorious/.test(lower))
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop';
  if (/headphone|headset/.test(lower))
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop';
  if (/anker|power.*strip/.test(lower))
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop';
  return 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=80&h=80&fit=crop';
}

// ==============================
// MAIN
// ==============================
const files = fs.readdirSync(GUIDES_DIR)
  .filter(f => f.endsWith('.html'))
  .sort()
  .map(f => path.join(GUIDES_DIR, f));

console.log(`\nRestoring guides from git for clean state...`);
try {
  require('child_process').execSync('cd ' + GUIDES_DIR + ' && git checkout -- *.html 2>&1 || true').toString();
} catch(e) {}

console.log(`\nEnhancing ${files.length} guide files...\n`);

let success = 0, fail = 0;
for (const file of files) {
  const basename = path.basename(file);
  console.log(`\n📄 ${basename}`);
  try {
    if (enhanceGuide(file)) success++; else fail++;
  } catch (err) {
    console.error(`  ❌ ${err.message}`);
    fail++;
  }
}

console.log(`\n🎯 Done! ${success} enhanced, ${fail} failed\n`);
