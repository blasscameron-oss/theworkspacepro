// Contrast checker for the redesign's new color pairs (WCAG 2.x).
function srgb(c){c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);}
function lum(hex){const h=hex.replace('#','');const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return 0.2126*srgb(r)+0.7152*srgb(g)+0.0722*srgb(b);}
// Composite an rgba over an opaque base to get an effective opaque hex.
function over(fg,a,bg){const f=fg.replace('#',''),b=bg.replace('#','');const mix=i=>Math.round(parseInt(f.substr(i*2,2),16)*a+parseInt(b.substr(i*2,2),16)*(1-a));const to=n=>n.toString(16).padStart(2,'0');return '#'+to(mix(0))+to(mix(1))+to(mix(2));}
function ratio(a,b){const L1=lum(a),L2=lum(b);const hi=Math.max(L1,L2),lo=Math.min(L1,L2);return (hi+0.05)/(lo+0.05);}

// LIGHT surfaces
const L={paper:'#f5f2eb',white:'#fffefa',ink:'#1d2824',muted:'#5b6862',accent:'#28614f',accentDark:'#0d4934',terra:'#b84d2a',line:'#cfd5cf'};
// DARK surfaces (editorial dark remap)
const D={paper:'#141714',white:'#1e231f',ink:'#f4efe7',muted:'#c3c0b8',accent:'#86c4aa',accentDark:'#9ad0b7',brand:'#ed835d',instr:'#80bea5',btnBg:'#2a6553',hover:'#262c27',input:'#12160f'};

const tests=[
 ['LIGHT body text ink / paper', L.ink, L.paper, 4.5],
 ['LIGHT body text ink / white card', L.ink, L.white, 4.5],
 ['LIGHT muted / white card', L.muted, L.white, 4.5],
 ['LIGHT muted / paper', L.muted, L.paper, 4.5],
 ['LIGHT eyebrow accent(spruce) / paper', L.accent, L.paper, 4.5],
 ['LIGHT eyebrow accent(spruce) / white', L.accent, L.white, 4.5],
 ['LIGHT link accent-dark / white', L.accentDark, L.white, 4.5],
 ['LIGHT stat label spruce / white', L.accent, L.white, 4.5],
 ['LIGHT terracotta label / paper-alt', L.terra, '#ebe8df', 3.0],
 ['LIGHT plate numeral (ink 50%) / white card', over('#171a17',0.5,L.white), L.white, 3.0],
 ['DARK plate numeral (text 50%) / white card', over('#f4efe7',0.5,D.white), D.white, 3.0],
 ['LIGHT white text / CTA spruce btn', '#ffffff', L.accent, 4.5],
 ['DARK body text ink / paper', D.ink, D.paper, 4.5],
 ['DARK body text ink / white card', D.ink, D.white, 4.5],
 ['DARK muted / white card', D.muted, D.white, 4.5],
 ['DARK muted / paper', D.muted, D.paper, 4.5],
 ['DARK eyebrow accent / paper', D.accent, D.paper, 4.5],
 ['DARK eyebrow accent / white card', D.accent, D.white, 4.5],
 ['DARK link accent-dark / paper', D.accentDark, D.paper, 4.5],
 ['DARK link accent-dark / white card', D.accentDark, D.white, 4.5],
 ['DARK white text / CTA spruce btn', '#ffffff', D.btnBg, 4.5],
 ['DARK terracotta brand label / instrument ground', D.brand, '#1a1f1b', 3.0],
 ['DARK rail instrument stroke / instrument ground', D.instr, '#1a1f1b', 3.0],
 ['DARK stat number ink / white card', D.ink, D.white, 4.5],
 ['DARK footer link #bac6c0 / ink bg', '#bac6c0', L.ink, 4.5],
 ['DARK footer legal muted / ink bg', over('#f4efe7',0.60,L.ink), L.ink, 4.5],
];
let fail=0;
for(const [name,fg,bg,min] of tests){
  const r=ratio(fg,bg);
  const ok=r>=min;
  if(!ok)fail++;
  console.log(`${ok?'PASS':'FAIL'}  ${r.toFixed(2)}:1  (min ${min})  ${name}`);
}
console.log(`\n${fail===0?'ALL PASS':fail+' FAILURES'}`);
process.exit(fail?1:0);
