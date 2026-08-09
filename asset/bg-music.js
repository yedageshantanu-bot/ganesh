(function () {
  if (window.__globalBgMusicInitialized) return;
  window.__globalBgMusicInitialized = true;

  const AUDIO_SRC = 'asset/background-music.mp3';

  // Inject equalizer CSS if not already present
  if (!document.getElementById('global-bg-music-styles')) {
    const style = document.createElement('style');
    style.id = 'global-bg-music-styles';
    style.textContent = `
      .global-sound-toggle {
        position: fixed;
        top: 24px;
        right: 120px;
        z-index: 9999;
        display: flex;
        align-items: flex-end;
        gap: 3.5px;
        cursor: pointer;
        height: 20px;
        padding: 5px 10px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 20px;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        transition: all 0.3s ease;
      }
      .global-sound-toggle:hover {
        background: rgba(0, 0, 0, 0.7);
        border-color: rgba(255, 255, 255, 0.5);
        transform: scale(1.05);
      }
      .global-sound-toggle .eq-bar,
      .sound-toggle .eq-bar {
        width: 3px;
        height: 100%;
        background: #ffffff;
        transform-origin: bottom;
        animation: globalBounceEq 1.2s ease-in-out infinite alternate;
        opacity: 0.9;
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
        .global-sound-toggle {
          top: 18px;
          right: 80px;
          height: 18px;
          padding: 4px 8px;
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
    document.body.appendChild(toggleBtn);
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
