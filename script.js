/* =========================================================
   Rodopi Solar – script.js
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const themeToggle = document.getElementById('themeToggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let themeSwitchTimer;

  function applyTheme(theme, persist) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    const isDark = nextTheme === 'dark';
    const root = document.documentElement;

    if (persist) {
      clearTimeout(themeSwitchTimer);
      root.classList.add('theme-switching');
    }

    root.setAttribute('data-theme', nextTheme);
    if (themeMeta) themeMeta.setAttribute('content', isDark ? '#020617' : '#F59E0B');

    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? 'Включи светъл режим' : 'Включи тъмен режим');
      const label = themeToggle.querySelector('.theme-toggle__text');
      if (label) label.textContent = isDark ? 'Светъл' : 'Тъмен';
    }

    if (persist) {
      try { localStorage.setItem('rodopi_theme', nextTheme); } catch (_) {}
      requestAnimationFrame(function () {
        themeSwitchTimer = setTimeout(function () {
          root.classList.remove('theme-switching');
        }, 120);
      });
    }
  }

  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isDark ? 'light' : 'dark', true);
    });
  }

  /* ---- Hero Slider ---- */
  const slides = document.querySelectorAll('.hero__slide');
  const dots = document.querySelectorAll('.hero__dot');
  const prev = document.getElementById('heroPrev');
  const next = document.getElementById('heroNext');
  const slider = document.getElementById('heroSlider');
  const mobileBreakpoint = 768;
  let current = 0;
  let timer;

  function goTo(index) {
    if (!slides.length || !dots.length) return;
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, 6000);
  }

  function resetAutoplay() {
    clearInterval(timer);
    startAutoplay();
  }

  if (slides.length && prev && next && slider && dots.length === slides.length) {
    prev.addEventListener('click', function () { goTo(current - 1); resetAutoplay(); });
    next.addEventListener('click', function () { goTo(current + 1); resetAutoplay(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.dataset.index, 10));
        resetAutoplay();
      });
    });

    // Touch / swipe support
    let touchStartX = 0;
    slider.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); resetAutoplay(); }
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        resetAutoplay();
      }
    });

    startAutoplay();
  }

  /* ---- Burger / Mobile Menu ---- */
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTop');
  const homeHash = '#home';
  const pageUrl = window.location.pathname + window.location.search;
  let closeMenu = function () {};
  let openMenu = function () {};
  let setDropdownState = function () {};
  let syncMobileNavigation = function () {};

  function getTargetSection(hash) {
    return hash && document.querySelector(hash) ? hash : homeHash;
  }

  function getNavigationState(state) {
    const currentState = state || history.state || {};
    const section = getTargetSection(currentState.section || window.location.hash || homeHash);

    return {
      section: section,
      menuOpen: Boolean(currentState.menuOpen),
      dropdownOpen: Boolean(currentState.menuOpen && currentState.dropdownOpen),
    };
  }

  function updateHistoryState(nextState, replace) {
    const state = getNavigationState(Object.assign({}, getNavigationState(), nextState));

    history[replace ? 'replaceState' : 'pushState'](
      state,
      '',
      state.section === homeHash ? pageUrl : state.section
    );

    return state;
  }

  function scrollToSection(hash) {
    const target = document.querySelector(hash);
    if (!target) return false;

    document.querySelectorAll('.hero-offer-card.is-targeted').forEach(function (card) {
      card.classList.remove('is-targeted');
    });
    if (target.classList.contains('hero-offer-card')) {
      target.classList.add('is-targeted');
    }

    const headerOffset = header ? header.offsetHeight + 12 : 0;
    const targetTop = Math.max(target.getBoundingClientRect().top + window.scrollY - headerOffset, 0);

    window.scrollTo({
      top: targetTop,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });

    return true;
  }

  if (burger && nav) {
    const dropdownToggles = document.querySelectorAll('.nav__item--dropdown > a, .nav__item--dropdown > button');
    const dropdownItems = document.querySelectorAll('.nav__item--dropdown');

    setDropdownState = function (open) {
      dropdownItems.forEach(function (item) {
        item.classList.toggle('open', open);
      });
      dropdownToggles.forEach(function (link) {
        link.setAttribute('aria-expanded', String(open));
      });
    };

    openMenu = function () {
      nav.classList.add('open');
      burger.classList.add('active');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    closeMenu = function () {
      nav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      setDropdownState(false);
      document.body.style.overflow = '';
    };

    syncMobileNavigation = function (state) {
      if (window.innerWidth > mobileBreakpoint) {
        closeMenu();
        return;
      }

      if (state.menuOpen) {
        openMenu();
        setDropdownState(state.dropdownOpen);
        return;
      }

      closeMenu();
    };

    burger.addEventListener('click', function () {
      if (window.innerWidth > mobileBreakpoint) return;

      const state = getNavigationState();
      if (state.menuOpen) {
        history.back();
        return;
      }

      openMenu();
      updateHistoryState({ menuOpen: true, dropdownOpen: false }, false);
    });

    // Dropdown toggling
    let lastTouchDropdownToggle = 0;
    function toggleDropdown(link, e) {
      e.preventDefault();
      e.stopPropagation();

      const state = getNavigationState();
      const willOpen = window.innerWidth > mobileBreakpoint ? true : !link.parentElement.classList.contains('open');

      setDropdownState(willOpen);
      if (state.menuOpen) {
        updateHistoryState({ menuOpen: true, dropdownOpen: willOpen }, true);
      }
    }

    dropdownToggles.forEach(function (link) {
      link.setAttribute('aria-expanded', 'false');
      link.addEventListener('touchend', function (e) {
        lastTouchDropdownToggle = Date.now();
        toggleDropdown(link, e);
      }, { passive: false });

      link.addEventListener('click', function (e) {
        if (Date.now() - lastTouchDropdownToggle < 650) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        toggleDropdown(link, e);
      });
    });

    dropdownItems.forEach(function (item) {
      item.addEventListener('pointerenter', function () {
        if (window.innerWidth <= mobileBreakpoint) return;
        setDropdownState(true);
      });

      item.addEventListener('pointerleave', function () {
        if (window.innerWidth <= mobileBreakpoint) return;
        setDropdownState(false);
      });

      item.addEventListener('focusin', function () {
        if (window.innerWidth <= mobileBreakpoint) return;
        setDropdownState(true);
      });

      item.addEventListener('focusout', function (e) {
        if (window.innerWidth <= mobileBreakpoint) return;
        if (!item.contains(e.relatedTarget)) {
          setDropdownState(false);
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__item--dropdown')) {
        setDropdownState(false);
      }
    });

    // Close menu on nav link click
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        const isDropdownToggle = a.matches('.nav__item--dropdown > a');
        if (!isDropdownToggle) {
          closeMenu();
        }
      });
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        const state = getNavigationState();
        if (state.menuOpen) {
          history.back();
          return;
        }
        closeMenu();
      } else if (e.key === 'Escape') {
        setDropdownState(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > mobileBreakpoint) {
        const state = getNavigationState();
        closeMenu();
        if (state.menuOpen || state.dropdownOpen) {
          updateHistoryState({ menuOpen: false, dropdownOpen: false }, true);
        }
      }
    });
  }

  /* ---- In-page navigation / native history ---- */
  const internalAnchors = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  if (internalAnchors.length) {
    updateHistoryState({ section: getTargetSection(window.location.hash || homeHash), menuOpen: false, dropdownOpen: false }, true);

    internalAnchors.forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (e.defaultPrevented) return;

        const hash = link.getAttribute('href');
        if (!hash || !document.querySelector(hash)) return;

        e.preventDefault();
        const state = getNavigationState();
        const targetSection = getTargetSection(hash);

        if (nav && nav.classList.contains('open')) {
          closeMenu();
        }

        if (state.menuOpen || state.dropdownOpen) {
          updateHistoryState({ section: targetSection, menuOpen: false, dropdownOpen: false }, true);
        } else if (targetSection !== state.section) {
          updateHistoryState({ section: targetSection, menuOpen: false, dropdownOpen: false }, false);
        }

        setDropdownState(false);
        scrollToSection(targetSection);
      });
    });

    window.addEventListener('popstate', function (event) {
      const state = getNavigationState(event.state);
      syncMobileNavigation(state);
      scrollToSection(state.section);
    });

    if (window.location.hash) {
      window.requestAnimationFrame(function () {
        scrollToSection(getNavigationState().section);
      });
    }
  }

  /* ---- Header shadow + scroll top ---- */
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) {
      header.style.boxShadow = y > 60
        ? '0 4px 24px rgba(15,23,42,.14)'
        : '0 2px 16px rgba(15,23,42,.07)';
    }
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('show', y > 400);
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  /* ---- Cookie Banner ---- */
  const banner = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('cookieAccept');
  const declineBtn = document.getElementById('cookieDecline');
  const COOKIE_KEY = 'rodopi_cookie_consent';

  function getConsent() {
    try {
      return localStorage.getItem(COOKIE_KEY);
    } catch (_) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(COOKIE_KEY, value);
    } catch (_) {
      // localStorage can be blocked by privacy settings; silently continue.
    }
  }

  if (banner) {
    function hideBanner() {
      banner.classList.remove('show');
      setTimeout(function () { banner.style.display = 'none'; }, 500);
    }

    if (!getConsent()) {
      setTimeout(function () { banner.classList.add('show'); }, 1500);
    } else {
      banner.style.display = 'none';
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        setConsent('accepted');
        hideBanner();
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        setConsent('declined');
        hideBanner();
      });
    }
  }

  /* ---- Contact Form (POST към /api/contact) ---- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const originalText = btn.textContent;

      const data = {
        name:    document.getElementById('name').value.trim(),
        phone:   document.getElementById('phone').value.trim(),
        email:   document.getElementById('email').value.trim(),
        message: document.getElementById('message').value.trim(),
      };

      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      const phoneIsValid = /^[0-9+()\s-]{7,20}$/.test(data.phone);

      if (!emailIsValid || !phoneIsValid) {
        btn.textContent = 'Проверете имейла и телефона.';
        btn.style.background = '#ef4444';
        btn.style.color = 'white';
        setTimeout(function () {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 3500);
        return;
      }

      btn.textContent = 'Изпращане...';
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');

      fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
        .then(function (res) {
          return res.json()
            .catch(function () { return {}; })
            .then(function (json) {
              if (!res.ok || !json.ok) {
                throw new Error(json.error || 'Грешка – опитайте пак.');
              }
              return json;
            });
        })
        .then(function () {
          btn.textContent = '✓ Изпратено! Ще се свържем с Вас скоро.';
          btn.style.background = '#10b981';
          btn.style.color = 'white';
          form.reset();
          setTimeout(function () {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.background = '';
            btn.style.color = '';
            btn.removeAttribute('aria-busy');
          }, 5000);
        })
        .catch(function (err) {
          btn.textContent = err.message || 'Мрежова грешка – опитайте пак.';
          btn.style.background = '#ef4444';
          btn.style.color = 'white';
          btn.disabled = false;
          setTimeout(function () {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
            btn.removeAttribute('aria-busy');
          }, 4000);
        });
    });
  }

  /* ---- Intersection Observer – fade-in on scroll ---- */
  const animatedElements = document.querySelectorAll(
    '.catalog-card, .portfolio-item, .why-solar__image, .why-solar__text'
  );

  if (animatedElements.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      animatedElements.forEach(function (el) {
        el.classList.add('visible');
      });
    } else {
      const observerOptions = { threshold: 0.12 };
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      animatedElements.forEach(function (el) {
        el.classList.add('fade-in');
        observer.observe(el);
      });
    }
  }

})();
