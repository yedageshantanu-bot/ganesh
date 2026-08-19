const { Jimp, rgbaToInt } = require('jimp');
const fs = require('fs');
const path = require('path');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFDF6D"/>
      <stop offset="40%" stop-color="#D4AF37"/>
      <stop offset="85%" stop-color="#996515"/>
      <stop offset="100%" stop-color="#5A3A00"/>
    </linearGradient>
    <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#C0392B"/>
      <stop offset="40%" stop-color="#E67E22"/>
      <stop offset="80%" stop-color="#F1C40F"/>
      <stop offset="100%" stop-color="#FFFDF0"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Crisp White Outer Circular Badge (Pops against Google Search dark/light themes) -->
  <circle cx="256" cy="256" r="240" fill="#FFFFFF" stroke="#D4AF37" stroke-width="12" filter="url(#shadow)"/>
  <circle cx="256" cy="256" r="222" fill="none" stroke="#F3C444" stroke-width="3" opacity="0.8"/>

  <!-- Inner Sacred Flame & Lotus Motif -->
  <!-- Outer Petals -->
  <path d="M 256 95 C 290 160 365 210 365 280 C 365 340 316 380 256 380 C 196 380 147 340 147 280 C 147 210 222 160 256 95 Z" fill="url(#fireGrad)"/>
  
  <!-- Inner Gold Core -->
  <path d="M 256 145 C 280 195 330 230 330 285 C 330 326 297 355 256 355 C 215 355 182 326 182 285 C 182 230 232 195 256 145 Z" fill="url(#goldGrad)"/>

  <!-- Inner White Sacred Light -->
  <path d="M 256 190 C 270 225 300 248 300 288 C 300 312 280 330 256 330 C 232 330 212 312 212 288 C 212 248 242 225 256 190 Z" fill="#FFFFFF"/>

  <!-- High-Contrast Stylized Monogram GT -->
  <!-- Letter G -->
  <path d="M 230 245 C 216 245 204 254 204 275 C 204 296 216 305 232 305 C 245 305 254 297 256 286 L 234 286 L 234 274 L 268 274 L 268 307 C 258 315 245 318 230 318 C 204 318 188 300 188 275 C 188 250 204 232 230 232 C 245 232 258 238 266 247 L 254 257 C 248 250 240 245 230 245 Z" fill="#1A150A"/>

  <!-- Letter T -->
  <path d="M 276 234 L 324 234 L 324 247 L 307 247 L 307 316 L 293 316 L 293 247 L 276 247 Z" fill="#1A150A"/>
</svg>`;

fs.writeFileSync(path.join(__dirname, '..', 'favicon.svg'), svgContent, 'utf8');
console.log('Generated vibrant white-badge favicon.svg');

async function createFavicons() {
  const SIZE = 512;
  const image = new Jimp({ width: SIZE, height: SIZE, color: 0x00000000 });

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const outerR = 244;
  const innerR = 226;

  function getGoldColor(t) {
    if (t < 0.3) return rgbaToInt(255, 223, 109, 255);
    if (t < 0.7) return rgbaToInt(212, 175, 55, 255);
    return rgbaToInt(153, 101, 21, 255);
  }

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= outerR) {
        if (dist >= outerR - 12) {
          // Gold Border Ring
          const t = (x + y) / (SIZE * 2);
          image.setPixelColor(getGoldColor(t), x, y);
        } else if (dist >= innerR - 2 && dist <= innerR + 2) {
          // Inner Gold Line
          image.setPixelColor(rgbaToInt(243, 196, 68, 255), x, y);
        } else {
          // Crisp Pure White Badge Fill (like Om Swami's icon)
          image.setPixelColor(rgbaToInt(255, 255, 255, 255), x, y);
        }
      }
    }
  }

  // Draw Vibrant Sacred Flame & Lotus
  for (let y = 90; y <= 380; y++) {
    for (let x = 145; x <= 367; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < innerR - 2) {
        const nx = (x - cx) / 105;
        const ny = (y - cy - 20) / 135;
        const flameCond = (nx * nx + ny * ny - 0.75);

        if (flameCond < 0) {
          // Crimson-Orange-Gold Gradient
          const t = (y - 90) / 290;
          let r, g, b;
          if (t < 0.35) { r = 241; g = 196; b = 15; }
          else if (t < 0.7) { r = 230; g = 126; b = 34; }
          else { r = 192; g = 57; b = 43; }

          image.setPixelColor(rgbaToInt(r, g, b, 255), x, y);
        }
      }
    }
  }

  // Inner Gold Core
  for (let y = 140; y <= 355; y++) {
    for (let x = 180; x <= 332; x++) {
      const nx = (x - cx) / 72;
      const ny = (y - cy - 25) / 102;
      const flameCond = (nx * nx + ny * ny - 0.75);

      if (flameCond < 0) {
        image.setPixelColor(rgbaToInt(212, 175, 55, 255), x, y);
      }
    }
  }

  // High-Contrast Monogram GT (Dark Charcoal)
  for (let y = 230; y <= 320; y++) {
    for (let x = 185; x <= 328; x++) {
      let isGT = false;
      // G
      const g_dx = x - 230;
      const g_dy = y - 275;
      const g_dist = Math.sqrt(g_dx * g_dx + g_dy * g_dy);

      if (g_dist >= 30 && g_dist <= 44) {
        const angle = Math.atan2(g_dy, g_dx);
        if (!(angle > -0.4 && angle < 0.4)) {
          isGT = true;
        }
      }
      if (x >= 230 && x <= 268 && y >= 272 && y <= 286) isGT = true;
      if (x >= 254 && x <= 268 && y >= 282 && y <= 308) isGT = true;

      // T
      if (x >= 276 && x <= 324 && y >= 234 && y <= 248) isGT = true;
      if (x >= 293 && x <= 307 && y >= 244 && y <= 316) isGT = true;

      if (isGT) {
        image.setPixelColor(rgbaToInt(20, 16, 10, 255), x, y);
      }
    }
  }

  const rootDir = path.join(__dirname, '..');

  await image.write(path.join(rootDir, 'android-chrome-512x512.png'));
  const img192 = image.clone().resize({ w: 192, h: 192 });
  await img192.write(path.join(rootDir, 'android-chrome-192x192.png'));
  const img180 = image.clone().resize({ w: 180, h: 180 });
  await img180.write(path.join(rootDir, 'apple-touch-icon.png'));
  const img96 = image.clone().resize({ w: 96, h: 96 });
  await img96.write(path.join(rootDir, 'favicon-96x96.png'));
  const img48 = image.clone().resize({ w: 48, h: 48 });
  await img48.write(path.join(rootDir, 'favicon-48x48.png'));
  const img32 = image.clone().resize({ w: 32, h: 32 });
  await img32.write(path.join(rootDir, 'favicon-32x32.png'));
  const img16 = image.clone().resize({ w: 16, h: 16 });
  await img16.write(path.join(rootDir, 'favicon-16x16.png'));

  const buf48 = await img48.getBuffer('image/png');
  const buf32 = await img32.getBuffer('image/png');
  const buf16 = await img16.getBuffer('image/png');

  const numImages = 3;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);

  const dirSize = 16 * numImages;
  const offset0 = 6 + dirSize;
  const offset1 = offset0 + buf48.length;
  const offset2 = offset1 + buf32.length;

  const dir = Buffer.alloc(dirSize);

  dir.writeUInt8(48, 0);
  dir.writeUInt8(48, 1);
  dir.writeUInt8(0, 2);
  dir.writeUInt8(0, 3);
  dir.writeUInt16LE(1, 4);
  dir.writeUInt16LE(32, 6);
  dir.writeUInt32LE(buf48.length, 8);
  dir.writeUInt32LE(offset0, 12);

  dir.writeUInt8(32, 16);
  dir.writeUInt8(32, 17);
  dir.writeUInt8(0, 18);
  dir.writeUInt8(0, 19);
  dir.writeUInt16LE(1, 20);
  dir.writeUInt16LE(32, 22);
  dir.writeUInt32LE(buf32.length, 24);
  dir.writeUInt32LE(offset1, 28);

  dir.writeUInt8(16, 32);
  dir.writeUInt8(16, 33);
  dir.writeUInt8(0, 34);
  dir.writeUInt8(0, 35);
  dir.writeUInt16LE(1, 36);
  dir.writeUInt16LE(32, 38);
  dir.writeUInt32LE(buf16.length, 40);
  dir.writeUInt32LE(offset2, 44);

  const icoBuffer = Buffer.concat([header, dir, buf48, buf32, buf16]);
  fs.writeFileSync(path.join(rootDir, 'favicon.ico'), icoBuffer);
  console.log('Saved vibrant white-badge favicons and favicon.ico');
}

createFavicons().catch(err => {
  console.error(err);
  process.exit(1);
});
