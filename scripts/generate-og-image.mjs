import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  // Let's create a cropped sample from public/puzzles/lionel_messi.webp (crop the eyes area)
  // Messi eyes crop from celebs.json: [0.24, 0.17, 0.52, 0.08] => [left 24%, top 17%, width 52%, height 8%]
  // Let's get an attractive 360x220 crop of Messi or Zendaya
  const messiImgPath = path.resolve('public/puzzles/lionel_messi.webp');
  const messiMetadata = await sharp(messiImgPath).metadata();
  
  // Crop the eyes/face region of Messi
  const cropLeft = Math.round(messiMetadata.width * 0.18);
  const cropTop = Math.round(messiMetadata.height * 0.14);
  const cropWidth = Math.round(messiMetadata.width * 0.64);
  const cropHeight = Math.round(messiMetadata.height * 0.22);

  const croppedBuffer = await sharp(messiImgPath)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .resize(380, 200, { fit: 'cover' })
    .toBuffer();

  const croppedBase64 = `data:image/webp;base64,${croppedBuffer.toString('base64')}`;

  // SVG graphic for the 1200x630 card
  const svgCard = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0e1326"/>
        <stop offset="50%" stop-color="#141933"/>
        <stop offset="100%" stop-color="#0a0d1a"/>
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="120%" height="120%">
        <feDropShadow dx="8" dy="8" stdDeviation="0" flood-color="#000000" flood-opacity="0.8"/>
      </filter>
      <filter id="btnShadow" x="-5%" y="-5%" width="120%" height="120%">
        <feDropShadow dx="4" dy="4" stdDeviation="0" flood-color="#000000" flood-opacity="0.9"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
    
    <!-- Decorative subtle grid circles -->
    <circle cx="100" cy="80" r="140" fill="#2d3cff" opacity="0.15" filter="blur(40px)"/>
    <circle cx="1100" cy="550" r="180" fill="#ffc933" opacity="0.1" filter="blur(50px)"/>

    <!-- Left Content Column -->
    <g transform="translate(70, 75)">
      <!-- Badge -->
      <rect x="0" y="0" width="230" height="34" rx="17" fill="#ffc933" stroke="#10131f" stroke-width="2"/>
      <text x="115" y="22" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="13" fill="#10131f" text-anchor="middle" letter-spacing="1.2">DAILY POP CULTURE TRIVIA</text>

      <!-- Main Headline -->
      <text x="0" y="105" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="62" fill="#ffffff" letter-spacing="-1">Guess The Celeb</text>

      <!-- Subtitle -->
      <text x="0" y="155" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="22" fill="#c3c8de">
        Can you name the star from a cropped
      </text>
      <text x="0" y="185" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#ffc933">
        hairline, eyes, nose, or beard?
      </text>

      <!-- Game Feature Pills -->
      <g transform="translate(0, 230)">
        <!-- Pill 1 Hair -->
        <rect x="0" y="0" width="95" height="36" rx="10" fill="#1f2545" stroke="#37416e" stroke-width="2"/>
        <text x="47" y="23" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#ffffff" text-anchor="middle">💈 Hair</text>

        <!-- Pill 2 Eyes -->
        <rect x="105" y="0" width="95" height="36" rx="10" fill="#1f2545" stroke="#37416e" stroke-width="2"/>
        <text x="152" y="23" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#ffffff" text-anchor="middle">👁️ Eyes</text>

        <!-- Pill 3 Nose -->
        <rect x="210" y="0" width="95" height="36" rx="10" fill="#1f2545" stroke="#37416e" stroke-width="2"/>
        <text x="257" y="23" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#ffffff" text-anchor="middle">👃 Nose</text>

        <!-- Pill 4 Beard -->
        <rect x="315" y="0" width="105" height="36" rx="10" fill="#1f2545" stroke="#37416e" stroke-width="2"/>
        <text x="367" y="23" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#ffffff" text-anchor="middle">🧔 Beard</text>

        <!-- Pill 5 Daily -->
        <rect x="430" y="0" width="95" height="36" rx="10" fill="#2d3cff" stroke="#4857ff" stroke-width="2"/>
        <text x="477" y="23" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="#ffffff" text-anchor="middle">⚡ Daily</text>
      </g>

      <!-- Bottom Domain Box -->
      <g transform="translate(0, 370)">
        <rect x="0" y="0" width="360" height="52" rx="12" fill="#2d3cff" filter="url(#btnShadow)"/>
        <text x="180" y="32" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18" fill="#ffffff" text-anchor="middle" letter-spacing="1">
          PLAY FREE ON GUESSTHECELEB.ORG
        </text>
      </g>
      <text x="0" y="450" font-family="system-ui, sans-serif" font-weight="500" font-size="15" fill="#8890ab">
        ✓ 100% Free  •  ✓ No Login  •  ✓ New Daily Mystery Stars
      </text>
    </g>

    <!-- Right Side Mock Game Card -->
    <g transform="translate(670, 65)">
      <!-- Card background with heavy border and retro shadow -->
      <rect x="0" y="0" width="460" height="490" rx="22" fill="#ffffff" stroke="#10131f" stroke-width="4" filter="url(#shadow)"/>
      
      <!-- Card Header -->
      <g transform="translate(26, 26)">
        <text x="0" y="18" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#10131f" letter-spacing="0.5">TODAY'S MYSTERY CROP</text>
        <rect x="290" y="0" width="118" height="26" rx="13" fill="#ffc933" stroke="#10131f" stroke-width="2"/>
        <text x="349" y="17" font-family="system-ui, sans-serif" font-weight="800" font-size="12" fill="#10131f" text-anchor="middle">5 TRIES LEFT</text>
      </g>

      <!-- Mystery Crop Image Box with border -->
      <g transform="translate(26, 68)">
        <rect x="0" y="0" width="408" height="220" rx="14" fill="#0d0f1c" stroke="#10131f" stroke-width="3"/>
        <clipPath id="cropClip">
          <rect x="3" y="3" width="402" height="214" rx="12"/>
        </clipPath>
        <!-- The cropped celebrity image will be positioned here -->
        <image href="${croppedBase64}" x="14" y="10" width="380" height="200" preserveAspectRatio="xMidYMid slice" clip-path="url(#cropClip)"/>
      </g>

      <!-- Attempt Indicator Dots -->
      <g transform="translate(26, 312)">
        <rect x="0" y="0" width="40" height="34" rx="8" fill="#e11d48" stroke="#10131f" stroke-width="2"/>
        <text x="20" y="22" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#fff" text-anchor="middle">✕</text>

        <rect x="50" y="0" width="40" height="34" rx="8" fill="#10b981" stroke="#10131f" stroke-width="2"/>
        <text x="70" y="23" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#fff" text-anchor="middle">✓</text>

        <rect x="100" y="0" width="40" height="34" rx="8" fill="#f1f3f9" stroke="#cbd2e1" stroke-width="2"/>
        <rect x="150" y="0" width="40" height="34" rx="8" fill="#f1f3f9" stroke="#cbd2e1" stroke-width="2"/>
        <rect x="200" y="0" width="40" height="34" rx="8" fill="#f1f3f9" stroke="#cbd2e1" stroke-width="2"/>

        <text x="260" y="22" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#64748b">Round 2 / 5</text>
      </g>

      <!-- Guess Box Mockup -->
      <g transform="translate(26, 368)">
        <rect x="0" y="0" width="408" height="52" rx="12" fill="#f8fafc" stroke="#10131f" stroke-width="2.5"/>
        <text x="18" y="32" font-family="system-ui, sans-serif" font-weight="600" font-size="16" fill="#94a3b8">Who is this celebrity?...</text>
        
        <rect x="290" y="8" width="108" height="36" rx="8" fill="#2d3cff" stroke="#10131f" stroke-width="2"/>
        <text x="344" y="31" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="#ffffff" text-anchor="middle">GUESS</text>
      </g>

      <!-- Prompt text -->
      <text x="230" y="455" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="#2d3cff" text-anchor="middle" letter-spacing="0.5">
        ★ GUESS THE CELEBRITY BY THEIR EYES ★
      </text>
    </g>
  </svg>
  `;

  const outPath = path.resolve('public/og-image.png');
  await sharp(Buffer.from(svgCard))
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(outPath);

  console.log(`Generated public/og-image.png (1200x630, ${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
}

generateOgImage().catch(console.error);
