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
  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
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

  if (burger && nav) {
    function closeMenu() {
      nav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Mobile dropdown toggling
    document.querySelectorAll('.nav__item--dropdown > a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          link.parentElement.classList.toggle('open');
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
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  /* ---- Header shadow + scroll top ---- */
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTop');
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

  if (banner) {
    function hideBanner() {
      banner.classList.remove('show');
      setTimeout(function () { banner.style.display = 'none'; }, 500);
    }

    if (!localStorage.getItem(COOKIE_KEY)) {
      setTimeout(function () { banner.classList.add('show'); }, 1500);
    } else {
      banner.style.display = 'none';
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        hideBanner();
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        localStorage.setItem(COOKIE_KEY, 'declined');
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
      const originalText = btn.textContent;

      const data = {
        name:    document.getElementById('name').value.trim(),
        phone:   document.getElementById('phone').value.trim(),
        email:   document.getElementById('email').value.trim(),
        message: document.getElementById('message').value.trim(),
      };

      btn.textContent = 'Изпращане...';
      btn.disabled = true;

      fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json.ok) {
            btn.textContent = '✓ Изпратено! Ще се свържем с Вас скоро.';
            btn.style.background = '#10b981';
            btn.style.color = 'white';
            form.reset();
            setTimeout(function () {
              btn.textContent = originalText;
              btn.disabled = false;
              btn.style.background = '';
              btn.style.color = '';
            }, 5000);
          } else {
            btn.textContent = json.error || 'Грешка – опитайте пак.';
            btn.style.background = '#ef4444';
            btn.style.color = 'white';
            btn.disabled = false;
            setTimeout(function () {
              btn.textContent = originalText;
              btn.style.background = '';
              btn.style.color = '';
            }, 4000);
          }
        })
        .catch(function () {
          btn.textContent = 'Мрежова грешка – опитайте пак.';
          btn.style.background = '#ef4444';
          btn.style.color = 'white';
          btn.disabled = false;
          setTimeout(function () {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
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
