/**
 * Karthikeyan K — Portfolio Script
 * Features: Navbar, Typed effect, Counters, Scroll animations, Project filters, Contact form, Theme toggle
 */

'use strict';

/* ========================================
   UTILITIES
   ======================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const onVisible = (elements, callback, options = {}) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
                if (!options.repeat) observer.unobserve(entry.target);
            }
        });
    }, { threshold: options.threshold || 0.15, ...options });
    elements.forEach(el => observer.observe(el));
};

/* ========================================
   THEME TOGGLE
   ======================================== */
const initTheme = () => {
    const btn = $('#themeToggle');
    const icon = $('#themeIcon');
    const body = document.body;

    const saved = localStorage.getItem('kk-theme') || 'dark';
    body.classList.toggle('light-theme', saved === 'light');
    updateIcon(saved);

    btn?.addEventListener('click', () => {
        const isLight = body.classList.toggle('light-theme');
        const theme = isLight ? 'light' : 'dark';
        localStorage.setItem('kk-theme', theme);
        updateIcon(theme);
    });

    function updateIcon(theme) {
        if (!icon) return;
        icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
};

/* ========================================
   NAVBAR
   ======================================== */
const initNavbar = () => {
    const navbar = $('#navbar');
    const menuToggle = $('#menuToggle');
    const navLinks = $('#navLinks');
    const links = $$('.nav-link');

    // Scroll: add .scrolled class
    const handleScroll = () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Hamburger
    menuToggle?.addEventListener('click', () => {
        const open = navLinks?.classList.toggle('open');
        menuToggle.classList.toggle('open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
    });

    // Close on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks?.classList.remove('open');
            menuToggle?.classList.remove('open');
            menuToggle?.setAttribute('aria-expanded', 'false');
        });
    });

    // Active link on scroll
    const sections = $$('section[id]');
    const activateLink = () => {
        const scrollY = window.scrollY;
        sections.forEach(sec => {
            const top = sec.offsetTop - 100;
            const bottom = top + sec.offsetHeight;
            const id = sec.getAttribute('id');
            if (scrollY >= top && scrollY < bottom) {
                links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
            }
        });
    };
    window.addEventListener('scroll', activateLink, { passive: true });
};

/* ========================================
   SCROLL TO TOP
   ======================================== */
const initScrollTop = () => {
    const btn = $('#scrollTop');
    window.addEventListener('scroll', () => {
        btn?.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
};

/* ========================================
   TYPED TEXT EFFECT
   ======================================== */
const initTyped = () => {
    const el = $('#typed-text');
    if (!el) return;

    const roles = [
        'Full Stack Apps',
        'AI-Powered Tools',
        'Data Pipelines',
        'IoT Solutions',
        'Beautiful UIs',
        'Smart Automation'
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let pausing = false;

    const type = () => {
        const current = roles[roleIdx];
        if (pausing) return;

        if (!deleting) {
            el.textContent = current.slice(0, charIdx + 1);
            charIdx++;
            if (charIdx === current.length) {
                pausing = true;
                setTimeout(() => { pausing = false; deleting = true; }, 1800);
            }
        } else {
            el.textContent = current.slice(0, charIdx - 1);
            charIdx--;
            if (charIdx === 0) {
                deleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
            }
        }
        setTimeout(type, deleting ? 50 : 90);
    };
    setTimeout(type, 600);
};

/* ========================================
   COUNTER ANIMATION
   ======================================== */
const initCounters = () => {
    const counters = $$('[data-target]');

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target, 10);
        const duration = 1400;
        const step = target / (duration / 16);
        let current = 0;

        const update = () => {
            current = Math.min(current + step, target);
            el.textContent = Math.floor(current);
            if (current < target) requestAnimationFrame(update);
            else el.textContent = target;
        };
        requestAnimationFrame(update);
    };

    onVisible(counters, animateCounter);
};

/* ========================================
   SCROLL ANIMATIONS (Intersection Observer)
   ======================================== */
const initScrollAnimations = () => {
    // Timeline items
    onVisible($$('.timeline-item'), el => el.classList.add('visible'));
    // Experience cards
    onVisible($$('.exp-card'), el => el.classList.add('visible'));
    // Skill groups
    onVisible($$('.skill-group'), el => el.classList.add('visible'));
    // Generic fade-in
    onVisible($$('.fade-in'), el => el.classList.add('visible'));

    // About grid / section cards
    onVisible($$('.about-bio-card, .about-stats-grid, .stat-card, .what-i-do'), el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    // Project cards
    onVisible($$('.proj-card'), (el) => {
        setTimeout(() => el.classList.add('visible'), parseInt(el.dataset.delay || '0', 10));
    }, { threshold: 0.1 });
};

/* ========================================
   PROJECT FILTER
   ======================================== */
const initProjectFilter = () => {
    const tabs = $$('.filter-tab');
    const cards = $$('.proj-card');

    // Assign staggered delay for initial visibility
    cards.forEach((c, i) => { c.dataset.delay = i * 60; });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const filter = tab.dataset.filter;

            cards.forEach(card => {
                const matches = filter === 'all' || card.dataset.category === filter;
                if (matches) {
                    card.style.display = '';
                    setTimeout(() => {
                        card.classList.remove('hiding');
                        card.classList.add('visible');
                    }, 50);
                } else {
                    card.classList.add('hiding');
                    card.classList.remove('visible');
                    setTimeout(() => { if (card.classList.contains('hiding')) card.style.display = 'none'; }, 300);
                }
            });
        });
    });
};

/* ========================================
   EMAILJS CONTACT FORM
   ======================================== */
const initContactForm = () => {
    const form = $('form.contact-form');
    if (!form) return;

    // Initialize EmailJS — replace with your actual public key
    if (typeof emailjs !== 'undefined') {
        emailjs.init('YOUR_PUBLIC_KEY');
    }

    const submitBtn = form.querySelector('.form-submit-btn');
    const btnText = form.querySelector('.btn-text');
    const btnLoading = form.querySelector('.btn-loading');
    const statusEl = $('#formStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm(form)) return;

        // Show loading
        if (btnText) btnText.hidden = true;
        if (btnLoading) btnLoading.hidden = false;
        submitBtn.disabled = true;

        try {
            if (typeof emailjs !== 'undefined') {
                await emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form);
            }
            showStatus(statusEl, '✅ Message sent! I\'ll get back to you soon.', false);
            form.reset();
        } catch (err) {
            showStatus(statusEl, '❌ Something went wrong. Please try again or email me directly.', true);
        } finally {
            if (btnText) btnText.hidden = false;
            if (btnLoading) btnLoading.hidden = true;
            submitBtn.disabled = false;
        }
    });
};

const validateForm = (form) => {
    const name = form.querySelector('#from_name');
    const email = form.querySelector('#from_email');
    const message = form.querySelector('#message');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name?.value.trim()) { name?.focus(); return false; }
    if (!email?.value.trim() || !emailRe.test(email.value)) { email?.focus(); return false; }
    if (!message?.value.trim()) { message?.focus(); return false; }
    return true;
};

const showStatus = (el, msg, isError) => {
    if (!el) return;
    el.textContent = msg;
    el.className = `form-notice${isError ? ' error' : ''}`;
    setTimeout(() => { el.textContent = ''; }, 6000);
};

/* ========================================
   FOOTER YEAR
   ======================================== */
const initYear = () => {
    const el = $('#currentYear');
    if (el) el.textContent = new Date().getFullYear();
};

/* ========================================
   SMOOTH SCROLL for anchor links
   ======================================== */
const initSmoothScroll = () => {
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = $(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
};


/* ========================================
   INIT
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavbar();
    initScrollTop();
    initTyped();
    initCounters();
    initScrollAnimations();
    initProjectFilter();
    initContactForm();
    initYear();
    initSmoothScroll();
    initImageFallbacks();

    // Trigger scroll once to set initial states
    window.dispatchEvent(new Event('scroll'));
});

/* ========================================
   IMAGE FALLBACKS
   ======================================== */
const initImageFallbacks = () => {
    $$('.proj-card-image img').forEach(img => {
        img.addEventListener('error', () => {
            img.dataset.broken = 'true';
        });
        // If already broken (cached error)
        if (!img.complete || img.naturalWidth === 0) {
            img.dataset.broken = 'true';
        }
    });
};
