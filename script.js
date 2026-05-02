/**
 * AngkorFit - Cambodia/Khmer themed interactive script
 * Vanilla JavaScript, no dependencies, no emojis
 */
(function () {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const throttle = (fn, wait) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(null, args);
      }
    };
  };

  // ===== HAMBURGER NAV =====
  const hamburger = $('#hamburger');
  const navMenu = $('#nav-menu');
  const navLinks = $$('.nav-link');

  function toggleMenu(forceClose = false) {
    if (!hamburger || !navMenu) return;
    const isOpen = navMenu.classList.contains('is-open');
    if (forceClose) {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    } else {
      const willOpen = !isOpen;
      hamburger.setAttribute('aria-expanded', String(willOpen));
      navMenu.classList.toggle('is-open', willOpen);
      document.body.classList.toggle('menu-open', willOpen);
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => toggleMenu());
    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu(true);
  });

  // ===== BACK TO TOP =====
  const backToTop = $('#backToTop');

  function updateBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('is-visible', window.scrollY > 400);
  }

  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', throttle(updateBackToTop, 150), { passive: true });
    updateBackToTop();
  }

  // ===== SCROLL REVEAL (fade-up) =====
  const fadeElements = $$('.fade-up');

  if ('IntersectionObserver' in window && fadeElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    fadeElements.forEach((el) => revealObserver.observe(el));
  } else {
    fadeElements.forEach((el) => el.classList.add('is-visible'));
  }

  // ===== CONTACT FORM VALIDATION =====
  const form = $('.contact-form');

  if (form) {
    const nameInput = $('#contact-name');
    const emailInput = $('#contact-email');
    const messageInput = $('#contact-message');
    const nameError = $('#name-error');
    const emailError = $('#email-error');
    const messageError = $('#message-error');

    const setError = (input, errorEl, message) => {
      errorEl.textContent = message || '';
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (message) {
        input.style.borderColor = '#e74c3c';
      } else {
        input.style.borderColor = '';
      }
    };

    const validateName = () => {
      const val = nameInput.value.trim();
      if (!val) return 'Name is required.';
      if (val.length < 2) return 'Name must be at least 2 characters.';
      return '';
    };

    const validateEmail = () => {
      const val = emailInput.value.trim();
      if (!val) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email.';
      return '';
    };

    const validateMessage = () => {
      const val = messageInput.value.trim();
      if (!val) return 'Message is required.';
      if (val.length < 10) return 'Message must be at least 10 characters.';
      return '';
    };

    const validateField = (input, validator, errorEl) => {
      const msg = validator();
      setError(input, errorEl, msg);
      return !msg;
    };

    nameInput.addEventListener('blur', () => validateField(nameInput, validateName, nameError));
    emailInput.addEventListener('blur', () => validateField(emailInput, validateEmail, emailError));
    messageInput.addEventListener('blur', () => validateField(messageInput, validateMessage, messageError));

    nameInput.addEventListener('input', () => {
      if (nameInput.getAttribute('aria-invalid') === 'true') validateField(nameInput, validateName, nameError);
    });
    emailInput.addEventListener('input', () => {
      if (emailInput.getAttribute('aria-invalid') === 'true') validateField(emailInput, validateEmail, emailError);
    });
    messageInput.addEventListener('input', () => {
      if (messageInput.getAttribute('aria-invalid') === 'true') validateField(messageInput, validateMessage, messageError);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok1 = validateField(nameInput, validateName, nameError);
      const ok2 = validateField(emailInput, validateEmail, emailError);
      const ok3 = validateField(messageInput, validateMessage, messageError);

      if (ok1 && ok2 && ok3) {
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Message Sent!';
        btn.style.background = '#2ecc71';
        form.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 2000);
      } else {
        if (!ok1) nameInput.focus();
        else if (!ok2) emailInput.focus();
        else messageInput.focus();
      }
    });
  }

  // ===== SCROLL SPY =====
  const sections = $$('section[id]');

  if (sections.length > 0) {
    const setActiveLink = (id) => {
      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === '#' + id;
        link.classList.toggle('nav-link--active', isActive);
      });
    };

    let visibleSections = new Set();

    const scrollSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target);
        } else {
          visibleSections.delete(entry.target);
        }
      });

      if (visibleSections.size > 0) {
        // Sort visible sections by their offsetTop to find the highest one
        const sortedVisible = Array.from(visibleSections).sort((a, b) => a.offsetTop - b.offsetTop);
        
        // Prioritize the top-most visible section
        const currentId = sortedVisible[0].getAttribute('id');
        setActiveLink(currentId);
      }
    }, {
      rootMargin: '-10% 0px -50% 0px',
      threshold: 0
    });

    sections.forEach((section) => {
      // Only observe sections that have a corresponding nav link
      const hasLink = navLinks.some(link => link.getAttribute('href') === '#' + section.getAttribute('id'));
      if (hasLink) {
        scrollSpyObserver.observe(section);
      }
    });
  }

  // ===== BOOK A DEMO BUTTONS =====
  const bookButtons = $$('.class-card .btn');
  bookButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const original = this.textContent;
      this.textContent = 'Demo Booked!';
      this.disabled = true;
      this.style.opacity = '0.7';
      setTimeout(() => {
        this.textContent = original;
        this.disabled = false;
        this.style.opacity = '';
      }, 2000);
    });
  });
})();
