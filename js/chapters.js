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

    // ── Seamless Next Chapter Navigation Engine ──
    const subTabs = Array.from(document.querySelectorAll('.sub-tab'));
    const activeTab = document.querySelector('.sub-tab.active');
    const activeIndex = activeTab ? subTabs.indexOf(activeTab) : -1;

    let nextHref = '';
    let nextNum = '';
    let nextTitle = '';
    let prevHref = '';

    // Book sequencing configuration for chapter 4 wrap-around
    const bookNextMap = {
      'before-the-fire': { href: '/chapters/the-path-of-vayu/chapter-1/', title: 'The Fire That Would Not Let Me Sleep (The Path of Vayu)', num: '01' },
      'the-path-of-vayu': { href: '/chapters/chess/chapter-1/', title: 'The First Move (Chess)', num: '01' },
      'chess': { href: '/chapters/vayu-mahesh/chapter-1/', title: 'Why Temple? (Vayu Mahesh)', num: '01' },
      'vayu-mahesh': { href: '/chapters/before-the-fire/chapter-1/', title: 'The Boy From Nashik (Before the Fire)', num: '01' }
    };

    const bookPrevMap = {
      'the-path-of-vayu': { href: '/chapters/before-the-fire/chapter-4/' },
      'chess': { href: '/chapters/the-path-of-vayu/chapter-4/' },
      'vayu-mahesh': { href: '/chapters/chess/chapter-4/' },
      'before-the-fire': { href: '/chapters/vayu-mahesh/chapter-4/' }
    };

    const currentPath = window.location.pathname;

    if (activeIndex !== -1 && activeIndex < subTabs.length - 1) {
      const nextTab = subTabs[activeIndex + 1];
      nextHref = nextTab.getAttribute('href');
      nextNum = nextTab.querySelector('.sub-tab-num')?.textContent.trim() || `0${activeIndex + 2}`;
      nextTitle = nextTab.querySelector('.sub-tab-text')?.textContent.trim() || 'Next Chapter';
    } else {
      for (const key in bookNextMap) {
        if (currentPath.includes(key)) {
          nextHref = bookNextMap[key].href;
          nextTitle = bookNextMap[key].title;
          nextNum = bookNextMap[key].num;
          break;
        }
      }
    }

    if (activeIndex > 0) {
      prevHref = subTabs[activeIndex - 1].getAttribute('href');
    } else {
      for (const key in bookPrevMap) {
        if (currentPath.includes(key)) {
          prevHref = bookPrevMap[key].href;
          break;
        }
      }
    }

    // Update bottom arrow links for Next & Previous
    const bottomArrows = document.querySelectorAll('.bottom-arrow');
    if (bottomArrows.length >= 2) {
      if (prevHref) bottomArrows[0].setAttribute('href', prevHref);
      if (nextHref) bottomArrows[1].setAttribute('href', nextHref);
    }

    // Helper for luxury transition on click
    function navigateWithTransition(url) {
      if (!url || url === '#') return;
      if (typeof gsap !== 'undefined') {
        gsap.to(['.tab-viewports', '.bottom-tabs-bar', '.header', '#floatingNextBar'], {
          opacity: 0,
          y: -15,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => {
            window.location.href = url;
          }
        });
      } else {
        window.location.href = url;
      }
    }

    // Dynamic Injection of End-of-Chapter Hero Card
    if (nextHref) {
      const scrollContainer = document.querySelector('.viewport-scroll-container');
      if (scrollContainer) {
        // Create Hero Wrapper & Card
        const heroWrapper = document.createElement('div');
        heroWrapper.className = 'next-chapter-hero-wrapper';

        const heroCard = document.createElement('div');
        heroCard.className = 'next-chapter-hero-card';
        heroCard.innerHTML = `
          <div class="next-chapter-divider">
            <span class="next-chapter-badge">CONTINUE THE JOURNEY</span>
          </div>
          <a href="${nextHref}" class="next-chapter-action-btn">
            <div class="next-chapter-info">
              <span class="next-chapter-num">NEXT CHAPTER — ${nextNum}</span>
              <h3 class="next-chapter-name">${nextTitle}</h3>
            </div>
            <div class="next-chapter-icon-circle">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>
          </a>
        `;
        heroWrapper.appendChild(heroCard);

        // Insert before final spacer if exists
        const lastSpacer = scrollContainer.querySelector('div[style*="height: 200px"]') || scrollContainer.querySelector('div[style*="height: 150px"]');
        if (lastSpacer) {
          lastSpacer.parentNode.insertBefore(heroWrapper, lastSpacer);
        } else {
          const landingScreen = scrollContainer.querySelector('.landing-screen') || scrollContainer;
          landingScreen.appendChild(heroWrapper);
        }
      }
    }


    // Attach smooth transition handlers to all navigation links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.next-chapter-action-btn, .bottom-arrow, .sub-tab');
      if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          e.preventDefault();
          navigateWithTransition(href);
        }
      }
    });

    // Keyboard Arrow Navigation (Right Arrow = Next, Left Arrow = Prev)
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' && nextHref) {
        navigateWithTransition(nextHref);
      } else if (e.key === 'ArrowLeft' && prevHref) {
        navigateWithTransition(prevHref);
      }
    });
  });
})();


