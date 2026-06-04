/* =========================================================
   Rodopi Solar – script.js
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const navBackBtn = document.getElementById('navBack');
  const homeHash = '#home';
  let closeMenu = function () {};

  if (burger && nav) {
    const dropdownToggles = nav.querySelectorAll('.nav__item--dropdown > a');

    closeMenu = function () {
      nav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      nav.querySelectorAll('.nav__item--dropdown').forEach(function (item) {
        item.classList.remove('open');
      });
      dropdownToggles.forEach(function (link) {
        link.setAttribute('aria-expanded', 'false');
      });
      document.body.style.overflow = '';
    };

    burger.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Mobile dropdown toggling
    dropdownToggles.forEach(function (link) {
      link.setAttribute('aria-expanded', 'false');
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= mobileBreakpoint) {
          e.preventDefault();
          const parent = link.parentElement;
          const isOpen = parent.classList.toggle('open');
          link.setAttribute('aria-expanded', String(isOpen));
        }
      });
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
      if (e.key === 'Escape') {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > mobileBreakpoint) {
        closeMenu();
      }
    });
  }

  /* ---- In-page navigation / back button ---- */
  const internalAnchors = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  function getCurrentSection() {
    return window.location.hash || homeHash;
  }

  function getAppDepth() {
    return history.state && Number.isInteger(history.state.appDepth)
      ? history.state.appDepth
      : 0;
  }

  function updateBackButton() {
    if (!navBackBtn) return;
    navBackBtn.classList.toggle('show', getCurrentSection() !== homeHash);
  }

  function scrollToSection(hash) {
    const target = document.querySelector(hash);
    if (!target) return false;

    const headerOffset = header ? header.offsetHeight + 12 : 0;
    const targetTop = Math.max(target.getBoundingClientRect().top + window.scrollY - headerOffset, 0);

    window.scrollTo({
      top: targetTop,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });

    return true;
  }

  function updateSectionState(hash, replace) {
    const nextHash = hash === homeHash ? '' : hash;
    const nextUrl = nextHash || (window.location.pathname + window.location.search);
    const nextDepth = replace ? getAppDepth() : getAppDepth() + 1;

    history[replace ? 'replaceState' : 'pushState']({
      section: hash,
      appDepth: nextDepth,
    }, '', nextUrl);
  }

  if (internalAnchors.length) {
    updateSectionState(getCurrentSection(), true);

    internalAnchors.forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (e.defaultPrevented) return;

        const hash = link.getAttribute('href');
        if (!hash || !document.querySelector(hash)) return;

        e.preventDefault();

        if (nav && nav.classList.contains('open')) {
          closeMenu();
        }

        if (hash !== getCurrentSection()) {
          updateSectionState(hash, false);
        }

        scrollToSection(hash);
        updateBackButton();
      });
    });

    window.addEventListener('popstate', function () {
      scrollToSection(getCurrentSection());
      updateBackButton();
    });

    if (window.location.hash) {
      window.requestAnimationFrame(function () {
        scrollToSection(window.location.hash);
      });
    }

    updateBackButton();
  }

  if (navBackBtn) {
    navBackBtn.addEventListener('click', function () {
      if (nav && nav.classList.contains('open')) {
        closeMenu();
        return;
      }

      if (getCurrentSection() === homeHash) {
        updateBackButton();
        return;
      }

      if (getAppDepth() > 0) {
        history.back();
        return;
      }

      updateSectionState(homeHash, false);
      scrollToSection(homeHash);
      updateBackButton();
    });
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
    '.benefit-card, .catalog-card, .portfolio-item, .why-solar__image, .why-solar__text'
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
