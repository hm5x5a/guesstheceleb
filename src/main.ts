const $ = (s: string): any => document.querySelector(s);
const $$ = (s: string): any[] => [...document.querySelectorAll(s)];

const ls = {
  get(k: string, d: any) {
    try {
      return JSON.parse(localStorage.getItem(k) || '') ?? d;
    } catch {
      return d;
    }
  },
  set(k: string, v: any) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

/* Celebrity Data Types matching celebs.json specification */
export interface CelebEntry {
  name: string;
  wiki: string;
  aliases?: string[];
  modes: string[];
  crop?: Record<string, [number, number, number, number] | [number, number, number]>;
  image?: string;
}

// Starter fallback list if celebs.json cannot be fetched (e.g. offline)
const DEFAULT_CELEBS: CelebEntry[] = [
  {
    name: 'Lionel Messi',
    wiki: 'Lionel_Messi',
    aliases: ['Messi', 'Leo Messi'],
    modes: ['hair', 'beard', 'nose', 'eyes'],
    crop: {
      hair: [0.22, 0.04, 0.56, 0.14],
      eyes: [0.24, 0.17, 0.52, 0.08],
      nose: [0.35, 0.23, 0.30, 0.09],
      beard: [0.24, 0.29, 0.52, 0.15],
    },
    image: '/puzzles/lionel_messi.webp',
  },
  {
    name: 'Kanye West',
    wiki: 'Kanye_West',
    aliases: ['Ye', 'Kanye'],
    modes: ['hair', 'beard', 'nose', 'eyes'],
    crop: {
      hair: [0.20, 0.03, 0.60, 0.15],
      eyes: [0.22, 0.18, 0.56, 0.08],
      nose: [0.33, 0.24, 0.34, 0.09],
      beard: [0.22, 0.31, 0.56, 0.16],
    },
    image: '/puzzles/kanye_west.webp',
  },
  {
    name: 'Billie Eilish',
    wiki: 'Billie_Eilish',
    aliases: ['Billie'],
    modes: ['hair', 'nose', 'eyes'],
    crop: {
      hair: [0.12, 0.04, 0.76, 0.20],
      eyes: [0.20, 0.24, 0.60, 0.09],
      nose: [0.34, 0.31, 0.32, 0.10],
    },
    image: '/puzzles/billie_eilish.webp',
  },
  {
    name: 'Drake',
    wiki: 'Drake_(musician)',
    aliases: ['Aubrey Graham', 'Champagne Papi'],
    modes: ['hair', 'beard', 'nose', 'eyes'],
    crop: {
      hair: [0.20, 0.04, 0.60, 0.14],
      eyes: [0.22, 0.18, 0.56, 0.08],
      nose: [0.34, 0.24, 0.32, 0.09],
      beard: [0.22, 0.31, 0.56, 0.16],
    },
    image: '/puzzles/drake_musician.webp',
  },
  {
    name: 'Snoop Dogg',
    wiki: 'Snoop_Dogg',
    aliases: ['Snoop', 'Calvin Broadus'],
    modes: ['hair', 'beard', 'eyes', 'nose'],
    crop: {
      hair: [0.15, 0.02, 0.70, 0.20],
      eyes: [0.20, 0.22, 0.60, 0.09],
      nose: [0.34, 0.29, 0.32, 0.10],
      beard: [0.28, 0.38, 0.44, 0.16],
    },
    image: '/puzzles/snoop_dogg.webp',
  },
];


let CELEBS: CelebEntry[] = DEFAULT_CELEBS;

/* In-memory Wikipedia image cache */
const imageCache = new Map<string, HTMLImageElement | HTMLCanvasElement>();

/**
 * Procedural face generator fallback if network image is loading or unavailable
 */
function makeFallbackFace(name: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 800;
  const g = c.getContext('2d')!;
  g.scale(2, 2);

  // Derive stable colors from name hash
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const bgCol = ['#9fd3ff', '#ffb3c7', '#c8f0b4', '#ffe08a', '#d4c2ff', '#ffd0d0'][
    Math.abs(h) % 6
  ];
  const hairCol = ['#1a1a1a', '#3a2a1c', '#b5651d', '#120d0a', '#6b3e1f', '#22c55e'][
    Math.abs(h >> 3) % 6
  ];

  g.fillStyle = bgCol;
  g.fillRect(0, 0, 400, 400);

  // Body & Face
  g.fillStyle = '#2d3cff';
  g.beginPath();
  g.ellipse(200, 440, 160, 100, 0, 0, 7);
  g.fill();

  g.fillStyle = '#d8a07a';
  g.beginPath();
  g.ellipse(200, 215, 95, 120, 0, 0, 7);
  g.fill();

  // Hair
  g.fillStyle = hairCol;
  g.beginPath();
  g.ellipse(200, 150, 103, 96, 0, Math.PI, 2 * Math.PI);
  g.fill();

  // Eyes & Features
  g.fillStyle = '#fff';
  g.beginPath();
  g.ellipse(160, 195, 12, 14, 0, 0, 7);
  g.ellipse(240, 195, 12, 14, 0, 0, 7);
  g.fill();

  g.fillStyle = '#111';
  g.beginPath();
  g.ellipse(160, 197, 6, 7, 0, 0, 7);
  g.ellipse(240, 197, 6, 7, 0, 0, 7);
  g.fill();

  // Nose
  g.strokeStyle = 'rgba(0,0,0,.4)';
  g.lineWidth = 5;
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(200, 205);
  g.lineTo(193, 246);
  g.lineTo(207, 246);
  g.stroke();

  // Mouth
  g.strokeStyle = '#7a2d2d';
  g.lineWidth = 5;
  g.beginPath();
  g.arc(200, 270, 18, 0.15 * Math.PI, 0.85 * Math.PI);
  g.stroke();

  return c;
}

/**
 * Fast local WebP loader with fallback and retry
 */
let isImageLoading = false;

const pre = (src: string) => {
  const i = new Image();
  i.src = src;
  return i.decode().catch(() => {});
};

async function loadCelebImage(celeb: CelebEntry, retry = true): Promise<CanvasImageSource> {
  if (imageCache.has(celeb.wiki)) {
    return imageCache.get(celeb.wiki)!;
  }

  isImageLoading = true;
  drawDaily();

  // 1. Try local compressed WebP puzzle asset
  const targetSrc = celeb.image || `/puzzles/${celeb.wiki.toLowerCase().replace(/[^a-z0-9_]/g, '')}.webp`;
  
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = targetSrc;

  try {
    await img.decode();
    imageCache.set(celeb.wiki, img);
    isImageLoading = false;
    drawDaily();
    return img;
  } catch {
    // If local image fails, retry once from Wikipedia REST API as fallback
    if (retry) {
      try {
        const slug = encodeURIComponent(celeb.wiki);
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
        if (res.ok) {
          const data = await res.json();
          const remoteUrl = data.originalimage?.source || data.thumbnail?.source;
          if (remoteUrl) {
            const fallbackImg = new Image();
            fallbackImg.crossOrigin = 'anonymous';
            fallbackImg.src = remoteUrl;
            await fallbackImg.decode();
            imageCache.set(celeb.wiki, fallbackImg);
            isImageLoading = false;
            drawDaily();
            return fallbackImg;
          }
        }
      } catch (e) {
        console.warn('Fallback wiki image failed:', e);
      }
    }

    // Final fallback: procedural avatar
    const fallback = makeFallbackFace(celeb.name);
    imageCache.set(celeb.wiki, fallback);
    isImageLoading = false;
    drawDaily();
    return fallback;
  }
}

/**
 * Preload tomorrow's daily puzzle so it opens instantaneously
 */
function preloadTomorrow() {
  try {
    const tomorrowDay = day + 1;
    ['daily', 'hair', 'beard', 'eyes', 'nose'].forEach((m) => {
      const pool = getPoolForMode(m);
      if (pool.length === 0) return;
      const modeSeeds: Record<string, number> = {
        daily: 584777,
        mix: 584777,
        hair: 104729,
        beard: 224737,
        nose: 344749,
        eyes: 464761,
      };
      const baseSeed = modeSeeds[m] || 777777;
      const cycle = Math.floor(tomorrowDay / pool.length);
      const indexInCycle = tomorrowDay % pool.length;
      const cycleSeed = baseSeed + cycle * 99991;
      const shuffled = shuffleWithSeed(pool, cycleSeed);
      const nextCeleb = shuffled[indexInCycle];
      if (nextCeleb && nextCeleb.image) {
        pre(nextCeleb.image);
      }
    });
  } catch {}
}

/**
 * Seeded PRNG (Mulberry32) for deterministic daily shuffles per mode
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(array: T[], seedNum: number): T[] {
  const copy = [...array];
  const rng = mulberry32(seedNum);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* Alias checking helper */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const accepts = (v: string, celeb: CelebEntry) => {
  const candidates = [celeb.name, ...(celeb.aliases || [])];
  return candidates.some((a) => norm(a) === norm(v));
};

/* Game Constants & Modes */
type RouteTuple = [string, string, string];
const R = (n: string, t: string, d: string): RouteTuple => [n, t, d];

const ROUTES: Record<string, RouteTuple> = {
  daily: R('Daily', 'Guess the celebrity: daily mix', 'One celebrity, a new clue each guess: hair, eyes, nose, beard, then the full face.'),
  hair: R('Hair', 'Guess the celebrity by hair', 'Name the celebrity from a cropped hairline. A new daily puzzle, five tries.'),
  beard: R('Beard', 'Guess the celebrity by beard', 'Name the celebrity from a cropped beard. A new daily puzzle, five tries.'),
  nose: R('Nose', 'Guess the celebrity by nose', 'Name the celebrity from a cropped nose. A new daily puzzle, five tries.'),
  eyes: R('Eyes', 'Guess the celebrity by eyes', 'Name the celebrity from cropped eyes. A new daily puzzle, five tries.'),
  unlimited: R('Unlimited', 'Unlimited celebrity guessing', 'Random crop puzzles with no daily limit. Play as many as you like.'),
  make: R('Custom', 'Make a Custom Guess the celebrity', 'Add photos, crop them and play them one by one. Hold to reveal.'),
};

const MODE_DEFAULTS: Record<string, [number, number, number, number]> = {
  hair: [0.15, 0.0, 0.70, 0.28],
  beard: [0.20, 0.52, 0.60, 0.38],
  nose: [0.30, 0.38, 0.40, 0.24],
  eyes: [0.15, 0.30, 0.70, 0.20],
  mix: [0.0, 0.0, 1.0, 1.0],
  daily: [0.0, 0.0, 1.0, 1.0],
};

const MAX = 5;
const MIXO = ['hair', 'eyes', 'nose', 'beard'];

const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
let rt = 'daily';
let mode = 'Daily';
let U: any = null;

const isU = () => rt === 'unlimited';
const isDaily = () => rt === 'daily';
const feat = () => (isU() ? U.f : mode.toLowerCase());
const MK = (m: string) => 'gtc2_' + m;
const DK = (m: string) => 'gtc2d_' + m;

/**
 * Returns filtered pool for a specific mode
 */
function getPoolForMode(m: string): CelebEntry[] {
  const lower = m.toLowerCase();
  if (lower === 'unlimited' || lower === 'mix' || lower === 'daily') return CELEBS;
  const filtered = CELEBS.filter((c) => c.modes && c.modes.includes(lower));
  return filtered.length > 0 ? filtered : CELEBS;
}

/**
 * Cycle-based Seeded Daily Picker per mode:
 * 1. Shuffles the whole pool with a seed specific to the current cycle.
 * 2. Every celebrity is picked exactly once before repeating.
 * 3. When the pool completes, a new permutation is generated with no back-to-back duplicates.
 */
function getDailyCelebForMode(m: string): CelebEntry {
  const pool = getPoolForMode(m);
  if (!pool || pool.length === 0) return CELEBS[0];

  const modeSeeds: Record<string, number> = {
    daily: 584777,
    mix: 584777,
    hair: 104729,
    beard: 224737,
    nose: 344749,
    eyes: 464761,
  };
  const baseSeed = modeSeeds[m.toLowerCase()] || 777777;

  const cycle = Math.floor(day / pool.length);
  const indexInCycle = day % pool.length;
  const cycleSeed = baseSeed + cycle * 99991;

  const shuffled = shuffleWithSeed(pool, cycleSeed);
  return shuffled[indexInCycle];
}

const curCeleb = (): CelebEntry => {
  if (isU()) return U ? U.celeb : CELEBS[0];
  return getDailyCelebForMode(mode);
};

const cur = () =>
  isU()
    ? U
    : ((s: any) =>
        s.day === day ? s : { day, tries: [], done: false, won: false })(
        ls.get(DK(mode), {})
      );

const save = (s: any) => {
  if (!isU()) ls.set(DK(mode), s);
};

const newU = () => {
  const k = ['hair', 'beard', 'nose', 'eyes'];
  const chosenFeat = k[(Math.random() * 4) | 0];
  const pool = getPoolForMode(chosenFeat);
  const chosenCeleb = pool[(Math.random() * pool.length) | 0];

  U = {
    f: chosenFeat,
    celeb: chosenCeleb,
    tries: [],
    done: false,
    won: false,
  };
  loadCelebImage(chosenCeleb);
};

const stats = (m: string) =>
  ls.get(MK(m), null) || { played: 0, won: 0, dist: [0, 0, 0, 0, 0], streak: 0, max: 0, last: 0 };

/* Real Path & Mode mapping */
const PATH_MAP: Record<string, string> = {
  '/': 'daily',
  '/guess-the-celebrity-by-hair/': 'hair',
  '/guess-the-celebrity-by-beard/': 'beard',
  '/guess-the-celebrity-by-nose/': 'nose',
  '/guess-the-celebrity-by-eyes/': 'eyes',
  '/unlimited-guess-the-celebrity/': 'unlimited',
  '/custom-guess-the-celebrity/': 'make',
};

const URLS: Record<string, string> = {
  daily: '/',
  hair: '/guess-the-celebrity-by-hair/',
  beard: '/guess-the-celebrity-by-beard/',
  nose: '/guess-the-celebrity-by-nose/',
  eyes: '/guess-the-celebrity-by-eyes/',
  unlimited: '/unlimited-guess-the-celebrity/',
  make: '/custom-guess-the-celebrity/',
};

// Setup Nav Links as real anchors for SEO
const navEl = $('#nav');
if (navEl) {
  navEl.innerHTML = Object.entries(ROUTES)
    .map(([k, v]) => `<a class="tab" href="${URLS[k] || '/'}" data-r="${k}" aria-selected="false">${v[0]}</a>`)
    .join('');
}

function route() {
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  let detected = PATH_MAP[path];
  
  // Hash fallback for backwards compatibility or /#mix
  if (!detected && location.hash) {
    const hashKey = location.hash.replace(/^#\/?/, '');
    if (ROUTES[hashKey]) detected = hashKey;
  }

  rt = detected || 'hair';
  const o = ROUTES[rt];
  const mk = rt === 'make';

  $$('#nav .tab').forEach((t: HTMLElement) =>
    t.setAttribute('aria-selected', String(t.dataset.r === rt))
  );

  const dailyEl = $('#daily');
  const makeEl = $('#make');
  if (dailyEl) dailyEl.classList.toggle('on', !mk);
  if (makeEl) makeEl.classList.toggle('on', mk);

  if (!mk && dailyEl) {
    const h1El = $('#h1');
    const hpEl = $('#hp');
    if (h1El) h1El.textContent = o[1];
    if (hpEl) hpEl.textContent = o[2];
    if (isU()) {
      newU();
    } else {
      mode = o[0];
      loadCelebImage(curCeleb());
    }
    drawDaily();
  }
}

/**
 * Calculates the bounding box to sample from the source image.
 * Keeps the crop tight and isolated (no eyebrows for hair, no nose for beard, no forehead for eyes).
 * Only when isDone does it reveal the full photo.
 */
function getSourceRect(
  celeb: CelebEntry,
  feature: string,
  isDone: boolean,
  triesCount: number,
  srcW: number,
  srcH: number
): [number, number, number, number] {
  if (isDone) {
    return [0, 0, srcW, srcH];
  }

  const fLower = feature.toLowerCase();
  const rawCrop = celeb.crop?.[fLower] || MODE_DEFAULTS[fLower] || [0.2, 0.05, 0.6, 0.2];
  const [cx, cy, cw, ch = cw] = rawCrop;

  // Maximum 5% total subtle expansion to keep the game difficult and isolate the feature
  const expand = (Math.min(triesCount, 4) / 4) * 0.05;
  const curW = Math.min(1, cw * (1 + expand));
  const curH = Math.min(1, ch * (1 + expand));
  const curX = Math.max(0, Math.min(1 - curW, cx - (curW - cw) / 2));
  const curY = Math.max(0, Math.min(1 - curH, cy - (curH - ch) / 2));

  return [
    curX * srcW,
    curY * srcH,
    curW * srcW,
    curH * srcH,
  ];
}

function drawDaily() {
  const s = cur();
  const canvas = $('#dc');
  if (!canvas) return;
  const g = canvas.getContext('2d');
  const celeb = curCeleb();
  if (!celeb) return;

  const cachedDrawable = imageCache.get(celeb.wiki) || makeFallbackFace(celeb.name);
  const srcW = (cachedDrawable as any).width || 800;
  const srcH = (cachedDrawable as any).height || 800;

  const isDailyMix = (mode === 'Daily' || mode === 'Mix' || isDaily()) && !isU();

  const currentFeat =
    isDailyMix
      ? MIXO[Math.min(s.tries.length, 3)]
      : feat();

  const [sx, sy, sw, sh] = getSourceRect(celeb, currentFeat, s.done, s.tries.length, srcW, srcH);

  // Clear with clean dark background
  g.fillStyle = '#10131f';
  g.fillRect(0, 0, 720, 720);

  // If image is still decoding, draw a sleek skeleton placeholder
  if (isImageLoading) {
    g.fillStyle = '#181b30';
    g.fillRect(0, 0, 720, 720);

    // Subtle skeleton pulse box
    g.fillStyle = '#232845';
    g.beginPath();
    g.roundRect(160, 200, 400, 260, 16);
    g.fill();

    // Loading indicator text
    g.fillStyle = '#ffc933';
    g.font = '800 28px "Bricolage Grotesque", system-ui, sans-serif';
    g.textAlign = 'center';
    g.fillText('Loading puzzle...', 360, 340);

    g.fillStyle = '#9aa0ba';
    g.font = '500 18px "Bricolage Grotesque", system-ui, sans-serif';
    g.fillText('Preparing daily crop from CDN', 360, 380);
  } else {
    // Maintain exact aspect ratio without stretching, centered like Crop Run
    const scale = Math.min(720 / sw, 720 / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = (720 - dw) / 2;
    const dy = (720 - dh) / 2;

    g.imageSmoothingQuality = 'high';
    g.drawImage(cachedDrawable, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  // Render dots
  $('#dots').innerHTML = Array.from(
    { length: MAX },
    (_, k) =>
      `<i class="${
        k < s.tries.length ? (s.won && k === s.tries.length - 1 ? 'w' : 'x') : ''
      }"></i>`
  ).join('');

  const n = MAX - s.tries.length;
  $('#msg').textContent = isImageLoading
    ? 'Loading puzzle...'
    : s.done
    ? s.won
      ? `Yes, it is ${celeb.name}.`
      : `It was ${celeb.name}.`
    : s.tries.length
    ? `${n} ${n === 1 ? 'try' : 'tries'} left. ${
        isDailyMix
          ? 'New clue: ' + (s.tries.length > 3 ? 'full face' : MIXO[s.tries.length].toLowerCase()) + '.'
          : 'Zoomed out.'
      }`
    : isU()
    ? `This round: ${feat()}.`
    : isDailyMix
    ? 'First clue: hair.'
    : '';

  $('#share').hidden = !s.done;
  $('#again').hidden = !(s.done && isU());
  $('#giveup').hidden = s.done;
  $('#go').disabled = $('#g').disabled = s.done || isImageLoading;

  const a = ls.get('gtc2_all', null) || { last: 0, streak: 0 };
  const k = a.last >= day - 1 ? a.streak : 0;
  $('#streak').textContent = k + (k === 1 ? ' day' : ' days') + ' streak';
}

function finish(s: any, ok: boolean) {
  s.done = true;
  s.won = ok;
  if (!isU()) {
    const p = stats(mode);
    p.played++;
    if (ok) {
      p.won++;
      p.dist[s.tries.length - 1]++;
      p.streak = (p.last === day - 1 ? p.streak : 0) + 1;
      p.max = Math.max(p.max, p.streak);
      p.last = day;
    } else {
      p.streak = 0;
    }
    ls.set(MK(mode), p);

    const a = ls.get('gtc2_all', null) || { last: 0, streak: 0, max: 0 };
    if (a.last !== day) {
      a.streak = (a.last === day - 1 ? a.streak : 0) + 1;
      a.max = Math.max(a.max, a.streak);
      a.last = day;
      ls.set('gtc2_all', a);
    }

    // Preload tomorrow's daily puzzle when user finishes
    preloadTomorrow();
  }
  if (ok && setg().cf !== false) confetti();
}

function guess() {
  const s = cur();
  const v = $('#g').value.trim();
  if (!v || s.done) return;
  const celeb = curCeleb();
  const ok = accepts(v, celeb);
  s.tries.push(v);
  $('#g').value = '';
  if (ok || s.tries.length >= MAX) finish(s, ok);
  save(s);
  drawDaily();
}

$('#go').onclick = guess;
$('#g').onkeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') guess();
};

$('#giveup').onclick = () => {
  const s = cur();
  if (!s.done) {
    finish(s, false);
    save(s);
    drawDaily();
  }
};

$('#again').onclick = () => {
  newU();
  drawDaily();
};

async function generateShareCard(s: any, celeb: CelebEntry): Promise<Blob> {
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 960;
  const g = c.getContext('2d')!;

  // Background
  g.fillStyle = '#0d0f1c';
  g.fillRect(0, 0, 800, 960);

  // Outer border
  g.strokeStyle = '#f1f2fa';
  g.lineWidth = 6;
  g.strokeRect(16, 16, 768, 928);

  // Header banner
  g.fillStyle = '#2d3cff';
  g.fillRect(20, 20, 760, 90);
  g.strokeStyle = '#10131f';
  g.lineWidth = 4;
  g.strokeRect(20, 20, 760, 90);

  // Header Title
  g.fillStyle = '#ffffff';
  g.font = '800 36px "Bricolage Grotesque", system-ui, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText('GuessTheCeleb', 44, 65);

  // Mode badge
  g.fillStyle = '#ffc933';
  g.fillRect(520, 42, 230, 46);
  g.fillStyle = '#10131f';
  g.font = '800 22px "Bricolage Grotesque", system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText(feat().toUpperCase() + (isU() ? '' : ` #${day - 20000}`), 635, 65);

  // Photo frame
  const cached = imageCache.get(celeb.wiki) || makeFallbackFace(celeb.name);
  const pw = 700;
  const ph = 500;
  const px = 50;
  const py = 135;

  g.fillStyle = '#181b30';
  g.fillRect(px, py, pw, ph);
  g.strokeStyle = '#f1f2fa';
  g.lineWidth = 4;
  g.strokeRect(px, py, pw, ph);

  // Draw image centered in photo frame
  const srcW = (cached as any).width || 800;
  const srcH = (cached as any).height || 800;
  const scale = Math.min(pw / srcW, ph / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  g.imageSmoothingQuality = 'high';
  g.drawImage(cached, 0, 0, srcW, srcH, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);

  // Result info box
  g.fillStyle = '#181b30';
  g.fillRect(50, 660, 700, 215);
  g.strokeStyle = '#f1f2fa';
  g.lineWidth = 4;
  g.strokeRect(50, 660, 700, 215);

  // Celebrity Name
  g.fillStyle = s.won ? '#2ec98a' : '#ff5d5d';
  g.font = '800 38px "Bricolage Grotesque", system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText(celeb.name.toUpperCase(), 400, 705);

  // Subtitle
  g.fillStyle = '#f1f2fa';
  g.font = '600 24px "Bricolage Grotesque", system-ui, sans-serif';
  const subtitle = s.won
    ? `Solved in ${s.tries.length}/${MAX} attempts! 🎯`
    : `Revealed after ${MAX} attempts`;
  g.fillText(subtitle, 400, 750);

  // Tries blocks
  const blockW = 60;
  const blockH = 18;
  const gap = 12;
  const totalBW = MAX * blockW + (MAX - 1) * gap;
  const startBX = (800 - totalBW) / 2;

  for (let k = 0; k < MAX; k++) {
    const bx = startBX + k * (blockW + gap);
    const by = 780;
    if (k < s.tries.length) {
      g.fillStyle = s.won && k === s.tries.length - 1 ? '#2ec98a' : '#ff5d5d';
    } else {
      g.fillStyle = '#2b304d';
    }
    g.fillRect(bx, by, blockW, blockH);
    g.strokeStyle = '#10131f';
    g.lineWidth = 2;
    g.strokeRect(bx, by, blockW, blockH);
  }

  // Footer URL
  g.fillStyle = '#9aa0ba';
  g.font = '600 20px "Bricolage Grotesque", system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText('Play at guesstheceleb.org', 400, 845);

  return new Promise((resolve) => {
    c.toBlob((b) => resolve(b!), 'image/png');
  });
}

$('#share').onclick = async () => {
  const s = cur();
  const celeb = curCeleb();
  $('#share').textContent = 'Generating...';

  try {
    const blob = await generateShareCard(s, celeb);

    // 1. Mobile Web Share API
    if (
      navigator.canShare &&
      navigator.canShare({ files: [new File([blob], 'result.png', { type: 'image/png' })] })
    ) {
      const file = new File(
        [blob],
        `GuessTheCeleb-${celeb.name.replace(/\s+/g, '-')}-result.png`,
        { type: 'image/png' }
      );
      await navigator.share({
        title: 'Guess The Celeb Result',
        files: [file],
      });
      $('#share').textContent = 'Shared! 🖼️';
      setTimeout(() => ($('#share').textContent = 'Share Image Card'), 2000);
      return;
    }

    // 2. Direct clipboard image copy
    if (navigator.clipboard && typeof (window as any).ClipboardItem !== 'undefined') {
      try {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ 'image/png': blob }),
        ]);
        $('#share').textContent = 'Image Copied! 📋';
        setTimeout(() => ($('#share').textContent = 'Share Image Card'), 2000);
        return;
      } catch {
        // Fallback to file download
      }
    }

    // 3. Fallback: Direct file download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GuessTheCeleb-${celeb.name.replace(/\s+/g, '-')}-result.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    $('#share').textContent = 'Card Saved! 📥';
    setTimeout(() => ($('#share').textContent = 'Share Image Card'), 2000);
  } catch (err) {
    console.warn('Share image error:', err);
    $('#share').textContent = 'Share Image Card';
  }
};

function populateDatalist() {
  const names = new Set<string>();
  CELEBS.forEach((c) => {
    names.add(c.name);
    if (c.aliases) c.aliases.forEach((a) => names.add(a));
  });
  $('#names').innerHTML = [...names].map((n) => `<option value="${n}">`).join('');
}

setInterval(() => {
  const el = $('#cd');
  const s = rt !== 'make' && !isU() && cur();
  if (!s || !s.done) {
    el.textContent = '';
    return;
  }
  const n = new Date();
  const m =
    new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1).getTime() - n.getTime();
  const p = (x: number) => String(x | 0).padStart(2, '0');
  el.textContent = `Next puzzle in ${p(m / 36e5)}:${p((m / 6e4) % 60)}:${p(
    (m / 1e3) % 60
  )}`;
}, 1000);

/* Modals */
const dlg = $('#dlg');
dlg.onclick = (e: MouseEvent) => {
  if (e.target === dlg) dlg.close();
};

function modal(t: string, h: string) {
  dlg.innerHTML = `<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><h2>${t}</h2><button class="btn alt" id="x" aria-label="Close">✕</button></div>${h}</div>`;
  if (!dlg.open) dlg.showModal();
  $('#x').onclick = () => dlg.close();
}

function statsModal(m = mode) {
  const p = stats(m);
  const a = ls.get('gtc2_all', null) || { streak: 0, max: 0, last: 0 };
  const mx = Math.max(1, ...p.dist);
  const bx = (n: number | string, l: string) =>
    `<div class="box"><b>${n}</b><span>${l}</span></div>`;

  modal(
    'Statistics',
    `<div class="chips">${Object.keys(ROUTES)
      .filter((k) => k !== 'make' && k !== 'unlimited')
      .map(
        (k) =>
          `<button class="chip" aria-pressed="${
            ROUTES[k][0] === m
          }" data-k="${ROUTES[k][0]}">${ROUTES[k][0]}</button>`
      )
      .join('')}</div><div class="boxes">${bx(p.played, 'Played')}${bx(
      p.played ? Math.round((100 * p.won) / p.played) : 0,
      'Win %'
    )}${bx(p.streak, 'Streak')}${bx(p.max, 'Max streak')}${bx(
      a.last >= day - 1 ? a.streak : 0,
      'All modes streak'
    )}${bx(a.max, 'All modes best')}</div><h3>Tries distribution</h3>${p.dist
      .map(
        (n: number, i: number) =>
          `<div class="bar"><span>#${i + 1}</span><div><i style="width:${Math.max(
            8,
            (100 * n) / mx
          )}%">${n}</i></div></div>`
      )
      .join('')}<div class="row" style="margin-top:14px"><button class="btn alt" id="rs">Reset stats</button></div>`
  );

  dlg.querySelectorAll('[data-k]').forEach((b: HTMLElement) => {
    b.onclick = () => statsModal(b.dataset.k!);
  });

  $('#rs').onclick = () => {
    if (confirm('Reset ' + m + ' stats?')) {
      ls.set(MK(m), null);
      statsModal(m);
      drawDaily();
    }
  };
}

const setg = () => ls.get('gtc2_set', null) || {};

function applySet() {
  const c = setg();
  const r = document.documentElement;
  if (c.dark === undefined) delete r.dataset.theme;
  else r.dataset.theme = c.dark ? 'dark' : 'light';
  r.toggleAttribute('data-cb', !!c.cb);
}

function settingsModal() {
  const c = setg();
  const row = (k: string, t: string, d: string, v: any) =>
    `<label class="tg"><span>${t}<small>${d}</small></span><input type="checkbox" role="switch" data-s="${k}" ${
      v ? 'checked' : ''
    }></label>`;

  modal(
    'Settings',
    row(
      'dark',
      'Dark mode',
      'Switch between light and dark',
      c.dark ?? matchMedia('(prefers-color-scheme:dark)').matches
    ) +
      row('cb', 'Color blind mode', 'High contrast colors', c.cb) +
      row('cf', 'Confetti', 'Celebrate when you win', c.cf !== false)
  );

  dlg.querySelectorAll('[data-s]').forEach((i: HTMLInputElement) => {
    i.onchange = () => {
      const n = setg();
      n[i.dataset.s!] = i.checked;
      ls.set('gtc2_set', n);
      applySet();
      drawDaily();
    };
  });
}

const helpModal = () =>
  modal(
    'How to play',
    `<p>A small crop of a face is shown. Guess who it is.</p><p>You get ${MAX} tries. Each wrong guess zooms out to show more.</p><p><strong>Daily</strong> reveals a different feature on each wrong guess: Hair → Eyes → Nose → Beard → Full face. A new puzzle unlocks every day.</p><p><strong>Hair, Beard, Nose, Eyes</strong> each have their own daily puzzle and streak.</p><p><strong>Unlimited</strong> gives random puzzles with no daily limit. <strong>Custom</strong> lets you upload your own photos and make your own game.</p>`
  );

$('#bs').onclick = () => statsModal(isU() || rt === 'make' ? 'Hair' : mode);
$('#bt').onclick = settingsModal;
$('#bh').onclick = helpModal;

function confetti() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const c = document.createElement('canvas');
  c.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:20';
  c.width = innerWidth;
  c.height = innerHeight;
  document.body.append(c);

  const g = c.getContext('2d')!;
  const P = Array.from({ length: 120 }, () => ({
    x: c.width / 2,
    y: c.height * 0.6,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 16 - 4,
    r: Math.random() * 6 + 3,
    c: ['#ffc933', '#2ec98a', '#2d3cff', '#ff5d5d'][(Math.random() * 4) | 0],
  }));

  let f = 0;
  (function t() {
    g.clearRect(0, 0, c.width, c.height);
    P.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      g.fillStyle = p.c;
      g.fillRect(p.x, p.y, p.r, p.r);
    });
    if (++f < 110) requestAnimationFrame(t);
    else c.remove();
  })();
}

/* Crop run: creator */
const PRE: Record<string, [number, number, number, number]> = {
  Hair: [0.18, 0.05, 0.64, 0.18],
  Eyes: [0.18, 0.22, 0.64, 0.10],
  Nose: [0.32, 0.32, 0.36, 0.12],
  Beard: [0.20, 0.44, 0.60, 0.22],
};

interface CropItem {
  b: ImageBitmap | HTMLCanvasElement;
  r: [number, number, number, number];
  h: [number, number, number, number][];
  l: string;
  presetKey?: string;
}

let items: CropItem[] = [];
let sel = -1;

$('#presets').innerHTML = Object.keys(PRE)
  .map((k) => `<button class="chip" data-p="${k}">${k}</button>`)
  .join('');

$$('#presets .chip').forEach((b: HTMLElement) => {
  b.onclick = () => {
    const it = items[sel];
    if (!it) return;
    it.h.push([...it.r]);
    it.presetKey = b.dataset.p;
    it.r = [...PRE[b.dataset.p!]];
    edit();
  };
});

$('#file').onchange = (e: any) => add([...e.target.files]);

const dr = $('#drop');
['dragover', 'dragenter'].forEach((n) =>
  dr.addEventListener(n, (e: DragEvent) => {
    e.preventDefault();
    dr.classList.add('on');
  })
);

['dragleave', 'drop'].forEach((n) =>
  dr.addEventListener(n, (e: DragEvent) => {
    e.preventDefault();
    dr.classList.remove('on');
  })
);

dr.addEventListener('drop', (e: DragEvent) => add([...(e.dataTransfer?.files || [])]));
addEventListener('paste', (e: ClipboardEvent) =>
  add([...(e.clipboardData?.files || [])])
);

async function add(fs: File[]) {
  const valid = fs.filter((f) => f.type.startsWith('image/')).slice(0, 20 - items.length);
  for (const f of valid) {
    try {
      items.push({
        b: await createImageBitmap(f, { imageOrientation: 'from-image' }),
        r: [...PRE.Hair],
        h: [],
        l: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        presetKey: 'Hair',
      });
    } catch {}
  }
  if (valid.length) {
    sel = items.length - 1;
    location.hash = '#/make';
    edit();
  }
  $('#file').value = '';
}

function thumbs() {
  $('#strip').innerHTML = '';
  items.forEach((it, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Photo ' + (i + 1));
    if (i === sel) b.setAttribute('aria-current', 'true');
    const c = document.createElement('canvas');
    c.width = c.height = 96;
    const [x, y, w, h] = px(it);
    c.getContext('2d')!.drawImage(
      it.b,
      x,
      y,
      w,
      h,
      0,
      0,
      96,
      (96 * h) / w > 96 ? 96 : 96
    );
    b.append(c);
    b.onclick = () => {
      sel = i;
      edit();
    };
    $('#strip').append(b);
  });
  $('#start').disabled = !items.length;
}

const px = (it: CropItem): [number, number, number, number] => [
  it.r[0] * it.b.width,
  it.r[1] * it.b.height,
  it.r[2] * it.b.width,
  it.r[3] * it.b.height,
];

function edit() {
  const it = items[sel];
  $('#editor').style.display = it ? 'block' : 'none';
  thumbs();
  if (!it) return;

  const c = $('#ce');
  const sc = Math.min(1, 1100 / Math.max(it.b.width, it.b.height));
  c.width = it.b.width * sc;
  c.height = it.b.height * sc;

  const g = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;
  const [x, y, w, h] = it.r;

  g.drawImage(it.b, 0, 0, W, H);
  g.fillStyle = 'rgba(8,10,25,.62)';
  g.fillRect(0, 0, W, y * H);
  g.fillRect(0, (y + h) * H, W, H);
  g.fillRect(0, y * H, x * W, h * H);
  g.fillRect((x + w) * W, y * H, W, h * H);

  g.lineWidth = Math.max(3, W / 200);
  g.strokeStyle = '#ffc933';
  g.strokeRect(x * W, y * H, w * W, h * H);
  g.fillStyle = '#ffc933';
  const k = Math.max(10, W / 50);
  g.fillRect((x + w) * W - k, (y + h) * H - k, k * 1.4, k * 1.4);

  $('#lbl').value = it.l;
  $('#undo').disabled = !it.h.length;
}

let drag: any = null;
const ce = $('#ce');

const pos = (e: PointerEvent): [number, number] => {
  const b = ce.getBoundingClientRect();
  return [
    Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)),
    Math.min(1, Math.max(0, (e.clientY - b.top) / b.height)),
  ];
};

ce.onpointerdown = (e: PointerEvent) => {
  const it = items[sel];
  if (!it) return;
  ce.setPointerCapture(e.pointerId);
  const [px_, py] = pos(e);
  const [x, y, w, h] = it.r;
  const snap = [...it.r];

  if (Math.abs(px_ - (x + w)) < 0.06 && Math.abs(py - (y + h)) < 0.06) {
    drag = { m: 'size', snap };
  } else if (px_ > x && px_ < x + w && py > y && py < y + h) {
    drag = { m: 'move', ox: px_ - x, oy: py - y, snap };
  } else {
    drag = { m: 'draw', sx: px_, sy: py, snap };
  }
};

ce.onpointermove = (e: PointerEvent) => {
  if (!drag) return;
  const it = items[sel];
  const [px_, py] = pos(e);
  const r = it.r;

  if (drag.m === 'draw') {
    r[0] = Math.min(drag.sx, px_);
    r[1] = Math.min(drag.sy, py);
    r[2] = Math.abs(px_ - drag.sx);
    r[3] = Math.abs(py - drag.sy);
  } else if (drag.m === 'move') {
    r[0] = Math.min(1 - r[2], Math.max(0, px_ - drag.ox));
    r[1] = Math.min(1 - r[3], Math.max(0, py - drag.oy));
  } else {
    r[2] = Math.max(0.05, px_ - r[0]);
    r[3] = Math.max(0.05, py - r[1]);
  }
  edit_light();
};

function edit_light() {
  const it = items[sel];
  const s = it.h;
  it.h = [];
  edit();
  it.h = s;
}

const endDrag = () => {
  if (!drag) return;
  const it = items[sel];
  if (it.r.some((v, i) => Math.abs(v - drag.snap[i]) > 0.001)) {
    if (it.r[2] < 0.05 || it.r[3] < 0.05) it.r = drag.snap;
    else it.h.push(drag.snap);
  }
  drag = null;
  edit();
};

ce.onpointerup = endDrag;
ce.onpointercancel = endDrag;

$('#undo').onclick = () => {
  const it = items[sel];
  if (it && it.h.length) {
    it.r = it.h.pop()!;
    edit();
  }
};

$('#del').onclick = () => {
  if (sel < 0) return;
  items.splice(sel, 1);
  sel = Math.min(sel, items.length - 1);
  edit();
};

$('#lbl').oninput = (e: any) => {
  if (items[sel]) items[sel].l = e.target.value;
};

/* Export JSON button in Crop Run editor */
const expJsonBtn = $('#expjson');
if (expJsonBtn) {
  expJsonBtn.onclick = async () => {
    const it = items[sel];
    if (!it) return;

    const name = it.l.trim() || 'Example Celebrity';
    const wiki = name.replace(/\s+/g, '_');
    const featKey = (it.presetKey || 'hair').toLowerCase();

    // Round coordinates to 2 decimal places
    const round4 = it.r.map((v) => Math.round(v * 100) / 100);

    const snippet = {
      name,
      wiki,
      aliases: [],
      modes: [featKey],
      crop: {
        [featKey]: round4,
      },
    };

    const formatted = JSON.stringify(snippet, null, 2);

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(formatted);
      }
      modal(
        'Export JSON',
        `<p>Copied to clipboard! Paste this block into <code>public/celebs.json</code>:</p><pre style="background:var(--bg);padding:12px;border-radius:10px;font-size:0.85rem;overflow:auto;max-height:220px;border:2px solid var(--ink)">${formatted}</pre><div class="row" style="margin-top:12px"><button class="btn" id="done-copy">Done</button></div>`
      );
      $('#done-copy').onclick = () => dlg.close();
    } catch {
      modal(
        'Export JSON',
        `<p>Copy this block into <code>public/celebs.json</code>:</p><textarea style="width:100%;height:140px;background:var(--bg);border:2px solid var(--ink);border-radius:10px;padding:8px;font-family:monospace" readonly>${formatted}</textarea>`
      );
    }
  };
}

/* Crop run: player. Press and hold shows the full photo, release hides it instantly. */
let ri = 0;
let held = false;
const pc = $('#pc');
const pg = pc.getContext('2d')!;
pc.width = 900;
pc.height = 1200;

function show() {
  const it = items[ri];
  if (!it) return;
  pg.fillStyle = '#10131f';
  pg.fillRect(0, 0, 900, 1200);

  const [x, y, w, h] = held ? [0, 0, it.b.width, it.b.height] : px(it);
  const s = Math.min(900 / w, 1200 / h);

  pg.imageSmoothingQuality = 'high';
  pg.drawImage(
    it.b,
    x,
    y,
    w,
    h,
    (900 - w * s) / 2,
    (1200 - h * s) / 2,
    w * s,
    h * s
  );

  $('#cnt').textContent = `${ri + 1} of ${items.length}`;
  const l = $('#lab');
  l.textContent = it.l;
  l.classList.toggle('on', held && !!it.l);
}

const setHeld = (v: boolean) => {
  if (held !== v) {
    held = v;
    show();
  }
};

pc.onpointerdown = (e: PointerEvent) => {
  pc.setPointerCapture(e.pointerId);
  setHeld(true);
};

['pointerup', 'pointercancel', 'lostpointercapture'].forEach((n) =>
  pc.addEventListener(n, () => setHeld(false))
);

pc.oncontextmenu = (e: Event) => e.preventDefault();

const go = (d: number) => {
  ri = (ri + d + items.length) % items.length;
  held = false;
  show();
};

$('#next').onclick = () => go(1);
$('#prev').onclick = () => go(-1);
$('#start').onclick = () => {
  ri = 0;
  held = false;
  $('#play').classList.add('on');
  show();
};
$('#close').onclick = () => {
  $('#play').classList.remove('on');
  held = false;
};

addEventListener('keydown', (e: KeyboardEvent) => {
  if (!$('#play').classList.contains('on')) return;
  if (e.code === 'Space') {
    e.preventDefault();
    setHeld(true);
  }
  if (e.key === 'ArrowRight') go(1);
  if (e.key === 'ArrowLeft') go(-1);
  if (e.key === 'Escape') $('#close').click();
});

addEventListener('keyup', (e: KeyboardEvent) => {
  if (e.code === 'Space') setHeld(false);
});

// Fetch celebs.json at runtime and initialize
async function initCelebs() {
  try {
    const res = await fetch('/celebs.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        CELEBS = data;
      }
    }
  } catch (err) {
    console.log('Using embedded fallback celebrities list:', err);
  }

  // Start preloading today's puzzle image immediately
  try {
    const todayCeleb = curCeleb();
    if (todayCeleb && todayCeleb.image) {
      pre(todayCeleb.image);
    }
  } catch {}

  populateDatalist();
  applySet();
  route();
}

addEventListener('hashchange', route);
initCelebs();

