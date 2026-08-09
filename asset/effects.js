(function () {
  // Prevent duplicate instantiation
  if (window.__antigravityEffectsLoaded) return;
  window.__antigravityEffectsLoaded = true;

  // Detect page type
  function detectPageType() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('written-word')) return 'written-word';
    if (path.includes('before-the-fire')) return 'before-the-fire';
    if (path.includes('the-path-of-vayu')) return 'the-path-of-vayu';
    if (path.includes('vayu-mahesh')) return 'vayu-mahesh';
    if (path.includes('chess')) return 'chess';
    
    const title = document.title.toLowerCase();
    if (title.includes('written word')) return 'written-word';
    if (title.includes('before the fire')) return 'before-the-fire';
    if (title.includes('path of vayu')) return 'the-path-of-vayu';
    if (title.includes('vayu mahesh') || title.includes('mahesh')) return 'vayu-mahesh';
    if (title.includes('chess')) return 'chess';
    return '';
  }

  const activePageType = detectPageType();
  if (activePageType === '') {
    // Only run on supported pages, keep other pages untouched
    return;
  }
  console.log("✅ Ambient Effects Active:", activePageType);

  // Configuration mapping for Written Word tabs (Snow, Leaf, Bird, Feather, Fire only)
  const PAGE_CONFIGS = {
    books: 'ice-crystals',
    articles: 'falling-leaves',
    poems: 'soft-snow',
    quotes: 'lotus-petals',
    default: 'fire-embers'
  };

  // Minimal asset paths (Snow, Leaf, Bird, Feather only)
  const ASSET_PATHS = {
    'leaf-01': 'asset/effect/leaf-01.webp.png',
    'leaf-02': 'asset/effect/leaf-02.webp.png',
    'leaf-03': 'asset/effect/leaf-03.webp.png',
    'leaf-04': 'asset/effect/leaf-04.webp.png',
    'feather-01': 'asset/effect/feather-01.webp.png',
    'feather-02': 'asset/effect/feather-02.webp.png',
    'bird': 'asset/effect/bird-01.webp.png',
    'snowflake-01': 'asset/effect/snowflake-01.webp.png',
    'snowflake-02': 'asset/effect/snowflake-02.webp.png',
    'snowflake-ice': 'asset/effect/snowflake-ice.webp.png'
  };

  // Preloaded image cache
  const IMAGES = {};
  let assetsLoaded = false;

  function loadAssets() {
    let loadedCount = 0;
    const keys = Object.keys(ASSET_PATHS);
    keys.forEach(key => {
      const img = new Image();
      img.src = ASSET_PATHS[key];
      img.onload = () => {
        IMAGES[key] = img;
        loadedCount++;
        if (loadedCount === keys.length) {
          assetsLoaded = true;
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === keys.length) {
          assetsLoaded = true;
        }
      };
    });
  }
  loadAssets();

  // Create Canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'ambientEffectCanvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '2'; // Behind page content, in front of background vignette/parchment
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // State Variables
  let particles = [];
  let currentEffect = 'none';
  let isMobileDevice = window.innerWidth < 768;

  // Accessibility Check
  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
    prefersReducedMotion = e.matches;
  });

  // Get scroll depth for transition triggers (Starts on scroll inside reader overlay)
  function getScrollState() {
    if (document.body.classList.contains('reader-open')) {
      const reader = document.getElementById('articleReader');
      if (reader) {
        return reader.scrollTop >= 20 ? 'reading' : 'landing';
      }
    }
    return 'reading'; // Main tab pages are always active
  }

  // Get active tab from Vayu DOM state
  function getVayuActiveTab() {
    const activeTab = document.querySelector('.sub-tab.active .sub-tab-text');
    if (activeTab) {
      return activeTab.textContent.trim().toLowerCase();
    }
    return '';
  }

  // Determine target effect based on tab and scroll state
  function determineTargetEffect() {
    if (activePageType === 'chess') {
      return 'soft-snow';
    }
    if (activePageType === 'before-the-fire') {
      return 'ice-crystals';
    }
    if (activePageType === 'the-path-of-vayu') {
      return 'falling-leaves';
    }
    if (activePageType === 'vayu-mahesh') {
      return 'distant-birds';
    }

    // If reader is open, choose effect based on reader category and scroll state
    if (document.body.classList.contains('reader-open')) {
      const scrollState = getScrollState();
      if (scrollState === 'landing') {
        return 'none'; // Stopped at the top of reader
      }
      const category = document.body.getAttribute('data-reader-category') || 'poem';
      if (category === 'poem') return 'soft-snow';
      if (category === 'books') return 'distant-birds';
      return 'falling-leaves'; // For articles
    }

    // Main landing page tabs: ALWAYS active
    const hash = window.location.hash.toLowerCase();
    let effectKey = 'default';
    if (hash.includes('books')) effectKey = 'books';
    else if (hash.includes('articles')) effectKey = 'articles';
    else if (hash.includes('poems')) effectKey = 'poems';
    else if (hash.includes('quotes')) effectKey = 'quotes';

    return PAGE_CONFIGS[effectKey] || PAGE_CONFIGS.default;
  }

  // Particle Class
  class Particle {
    constructor(effectType) {
      this.effect = effectType;
      this.isDying = false;
      this.spawnOpacity = 0;
      this.reset(true);
    }

    reset(initialSetup = false) {
      const isFallingEffect = ['falling-leaves', 'soft-snow', 'floating-feathers', 'ice-crystals', 'lotus-petals'].includes(this.effect);
      if (initialSetup) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      } else {
        if (isFallingEffect && this.effect !== 'falling-leaves') {
          // Count how many particles are currently in the center text zone
          const centerMin = width * 0.23;
          const centerMax = width * 0.77;
          let centerCount = 0;
          if (typeof particles !== 'undefined' && particles.length) {
            for (let i = 0; i < particles.length; i++) {
              const p = particles[i];
              if (p !== this && p.x >= centerMin && p.x <= centerMax && !p.isDying) {
                centerCount++;
              }
            }
          }
          
          if (centerCount >= 3) {
            // Force spawn on the left or right 25% margins
            this.x = Math.random() > 0.5 ? Math.random() * centerMin : width - Math.random() * (width - centerMax);
          } else {
            this.x = Math.random() * width;
          }
        } else {
          this.x = Math.random() * width;
        }
        this.y = -50;
      }
      this.vx = 0;
      this.vy = 0;
      this.size = 0;
      this.angle = Math.random() * Math.PI * 2;
      this.rotationSpeed = 0;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = 0;
      this.alpha = 0;
      this.maxAlpha = 0.35 + Math.random() * 0.25;
      this.scale = 1;
      this.assetKey = '';
      this.pulseTimer = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.01 + Math.random() * 0.02;
      this.color = '';

      const reducedMultiplier = prefersReducedMotion ? 0.1 : 1.0;

      switch (this.effect) {
        case 'falling-leaves':
          const leafImages = ['leaf-01', 'leaf-02', 'leaf-03', 'leaf-04'];
          this.assetKey = leafImages[Math.floor(Math.random() * leafImages.length)];
          this.size = 18 + Math.random() * 22;
          this.maxAlpha = 0.15 + Math.random() * 0.25;
          this.vy = (0.25 + Math.random() * 0.45) * reducedMultiplier; // Slow magical hover
          this.vx = (Math.random() - 0.5) * 0.35 * reducedMultiplier;
          this.rotationSpeed = (Math.random() - 0.5) * 0.05 * reducedMultiplier; // Faster tumbling
          this.swaySpeed = 0.008 + Math.random() * 0.015;
          break;

        case 'floating-feathers':
          this.assetKey = Math.random() > 0.5 ? 'feather-01' : 'feather-02';
          this.size = 40 + Math.random() * 25;
          this.vy = (0.3 + Math.random() * 0.3) * reducedMultiplier;
          this.vx = (Math.random() - 0.5) * 0.25 * reducedMultiplier;
          this.rotationSpeed = (Math.random() - 0.5) * 0.01 * reducedMultiplier;
          this.swaySpeed = 0.005 + Math.random() * 0.008;
          break;

        case 'ice-crystals':
          this.assetKey = 'snowflake-ice';
          this.size = 18 + Math.random() * 14; // 18px to 32px (larger, clearer)
          this.vy = (0.35 + Math.random() * 0.45) * reducedMultiplier;
          this.vx = (Math.random() - 0.5) * 0.2 * reducedMultiplier;
          this.swaySpeed = 0.01 + Math.random() * 0.01;
          this.rotationSpeed = (Math.random() - 0.5) * 0.015 * reducedMultiplier; // Gentle spinning
          this.maxAlpha = 0.45 + Math.random() * 0.25; // Highly visible, soft opacity
          break;

        case 'soft-snow':
          if (Math.random() > 0.15) {
            this.assetKey = Math.random() > 0.5 ? 'snowflake-01' : 'snowflake-02';
            this.size = 18 + Math.random() * 12;
          } else {
            this.size = 3.5 + Math.random() * 3.5;
          }
          this.vy = (0.4 + Math.random() * 0.5) * reducedMultiplier;
          this.vx = (Math.random() - 0.5) * 0.2 * reducedMultiplier;
          this.swaySpeed = 0.01 + Math.random() * 0.01;
          break;

        case 'distant-birds':
          this.assetKey = 'bird';
          this.size = 22 + Math.random() * 12;
          this.subType = Math.random() > 0.5 ? 'horizontal' : 'rising';
          
          if (this.subType === 'horizontal') {
            const leftToRight = Math.random() > 0.5;
            this.x = initialSetup ? Math.random() * width : (leftToRight ? -50 : width + 50);
            this.y = height * 0.08 + Math.random() * height * 0.35;
            this.vx = (leftToRight ? 0.35 + Math.random() * 0.4 : -0.35 - Math.random() * 0.4) * reducedMultiplier;
            this.vy = 0;
            this.swaySpeed = 0.05 + Math.random() * 0.05;
            this.scale = leftToRight ? 1 : -1;
          } else {
            this.x = Math.random() * width;
            this.y = initialSetup ? Math.random() * height : height + 50;
            this.vy = -(0.35 + Math.random() * 0.45) * reducedMultiplier;
            this.vx = (Math.random() > 0.5 ? 0.2 + Math.random() * 0.3 : -0.2 - Math.random() * 0.3) * reducedMultiplier;
            this.swaySpeed = 0.05 + Math.random() * 0.05;
            this.scale = this.vx > 0 ? 1 : -1;
          }
          break;

        case 'fire-embers':
          this.assetKey = '';
          this.size = 1.5 + Math.random() * 4.5;
          this.x = Math.random() * width;
          this.subType = Math.random() > 0.5 ? 'up' : 'down';
          
          if (this.subType === 'up') {
            this.y = initialSetup ? Math.random() * height : height + 20;
            this.vy = -(0.4 + Math.random() * 0.8) * reducedMultiplier;
          } else {
            this.y = initialSetup ? Math.random() * height : -20;
            this.vy = (0.4 + Math.random() * 0.8) * reducedMultiplier;
          }
          
          this.vx = (Math.random() - 0.5) * 0.35 * reducedMultiplier;
          this.swaySpeed = 0.01 + Math.random() * 0.02;
          this.sway = Math.random() * Math.PI * 2;
          this.maxAlpha = 0.35 + Math.random() * 0.45;
          const fireColors = ['#ff3c00', '#ff6a00', '#ff9900', '#ffbb00', '#ff5500', '#e22d00'];
          this.color = fireColors[Math.floor(Math.random() * fireColors.length)];
          break;

        case 'before-the-fire':
          this.assetKey = '';
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.radius = 2 + Math.random() * 4; // Start very small
          this.maxRadius = 35 + Math.random() * 40; // Expand to 35px - 75px
          this.growthSpeed = (0.45 + Math.random() * 0.65) * reducedMultiplier; // Expand slowly/zen
          this.maxAlpha = 0.18 + Math.random() * 0.17; // Faint ripple outline
          break;

        case 'path-of-vayu':
          this.assetKey = '';
          this.size = 220 + Math.random() * 200; // Volumetric wind clouds (220px to 420px)
          this.x = initialSetup ? Math.random() * width : -this.size * 0.8;
          this.y = Math.random() * height;
          this.vx = (0.55 + Math.random() * 0.45) * reducedMultiplier; // Gusty horizontal wind drift
          this.vy = (Math.random() - 0.5) * 0.08 * reducedMultiplier;
          this.swaySpeed = 0.004 + Math.random() * 0.005;
          this.sway = Math.random() * Math.PI * 2;
          this.maxAlpha = 0.15 + Math.random() * 0.15; // Faint, wind-like mist
          break;

        case 'vayu-embers':
          this.assetKey = '';
          this.size = 1.5 + Math.random() * 2.0; // Small sparks/ashes
          this.y = Math.random() * height;
          this.leftToRight = Math.random() > 0.5;
          if (this.leftToRight) {
            this.x = initialSetup ? Math.random() * width : -20;
            this.vx = (1.2 + Math.random() * 1.0) * reducedMultiplier; // Drifting right fast
          } else {
            this.x = initialSetup ? Math.random() * width : width + 20;
            this.vx = -(1.2 + Math.random() * 1.0) * reducedMultiplier; // Drifting left fast
          }
          this.vy = -(0.15 + Math.random() * 0.35) * reducedMultiplier; // Floating upwards slowly
          const emberColors = ['#ff4500', '#ff6a00', '#ff8c00', '#ffa500', '#ff3c00', '#6f6f6f', '#4f4f4f'];
          this.color = emberColors[Math.floor(Math.random() * emberColors.length)];
          this.maxAlpha = 0.35 + Math.random() * 0.35;
          break;

        case 'lotus-petals':
          this.assetKey = '';
          this.size = 14 + Math.random() * 10; // Petal length
          
          if (initialSetup) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (0.2 + Math.random() * 0.4) * reducedMultiplier;
            this.vy = (0.7 + Math.random() * 0.6) * reducedMultiplier;
          } else {
            // Spawn from one of 3 edges: Top (0), Left (1), Right (2)
            const edge = Math.floor(Math.random() * 3);
            if (edge === 0) {
              // Top edge
              this.x = Math.random() * width;
              this.y = -this.size - 10;
              this.vx = (Math.random() - 0.5) * 0.4 * reducedMultiplier; // Falls mostly straight down
              this.vy = (0.7 + Math.random() * 0.6) * reducedMultiplier;
            } else if (edge === 1) {
              // Left edge
              this.x = -this.size - 10;
              this.y = Math.random() * height * 0.6; // Upper 60% of screen
              this.vx = (0.6 + Math.random() * 0.8) * reducedMultiplier; // Drifts right actively
              this.vy = (0.5 + Math.random() * 0.5) * reducedMultiplier; // Falls down
            } else {
              // Right edge
              this.x = width + this.size + 10;
              this.y = Math.random() * height * 0.6; // Upper 60% of screen
              this.vx = -(0.6 + Math.random() * 0.8) * reducedMultiplier; // Drifts left actively
              this.vy = (0.5 + Math.random() * 0.5) * reducedMultiplier; // Falls down
            }
          }
          
          this.swaySpeed = 0.005 + Math.random() * 0.005;
          this.sway = Math.random() * Math.PI * 2;
          this.angle = Math.random() * Math.PI * 2;
          this.rotationSpeed = (Math.random() - 0.5) * 0.02 * reducedMultiplier;
          const petalColors = ['#ffd1dc', '#ffb7c5', '#ff9ebb', '#fda4ba', '#fcc2d7'];
          this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
          this.maxAlpha = 0.30 + Math.random() * 0.25;
          break;
      }
    }

    update() {
      if (this.spawnOpacity < 1 && !this.isDying) {
        this.spawnOpacity += 0.02;
      }

      if (this.isDying) {
        this.spawnOpacity -= 0.03;
        if (this.spawnOpacity <= 0) {
          return false;
        }
      }

      let centralReduction = 1.0;
      if (this.effect !== 'before-the-fire' && this.effect !== 'path-of-vayu' && this.x > width * 0.25 && this.x < width * 0.75) {
        centralReduction = 0.55;
      }

      this.alpha = this.maxAlpha * this.spawnOpacity * centralReduction;

      const reducedMultiplier = prefersReducedMotion ? 0.1 : 1.0;

      switch (this.effect) {
        case 'falling-leaves':
          this.y += this.vy;
          this.angle += this.rotationSpeed;
          this.sway += this.swaySpeed;
          this.x += (Math.sin(this.sway) * 0.8 + this.vx) * reducedMultiplier; // Wider magical sway

          if (this.y > height + 50 || this.x < -50 || this.x > width + 50) {
            if (this.isDying) return false;
            if (particles.length > getBaselineCount(this.effect)) return false;
            this.reset();
          }
          break;

        case 'floating-feathers':
          this.y += this.vy;
          this.angle += this.rotationSpeed;
          this.sway += this.swaySpeed;
          this.x += (Math.sin(this.sway) * 0.75 + this.vx) * reducedMultiplier;

          if (this.y > height + 60 || this.x < -60 || this.x > width + 60) {
            if (this.isDying) return false;
            if (particles.length > getBaselineCount(this.effect)) return false;
            this.reset();
          }
          break;

        case 'ice-crystals':
          this.y += this.vy;
          this.angle += this.rotationSpeed;
          this.sway += this.swaySpeed;
          this.x += (Math.sin(this.sway) * 0.15 + this.vx) * reducedMultiplier;

          if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
            if (this.isDying) return false;
            if (particles.length > getBaselineCount(this.effect)) return false;
            this.reset();
          }
          break;

        case 'soft-snow':
          this.y += this.vy;
          this.sway += this.swaySpeed;
          this.x += (Math.sin(this.sway) * 0.15 + this.vx) * reducedMultiplier;

          if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
            if (this.isDying) return false;
            if (particles.length > getBaselineCount(this.effect)) return false;
            this.reset();
          }
          break;

        case 'distant-birds':
          this.x += this.vx;
          this.pulseTimer += this.swaySpeed;
          
          if (this.subType === 'rising') {
            this.y += this.vy;
            this.y += Math.sin(this.pulseTimer) * 0.15;
            
            if (this.y < -50 || this.x < -100 || this.x > width + 100) {
              if (this.isDying) return false;
              if (particles.length > getBaselineCount(this.effect)) return false;
              this.reset();
            }
          } else {
            this.y += Math.sin(this.pulseTimer) * 0.15;
            
            if ((this.vx > 0 && this.x > width + 100) || (this.vx < 0 && this.x < -100)) {
            if (this.isDying) return false;
            if (particles.length > getBaselineCount(this.effect)) return false;
            this.reset();
          }
          }
          break;

        case 'fire-embers':
          this.y += this.vy;
          this.sway += this.swaySpeed;
          this.x += (Math.sin(this.sway) * 0.25 + this.vx) * reducedMultiplier;
          
          if (this.size > 0.5) {
            this.size -= 0.005;
          }

          if (this.subType === 'up') {
            if (this.y < -20 || this.x < -20 || this.x > width + 20 || this.size <= 0.5) {
              if (this.isDying) return false;
              if (particles.length > getBaselineCount(this.effect)) return false;
              this.reset();
            }
          } else {
            if (this.y > height + 20 || this.x < -20 || this.x > width + 20 || this.size <= 0.5) {
              if (this.isDying) return false;
              if (particles.length > getBaselineCount(this.effect)) return false;
              this.reset();
            }
          }
          break;

        case 'before-the-fire':
          this.radius += this.growthSpeed;

          if (this.radius >= this.maxRadius) {
            if (this.isDying) return false;
            if (particles.length > getBaselineCount(this.effect)) return false;
            this.reset();
          }
          break;

        case 'path-of-vayu':
          this.x += this.vx;
          this.y += this.vy;
          this.sway += this.swaySpeed;
          this.y += Math.sin(this.sway) * 0.05;

          if (this.x > width + this.size * 1.5) {
            if (this.isDying) return false;
            if (particles.length > getBaselineCount(this.effect)) return false;
            this.reset();
          }
          break;

        case 'vayu-embers':
          this.x += this.vx;
          this.y += this.vy;
          if (this.size > 0.4) {
            this.size -= 0.003;
          }

          const outOfBounds = this.leftToRight ? (this.x > width + 20) : (this.x < -20);
          if (outOfBounds || this.y < -20 || this.size <= 0.4) {
            if (this.isDying) return false;
            if (particles.length > getBaselineCount(this.effect)) return false;
            this.reset();
          }
          break;

        case 'lotus-petals':
          this.x += (Math.sin(this.sway) * 0.35 + this.vx) * reducedMultiplier;
          this.y += this.vy;
          this.angle += this.rotationSpeed;
          this.sway += this.swaySpeed;

          if (this.y > height + this.size + 10 || this.x < -this.size - 20 || this.x > width + this.size + 20) {
            if (this.isDying) return false;
            if (particles.length > getBaselineCount(this.effect)) return false;
            this.reset();
          }
          break;
      }

      return true;
    }

    draw() {
      if (this.assetKey) {
        if (IMAGES[this.assetKey]) {
          const img = IMAGES[this.assetKey];
          ctx.save();
          ctx.globalAlpha = this.alpha;
          ctx.translate(this.x, this.y);

          if (this.effect === 'distant-birds') {
            const flap = 0.8 + Math.sin(this.pulseTimer) * 0.25;
            ctx.scale(this.scale, flap);
            ctx.drawImage(img, -this.size / 2, -this.size / 2, this.size, this.size);
          } else {
            ctx.rotate(this.angle);
            ctx.drawImage(img, -this.size / 2, -this.size / 2, this.size, this.size);
          }

          ctx.restore();
        }
        return; // Prevent fallbacks for image-based particles before they load
      }

      ctx.save();
      ctx.globalAlpha = this.alpha;

      if (this.effect === 'soft-snow') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#ffffff';
        ctx.fill();
      } else if (this.effect === 'fire-embers') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5 + Math.random() * 5;
        ctx.shadowColor = this.color;
        ctx.fill();
      } else if (this.effect === 'before-the-fire') {
        const currentAlpha = 1.0 - this.radius / this.maxRadius;
        if (currentAlpha > 0) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(92, 74, 50, ${currentAlpha})`; // Faint charcoal ring matching text
          ctx.lineWidth = 1.0;
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Second concentric inner ripple ring for volumetric detail
          ctx.beginPath();
          ctx.strokeStyle = `rgba(92, 74, 50, ${currentAlpha * 0.45})`;
          ctx.lineWidth = 0.8;
          ctx.arc(this.x, this.y, this.radius * 0.65, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (this.effect === 'path-of-vayu') {
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        // Soft airy-slate-blue gusty wind clouds (using solid stops, relying on ctx.globalAlpha)
        grad.addColorStop(0, 'rgba(160, 175, 185, 1.0)');
        grad.addColorStop(0.4, 'rgba(160, 175, 185, 0.75)');
        grad.addColorStop(0.7, 'rgba(160, 175, 185, 0.25)');
        grad.addColorStop(1, 'rgba(160, 175, 185, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.effect === 'vayu-embers') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        // Glow for hot sparks, no glow for dark gray ashes
        if (this.color.startsWith('#ff')) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = this.color;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      } else if (this.effect === 'lotus-petals') {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Beautiful organic petal shape
        ctx.moveTo(0, -this.size / 2);
        ctx.quadraticCurveTo(-this.size * 0.45, 0, 0, this.size / 2);
        ctx.quadraticCurveTo(this.size * 0.45, 0, 0, -this.size / 2);
        ctx.fill();

        // Delicate midrib/spine
        ctx.strokeStyle = 'rgba(230, 100, 130, 0.45)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, this.size / 2);
        ctx.lineTo(0, -this.size / 5);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Centralized baseline count manager
  function getBaselineCount(effect) {
    let count = 40; // Default count
    if (effect === 'falling-leaves') count = 65;
    else if (effect === 'ice-crystals') count = 35;
    else if (effect === 'soft-snow') count = 40;
    else if (effect === 'floating-feathers') count = 10;
    else if (effect === 'distant-birds') count = 35;
    else if (effect === 'fire-embers') count = 75;
    else if (effect === 'before-the-fire') count = 14;
    else if (effect === 'path-of-vayu') count = 15;
    else if (effect === 'vayu-embers') count = 25;
    else if (effect === 'lotus-petals') count = 30;
    
    if (prefersReducedMotion) count = Math.max(2, Math.floor(count * 0.3));
    if (isMobileDevice) count = Math.floor(count * 0.5);
    return count;
  }

  // Effect manager
  function populateParticles(effect, count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(new Particle(effect));
    }
    return arr;
  }

  function handleEffectTransition(targetEffect) {
    if (currentEffect === targetEffect) return;

    particles.forEach(p => {
      p.isDying = true;
    });

    if (targetEffect === 'none') {
      currentEffect = 'none';
      return;
    }

    const count = getBaselineCount(targetEffect);
    const newParticles = populateParticles(targetEffect, count);
    particles = particles.concat(newParticles);
    currentEffect = targetEffect;
  }

  // Scroll booster: Spawns new particles on scroll for ALL effects
  let lastScrollTime = 0;
  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScrollTime > 60) { // Throttle scroll spawn
      lastScrollTime = now;
      
      const maxCount = getBaselineCount(currentEffect) * 1.5; // Max allowed particles during scroll boost
      if (currentEffect !== 'none' && particles.length < maxCount) {
        const spawnCount = isMobileDevice ? 1 : 2; // Spawn 1-2 particles per scroll trigger
        for (let i = 0; i < spawnCount; i++) {
          const p = new Particle(currentEffect);
          p.spawnOpacity = 0.6; // Start visible
          
          if (['falling-leaves', 'soft-snow', 'floating-feathers', 'ice-crystals', 'lotus-petals'].includes(currentEffect)) {
            p.y = -20; // Start just above screen top
            if (currentEffect === 'falling-leaves') {
              p.x = Math.random() * width;
            } else {
              // Spawn strictly inside left or right 25% margins to keep text clear
              p.x = Math.random() > 0.5 ? Math.random() * width * 0.23 : width - Math.random() * (width * 0.23);
            }
          } else if (currentEffect === 'fire-embers') {
            p.y = p.subType === 'up' ? height + 20 : -20;
            p.x = Math.random() * width;
          } else if (currentEffect === 'vayu-embers') {
            p.x = p.leftToRight ? -20 : width + 20;
            p.y = Math.random() * height;
          } else if (currentEffect === 'path-of-vayu') {
            p.x = -p.size * 0.8;
            p.y = Math.random() * height;
          } else if (currentEffect === 'before-the-fire') {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.radius = 2;
          } else if (currentEffect === 'distant-birds') {
            p.x = p.scale > 0 ? -50 : width + 50;
            p.y = height * 0.08 + Math.random() * height * 0.35;
          }
          
          particles.push(p);
        }
      }
    }
  }, true); // Capture scroll on scrollable viewports

  // Animation Loop
  function animate() {
    const targetEffect = determineTargetEffect();
    handleEffectTransition(targetEffect);

    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const alive = particles[i].update();
      if (!alive) {
        particles.splice(i, 1);
      } else {
        particles[i].draw();
      }
    }

    requestAnimationFrame(animate);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    animate();
  } else {
    window.addEventListener('DOMContentLoaded', animate);
  }

})();
