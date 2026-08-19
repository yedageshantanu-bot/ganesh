const { Jimp, rgbaToInt } = require('jimp');
const fs = require('fs');
const path = require('path');

async function createFavicons() {
  const SIZE = 512;
  const image = new Jimp({ width: SIZE, height: SIZE, color: 0x00000000 });

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const outerR = 246;
  const innerR = 232;

  // Helper color functions
  function getGoldColor(t) {
    // Gradient from White -> Light Gold -> Dark Gold -> Rich Bronze
    if (t < 0.25) return rgbaToInt(255, 255, 255, 255);
    if (t < 0.6) return rgbaToInt(255, 215, 0, 255);
    if (t < 0.85) return rgbaToInt(212, 175, 55, 255);
    return rgbaToInt(153, 101, 21, 255);
  }

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= outerR) {
        if (dist >= outerR - 14) {
          // Outer Gold Border Ring
          const t = (x + y) / (SIZE * 2);
          image.setPixelColor(getGoldColor(t), x, y);
        } else if (dist >= innerR - 2 && dist <= innerR + 2) {
          // Inner Thin Gold Ring
          image.setPixelColor(rgbaToInt(212, 175, 55, 220), x, y);
        } else {
          // Dark Background Fill with radial subtle glow
          const glow = Math.max(0, 1 - dist / innerR);
          const r = Math.round(15 + glow * 25);
          const g = Math.round(12 + glow * 20);
          const b = Math.round(20 + glow * 15);
          image.setPixelColor(rgbaToInt(r, g, b, 255), x, y);
        }
      }
    }
  }

  // Draw Central Sacred Flame & GT Monogram
  // Draw Flame Petal Background Glow
  for (let y = 100; y <= 350; y++) {
    for (let x = 160; x <= 352; x++) {
      const nx = (x - cx) / 100;
      const ny = (y - cy) / 120;
      // Heart/Flame shape condition: (x^2 + y^2 - 1)^3 - x^2 * y^3 < 0
      const flameCond = (nx * nx + ny * ny - 0.7);
      if (flameCond < 0) {
        const curCol = image.getPixelColor(x, y);
        // Blend gold fire glow
        const glowAlpha = Math.round(80 * (1 - Math.abs(flameCond)));
        if (glowAlpha > 0) {
          image.setPixelColor(rgbaToInt(255, 215, 0, Math.min(255, glowAlpha + 100)), x, y);
        }
      }
    }
  }

  // Draw Crisp Monogram GT
  // G: Circle arc + horizontal bar
  // T: Top bar + vertical stem
  for (let y = 190; y <= 310; y++) {
    for (let x = 170; x <= 340; x++) {
      let isGT = false;
      // Letter G
      const g_dx = x - 225;
      const g_dy = y - 250;
      const g_dist = Math.sqrt(g_dx * g_dx + g_dy * g_dy);

      if (g_dist >= 35 && g_dist <= 52) {
        // Cutout for right opening of G
        const angle = Math.atan2(g_dy, g_dx);
        if (!(angle > -0.4 && angle < 0.4)) {
          isGT = true;
        }
      }
      // G horizontal crossbar
      if (x >= 225 && x <= 265 && y >= 244 && y <= 258) {
        isGT = true;
      }
      // G vertical inner spur
      if (x >= 252 && x <= 265 && y >= 254 && y <= 286) {
        isGT = true;
      }

      // Letter T
      // Top bar
      if (x >= 278 && x <= 335 && y >= 198 && y <= 214) {
        isGT = true;
      }
      // Vertical stem
      if (x >= 298 && x <= 315 && y >= 210 && y <= 300) {
        isGT = true;
      }

      if (isGT) {
        // High contrast pure gold/white text fill
        const goldVal = Math.round(240 + ((x + y) % 15));
        image.setPixelColor(rgbaToInt(255, 248, 220, 255), x, y);
      }
    }
  }

  const rootDir = path.join(__dirname, '..');

  // Save 512x512
  await image.write(path.join(rootDir, 'android-chrome-512x512.png'));
  console.log('Saved android-chrome-512x512.png');

  // Save 192x192
  const img192 = image.clone().resize({ w: 192, h: 192 });
  await img192.write(path.join(rootDir, 'android-chrome-192x192.png'));
  console.log('Saved android-chrome-192x192.png');

  // Save 180x180 (Apple Touch Icon)
  const img180 = image.clone().resize({ w: 180, h: 180 });
  await img180.write(path.join(rootDir, 'apple-touch-icon.png'));
  console.log('Saved apple-touch-icon.png');

  // Save 96x96 (Favicon 96x96 - Multiple of 48 for Google)
  const img96 = image.clone().resize({ w: 96, h: 96 });
  await img96.write(path.join(rootDir, 'favicon-96x96.png'));
  console.log('Saved favicon-96x96.png');

  // Save 48x48 (Favicon 48x48 - Required by Google Search)
  const img48 = image.clone().resize({ w: 48, h: 48 });
  await img48.write(path.join(rootDir, 'favicon-48x48.png'));
  console.log('Saved favicon-48x48.png');

  // Save 32x32
  const img32 = image.clone().resize({ w: 32, h: 32 });
  await img32.write(path.join(rootDir, 'favicon-32x32.png'));
  console.log('Saved favicon-32x32.png');

  // Save 16x16
  const img16 = image.clone().resize({ w: 16, h: 16 });
  await img16.write(path.join(rootDir, 'favicon-16x16.png'));
  console.log('Saved favicon-16x16.png');

  // Create favicon.ico containing PNG buffers for 48, 32, 16
  const buf48 = await img48.getBuffer('image/png');
  const buf32 = await img32.getBuffer('image/png');
  const buf16 = await img16.getBuffer('image/png');

  // ICO header: 6 bytes
  // 0-1: Reserved (0)
  // 2-3: Type (1 = ICO)
  // 4-5: Count of images (3)
  const numImages = 3;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);

  // Each directory entry: 16 bytes
  const dirSize = 16 * numImages;
  const offset0 = 6 + dirSize;
  const offset1 = offset0 + buf48.length;
  const offset2 = offset1 + buf32.length;

  const dir = Buffer.alloc(dirSize);

  // Entry 0: 48x48
  dir.writeUInt8(48, 0);
  dir.writeUInt8(48, 1);
  dir.writeUInt8(0, 2);
  dir.writeUInt8(0, 3);
  dir.writeUInt16LE(1, 4); // Color planes
  dir.writeUInt16LE(32, 6); // Bits per pixel
  dir.writeUInt32LE(buf48.length, 8);
  dir.writeUInt32LE(offset0, 12);

  // Entry 1: 32x32
  dir.writeUInt8(32, 16);
  dir.writeUInt8(32, 17);
  dir.writeUInt8(0, 18);
  dir.writeUInt8(0, 19);
  dir.writeUInt16LE(1, 20);
  dir.writeUInt16LE(32, 22);
  dir.writeUInt32LE(buf32.length, 24);
  dir.writeUInt32LE(offset1, 28);

  // Entry 2: 16x16
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
  console.log('Saved multi-resolution favicon.ico');
}

createFavicons().catch(err => {
  console.error(err);
  process.exit(1);
});
