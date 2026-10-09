import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const celebsPath = path.resolve('public/celebs.json');
const puzzlesDir = path.resolve('public/puzzles');

if (!fs.existsSync(puzzlesDir)) {
  fs.mkdirSync(puzzlesDir, { recursive: true });
}

const celebs = JSON.parse(fs.readFileSync(celebsPath, 'utf8'));

async function fetchWikiImage(wikiSlug) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiSlug)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'GuessTheCelebBot/1.0 (https://guesstheceleb.org; admin@guesstheceleb.org)'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${wikiSlug}`);
  const data = await res.json();
  const imgUrl = data.originalimage?.source || data.thumbnail?.source;
  if (!imgUrl) throw new Error(`No image found for ${wikiSlug}`);
  return imgUrl;
}

async function processAll() {
  console.log(`Starting download and WebP compression for ${celebs.length} celebrities...`);
  
  for (let i = 0; i < celebs.length; i++) {
    const c = celebs[i];
    const safeKey = c.wiki.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const outFilename = `${safeKey}.webp`;
    const outPath = path.join(puzzlesDir, outFilename);
    const localUrl = `/puzzles/${outFilename}`;
    
    c.image = localUrl;

    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
      console.log(`[${i+1}/${celebs.length}] Already cached: ${outFilename} (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
      continue;
    }

    try {
      console.log(`[${i+1}/${celebs.length}] Fetching image for ${c.name} (${c.wiki})...`);
      const imgUrl = await fetchWikiImage(c.wiki);
      const res = await fetch(imgUrl, {
        headers: {
          'User-Agent': 'GuessTheCelebBot/1.0 (https://guesstheceleb.org)'
        }
      });
      if (!res.ok) throw new Error(`Failed to download ${imgUrl}: ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Resize to max 900x900, WebP quality 78
      await sharp(buffer)
        .resize(900, 900, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 78 })
        .toFile(outPath);

      const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`   --> Saved ${outFilename} (${sizeKb} KB)`);
    } catch (err) {
      console.error(`   --> Error processing ${c.name}:`, err.message);
    }
  }

  // Update celebs.json with the image field
  fs.writeFileSync(celebsPath, JSON.stringify(celebs, null, 2), 'utf8');
  console.log('Finished! Updated public/celebs.json with local puzzle image paths.');
}

processAll();
