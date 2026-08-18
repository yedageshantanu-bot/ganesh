(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // ── Dynamic Word Wrapper for Premium Reveals ──
    document.querySelectorAll('.landing-title').forEach(title => {
      const text = title.textContent.trim();
      title.innerHTML = '';
      text.split(' ').forEach((word, wordIndex, array) => {
        const wordWrap = document.createElement('span');
        wordWrap.className = 'word-wrap';

        const wordInner = document.createElement('span');
        wordInner.className = 'word-inner';
        wordInner.textContent = word;

        wordWrap.appendChild(wordInner);
        title.appendChild(wordWrap);

        if (wordIndex < array.length - 1) {
          title.appendChild(document.createTextNode(' '));
        }
      });
    });

    // ── Parallax Doves Effect ──
    window.addEventListener('mousemove', (e) => {
      if (typeof isMobile === 'function' && isMobile()) return;
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;

      const activeViewport = document.querySelector('.tab-viewport.active') || document.querySelector('.tab-viewport');
      if (!activeViewport) return;

      const leftDove = activeViewport.querySelector('.dove-left');
      const rightDove = activeViewport.querySelector('.dove-right');

      if (leftDove && typeof gsap !== 'undefined') {
        gsap.to(leftDove, {
          x: -normX * 35,
          y: -normY * 20,
          rotation: -normX * 8,
          duration: 0.8,
          ease: 'power1.out'
        });
      }
      if (rightDove && typeof gsap !== 'undefined') {
        gsap.to(rightDove, {
          x: normX * 35,
          y: -normY * 20,
          rotation: normX * 8,
          duration: 0.8,
          ease: 'power1.out'
        });
      }
    });

    // ── Scroll Indicator and Explorer Clicks ──
    document.querySelectorAll('.landing-screen').forEach((screen) => {
      screen.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;

        const container = screen.closest('.viewport-scroll-container');
        if (container && typeof gsap !== 'undefined') {
          gsap.to(container, {
            scrollTop: window.innerHeight,
            duration: 1.2,
            ease: 'power3.inOut'
          });
        }
      });
    });

    // ── Scroll Progress Bar Updater ──
    const progressBar = document.getElementById('readerProgressBar');
    const scrollContainers = document.querySelectorAll('.viewport-scroll-container');

    scrollContainers.forEach(container => {
      container.addEventListener('scroll', () => {
        if (progressBar) {
          const winScroll = container.scrollTop;
          const height = container.scrollHeight - container.clientHeight;
          if (height > 0) {
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
          }
        }
      });
    });

    // ── Initial Viewport Reveal Animations ──
    if (typeof gsap !== 'undefined') {
      const activeViewport = document.querySelector('.tab-viewport.active') || document.querySelector('.tab-viewport');
      if (activeViewport) {
        const titleWords = activeViewport.querySelectorAll('.word-inner');
        const desc = activeViewport.querySelector('.landing-desc');
        const eyebrow = activeViewport.querySelector('.landing-eyebrow');
        const quote = activeViewport.querySelector('.quote-wrap');

        if (eyebrow) {
          gsap.fromTo(eyebrow,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.2 }
          );
        }

        if (titleWords.length > 0) {
          gsap.fromTo(titleWords,
            { y: '100%', opacity: 0 },
            { y: '0%', opacity: 1, duration: 0.8, stagger: 0.04, ease: 'power3.out', delay: 0.3 }
          );
        }

        if (quote) {
          gsap.fromTo(quote,
            { x: 30, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.7 }
          );
        }

        if (desc) {
          gsap.fromTo(desc,
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.6 }
          );
        }
      }
    }
  });
})();
