import type { CelebrityCard, CropCategory } from '../types/game';

// Searchable celebrity names list for Wordle autocomplete
export const CELEBRITY_NAMES = [
  'Kanye West',
  'Drake',
  'Billie Eilish',
  'Zendaya',
  'Lionel Messi',
  'Cristiano Ronaldo',
  'The Weeknd',
  'Travis Scott',
  'Taylor Swift',
  'Rihanna',
  'Snoop Dogg',
  'Eminem',
  'LeBron James',
  'Ariana Grande',
  'Post Malone',
  'Pedro Pascal',
  'Cillian Murphy',
  'Margot Robbie',
  'Dwayne Johnson',
  'Keanu Reeves',
  'Harry Styles',
  'Justin Bieber',
  'Kendrick Lamar',
  'Selena Gomez',
  'Brad Pitt',
  'Leonardo DiCaprio',
  'Johnny Depp',
  'Robert Downey Jr.',
  'Tom Holland',
  'Timothée Chalamet',
  'Jack Harlow',
  'Bad Bunny',
  'Michael B. Jordan',
  'Bruno Mars',
  'Chris Hemsworth',
  'Will Smith',
  'Zac Efron',
  'Doja Cat',
  'Dua Lipa',
  'Ed Sheeran',
  'SZA',
  'Kylie Jenner',
  'Kim Kardashian',
  'Cardi B',
  'Nicki Minaj',
  '50 Cent',
  'Steve Harvey',
  'Morgan Freeman',
  'Samuel L. Jackson',
  'Gordon Ramsay',
];

// Clean stylized celebrity illustrations matching iconic street quiz challenges
export const CURATED_CELEBRITIES: CelebrityCard[] = [
  {
    id: 'celeb-kanye',
    name: 'Kanye West',
    category: 'hair',
    hint: '24-time Grammy winner, Yeezy founder',
    difficulty: 'easy',
    imageWidth: 600,
    imageHeight: 750,
    crop: {
      x: 0.18,
      y: 0.15,
      width: 0.64,
      height: 0.22,
    },
    // Stylized high-contrast SVG representation of iconic haircut
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
      <defs>
        <linearGradient id="bg_kanye" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%231e222d"/>
          <stop offset="100%" stop-color="%2312151c"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(%23bg_kanye)"/>
      <!-- Body & Shoulders -->
      <path d="M120 750 L160 560 Q300 520 440 560 L480 750 Z" fill="%230f1015"/>
      <path d="M220 540 L300 620 L380 540 Z" fill="%23262933"/>
      <!-- Head -->
      <ellipse cx="300" cy="380" rx="145" ry="175" fill="%238d5524"/>
      <!-- Iconic Buzzcut Hairline -->
      <path d="M165 330 C165 210, 435 210, 435 330 C400 270, 340 270, 300 275 C260 270, 200 270, 165 330 Z" fill="%23161413"/>
      <!-- Facial features -->
      <!-- Eyebrows -->
      <path d="M210 335 Q245 328 275 336" stroke="%23161413" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M325 336 Q355 328 390 335" stroke="%23161413" stroke-width="8" stroke-linecap="round" fill="none"/>
      <!-- Eyes -->
      <ellipse cx="245" cy="358" rx="16" ry="9" fill="%231a1614"/>
      <ellipse cx="355" cy="358" rx="16" ry="9" fill="%231a1614"/>
      <!-- Nose -->
      <path d="M295 365 L285 418 Q300 426 315 418 L305 365" fill="%237a491e"/>
      <!-- Beard & Goatee -->
      <path d="M265 448 Q300 442 335 448 Q345 490 300 500 Q255 490 265 448 Z" fill="%23141211"/>
      <ellipse cx="300" cy="460" rx="22" ry="5" fill="%235a3414"/>
    </svg>`,
  },
  {
    id: 'celeb-billie',
    name: 'Billie Eilish',
    category: 'hair',
    hint: 'Multi-Oscar & Grammy winner known for neon green roots',
    difficulty: 'easy',
    imageWidth: 600,
    imageHeight: 750,
    crop: {
      x: 0.12,
      y: 0.10,
      width: 0.76,
      height: 0.32,
    },
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
      <defs>
        <linearGradient id="bg_billie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%23161b26"/>
          <stop offset="100%" stop-color="%230b0e14"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(%23bg_billie)"/>
      <!-- Shoulders -->
      <path d="M130 750 L170 570 Q300 540 430 570 L470 750 Z" fill="%2322c55e"/>
      <!-- Face -->
      <ellipse cx="300" cy="410" rx="130" ry="160" fill="%23fed7aa"/>
      <!-- Green Neon Roots Hair -->
      <path d="M150 440 C120 220, 480 220, 450 440 C430 330, 390 290, 300 295 C210 290, 170 330, 150 440 Z" fill="%2322c55e"/>
      <path d="M140 420 C110 500, 120 620, 180 660 C160 520, 160 440, 170 410 Z" fill="%2309090b"/>
      <path d="M460 420 C490 500, 480 620, 420 660 C440 520, 440 440, 430 410 Z" fill="%2309090b"/>
      <path d="M220 310 Q300 340 380 310 Q340 280 300 290 Q260 280 220 310 Z" fill="%2322c55e"/>
      <!-- Eyes & Face -->
      <path d="M220 385 Q250 378 275 385" stroke="%231c1917" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M325 385 Q350 378 380 385" stroke="%231c1917" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="250" cy="405" r="10" fill="%2338bdf8"/>
      <circle cx="350" cy="405" r="10" fill="%2338bdf8"/>
      <path d="M295 410 L290 445 Q300 452 310 445 L305 410" fill="%23fba872"/>
      <path d="M275 480 Q300 495 325 480" stroke="%23e11d48" stroke-width="6" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: 'celeb-drake',
    name: 'Drake',
    category: 'beard',
    hint: 'Certified Lover Boy, OVO founder, iconic heart fade and beard',
    difficulty: 'easy',
    imageWidth: 600,
    imageHeight: 750,
    crop: {
      x: 0.22,
      y: 0.52,
      width: 0.56,
      height: 0.28,
    },
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
      <defs>
        <linearGradient id="bg_drake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%231f1d24"/>
          <stop offset="100%" stop-color="%23111014"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(%23bg_drake)"/>
      <path d="M130 750 L170 550 Q300 520 430 550 L470 750 Z" fill="%231e1b18"/>
      <ellipse cx="300" cy="380" rx="140" ry="170" fill="%23b87948"/>
      <!-- Hairline with signature heart cutout -->
      <path d="M170 330 C170 230, 430 230, 430 330 C390 280, 350 285, 300 285 C250 285, 210 280, 170 330 Z" fill="%23171311"/>
      <path d="M245 285 C240 275, 255 265, 260 275 C265 265, 280 275, 275 285 L260 295 Z" fill="%23b87948"/>
      <!-- Eyes & Brows -->
      <path d="M210 335 Q245 325 275 335" stroke="%23171311" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M325 335 Q355 325 390 335" stroke="%23171311" stroke-width="8" stroke-linecap="round" fill="none"/>
      <ellipse cx="245" cy="355" rx="14" ry="8" fill="%23171311"/>
      <ellipse cx="355" cy="355" rx="14" ry="8" fill="%23171311"/>
      <!-- Signature Sharp Full Beard -->
      <path d="M190 410 C180 520, 230 555, 300 555 C370 555, 420 520, 410 410 C395 480, 360 480, 300 480 C240 480, 205 480, 190 410 Z" fill="%23141110"/>
      <!-- Mustache & lips -->
      <path d="M255 435 Q300 430 345 435 Q300 450 255 435 Z" fill="%23141110"/>
      <ellipse cx="300" cy="455" rx="18" ry="4" fill="%23753e18"/>
    </svg>`,
  },
  {
    id: 'celeb-messi',
    name: 'Lionel Messi',
    category: 'beard',
    hint: '8-time Ballon d’Or legend, World Cup champion with ginger-brown beard',
    difficulty: 'medium',
    imageWidth: 600,
    imageHeight: 750,
    crop: {
      x: 0.22,
      y: 0.52,
      width: 0.56,
      height: 0.28,
    },
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
      <defs>
        <linearGradient id="bg_messi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%231e293b"/>
          <stop offset="100%" stop-color="%230f172a"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(%23bg_messi)"/>
      <path d="M130 750 L170 560 Q300 530 430 560 L470 750 Z" fill="%2338bdf8"/>
      <ellipse cx="300" cy="380" rx="135" ry="170" fill="%23f5caa2"/>
      <!-- Flowing hair -->
      <path d="M165 340 C145 200, 455 200, 435 340 C390 260, 340 270, 300 270 C260 270, 210 260, 165 340 Z" fill="%23451a03"/>
      <!-- Eyes & Nose -->
      <path d="M210 335 Q245 328 275 338" stroke="%23451a03" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M325 338 Q355 328 390 335" stroke="%23451a03" stroke-width="7" stroke-linecap="round" fill="none"/>
      <ellipse cx="245" cy="355" rx="12" ry="7" fill="%23451a03"/>
      <ellipse cx="355" cy="355" rx="12" ry="7" fill="%23451a03"/>
      <path d="M295 350 L285 415 Q300 422 315 415 L305 350" fill="%23e2ad7f"/>
      <!-- Ginger-brown trimmed beard -->
      <path d="M195 400 C185 520, 230 550, 300 550 C370 550, 415 520, 405 400 C395 470, 360 480, 300 480 C240 480, 205 470, 195 400 Z" fill="%239a3412"/>
      <path d="M255 435 Q300 425 345 435 Q300 450 255 435 Z" fill="%239a3412"/>
    </svg>`,
  },
  {
    id: 'celeb-snoop',
    name: 'Snoop Dogg',
    category: 'hair',
    hint: 'West Coast hip-hop icon known for signature braids & shades',
    difficulty: 'easy',
    imageWidth: 600,
    imageHeight: 750,
    crop: {
      x: 0.14,
      y: 0.12,
      width: 0.72,
      height: 0.30,
    },
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
      <defs>
        <linearGradient id="bg_snoop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%231a202c"/>
          <stop offset="100%" stop-color="%230d1117"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(%23bg_snoop)"/>
      <path d="M140 750 L180 560 Q300 530 420 560 L460 750 Z" fill="%231e3a8a"/>
      <!-- Lean face -->
      <ellipse cx="300" cy="400" rx="120" ry="175" fill="%236e3f1e"/>
      <!-- Iconic Braids / Pigtails -->
      <path d="M180 340 C170 220, 430 220, 420 340 C390 280, 350 270, 300 270 C250 270, 210 280, 180 340 Z" fill="%23111827"/>
      <!-- Braids flowing down sides with hair ties -->
      <path d="M180 330 Q140 430 160 550 Q140 560 160 580" stroke="%23111827" stroke-width="26" stroke-linecap="round" fill="none"/>
      <circle cx="160" cy="560" r="16" fill="%23ef4444"/>
      <path d="M420 330 Q460 430 440 550 Q460 560 440 580" stroke="%23111827" stroke-width="26" stroke-linecap="round" fill="none"/>
      <circle cx="440" cy="560" r="16" fill="%23ef4444"/>
      <!-- Sunglasses -->
      <rect x="200" y="360" width="85" height="40" rx="8" fill="%23000000"/>
      <rect x="315" y="360" width="85" height="40" rx="8" fill="%23000000"/>
      <line x1="285" y1="375" x2="315" y2="375" stroke="%23000000" stroke-width="6"/>
      <!-- Thin goatee -->
      <path d="M285 490 L300 520 L315 490 Z" fill="%23111827"/>
      <path d="M265 450 Q300 445 335 450" stroke="%23111827" stroke-width="4" fill="none"/>
    </svg>`,
  },
  {
    id: 'celeb-cillian',
    name: 'Cillian Murphy',
    category: 'eyes',
    hint: 'Oscar winner (Oppenheimer, Peaky Blinders) with piercing blue eyes',
    difficulty: 'medium',
    imageWidth: 600,
    imageHeight: 750,
    crop: {
      x: 0.18,
      y: 0.36,
      width: 0.64,
      height: 0.20,
    },
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
      <defs>
        <linearGradient id="bg_cillian" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%23171923"/>
          <stop offset="100%" stop-color="%23090a0f"/>
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="url(%23bg_cillian)"/>
      <path d="M130 750 L170 570 Q300 540 430 570 L470 750 Z" fill="%2327272a"/>
      <!-- Chiseled Face -->
      <path d="M190 320 Q300 240 410 320 L400 480 Q300 570 200 480 Z" fill="%23fde68a"/>
      <!-- Peaky Blinders Undercut Hair -->
      <path d="M170 340 C160 210, 440 210, 430 340 C390 270, 350 260, 300 260 C250 260, 210 270, 170 340 Z" fill="%23292524"/>
      <!-- Sharp Brows -->
      <path d="M210 345 Q245 335 275 348" stroke="%23292524" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M325 348 Q355 335 390 345" stroke="%23292524" stroke-width="6" stroke-linecap="round" fill="none"/>
      <!-- Striking Piercing Light Blue Eyes -->
      <ellipse cx="245" cy="370" rx="18" ry="10" fill="%23ffffff"/>
      <circle cx="245" cy="370" r="8" fill="%2306b6d4"/>
      <circle cx="245" cy="370" r="3.5" fill="%23083344"/>
      <ellipse cx="355" cy="370" rx="18" ry="10" fill="%23ffffff"/>
      <circle cx="355" cy="370" r="8" fill="%2306b6d4"/>
      <circle cx="355" cy="370" r="3.5" fill="%23083344"/>
      <!-- Chiseled cheekbone & mouth -->
      <path d="M295 375 L288 435 Q300 442 312 435 L305 375" fill="%23f59e0b" opacity="0.4"/>
      <path d="M270 480 Q300 475 330 480" stroke="%23b45309" stroke-width="5" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
];

// Returns today's daily celebrity based on calendar date seed and chosen category
export function getDailyCelebrity(dateStr: string, category: CropCategory = 'hair'): CelebrityCard {
  const filtered = CURATED_CELEBRITIES.filter((c) => c.category === category);
  const candidates = filtered.length > 0 ? filtered : CURATED_CELEBRITIES;

  // Simple numeric hash of date string YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % candidates.length;
  return candidates[index];
}
