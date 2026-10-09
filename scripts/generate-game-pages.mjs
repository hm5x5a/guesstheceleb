import fs from 'fs';
import path from 'path';

const baseTemplate = fs.readFileSync('index.html', 'utf8');

// Configuration for each game mode page
const gamePages = [
  {
    dir: 'guess-the-celebrity-by-hair',
    canonical: 'https://guesstheceleb.org/guess-the-celebrity-by-hair/',
    title: 'Guess the Celebrity by Hair: Daily Hairline Game',
    metaDesc: "Can you name the celebrity from a cropped hairline? Play today's puzzle. Five tries, and the crop zooms out after each wrong guess.",
    h1: 'Guess the celebrity by hair',
    hp: 'Name the celebrity from a cropped hairline. A new daily puzzle, five tries.',
    badge: 'Daily Hairline Challenge',
    primaryKeyword: 'guess the celebrity by hair',
    introText: 'Welcome to the official <strong>Guess the Celebrity by Hair</strong> daily puzzle game. Hairlines, fades, dye colors, and iconic textures are among the most distinctive signatures of world-famous stars, musicians, athletes, and actors. In this daily mode, your goal is to identify the mystery celebrity purely from an isolated photograph of their hair and hairline. Eyebrows, eyes, and lower facial features are completely hidden to deliver a true visual recognition test.',
    featureDesc: 'In hair mode, the crop is strictly centered on the hairline, fringe, or crown. Notice subtle details: distinctive widow peaks, signature tapers, textured afro curls, dyed highlights, or buzzcuts. If you guess incorrectly, the crop gently zooms out by a few percent to reveal slightly more context without giving away the full face.',
    faq: [
      {
        q: 'How does guess the celebrity by hair work?',
        a: 'Guess the celebrity by hair presents an isolated crop of a world-famous celebrity’s hairline or crown. You have five tries to type their name into the guess box. Each incorrect guess records a red indicator and provides a slight visual zoom-out.'
      },
      {
        q: 'Is there a new hairline puzzle every day?',
        a: 'Yes, a brand-new celebrity hairline puzzle unlocks every day at midnight in your local timezone. Everyone around the world plays the identical puzzle on the same date.'
      },
      {
        q: 'What happens when I guess wrong?',
        a: 'When you make an incorrect guess, a red indicator dot is added and the crop view subtly expands by 5% to give you slightly more peripheral context while keeping the eyebrows hidden.'
      },
      {
        q: 'Can I play more than once a day?',
        a: 'You can play today’s daily hairline puzzle once for your official streak. If you want endless practice rounds without waiting for tomorrow, switch to Unlimited Mode from the top navigation bar.'
      },
      {
        q: 'Does the game save my streak?',
        a: 'Yes! Your win count, streak record, and attempt distribution are saved securely in your browser local storage. Click the statistics icon (▥) in the top menu to view your record.'
      },
      {
        q: 'Do I need an account to play?',
        a: 'No account, registration, or email is required. Everything runs directly in your web browser with complete privacy.'
      },
      {
        q: 'Is Guess The Celebrity by Hair free?',
        a: 'Yes, Guess The Celeb is completely free to play on desktop, tablet, and mobile devices.'
      }
    ]
  },
  {
    dir: 'guess-the-celebrity-by-beard',
    canonical: 'https://guesstheceleb.org/guess-the-celebrity-by-beard/',
    title: 'Guess the Celebrity by Beard: Daily Puzzle',
    metaDesc: 'Name the celebrity from a cropped beard. A new daily beard puzzle, five tries, and your own streak.',
    h1: 'Guess the celebrity by beard',
    hp: 'Name the celebrity from a cropped beard. A new daily puzzle, five tries.',
    badge: 'Daily Beard & Stubble Challenge',
    primaryKeyword: 'guess the celebrity by beard',
    introText: 'Step up to the <strong>Guess the Celebrity by Beard</strong> daily trivia challenge! Facial hair is one of Hollywood and pop culture’s greatest trademarks. From rugged stubble and trimmed goatees to full lumberjack beards and sharp jawline lineups, this mode challenges you to name the celebrity exclusively by their facial hair.',
    featureDesc: 'In beard mode, the upper face, eyes, and nose are completely cropped away. You are presented strictly with the jawline, chin, and mustache area. Study the color of the stubble, hair thickness, cheek line definition, and chin grooming to determine which A-list star is on screen.',
    faq: [
      {
        q: 'How do I play the beard version of Guess The Celeb?',
        a: 'Study the cropped beard or mustache shown on screen. Type the celebrity’s name or known alias into the search bar and submit. You have five attempts to guess correctly.'
      },
      {
        q: 'Why is the beard puzzle harder than hair?',
        a: 'Beard crops isolate only the lower jaw, chin, and mustache, hiding signature eyes and forehead structures. Identifying stars by stubble density and grooming lines requires sharp pop culture memory.'
      },
      {
        q: 'How many tries do I get for each beard puzzle?',
        a: 'You get 5 attempts per daily puzzle. After winning or giving up, the complete uncropped high-resolution photo is revealed.'
      },
      {
        q: 'When does the next beard puzzle unlock?',
        a: 'A new daily beard puzzle unlocks every night at midnight local time. All players worldwide receive the same celebrity puzzle on any given date.'
      },
      {
        q: 'Can I guess celebrities using their common nicknames?',
        a: 'Yes! Widely recognized aliases such as "Ye", "The Rock", "CR7", and "Messi" are accepted alongside full legal names.'
      },
      {
        q: 'Does it work smoothly on mobile phones?',
        a: 'Yes, the game is fully optimized for touchscreens, iPhones, and Android devices with zero downloads required.'
      }
    ]
  },
  {
    dir: 'guess-the-celebrity-by-nose',
    canonical: 'https://guesstheceleb.org/guess-the-celebrity-by-nose/',
    title: 'Guess the Celebrity by Nose: Daily Puzzle',
    metaDesc: 'Think you know faces? Guess the celebrity from a cropped nose in today\'s puzzle. Five tries, new every day.',
    h1: 'Guess the celebrity by nose',
    hp: 'Name the celebrity from a cropped nose. A new daily puzzle, five tries.',
    badge: 'Daily Nose & Bridge Trivia',
    primaryKeyword: 'guess the celebrity by nose',
    introText: 'Think you have an eagle eye for facial anatomy? Test yourself in <strong>Guess the Celebrity by Nose</strong>. The nose sits dead-center on the human face, providing key structural cues regarding bridge width, tip shape, nostril curves, and skin complexion. Can you name the world-famous personality from just their nose?',
    featureDesc: 'In nose mode, both the eyes and the mouth are masked away. You see only the nasal bridge, tip, and upper philtrum. Distinguish between prominent Roman bridges, button noses, subtle asymmetry, and recognizable profile shapes.',
    faq: [
      {
        q: 'Can you really guess a celebrity from a nose?',
        a: 'Yes! Facial recognition research shows the nasal bridge and tip geometry provide distinct biometric cues. Experienced players recognize subtle bridge slopes, tip angles, and nostril shapes instantly.'
      },
      {
        q: 'Are there hints in nose mode?',
        a: 'Each incorrect guess causes the view to slightly zoom outward, revealing nearby cheek and upper lip contours to help you narrow down your guess.'
      },
      {
        q: 'How does the zoom-out work?',
        a: 'The game expands the cropped viewport by a calculated 5% after each attempt. This ensures the challenge remains intact while rewarding strategic guessing.'
      },
      {
        q: 'Is there a daily streak for the nose category?',
        a: 'Yes, every game mode tracks its own independent daily streak, games played, and win percentage in the stats panel.'
      },
      {
        q: 'Is the game completely free to play?',
        a: 'Yes, Guess The Celeb by Nose is 100% free with no paywalls, accounts, or in-app purchases.'
      }
    ]
  },
  {
    dir: 'guess-the-celebrity-by-eyes',
    canonical: 'https://guesstheceleb.org/guess-the-celebrity-by-eyes/',
    title: 'Guess the Celebrity by Eyes: Daily Puzzle',
    metaDesc: 'Name the celebrity from their eyes alone. Play today\'s cropped eyes puzzle and keep your daily streak.',
    h1: 'Guess the celebrity by eyes',
    hp: 'Name the celebrity from cropped eyes. A new daily puzzle, five tries.',
    badge: 'Daily Eyes & Iris Puzzle',
    primaryKeyword: 'guess the celebrity by eyes',
    introText: 'They say the eyes are the window to the soul—and in <strong>Guess the Celebrity by Eyes</strong>, they are your only ticket to victory! From Cillian Murphy’s piercing icy blue gaze and Billie Eilish’s hooded eyes to Zendaya’s expressive brown eyes, celebrities have unforgettable eyes that set them apart.',
    featureDesc: 'In eyes mode, the forehead and nose are tightly excluded. You see the eye sockets, eyelids, iris pigmentation, and eyebrow arch. Pay close attention to eyebrow grooming, eyelid creases, and eye spacing to solve the mystery.',
    faq: [
      {
        q: 'What counts as a correct answer in eyes mode?',
        a: 'Typing the celebrity’s official name or common alias (for example, "Drake" or "Aubrey Graham") into the guess box counts as an immediate correct solution.'
      },
      {
        q: 'Are nicknames and monikers accepted?',
        a: 'Yes, common monikers and mononyms such as "Rihanna", "Snoop Dogg", and "LeBron" are fully accepted.'
      },
      {
        q: 'How is the eyes puzzle chosen each day?',
        a: 'The daily celebrity is selected using a deterministic, cycle-based seeded shuffle. Every player gets the exact same mystery star on any calendar date, with no repeating celebrities.'
      },
      {
        q: 'How many guesses do I get?',
        a: 'You get 5 attempts to name the celebrity. When you finish, you can share a custom graphic result card with friends on social media.'
      },
      {
        q: 'Can I play past eye puzzles?',
        a: 'You can practice anytime with random celebrity crops by opening Unlimited Mode from the top menu.'
      }
    ]
  },
  {
    dir: 'unlimited-guess-the-celebrity',
    canonical: 'https://guesstheceleb.org/unlimited-guess-the-celebrity/',
    title: 'Unlimited Guess the Celebrity: Endless Rounds',
    metaDesc: 'Play as many guess the celebrity rounds as you like. Random crops of hair, beard, nose and eyes with no daily limit.',
    h1: 'Unlimited guess the celebrity',
    hp: 'Random crop puzzles with no daily limit. Play as many as you like.',
    badge: 'Endless Practice Arena',
    primaryKeyword: 'unlimited guess the celebrity',
    introText: 'Want to keep playing without waiting 24 hours for tomorrow’s midnight drop? <strong>Unlimited Guess the Celebrity</strong> gives you non-stop celebrity crop puzzles with randomized features and endless rounds. Train your visual recognition skills across hair, beard, nose, and eyes continuously.',
    featureDesc: 'Each round randomly selects a celebrity from our curated pool and assigns a mystery feature to guess. Guess the star within 5 tries, click "Next puzzle", and immediately dive into the next challenge.',
    faq: [
      {
        q: 'What is the difference between daily and unlimited?',
        a: 'Daily puzzles offer one shared puzzle per mode every 24 hours that counts towards your official consecutive daily streak. Unlimited mode lets you play endless randomized rounds back-to-back at any time.'
      },
      {
        q: 'Does unlimited mode affect my daily streak?',
        a: 'No, unlimited mode is designed for practice and fun. It does not overwrite or penalize your daily calendar streaks.'
      },
      {
        q: 'Which features are tested in unlimited mode?',
        a: 'Rounds cycle dynamically between cropped hairlines, facial beards, nasal bridges, and eyes.'
      },
      {
        q: 'Is there a limit on how many rounds I can play?',
        a: 'There is zero limit. You can play as many puzzles as you wish for as long as you want.'
      },
      {
        q: 'Is Unlimited Guess The Celeb completely free?',
        a: 'Yes, 100% free with no registration, coins, or tokens needed.'
      }
    ]
  },
  {
    dir: 'custom-guess-the-celebrity',
    canonical: 'https://guesstheceleb.org/custom-guess-the-celebrity/',
    title: 'Custom Guess the Celebrity: Make Your Own Game',
    metaDesc: 'Make your own guess the celebrity game. Add photos, crop the part you want to show, then hold to reveal. Free, no login.',
    h1: 'Make your own crop run',
    hp: 'Add photos, crop them and play them one by one. Hold to reveal.',
    badge: 'Creator & Host Studio',
    primaryKeyword: 'custom guess the celebrity',
    introText: 'Create your own interactive Hold-to-Reveal trivia games with <strong>Custom Guess the Celebrity</strong>! Perfect for TikTok creators, Instagram Reels, YouTube Shorts, classroom trivia, and party games. Simply drop your photos, draw crop boxes, and host an interactive live game with touch-and-hold reveal controls.',
    featureDesc: 'Upload images from your device, drag rectangular crop boundaries around hairlines or faces, set optional answer labels, and launch Host Mode. Press and hold the canvas (or spacebar) to reveal the original image, and release to instantly hide it again.',
    faq: [
      {
        q: 'How do I make my own guess the celebrity game?',
        a: 'Drag and drop your photos into the drop zone, use the canvas crop editor to draw your target crop rectangle, and click "Start run" to begin hosting.'
      },
      {
        q: 'Are my photos uploaded to any server?',
        a: 'No. All images and crops are handled strictly client-side inside your browser memory. Your personal photos are never uploaded or stored on external servers.'
      },
      {
        q: 'How many photos can I add to a crop run?',
        a: 'You can upload dozens of photos to create complete trivia series for street interviews, social videos, or party games.'
      },
      {
        q: 'How do I record games for TikTok or Reels?',
        a: 'Open Crop Run in fullscreen on your phone or laptop. Screen-record while tapping and holding the image to reveal the celebrity answer on beat with your trivia questions.'
      },
      {
        q: 'Can I export custom crops as JSON?',
        a: 'Yes! Click "Export JSON" in the crop editor to copy pre-formatted crop coordinates suitable for adding directly into celebs.json.'
      }
    ]
  }
];

// Generate each game mode HTML file
gamePages.forEach((page) => {
  const pageDir = path.resolve(page.dir);
  if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': page.faq.map(item => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a
      }
    }))
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': page.title,
    'url': page.canonical,
    'applicationCategory': 'GameApplication',
    'operatingSystem': 'Any',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://guesstheceleb.org/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': page.h1,
        'item': page.canonical
      }
    ]
  };

  let html = baseTemplate;

  // Replace Title & Meta Description & Canonical
  html = html.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`);
  html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${page.metaDesc}">`);
  html = html.replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${page.canonical}">`);
  html = html.replace(/<meta property="og:url" content=".*?">/, `<meta property="og:url" content="${page.canonical}">`);
  html = html.replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${page.title}">`);
  html = html.replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${page.metaDesc}">`);
  html = html.replace(/<meta name="twitter:url" content=".*?">/, `<meta name="twitter:url" content="${page.canonical}">`);
  html = html.replace(/<meta name="twitter:title" content=".*?">/, `<meta name="twitter:title" content="${page.title}">`);
  html = html.replace(/<meta name="twitter:description" content=".*?">/, `<meta name="twitter:description" content="${page.metaDesc}">`);

  // Replace Structured Data Scripts
  const structuredDataHtml = `
<script type="application/ld+json">
${JSON.stringify(webAppSchema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumbSchema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(faqSchema, null, 2)}
</script>`;

  html = html.replace(/<!-- Structured Data for Google SEO.*?<\/script>/s, structuredDataHtml);

  // Set H1 and Hero description in the raw HTML
  html = html.replace(/<h1 id="h1"><\/h1><p id="hp"><\/p>/, `<h1 id="h1">${page.h1}</h1><p id="hp">${page.hp}</p>`);

  // Build breadcrumbs bar
  const breadcrumbsHtml = `
<nav aria-label="Breadcrumb" style="padding:10px 0 0;font-size:0.88rem">
  <a href="/" style="color:var(--blue);text-decoration:none;font-weight:700">Home</a> &rsaquo;
  <span style="color:var(--mut)">${page.h1}</span>
</nav>`;

  html = html.replace(/<section id="daily" class="view on">/, `<section id="daily" class="view on">${breadcrumbsHtml}`);

  // Build FAQ HTML with native details/summary and H3
  const faqListHtml = page.faq.map((item, idx) => `
    <details class="faq-item"${idx === 0 ? ' open' : ''}>
      <summary><h3 style="margin:0;font-size:1.05rem;display:inline">${item.q}</h3></summary>
      <div class="faq-ans">${item.a}</div>
    </details>`).join('');

  // Replace Guide & FAQ section with unique text & questions
  const uniqueContentHtml = `
<!-- UNIQUE MODE CONTENT & FAQ (300+ Words) -->
<div class="guide-wrap">
  <div class="card">
    <div class="section-badge">${page.badge}</div>
    <h2>Mastering the ${page.h1} Mode</h2>
    <p style="font-size:1.02rem;line-height:1.6">${page.introText}</p>
    <p style="font-size:1.02rem;line-height:1.6">${page.featureDesc}</p>
    <div class="row" style="margin-top:16px;gap:10px">
      <a href="/guess-the-celebrity-by-hair/" class="chip">Hair Mode</a>
      <a href="/guess-the-celebrity-by-beard/" class="chip">Beard Mode</a>
      <a href="/guess-the-celebrity-by-nose/" class="chip">Nose Mode</a>
      <a href="/guess-the-celebrity-by-eyes/" class="chip">Eyes Mode</a>
      <a href="/unlimited-guess-the-celebrity/" class="chip">Unlimited Rounds</a>
      <a href="/custom-guess-the-celebrity/" class="chip">Custom Game Maker</a>
    </div>
  </div>

  <div class="steps-grid">
    <div class="step-card">
      <div class="step-num">1</div>
      <h3 style="margin:4px 0">Inspect the crop</h3>
      <p class="mut" style="margin:0">Study key features carefully: shapes, curves, colors, and skin tones.</p>
    </div>
    <div class="step-card">
      <div class="step-num">2</div>
      <h3 style="margin:4px 0">Enter your guess</h3>
      <p class="mut" style="margin:0">Type the star's name or alias. You have 5 tries to guess right.</p>
    </div>
    <div class="step-card">
      <div class="step-num">3</div>
      <h3 style="margin:4px 0">Grow your streak</h3>
      <p class="mut" style="margin:0">Win daily to increase your consecutive streak and unlock the full uncropped photo.</p>
    </div>
  </div>

  <div class="card" style="margin-top:12px">
    <div class="center-header" style="margin-bottom:12px">
      <div class="section-badge" style="background:#e0e7ff;color:#312e81">Frequently Asked Questions</div>
      <h2>Frequently Asked Questions</h2>
    </div>
    <div class="faq-list">
      ${faqListHtml}
    </div>
  </div>
</div>`;

  html = html.replace(/<!-- HOW TO PLAY SECTION -->.*?<\/section>/s, `${uniqueContentHtml}\n</section>`);

  // Update Footer with Trust links
  const footerHtml = `
<footer>
  <div class="wrap" style="display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;font-weight:700">
      <a href="/" style="color:inherit;text-decoration:none">Home</a>
      <a href="/guess-the-celebrity-by-hair/" style="color:inherit;text-decoration:none">Hair Game</a>
      <a href="/guess-the-celebrity-by-beard/" style="color:inherit;text-decoration:none">Beard Game</a>
      <a href="/guess-the-celebrity-by-nose/" style="color:inherit;text-decoration:none">Nose Game</a>
      <a href="/guess-the-celebrity-by-eyes/" style="color:inherit;text-decoration:none">Eyes Game</a>
      <a href="/unlimited-guess-the-celebrity/" style="color:inherit;text-decoration:none">Unlimited</a>
      <a href="/custom-guess-the-celebrity/" style="color:inherit;text-decoration:none">Custom Game</a>
      <a href="/about/" style="color:inherit;text-decoration:none">About</a>
      <a href="/privacy/" style="color:inherit;text-decoration:none">Privacy Policy</a>
      <a href="/terms/" style="color:inherit;text-decoration:none">Terms</a>
      <a href="/contact/" style="color:inherit;text-decoration:none">Contact</a>
    </div>
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;color:var(--mut);font-size:0.9rem">
      <span>&copy; 2026 GuessTheCeleb.org. Everything runs locally on your device.</span>
      <span>Daily pop culture trivia puzzles.</span>
    </div>
  </div>
</footer>`;

  html = html.replace(/<footer>.*?<\/footer>/s, footerHtml);

  fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf8');
  console.log(`Generated: ${page.dir}/index.html`);
});

// Also update the root index.html with the new footer links and Organization / WebSite JSON-LD
let rootHtml = baseTemplate;
const rootFooterHtml = `
<footer>
  <div class="wrap" style="display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;font-weight:700">
      <a href="/" style="color:inherit;text-decoration:none">Home</a>
      <a href="/guess-the-celebrity-by-hair/" style="color:inherit;text-decoration:none">Hair Game</a>
      <a href="/guess-the-celebrity-by-beard/" style="color:inherit;text-decoration:none">Beard Game</a>
      <a href="/guess-the-celebrity-by-nose/" style="color:inherit;text-decoration:none">Nose Game</a>
      <a href="/guess-the-celebrity-by-eyes/" style="color:inherit;text-decoration:none">Eyes Game</a>
      <a href="/unlimited-guess-the-celebrity/" style="color:inherit;text-decoration:none">Unlimited</a>
      <a href="/custom-guess-the-celebrity/" style="color:inherit;text-decoration:none">Custom Game</a>
      <a href="/about/" style="color:inherit;text-decoration:none">About</a>
      <a href="/privacy/" style="color:inherit;text-decoration:none">Privacy Policy</a>
      <a href="/terms/" style="color:inherit;text-decoration:none">Terms</a>
      <a href="/contact/" style="color:inherit;text-decoration:none">Contact</a>
    </div>
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;color:var(--mut);font-size:0.9rem">
      <span>&copy; 2026 GuessTheCeleb.org. Everything runs locally on your device.</span>
      <span>Daily pop culture trivia puzzles.</span>
    </div>
  </div>
</footer>`;

rootHtml = rootHtml.replace(/<footer>.*?<\/footer>/s, rootFooterHtml);
fs.writeFileSync('index.html', rootHtml, 'utf8');
console.log('Updated index.html footer');
