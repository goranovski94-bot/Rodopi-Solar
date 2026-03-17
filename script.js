/* =========================================================
   Rodopi Solar – script.js
   ========================================================= */

(function () {
  'use strict';

  /* ---- Hero Slider ---- */
  const slides = document.querySelectorAll('.hero__slide');
  const dots   = document.querySelectorAll('.hero__dot');
  const prev   = document.getElementById('heroPrev');
  const next   = document.getElementById('heroNext');
  let current  = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAutoplay() {
    timer = setInterval(function () { goTo(current + 1); }, 6000);
  }

  function resetAutoplay() {
    clearInterval(timer);
    startAutoplay();
  }

  if (slides.length) {
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
    const slider = document.getElementById('heroSlider');
    slider.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); resetAutoplay(); }
    }, { passive: true });

    startAutoplay();
  }

  /* ---- Burger / Mobile Menu ---- */
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      burger.classList.toggle('active', open);
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
    nav.querySelectorAll('a:not(.nav__item--dropdown > a)').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Sticky header shrink ---- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      header.style.boxShadow = '0 4px 24px rgba(15,23,42,.14)';
    } else {
      header.style.boxShadow = '0 2px 16px rgba(15,23,42,.07)';
    }
  }, { passive: true });

  /* ---- Scroll-to-top button ---- */
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', function () {
    scrollTopBtn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  /* ---- Cookie Banner ---- */
  const banner       = document.getElementById('cookieBanner');
  const acceptBtn    = document.getElementById('cookieAccept');
  const declineBtn   = document.getElementById('cookieDecline');
  const COOKIE_KEY   = 'rodopi_cookie_consent';

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
  const observerOptions = { threshold: 0.12 };
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(
    '.benefit-card, .catalog-card, .portfolio-item, .info-card, .why-solar__image, .why-solar__text'
  ).forEach(function (el) {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  /* Inject fade-in animation styles dynamically */
  const style = document.createElement('style');
  style.textContent = `
    .fade-in {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity .55s ease, transform .55s ease;
    }
    .fade-in.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

})();
