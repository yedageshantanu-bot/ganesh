const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

// 1. Create clean SVG representation
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="30%" stop-color="#FFE57F"/>
      <stop offset="70%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#996515"/>
    </linearGradient>
    <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1A150A"/>
      <stop offset="100%" stop-color="#050506"/>
    </radialGradient>
  </defs>
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="248" fill="url(#bgGlow)" stroke="url(#goldGrad)" stroke-width="12"/>
  <circle cx="256" cy="256" r="230" fill="none" stroke="#D4AF37" stroke-width="2" opacity="0.6"/>
  <!-- Central Sacred Flame Motif -->
  <path d="M 256 100 C 275 160 330 200 330 260 C 330 310 295 340 256 340 C 217 340 182 310 182 260 C 182 200 237 160 256 100 Z" fill="url(#fireGrad)" opacity="0.25"/>
  <path d="M 256 140 C 270 190 310 220 310 265 C 310 300 285 320 256 320 C 227 320 202 300 202 265 C 202 220 242 190 256 140 Z" fill="url(#goldGrad)" opacity="0.4"/>
  <!-- Vector Monogram GT -->
  <!-- Letter G -->
  <path d="M 225 215 C 210 215 195 225 195 250 C 195 275 210 285 228 285 C 242 285 252 276 254 263 L 230 263 L 230 250 L 268 250 L 268 288 C 258 296 244 300 226 300 C 198 300 178 281 178 250 C 178 219 198 200 228 200 C 244 200 258 206 267 216 L 254 228 C 247 220 237 215 225 215 Z" fill="url(#goldGrad)"/>
  <!-- Letter T -->
  <path d="M 275 202 L 330 202 L 330 216 L 311 216 L 311 298 L 294 298 L 294 216 L 275 216 Z" fill="url(#goldGrad)"/>
</svg>`;

fs.writeFileSync(path.join(__dirname, '..', 'favicon.svg'), svgContent, 'utf8');
console.log('Saved favicon.svg');
