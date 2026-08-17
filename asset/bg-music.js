(function () {
  if (window.__globalBgMusicInitialized) return;
  window.__globalBgMusicInitialized = true;

  const AUDIO_SRC = 'WhatsApp Audio 2026-08-12 at 11.13.34 AM.mpeg';

  // Inject equalizer CSS if not already present
  if (!document.getElementById('global-bg-music-styles')) {
    const style = document.createElement('style');
    style.id = 'global-bg-music-styles';
    style.textContent = `
      .global-sound-toggle, .sound-toggle {
        display: inline-flex !important;
        align-items: flex-end !important;
        gap: 3.5px !important;
        cursor: pointer !important;
        height: 18px !important;
        padding: 0 4px !important;
        margin-left: 14px !important;
        vertical-align: middle !important;
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      .global-sound-toggle.is-fixed {
        position: fixed !important;
        top: 24px !important;
        right: 90px !important;
        left: auto !important;
        margin-left: 0 !important;
        z-index: 99999 !important;
      }
      .global-sound-toggle:hover, .sound-toggle:hover {
        transform: scale(1.15);
      }
      .global-sound-toggle .eq-bar, .sound-toggle .eq-bar {
        width: 3px;
        height: 100%;
        background: currentColor;
        transform-origin: bottom;
        animation: globalBounceEq 1.2s ease-in-out infinite alternate;
        opacity: 0.85;
        border-radius: 1px;
      }
      .global-sound-toggle .eq-bar:nth-child(1), .sound-toggle .eq-bar:nth-child(1) { animation-duration: 0.8s; }
      .global-sound-toggle .eq-bar:nth-child(2), .sound-toggle .eq-bar:nth-child(2) { animation-delay: 0.2s; animation-duration: 1.2s; }
      .global-sound-toggle .eq-bar:nth-child(3), .sound-toggle .eq-bar:nth-child(3) { animation-delay: 0.4s; animation-duration: 0.9s; }
      .global-sound-toggle .eq-bar:nth-child(4), .sound-toggle .eq-bar:nth-child(4) { animation-delay: 0.1s; animation-duration: 1.4s; }

      .global-sound-toggle.paused .eq-bar,
      .global-sound-toggle.silent .eq-bar,
      .sound-toggle.paused .eq-bar,
      .sound-toggle.silent .eq-bar {
        animation: none !important;
        transform: scaleY(0.2) !important;
        opacity: 0.4 !important;
      }
      @keyframes globalBounceEq {
        0% { transform: scaleY(0.2); }
        100% { transform: scaleY(1); }
      }
      @media (max-width: 768px) {
        .global-sound-toggle, .sound-toggle {
          height: 15px !important;
          margin-left: 8px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  let audio = document.getElementById('vayuMusic') || document.getElementById('globalBgMusic');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'globalBgMusic';
    audio.loop = true;
    audio.preload = 'auto';
    const source = document.createElement('source');
    source.src = AUDIO_SRC;
    source.type = 'audio/mpeg';
    audio.appendChild(source);
    document.body.appendChild(audio);
  } else {
    audio.loop = true;
    let source = audio.querySelector('source');
    if (source) {
      source.src = AUDIO_SRC;
    } else {
      audio.src = AUDIO_SRC;
    }
  }

  // Restore saved playback position seamlessly across page navigations
  function applySavedTime() {
    const savedTime = sessionStorage.getItem('bgMusicCurrentTime');
    if (savedTime) {
      const t = parseFloat(savedTime);
      if (!isNaN(t) && isFinite(t) && t > 0) {
        try {
          if (Math.abs(audio.currentTime - t) > 1.5) {
            audio.currentTime = t;
          }
        } catch (e) {}
      }
    }
  }

  audio.addEventListener('loadedmetadata', applySavedTime);
  audio.addEventListener('canplay', applySavedTime);
  applySavedTime();

  function saveCurrentTime() {
    if (!audio.paused && audio.currentTime > 0) {
      sessionStorage.setItem('bgMusicCurrentTime', audio.currentTime.toString());
    }
  }

  audio.addEventListener('timeupdate', saveCurrentTime);
  window.addEventListener('beforeunload', saveCurrentTime);
  window.addEventListener('pagehide', saveCurrentTime);

  let toggleBtn = document.getElementById('soundToggle') || document.querySelector('.sound-toggle');
  if (!toggleBtn) {
    toggleBtn = document.createElement('div');
    toggleBtn.id = 'soundToggle';
    toggleBtn.className = 'global-sound-toggle silent';
    toggleBtn.title = 'Toggle Music';
    toggleBtn.innerHTML = `
      <div class="eq-bar"></div>
      <div class="eq-bar"></div>
      <div class="eq-bar"></div>
      <div class="eq-bar"></div>
    `;

    // Attach inline into header next to logo if present
    const logoEl = document.querySelector('.logo-group') || document.querySelector('.gallery-logo') || document.querySelector('.logo') || document.querySelector('.brand-wrap') || document.querySelector('.header-logo');
    if (logoEl) {
      if (logoEl.classList.contains('logo-group')) {
        logoEl.appendChild(toggleBtn);
      } else if (logoEl.parentElement) {
        let wrap = logoEl.parentElement.querySelector('.logo-wrapper');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'logo-wrapper';
          wrap.style.cssText = 'display: inline-flex; align-items: center; gap: 12px;';
          logoEl.parentElement.insertBefore(wrap, logoEl);
          wrap.appendChild(logoEl);
        }
        wrap.appendChild(toggleBtn);
      } else {
        toggleBtn.classList.add('is-fixed');
        document.body.appendChild(toggleBtn);
      }
    } else {
      toggleBtn.classList.add('is-fixed');
      document.body.appendChild(toggleBtn);
    }
  }

  function updateToggleState(isPlaying) {
    if (isPlaying) {
      toggleBtn.classList.remove('silent', 'paused');
    } else {
      toggleBtn.classList.add('paused');
    }
  }

  function playAudio() {
    audio.volume = 0.7;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        localStorage.setItem('bgMusicState', 'playing');
        updateToggleState(true);
      }).catch((err) => {
        console.log("Autoplay waiting for interaction:", err);
      });
    }
  }

  function pauseAudio() {
    audio.pause();
    localStorage.setItem('bgMusicState', 'paused');
    updateToggleState(false);
  }

  const savedState = localStorage.getItem('bgMusicState');
  if (savedState === 'paused') {
    pauseAudio();
  } else {
    playAudio();
  }

  toggleBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!audio.paused) {
      pauseAudio();
    } else {
      playAudio();
    }
  });

  const handleFirstInteraction = function () {
    const currentState = localStorage.getItem('bgMusicState');
    if (currentState !== 'paused' && audio.paused) {
      playAudio();
    }
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
    document.removeEventListener('keydown', handleFirstInteraction);
  };

  document.addEventListener('click', handleFirstInteraction);
  document.addEventListener('touchstart', handleFirstInteraction);
  document.addEventListener('keydown', handleFirstInteraction);
})();
