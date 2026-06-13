// Generate Wax | Wane Copy — Clinical Glow / Quiet Luxury voice.
//
// Deterministic copy generator. No external API call required, so the workflow
// is reliably runnable. Voice rules and constraints are encoded explicitly:
//
//   - Tone: clinical-lab precision, restrained luxury, sensorial-but-measured.
//   - No exclamation marks, no emojis, no hype words, no slang, no all-caps shouting.
//   - Title style: noun-led phrasing; descriptor before format; size last.
//   - Bullets: capitalized noun-phrase head, period at end, ≤ ~250 chars.
//   - Brand suffix " | Wax | Wane" is appended ONLY to titles whose
//     `brandLine` (or category) matches HARAMOON skincare.
//
// Character ceilings here mirror Amazon and Walmart bulk-template hard limits.

const LIMITS = {
  amazon:  { title: 200, bullet: 500, description: 2000, keywords: 250 },
  walmart: { name: 199,  short: 1000, long: 4000, feature: 500 },
};

const HYPE = [
  'amazing','best ever','must-have','life-changing','revolutionary','game-changer',
  'world-class','incredible','unbelievable','jaw-dropping','perfect','flawless',
  'cheap','bargain','deal','sale','% off','guaranteed',
];
const EMOJI_RE = /[\p{Extended_Pictographic}\u200d]/gu;

function dehype(s) {
  if (!s) return '';
  let out = String(s).replace(EMOJI_RE, '').replace(/!+/g, '.').replace(/\s+/g, ' ').trim();
  for (const h of HYPE) {
    const re = new RegExp(`\\b${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    out = out.replace(re, '');
  }
  return out.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
}

function clip(s, max) {
  s = dehype(s);
  if (!s) return '';
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastBreak = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(', '), cut.lastIndexOf(' '));
  return (lastBreak > max * 0.6 ? cut.slice(0, lastBreak) : cut).replace(/[\s,;:.\-]+$/g, '').trim();
}

function titleCase(s) {
  const small = new Set(['a','an','and','as','at','but','by','for','in','of','on','or','the','to','vs','with']);
  return String(s || '').split(/\s+/).map((w, i) => {
    const lw = w.toLowerCase();
    if (i > 0 && small.has(lw)) return lw;
    return lw.charAt(0).toUpperCase() + lw.slice(1);
  }).join(' ');
}

function isHaramoon(p) {
  const blob = `${p.brandLine || ''} ${p.brand || ''} ${p.category || ''}`.toLowerCase();
  return /haramoon/.test(blob);
}

function brandSuffixFor(p) {
  if (!isHaramoon(p)) return '';
  return ' | Wax | Wane';
}

function buildTitle(p, hardCap) {
  const head = titleCase(p.productName || 'Untitled Product');
  const descriptor = p.specs && p.specs.descriptor ? titleCase(p.specs.descriptor) : '';
  const formatBits = [];
  if (descriptor) formatBits.push(descriptor);
  if (p.colorLabel) formatBits.push(titleCase(p.colorLabel));
  if (p.sizeLabel) formatBits.push(p.sizeLabel);

  let title = [head, ...formatBits].filter(Boolean).join(' — ');
  title = dehype(title);

  const suffix = brandSuffixFor(p);
  if (suffix) {
    if (title.length + suffix.length > hardCap) {
      title = clip(title, hardCap - suffix.length);
    }
    title = title + suffix;
  } else {
    title = clip(title, hardCap);
  }
  return title;
}

function defaultFeatures(p) {
  const ing = (p.ingredients || []).slice(0, 3).join(', ');
  const aud = (p.targetAudience && p.targetAudience.length) ? p.targetAudience[0] : 'considered routines';
  return [
    p.specs && p.specs.benefitOne ? p.specs.benefitOne : 'Calibrated formulation; restrained, measured performance with no excess.',
    ing ? `Anchored in ${ing}.` : 'Composition selected for clarity, not noise.',
    `Built for ${aud}.`,
    'Considered packaging; minimal, recyclable substrate where format permits.',
    'Quality-controlled in small lots; each unit batch-verified before release.',
  ];
}

function buildBullets(p, hardCap) {
  let raw = (p.features && p.features.length ? p.features : defaultFeatures(p)).slice(0, 5);
  while (raw.length < 5) raw = raw.concat(defaultFeatures(p)).slice(0, 5);
  return raw.map(b => {
    let s = dehype(b);
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!/[.?]$/.test(s)) s += '.';
    return clip(s, Math.min(hardCap, 250));
  });
}

function buildShortDescription(p, hardCap) {
  if (p.shortSummary) return clip(p.shortSummary, hardCap);
  const aud = p.targetAudience && p.targetAudience[0] ? p.targetAudience[0] : 'considered routines';
  const ing = (p.ingredients || []).slice(0, 3).join(', ');
  const s = `${titleCase(p.productName)} — a measured, polished addition to ${aud}.${
    ing ? ` Composition: ${ing}.` : ''
  } Performance is restrained, never theatrical.`;
  return clip(s, hardCap);
}

function buildLongDescription(p, hardCap) {
  if (p.longDescription) return clip(p.longDescription, hardCap);
  const ing = (p.ingredients || []).join(', ');
  const aud = (p.targetAudience || []).join(', ');
  const paras = [
    `${titleCase(p.productName)} is built around clarity. Formulation, finish, and feel are tuned for measured performance — the quiet kind of luxury that does not announce itself.`,
    ing ? `Composition: ${ing}.` : '',
    aud ? `Designed for: ${aud}.` : '',
    'Each unit is small-lot, batch-verified, and shipped in considered packaging. Use as part of a deliberate routine; pair with complementary steps from the same line for cohesive results.',
  ].filter(Boolean);
  return clip(paras.join('\n\n'), hardCap);
}

function buildKeywords(p, hardCap) {
  const base = new Set((p.keywords || []).map(s => s.toLowerCase()));
  for (const w of (p.targetAudience || [])) base.add(String(w).toLowerCase());
  for (const w of (p.ingredients || [])) base.add(String(w).toLowerCase());
  if (isHaramoon(p)) { base.add('haramoon'); base.add('skincare'); }
  return clip(Array.from(base).join(' '), hardCap);
}

const out = [];
for (const item of items) {
  const p = item.json;

  const amazonTitle = buildTitle(p, LIMITS.amazon.title);
  const walmartName = buildTitle(p, LIMITS.walmart.name);
  const bullets    = buildBullets(p, LIMITS.amazon.bullet);
  const shortDesc  = buildShortDescription(p, LIMITS.walmart.short);
  const longDesc   = buildLongDescription(p, Math.max(LIMITS.amazon.description, LIMITS.walmart.long));
  const keywords   = buildKeywords(p, LIMITS.amazon.keywords);

  out.push({
    json: {
      ...p,
      copy: {
        amazonTitle,
        walmartName,
        bullets,
        shortDescription: shortDesc,
        longDescription: clip(longDesc, LIMITS.walmart.long),
        amazonDescription: clip(longDesc, LIMITS.amazon.description),
        keywords,
        brandSuffixApplied: Boolean(brandSuffixFor(p)),
        isHaramoonLine: isHaramoon(p),
      },
      voice: {
        style: 'Clinical Glow / Quiet Luxury',
        rules: {
          noExclamations: true,
          noEmojis: true,
          noHype: true,
          brandSuffix: 'Appended only to HARAMOON skincare-line titles',
        },
        limits: LIMITS,
      },
    },
  });
}
return out;
