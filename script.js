/* script.js — Karthikeyan K premium portfolio interactions */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const $ = (s, c) => (c || document).querySelector(s);
    const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

    document.addEventListener('DOMContentLoaded', () => {
        if (reduceMotion) document.body.classList.add('no-motion');
        themeSetup();
        preloader();
        smoothScroll();
        cursor();
        spotlight();
        navigation();
        mobileMenu();
        magnetic();
        rippleFx();
        tilt();
        typedRole();
        heroIntro();
        scrollReveals();
        counters();
        timelines();
        cardGlowTrack();
        scrollOrb();
        ecosystem();
        credTabs();
        skillsOrbit();
        githubTelemetry();
        contactForm();
        aiAssistant();
        lazyThree();
        $('#currentYear') && ($('#currentYear').textContent = new Date().getFullYear());
    });

    /* ── Lazy-load Three.js hero after first paint (CWV) ── */
    function lazyThree() {
        if (reduceMotion) return;
        if (navigator.connection && navigator.connection.saveData) return;
        if (!$('#heroCanvas3D')) return;
        const inject = () => {
            const three = document.createElement('script');
            three.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
            three.onload = () => {
                const scene = document.createElement('script');
                scene.src = 'three-scene.js';
                document.body.appendChild(scene);
            };
            document.body.appendChild(three);
        };
        const schedule = () => ('requestIdleCallback' in window)
            ? requestIdleCallback(inject, { timeout: 2500 })
            : setTimeout(inject, 350);
        if (document.readyState === 'complete') schedule();
        else window.addEventListener('load', schedule, { once: true });
    }

    /* ── Theme toggle ──────────────────────────────────── */
    const getTheme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    function themeSetup() {
        const btn = $('#themeToggle');
        if (!btn) return;
        const meta = $('meta[name="theme-color"]');
        const apply = (t) => {
            document.documentElement.dataset.theme = t;
            try { localStorage.setItem('theme', t); } catch {}
            if (meta) meta.content = t === 'light' ? '#f3f4fb' : '#7c3aed';
            document.dispatchEvent(new CustomEvent('themechange', { detail: t }));
        };
        btn.addEventListener('click', () => {
            const next = getTheme() === 'light' ? 'dark' : 'light';
            apply(next);
            toast(next === 'light' ? 'Light mode ☀️' : 'Dark mode 🌙');
        });
    }

    /* ── Preloader ─────────────────────────────────────── */
    function preloader() {
        const el = $('#preloader');
        if (!el) return;
        const fill = $('#preloaderFill');
        const pct = $('#preloaderPercent');
        let p = 0;
        const tick = setInterval(() => {
            p = Math.min(p + Math.random() * 16, 92);
            fill.style.width = p + '%';
            pct.textContent = Math.round(p) + '%';
        }, 140);

        const finish = () => {
            clearInterval(tick);
            fill.style.width = '100%';
            pct.textContent = '100%';
            setTimeout(() => {
                el.classList.add('done');
                document.body.dispatchEvent(new CustomEvent('site:ready'));
                setTimeout(() => el.remove(), 1400);
            }, reduceMotion ? 50 : 420);
        };
        if (document.readyState === 'complete') finish();
        else window.addEventListener('load', finish);
        setTimeout(finish, 5000); /* hard cap */
    }

    /* ── Lenis + GSAP ──────────────────────────────────── */
    let lenis = null;
    function smoothScroll() {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        if (reduceMotion || typeof Lenis === 'undefined') return;
        lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
        function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        if (typeof ScrollTrigger !== 'undefined') lenis.on('scroll', ScrollTrigger.update);

        /* anchor links via lenis */
        $$('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (id.length < 2) return;
                const target = $(id);
                if (!target) return;
                e.preventDefault();
                lenis.scrollTo(target, { offset: -70, duration: 1.3 });
            });
        });
    }

    /* ── Custom cursor ─────────────────────────────────── */
    function cursor() {
        if (isTouch) return;
        const dot = $('#cursorDot'), ring = $('#cursorRing');
        if (!dot || !ring) return;
        let mx = -100, my = -100, rx = -100, ry = -100;
        window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
        (function loop() {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            dot.style.transform = `translate(${mx}px, ${my}px)`;
            ring.style.transform = `translate(${rx}px, ${ry}px)`;
            requestAnimationFrame(loop);
        })();
        const hoverables = 'a, button, .chip, .tilt-card, input, textarea, [data-tilt]';
        document.addEventListener('pointerover', (e) => {
            if (e.target.closest(hoverables)) ring.classList.add('is-hover');
        });
        document.addEventListener('pointerout', (e) => {
            if (e.target.closest(hoverables)) ring.classList.remove('is-hover');
        });
        document.addEventListener('pointerdown', () => ring.classList.add('is-down'));
        document.addEventListener('pointerup', () => ring.classList.remove('is-down'));
    }

    /* ── Mouse spotlight ───────────────────────────────── */
    function spotlight() {
        const el = $('#spotlight');
        if (!el || isTouch) return;
        window.addEventListener('pointermove', (e) => {
            el.style.setProperty('--mx', e.clientX + 'px');
            el.style.setProperty('--my', e.clientY + 'px');
        }, { passive: true });
    }

    /* ── Nav: shrink, active glider ────────────────────── */
    function navigation() {
        const header = $('#siteHeader');
        const glider = $('.nav-glider');
        const links = $$('.nav-link');
        if (!header) return;

        const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        function moveGlider(link) {
            if (!glider || !link) return;
            glider.style.left = link.parentElement.offsetLeft + 'px';
            glider.style.width = link.parentElement.offsetWidth + 'px';
            glider.classList.add('on');
        }

        const sections = links
            .map((l) => $(l.getAttribute('href')))
            .filter(Boolean);
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((en) => {
                    if (!en.isIntersecting) return;
                    const id = en.target.id;
                    links.forEach((l) => {
                        const on = l.dataset.section === id;
                        l.classList.toggle('active', on);
                        if (on) moveGlider(l);
                    });
                });
            }, { rootMargin: '-40% 0px -55% 0px' });
            sections.forEach((s) => io.observe(s));
        }
        window.addEventListener('resize', () => moveGlider($('.nav-link.active')), { passive: true });
        setTimeout(() => moveGlider($('.nav-link.active')), 600);
    }

    /* ── Mobile menu ───────────────────────────────────── */
    function mobileMenu() {
        const toggle = $('#menuToggle');
        const menu = $('#mobileMenu');
        if (!toggle || !menu) return;
        const links = $$('.m-link', menu);
        links.forEach((l, i) => (l.style.transitionDelay = 0.08 + i * 0.05 + 's'));
        function set(open) {
            toggle.classList.toggle('open', open);
            menu.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
            menu.setAttribute('aria-hidden', String(!open));
        }
        toggle.addEventListener('click', () => set(!menu.classList.contains('open')));
        links.forEach((l) => l.addEventListener('click', () => set(false)));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    }

    /* ── Magnetic buttons ──────────────────────────────── */
    function magnetic() {
        if (isTouch || reduceMotion) return;
        $$('.magnetic').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                el.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
            });
            el.addEventListener('pointerleave', () => {
                el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
                el.style.transform = '';
                setTimeout(() => (el.style.transition = ''), 500);
            });
        });
    }

    /* ── Ripple ────────────────────────────────────────── */
    function rippleFx() {
        document.addEventListener('pointerdown', (e) => {
            const host = e.target.closest('.ripple');
            if (!host) return;
            const r = host.getBoundingClientRect();
            const ink = document.createElement('span');
            ink.className = 'ink';
            ink.style.left = e.clientX - r.left + 'px';
            ink.style.top = e.clientY - r.top + 'px';
            host.appendChild(ink);
            setTimeout(() => ink.remove(), 650);
        });
    }

    /* ── Vanilla Tilt ──────────────────────────────────── */
    function tilt() {
        if (isTouch || reduceMotion || typeof VanillaTilt === 'undefined') return;
        VanillaTilt.init($$('[data-tilt]'), {
            max: 6, speed: 900, perspective: 1100,
            glare: true, 'max-glare': 0.12, gyroscope: false
        });
    }

    /* ── Typed role ────────────────────────────────────── */
    function typedRole() {
        const el = $('#typedRole');
        if (!el) return;
        const roles = [
            'AI Engineer',
            'Multi-Agent Systems Builder',
            'RAG &amp; LLM Engineer',
            'Agentic AI Explorer',
            'GenAI Automation Developer',
            'Full Stack AI Builder'
        ];
        if (typeof Typed !== 'undefined' && !reduceMotion) {
            new Typed('#typedRole', {
                strings: roles, typeSpeed: 55, backSpeed: 28,
                backDelay: 1800, loop: true, showCursor: false
            });
        } else {
            el.textContent = 'AI Engineer';
        }
    }

    /* ── Hero entrance ─────────────────────────────────── */
    function heroIntro() {
        const start = () => {
            if (typeof gsap === 'undefined' || reduceMotion) {
                $$('.reveal-line, .reveal-up').forEach((el) => {
                    el.style.transform = 'none';
                    el.style.opacity = '1';
                });
                return;
            }
            const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
            tl.to('.reveal-line', { y: 0, duration: 1.15, stagger: 0.12 }, 0.1);
            $$('.hero .reveal-up').forEach((el) => {
                tl.to(el, { y: 0, opacity: 1, duration: 0.9 }, 0.25 + (parseInt(el.dataset.delay || 0, 10) / 1000));
            });
        };
        if ($('#preloader')) document.body.addEventListener('site:ready', start, { once: true });
        else start();
    }

    /* ── Section reveals (ScrollTrigger) ───────────────── */
    function scrollReveals() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduceMotion) return;
        $$('.section').forEach((sec) => {
            const items = $$('.section-head, .glass-card, .eco-hud, .eco-body', sec)
                .filter((el) => !el.closest('.hero'));
            if (!items.length) return;
            gsap.fromTo(items,
                { y: 44, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.07,
                    scrollTrigger: { trigger: sec, start: 'top 74%', once: true }
                });
        });
        /* subtle parallax on portrait */
        gsap.to('.hero-visual', {
            yPercent: 10, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
        });
    }

    /* ── Timeline beam growth ──────────────────────────── */
    function timelines() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduceMotion) {
            $$('.timeline-beam').forEach((b) => (b.style.height = '100%'));
            return;
        }
        $$('[data-timeline]').forEach((tlEl) => {
            gsap.to($('.timeline-beam', tlEl), {
                height: '100%', ease: 'none',
                scrollTrigger: { trigger: tlEl, start: 'top 70%', end: 'bottom 55%', scrub: 0.5 }
            });
        });
    }

    /* ── Counters ──────────────────────────────────────── */
    function counters() {
        const els = $$('.counter');
        if (!els.length) return;
        const animate = (el) => {
            const target = parseFloat(el.dataset.target) || 0;
            const dec = parseInt(el.dataset.decimals || '0', 10);
            if (reduceMotion) { el.textContent = target.toFixed(dec); return; }
            const dur = 1600, t0 = performance.now();
            (function step(t) {
                const p = Math.min((t - t0) / dur, 1);
                el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(dec);
                if (p < 1) requestAnimationFrame(step);
            })(t0);
        };
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
            });
        }, { threshold: 0.6 });
        els.forEach((el) => io.observe(el));
    }

    /* ── Glass card glow follows cursor ────────────────── */
    function cardGlowTrack() {
        if (isTouch) return;
        document.addEventListener('pointermove', (e) => {
            const card = e.target.closest('.glass-card');
            if (!card) return;
            const r = card.getBoundingClientRect();
            card.style.setProperty('--gx', ((e.clientX - r.left) / r.width) * 100 + '%');
            card.style.setProperty('--gy', ((e.clientY - r.top) / r.height) * 100 + '%');
        }, { passive: true });
    }

    /* ── Scroll progress orb ───────────────────────────── */
    function scrollOrb() {
        const orb = $('#scrollOrb');
        const prog = $('#orbProgress');
        if (!orb || !prog) return;
        const LEN = 126;
        window.addEventListener('scroll', () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? window.scrollY / max : 0;
            prog.style.strokeDashoffset = LEN - LEN * p;
            orb.classList.toggle('show', window.scrollY > 500);
        }, { passive: true });
        orb.addEventListener('click', () => {
            if (lenis) lenis.scrollTo(0, { duration: 1.4 });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ── Credentials tabs ──────────────────────────────── */
    function credTabs() {
        const tabs = $$('.cred-tab');
        const panes = $$('.cred-pane');
        if (!tabs.length) return;
        function activate(tab) {
            tabs.forEach((t) => {
                const on = t === tab;
                t.classList.toggle('active', on);
                t.setAttribute('aria-selected', String(on));
                t.tabIndex = on ? 0 : -1;
            });
            panes.forEach((p) => {
                const on = p.dataset.pane === tab.dataset.pane;
                p.classList.toggle('active', on);
                p.hidden = !on;
            });
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }
        tabs.forEach((tab, i) => {
            tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
            tab.addEventListener('click', () => activate(tab));
            tab.addEventListener('keydown', (e) => {
                let idx = null;
                if (e.key === 'ArrowRight') idx = (i + 1) % tabs.length;
                else if (e.key === 'ArrowLeft') idx = (i - 1 + tabs.length) % tabs.length;
                else if (e.key === 'Home') idx = 0;
                else if (e.key === 'End') idx = tabs.length - 1;
                if (idx === null) return;
                e.preventDefault();
                tabs[idx].focus();
                activate(tabs[idx]);
            });
        });
    }

    /* ── AI system map (projects ecosystem) ────────────── */
    function ecosystem() {
        const canvas = $('#ecoCanvas');
        const inspector = $('#ecoInspector');
        if (!canvas || !inspector) return;
        const ctx = canvas.getContext('2d');
        const hint = $('#ecoHint');

        const CLUSTERS = {
            agents:     { label: 'LLM & Agents',     color: '#8b5cf6', lx: 0.22, ly: 0.10 },
            perception: { label: 'Vision & NLP',     color: '#22d3ee', lx: 0.78, ly: 0.10 },
            interfaces: { label: 'Product Systems',  color: '#34d399', lx: 0.20, ly: 0.94 },
            playground: { label: 'Algorithmic Play', color: '#fbbf24', lx: 0.78, ly: 0.94 }
        };

        const NODES = [
            { id: 'core', core: true, x: 0.5, y: 0.47, r: 17, short: 'KK' },
            {
                id: 'ai-consulting', cluster: 'agents', x: 0.185, y: 0.235, r: 13, flag: true,
                short: 'AI Consulting', name: 'AI Consulting System',
                type: 'multi-domain LLM expert system', year: '2024', status: 'LIVE',
                mission: 'Specialized Gemini 2.0 Flash agents for Education, Healthcare, Finance & Retail — domain-tuned prompting with real-time persistence. Published as international research.',
                pipeline: ['user query', 'domain router', 'gemini 2.0', 'expert answer'],
                metrics: [['4', 'domains'], ['paper', 'published'], ['prod', 'status']],
                stack: ['Gemini 2.0 Flash', 'Prompt Engineering', 'Next.js 15', 'Firebase'],
                img: 'images/projects/ai-consulting.jpg',
                cs: 'projects/ai-consulting.html',
                gh: 'https://github.com/Karthikeyan260/AiConsultingSystem',
                live: 'https://aiconsultingsystem.netlify.app/'
            },
            {
                id: 'job-assistant', cluster: 'agents', x: 0.315, y: 0.36, r: 12, flag: true,
                short: 'Job Copilot', name: 'AI Job Application Assistant',
                type: 'LLM career copilot', year: '2024', status: 'LIVE',
                mission: 'Resume optimization, personalized cover-letter generation and job-fit scoring via Gemini 2.0 Flash — with ML-driven skill-gap analysis and progress tracking.',
                pipeline: ['resume + JD', 'doc parser', 'LLM rewrite', 'fit score'],
                metrics: [['3', 'AI tools'], ['ML', 'skill-gap'], ['PDF', 'pipeline']],
                stack: ['Gemini 2.0 Flash', 'scikit-learn', 'Streamlit', 'PyPDF2'],
                img: 'images/projects/ai-job-assistant.jpg',
                cs: 'projects/job-assistant.html',
                gh: 'https://github.com/Karthikeyan260/AI-Powered-Job-Application-Assistant',
                live: 'https://ai-powered-job-application-assistant.streamlit.app/'
            },
            {
                id: 'nutrify', cluster: 'perception', x: 0.66, y: 0.20, r: 11,
                short: 'NutrifyAI', name: 'NutrifyAI',
                type: 'vision-language nutrition analysis', year: '2024', status: 'LIVE',
                mission: 'Any food photo becomes instant nutritional insight and calorie counts through Gemini multimodal inference.',
                pipeline: ['food photo', 'gemini vision', 'macro breakdown'],
                metrics: [['vision', 'modality'], ['instant', 'inference'], ['live', 'status']],
                stack: ['Multimodal LLM', 'Gemini Vision', 'Streamlit', 'Python'],
                img: 'images/projects/nutrify-ai.jpg',
                cs: 'projects/nutrify-ai.html',
                gh: 'https://github.com/Karthikeyan260/NutriLens',
                live: 'https://nutrifyai.streamlit.app/'
            },
            {
                id: 'address-ner', cluster: 'perception', x: 0.845, y: 0.30, r: 11,
                short: 'Address NER', name: 'Address NER',
                type: 'custom named-entity recognition', year: '2024', status: 'LIVE',
                mission: 'Custom NER model extracting structured address components from raw text — trained, evaluated and deployed to Hugging Face Spaces.',
                pipeline: ['raw text', 'spaCy NER', 'structured address'],
                metrics: [['92%', 'F1 score'], ['HF', 'spaces'], ['6', 'entities']],
                stack: ['SpaCy', 'NER', 'Hugging Face', 'Python'],
                img: 'images/projects/address-ner.svg',
                cs: 'projects/address-ner.html',
                gh: 'https://github.com/Karthikeyan260/Address_NER',
                live: 'https://huggingface.co/spaces/karthik2604/Address_ner'
            },
            {
                id: 'tts', cluster: 'perception', x: 0.72, y: 0.42, r: 9,
                short: 'TTS', name: 'Text to Speech',
                type: 'browser speech synthesis', year: '2023', status: 'LIVE',
                mission: 'Typed text becomes natural audio through the Web Speech API — multiple voices and adjustable speed.',
                pipeline: ['text input', 'speech API', 'audio out'],
                metrics: [['multi', 'voices'], ['0 deps', 'runtime'], ['live', 'status']],
                stack: ['Web Speech API', 'JavaScript'],
                img: 'images/projects/text-to-speech.svg',
                gh: 'https://github.com/Karthikeyan260/Text-to-Speech-webpage',
                live: 'https://text-to-speech-webpage.vercel.app'
            },
            {
                id: 'todo', cluster: 'interfaces', x: 0.155, y: 0.66, r: 10,
                short: 'Todo', name: 'Todo Application',
                type: 'task manager · internship build', year: '2024', status: 'LIVE',
                mission: 'Feature-rich task manager built during the Octanet internship — clean UI, Redux state and local persistence.',
                pipeline: ['user action', 'redux store', 'persisted UI'],
                metrics: [['CI/CD', 'pipeline'], ['redux', 'state'], ['live', 'status']],
                stack: ['React', 'TypeScript', 'Redux'],
                img: 'images/projects/todo-app.jpg',
                gh: 'https://github.com/Karthikeyan260/Todo-List',
                live: 'https://i8ftfb0ekpv7admu.vercel.app/'
            },
            {
                id: 'weather', cluster: 'interfaces', x: 0.27, y: 0.80, r: 10,
                short: 'Weather', name: 'Weather Dashboard',
                type: 'real-time data dashboard', year: '2024', status: 'LIVE',
                mission: 'Real-time weather with 5-day forecasts, geolocation and animated data visualizations.',
                pipeline: ['geolocation', 'weather API', 'visual forecast'],
                metrics: [['5-day', 'forecast'], ['geo', 'aware'], ['live', 'status']],
                stack: ['JavaScript', 'OpenWeatherMap', 'CSS3'],
                img: 'images/projects/weather-dashboard.jpg',
                gh: 'https://github.com/Karthikeyan260/Weather-Dashboard',
                live: 'https://weather-dashboard-rho-inky.vercel.app/'
            },
            {
                id: 'netflix', cluster: 'interfaces', x: 0.37, y: 0.68, r: 9,
                short: 'Netflix UI', name: 'Netflix Clone',
                type: 'pixel-perfect UI recreation', year: '2024', status: 'LIVE',
                mission: 'Pixel-perfect responsive recreation of the Netflix interface — hero banner, scrollable rows, hover effects.',
                pipeline: ['design ref', 'grid/flexbox', 'pixel-perfect UI'],
                metrics: [['1:1', 'fidelity'], ['resp', 'layout'], ['live', 'status']],
                stack: ['CSS Grid', 'Flexbox', 'JavaScript'],
                img: 'images/projects/netflix-clone.svg',
                gh: 'https://github.com/Karthikeyan260/Netflix-clone',
                live: 'https://netflix-clone1-one.vercel.app/'
            },
            {
                id: 'chess', cluster: 'playground', x: 0.64, y: 0.66, r: 11,
                short: 'Chess AI', name: 'Chess Game',
                type: 'minimax game AI', year: '2024', status: 'LIVE',
                mission: 'Chess against a minimax adversary — legal-move highlighting, check/checkmate detection, full rules engine.',
                pipeline: ['board state', 'minimax search', 'best move'],
                metrics: [['minimax', 'engine'], ['full', 'rules'], ['live', 'status']],
                stack: ['JavaScript', 'Minimax', 'Game AI'],
                img: 'images/projects/chess-game.jpg',
                gh: 'https://github.com/Karthikeyan260/Chess-game',
                live: 'https://chess-game-sandy-seven.vercel.app/'
            },
            {
                id: 'snake', cluster: 'playground', x: 0.86, y: 0.68, r: 9,
                short: 'Snake', name: 'Snake Game',
                type: 'canvas game loop', year: '2024', status: 'LIVE',
                mission: 'Classic snake on HTML5 Canvas — smooth motion, difficulty curve and a high-score board.',
                pipeline: ['input', 'game loop', 'canvas render'],
                metrics: [['60fps', 'loop'], ['hi-score', 'board'], ['live', 'status']],
                stack: ['HTML5 Canvas', 'JavaScript'],
                img: 'images/projects/snake-game.jpg',
                gh: 'https://github.com/Karthikeyan260/snake-game',
                live: 'https://snake-game-tawny-tau.vercel.app/'
            },
            {
                id: 'memory', cluster: 'playground', x: 0.70, y: 0.84, r: 9,
                short: 'Memory', name: 'Memory Card Game',
                type: 'state-machine puzzle', year: '2024', status: 'LIVE',
                mission: 'Card-matching challenge with flip animations, move counter, timer and difficulty levels.',
                pipeline: ['flip event', 'match logic', 'score state'],
                metrics: [['3', 'levels'], ['timer', 'mode'], ['live', 'status']],
                stack: ['CSS Animations', 'JavaScript'],
                img: 'images/projects/memory-game.svg',
                gh: 'https://github.com/Karthikeyan260/memory-game',
                live: 'https://memory-game-seven-snowy.vercel.app/'
            },
            {
                id: 'tictactoe', cluster: 'playground', x: 0.87, y: 0.86, r: 9,
                short: 'TicTacToe', name: 'Tic Tac Toe',
                type: 'win-detection logic', year: '2024', status: 'LIVE',
                mission: 'Responsive 2-player classic with animated winning lines and round score tracking.',
                pipeline: ['move', 'win detection', 'score round'],
                metrics: [['2P', 'mode'], ['anim', 'win line'], ['live', 'status']],
                stack: ['JavaScript', 'CSS3'],
                img: 'images/projects/tic-tac-toe.svg',
                gh: 'https://github.com/Karthikeyan260/Tic-Tac-Toe',
                live: 'https://tic-tac-toe-livid-nu.vercel.app/'
            }
        ];
        const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
        const EDGES = [
            ['core', 'ai-consulting'], ['core', 'job-assistant'], ['ai-consulting', 'job-assistant'],
            ['core', 'nutrify'], ['nutrify', 'address-ner'], ['nutrify', 'tts'],
            ['core', 'todo'], ['todo', 'weather'], ['todo', 'netflix'],
            ['core', 'chess'], ['chess', 'snake'], ['chess', 'memory'], ['snake', 'tictactoe']
        ].map(([a, b], i) => ({ a: byId[a], b: byId[b], t: (i * 0.37) % 1, speed: 0.0018 + (i % 4) * 0.0006 }));

        NODES.forEach((n, i) => { n.phase = i * 1.7; });

        let W = 0, H = 0, dpr = 1;
        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = canvas.clientWidth; H = canvas.clientHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        const themePal = () => getTheme() === 'light'
            ? { label: (a) => `rgba(20,22,42,${a})`, ghost: 'rgba(20,22,42,0.35)', edge: 0.22, coreText: '#fff' }
            : { label: (a) => `rgba(238,240,255,${a})`, ghost: 'rgba(238,240,255,0.28)', edge: 0.16, coreText: '#eef0ff' };
        let pal = themePal();
        document.addEventListener('themechange', () => { pal = themePal(); });

        let hover = null, selected = null, focusCluster = null;
        let mx = -1e4, my = -1e4;

        const px = (n, t) => {
            /* on narrow canvases pull nodes toward center so labels stay inside */
            const squeeze = W < 520 ? 0.82 : 1;
            return {
                x: (0.5 + (n.x - 0.5) * squeeze) * W,
                y: n.y * H + (reduceMotion ? 0 : Math.sin(t * 0.8 + n.phase) * 5)
            };
        };

        canvas.addEventListener('pointermove', (e) => {
            const r = canvas.getBoundingClientRect();
            mx = e.clientX - r.left; my = e.clientY - r.top;
        }, { passive: true });
        canvas.addEventListener('pointerleave', () => { mx = my = -1e4; });
        canvas.addEventListener('click', (e) => {
            /* hit-test from event coords — hover state never fires on touch taps */
            const r = canvas.getBoundingClientRect();
            const cx = e.clientX - r.left, cy = e.clientY - r.top;
            const t = performance.now() / 1000;
            let best = null, bestD = Infinity;
            NODES.forEach((n) => {
                if (n.core || dimmed(n)) return;
                const p = px(n, t);
                const d = Math.hypot(cx - p.x, cy - p.y);
                if (d < Math.max(34, n.r + 22) && d < bestD) { bestD = d; best = n; }
            });
            if (best) select(best);
        });

        $$('.eco-legend button').forEach((btn) => {
            btn.addEventListener('click', () => {
                focusCluster = focusCluster === btn.dataset.cluster ? null : btn.dataset.cluster;
                $$('.eco-legend button').forEach((b) => {
                    const on = b.dataset.cluster === focusCluster;
                    b.classList.toggle('on', on);
                    b.setAttribute('aria-pressed', String(on));
                });
            });
        });

        function select(n) {
            selected = n;
            renderNode(n);
            if (window.innerWidth < 980) {
                inspector.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
            }
        }

        /* ── inspector rendering ── */
        function renderIdle() {
            inspector.innerHTML = `
                <div class="ins-prompt mono">$ awaiting_selection<span class="ins-caret"></span></div>
                <div class="ins-idle">
                    <p>This is the live map of everything I've shipped. Click any <strong>node</strong> to open its system inspector — mission, pipeline architecture, metrics and launch links.</p>
                    <div class="ins-idle-stats">
                        <div class="ins-stat"><strong>12</strong><span>deployed systems</span></div>
                        <div class="ins-stat"><strong>5</strong><span>LLM / ML powered</span></div>
                        <div class="ins-stat"><strong>4</strong><span>clusters online</span></div>
                        <div class="ins-stat"><strong>100%</strong><span>shipped &amp; live</span></div>
                    </div>
                </div>`;
        }

        function renderNode(n) {
            const c = CLUSTERS[n.cluster];
            const d = (i) => `style="animation-delay:${(0.07 * i).toFixed(2)}s"`;
            inspector.innerHTML = `
                <div class="ins-prompt mono">$ inspect ${n.id}<span class="ins-caret"></span></div>
                <div class="ins-row ins-head" ${d(1)}>
                    <img class="ins-thumb" src="${n.img}" alt="" width="58" height="58" loading="lazy">
                    <div>
                        <h3>${n.name}</h3>
                        <span class="ins-type mono">${n.type} · ${n.year}</span>
                    </div>
                </div>
                <div class="ins-row" ${d(2)} style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;animation-delay:0.14s">
                    <span class="pill" style="color:${c.color};border-color:${c.color}66;background:${c.color}1a">${c.label}</span>
                    <span class="pill pill-live"><span class="status-dot"></span> ${n.status}</span>
                </div>
                <p class="ins-row ins-mission" ${d(3)}>${n.mission}</p>
                <div class="ins-row" ${d(4)}>
                    <div class="ins-label mono">// pipeline</div>
                    <div class="ins-pipe">${n.pipeline.map((p) => `<span class="pl-step">${p}</span>`).join('<span class="pl-arrow" aria-hidden="true"></span>')}</div>
                </div>
                <div class="ins-row" ${d(5)}>
                    <div class="ins-label mono">// metrics</div>
                    <div class="ins-metrics">${n.metrics.map(([v, k]) => `<div class="ins-metric"><strong>${v}</strong><span>${k}</span></div>`).join('')}</div>
                </div>
                <div class="ins-row" ${d(6)}>
                    <div class="ins-label mono">// stack</div>
                    <div class="tag-row">${n.stack.map((t) => `<span>${t}</span>`).join('')}</div>
                </div>
                <div class="ins-row p-links" ${d(7)}>
                    ${n.cs ? `<a href="${n.cs}" class="p-link live"><i class="fas fa-file-lines"></i> Case study</a>` : ''}
                    <a href="${n.gh}" target="_blank" rel="noopener noreferrer" class="p-link"><i class="fab fa-github"></i> Source</a>
                    <a href="${n.live}" target="_blank" rel="noopener noreferrer" class="p-link live"><i class="fas fa-arrow-up-right-from-square"></i> Launch</a>
                </div>
                ${n.live.includes('streamlit.app') ? `<div class="ins-row ins-wake mono" ${d(8)}>// hosted on streamlit — cold start may take ~30s</div>` : ''}`;
        }
        renderIdle();

        /* ── canvas loop ── */
        let inView = true;
        if ('IntersectionObserver' in window) {
            new IntersectionObserver((en) => { inView = en[0].isIntersecting; }, { threshold: 0 }).observe(canvas);
        }

        const dimmed = (n) => focusCluster && !n.core && n.cluster !== focusCluster;

        function draw(ts) {
            requestAnimationFrame(draw);
            if (!inView) return;
            const t = ts / 1000;
            ctx.clearRect(0, 0, W, H);

            /* cluster ghost labels */
            ctx.font = '600 11px "JetBrains Mono", monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            Object.entries(CLUSTERS).forEach(([key, c]) => {
                ctx.fillStyle = focusCluster === key ? c.color : pal.ghost;
                ctx.fillText(c.label.toUpperCase(), c.lx * W, c.ly * H);
            });

            /* edges + pulses */
            EDGES.forEach((e) => {
                const A = px(e.a, t), B = px(e.b, t);
                const cl = CLUSTERS[(e.b.cluster || e.a.cluster)];
                const dim = dimmed(e.a) || dimmed(e.b);
                ctx.strokeStyle = cl.color + (dim ? '14' : '3a');
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
                if (!reduceMotion && !dim) {
                    e.t = (e.t + e.speed) % 1;
                    const pxp = A.x + (B.x - A.x) * e.t;
                    const pyp = A.y + (B.y - A.y) * e.t;
                    const g = ctx.createRadialGradient(pxp, pyp, 0, pxp, pyp, 7);
                    g.addColorStop(0, cl.color); g.addColorStop(1, cl.color + '00');
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(pxp, pyp, 7, 0, Math.PI * 2); ctx.fill();
                }
            });

            /* nodes */
            let found = null;
            NODES.forEach((n) => {
                const p = px(n, t);
                const dim = dimmed(n);
                const cl = n.core ? { color: '#a78bfa' } : CLUSTERS[n.cluster];
                const isSel = selected === n;
                const d2 = Math.hypot(mx - p.x, my - p.y);
                const isHover = !dim && d2 < Math.max(26, n.r + 16);
                if (isHover && !found) found = n;
                const boost = (isHover || isSel) ? 1.25 : 1;
                const alpha = dim ? 0.14 : 1;

                ctx.globalAlpha = alpha;
                const glowR = n.r * 3.1 * boost;
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
                g.addColorStop(0, cl.color + 'e6');
                g.addColorStop(0.4, cl.color + '55');
                g.addColorStop(1, cl.color + '00');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2); ctx.fill();

                ctx.fillStyle = cl.color;
                ctx.beginPath(); ctx.arc(p.x, p.y, n.r * boost, 0, Math.PI * 2); ctx.fill();

                if (n.core) {
                    ctx.fillStyle = pal.coreText;
                    ctx.font = '700 12px "Space Grotesk", sans-serif';
                    ctx.fillText('KK', p.x, p.y);
                    ctx.strokeStyle = cl.color + '66';
                    ctx.setLineDash([4, 6]);
                    ctx.beginPath(); ctx.arc(p.x, p.y, n.r + 10 + Math.sin(t * 1.4) * 2, 0, Math.PI * 2); ctx.stroke();
                    ctx.setLineDash([]);
                } else {
                    if (isSel) {
                        ctx.strokeStyle = cl.color;
                        ctx.lineWidth = 1.5;
                        ctx.beginPath(); ctx.arc(p.x, p.y, n.r * boost + 7, 0, Math.PI * 2); ctx.stroke();
                    }
                    ctx.font = (W < 520 ? '500 10px ' : (n.flag ? '600 12px ' : '500 11px ')) + '"JetBrains Mono", monospace';
                    ctx.fillStyle = pal.label(dim ? 0.25 : (isHover || isSel ? 1 : 0.72));
                    ctx.fillText(n.short, p.x, p.y + n.r + 16);
                }
                ctx.globalAlpha = 1;
            });

            hover = found;
            canvas.style.cursor = hover && !hover.core ? 'pointer' : 'crosshair';
            if (hint) {
                hint.textContent = hover && !hover.core
                    ? `// ${hover.id} — click to inspect`
                    : '// click a node to inspect';
                hint.style.color = hover && !hover.core ? 'var(--cyan)' : '';
            }
        }
        requestAnimationFrame(draw);
    }

    /* ── Skills orbital constellation (canvas) ─────────── */
    function skillsOrbit() {
        const canvas = $('#skillsOrbit');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const label = $('#skillsStageLabel');

        const RINGS = [
            { r: 0.16, speed: 0.00042, items: ['LangChain', 'LangGraph', 'RAG'] },
            { r: 0.30, speed: -0.0003, items: ['AI Agents', 'MCP', 'Embeddings', 'Prompt Eng', 'Gemini'] },
            { r: 0.44, speed: 0.00022, items: ['Vector DBs', 'Semantic Search', 'NLP', 'Deep Learning', 'ML', 'Python'] },
            { r: 0.58, speed: -0.00016, items: ['HuggingFace', 'Streamlit', 'Pandas', 'SQL', 'React', 'Next.js', 'Firebase', 'IoT'] }
        ];
        const nodes = [];
        RINGS.forEach((ring, ri) => {
            ring.items.forEach((name, i) => {
                nodes.push({
                    name, ring: ri,
                    angle: (Math.PI * 2 * i) / ring.items.length + ri * 0.7,
                    hover: 0
                });
            });
        });

        let W = 0, H = 0, CX = 0, CY = 0, R = 0, dpr = 1;
        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = canvas.clientWidth; H = canvas.clientHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            CX = W / 2; CY = H / 2;
            /* cap so outer ring (0.58R) + label width stays inside canvas */
            R = W < 520 ? Math.min((W / 2 - 46) / 0.58, H * 1.05) : Math.min(W, H) * 0.78;
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        let mouseX = -1e4, mouseY = -1e4;
        canvas.addEventListener('pointermove', (e) => {
            const r = canvas.getBoundingClientRect();
            mouseX = e.clientX - r.left;
            mouseY = e.clientY - r.top;
        }, { passive: true });
        canvas.addEventListener('pointerleave', () => { mouseX = mouseY = -1e4; });

        let inView = true;
        if ('IntersectionObserver' in window) {
            new IntersectionObserver((en) => { inView = en[0].isIntersecting; }, { threshold: 0 }).observe(canvas);
        }

        const PALETTES = {
            dark: {
                ring: 'rgba(139, 92, 246, 0.10)',
                coreA: 'rgba(167,139,250,0.9)', coreB: 'rgba(139,92,246,0.28)',
                coreText: '#eef0ff',
                link: (h) => `rgba(139,92,246,${0.05 + h * 0.3})`,
                nodeA: 'rgba(167,139,250,0.9)', nodeHoverA: 'rgba(34,211,238,0.95)',
                node: '#c4b5fd', nodeHover: '#22d3ee',
                label: (h) => `rgba(238,240,255,${0.45 + h * 0.55})`
            },
            light: {
                ring: 'rgba(124, 58, 237, 0.16)',
                coreA: 'rgba(124,58,237,0.85)', coreB: 'rgba(124,58,237,0.2)',
                coreText: '#ffffff',
                link: (h) => `rgba(109,40,217,${0.10 + h * 0.35})`,
                nodeA: 'rgba(124,58,237,0.8)', nodeHoverA: 'rgba(8,145,178,0.9)',
                node: '#6d28d9', nodeHover: '#0891b2',
                label: (h) => `rgba(20,22,42,${0.55 + h * 0.45})`
            }
        };
        let pal = PALETTES[getTheme()];
        document.addEventListener('themechange', (e) => { pal = PALETTES[e.detail] || PALETTES.dark; });

        const FONT = () => W < 520
            ? '500 10px "JetBrains Mono", monospace'
            : '500 12px "JetBrains Mono", monospace';
        let last = 0;
        function draw(ts) {
            requestAnimationFrame(draw);
            if (!inView) return;
            const dt = reduceMotion ? 0 : Math.min(ts - last, 50);
            last = ts;
            ctx.clearRect(0, 0, W, H);

            /* rings */
            RINGS.forEach((ring) => {
                ctx.beginPath();
                ctx.arc(CX, CY, ring.r * R, 0, Math.PI * 2);
                ctx.strokeStyle = pal.ring;
                ctx.setLineDash([3, 7]);
                ctx.stroke();
                ctx.setLineDash([]);
            });

            /* core */
            const coreGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, 34);
            coreGrad.addColorStop(0, pal.coreA);
            coreGrad.addColorStop(0.5, pal.coreB);
            coreGrad.addColorStop(1, 'rgba(139,92,246,0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath(); ctx.arc(CX, CY, 34, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = pal.coreText;
            ctx.font = '700 13px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('KK', CX, CY);

            /* nodes */
            let hovered = null;
            nodes.forEach((n) => {
                const ring = RINGS[n.ring];
                n.angle += ring.speed * dt;
                const x = CX + Math.cos(n.angle) * ring.r * R;
                const y = CY + Math.sin(n.angle) * ring.r * R * 0.62; /* elliptic */
                n.x = x; n.y = y;

                const d = Math.hypot(mouseX - x, mouseY - y);
                const target = d < 42 ? 1 : 0;
                n.hover += (target - n.hover) * 0.15;
                if (target && (!hovered || d < hovered.d)) hovered = { n, d };

                /* link to core */
                ctx.strokeStyle = pal.link(n.hover);
                ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(x, y); ctx.stroke();

                const rad = 3.4 + n.hover * 3;
                const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 3.4);
                g.addColorStop(0, n.hover > 0.4 ? pal.nodeHoverA : pal.nodeA);
                g.addColorStop(1, 'rgba(139,92,246,0)');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(x, y, rad * 3.4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = n.hover > 0.4 ? pal.nodeHover : pal.node;
                ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();

                ctx.font = FONT();
                ctx.fillStyle = pal.label(n.hover);
                ctx.fillText(n.name, x, y - 14 - n.hover * 4);
            });

            if (label) {
                label.textContent = hovered
                    ? `// ${hovered.n.name.toLowerCase()}.node — active`
                    : '// tech.universe';
            }
        }
        requestAnimationFrame(draw);
    }

    /* ── GitHub telemetry ──────────────────────────────── */
    function githubTelemetry() {
        const USER = 'Karthikeyan260';
        const section = $('#github');
        if (!section) return;

        const CACHE_KEY = 'gh-cache-v1';
        const cached = (() => {
            try {
                const c = JSON.parse(localStorage.getItem(CACHE_KEY));
                return c && Date.now() - c.t < 3600e3 ? c.data : null;
            } catch { return null; }
        })();

        const load = (data) => {
            const { user, repos } = data;
            const totals = {
                repos: user.public_repos,
                followers: user.followers,
                stars: repos.reduce((s, r) => s + r.stargazers_count, 0),
                forks: repos.reduce((s, r) => s + r.forks_count, 0)
            };
            Object.entries(totals).forEach(([k, v]) => {
                const card = $(`[data-gh="${k}"]`, section);
                if (!card) return;
                card.classList.add('loaded');
                const numEl = $('.gh-num', card);
                animateNum(numEl, v);
            });

            /* languages */
            const langs = {};
            repos.forEach((r) => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
            const sorted = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 7);
            drawLangChart(sorted);

            /* top repos */
            const list = $('#ghRepoList');
            const top = [...repos]
                .filter((r) => !r.fork)
                .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
                .slice(0, 5);
            list.innerHTML = top.map((r) => `
                <li><a class="gh-repo loaded" href="${r.html_url}" target="_blank" rel="noopener noreferrer">
                    <span class="gh-repo-name">${esc(r.name)}
                        <span class="stars"><i class="fas fa-star"></i> ${r.stargazers_count} · <i class="fas fa-code-branch"></i> ${r.forks_count}</span>
                    </span>
                    ${r.description ? `<span class="gh-repo-desc">${esc(r.description)}</span>` : ''}
                </a></li>`).join('');
        };

        const fetchAll = async () => {
            const [uRes, rRes] = await Promise.all([
                fetch(`https://api.github.com/users/${USER}`),
                fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`)
            ]);
            if (!uRes.ok || !rRes.ok) throw new Error('gh fetch failed');
            const data = { user: await uRes.json(), repos: await rRes.json() };
            try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch {}
            return data;
        };

        const start = async () => {
            try {
                load(cached || await fetchAll());
            } catch {
                $$('.gh-stat', section).forEach((c) => c.classList.add('loaded'));
                const list = $('#ghRepoList');
                if (list) list.innerHTML = '<li class="gh-repo loaded"><span class="gh-repo-desc">GitHub API rate-limited — <a href="https://github.com/Karthikeyan260" target="_blank" rel="noopener noreferrer">view profile directly</a>.</span></li>';
            }
        };

        /* lazy: only fetch when section nears viewport */
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((en) => {
                if (en[0].isIntersecting) { start(); io.disconnect(); }
            }, { rootMargin: '400px' });
            io.observe(section);
        } else start();

        function animateNum(el, target) {
            if (!el) return;
            if (reduceMotion) { el.textContent = target; return; }
            const dur = 1400, t0 = performance.now();
            (function step(t) {
                const p = Math.min((t - t0) / dur, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(step);
            })(t0);
        }

        function loadChartJs() {
            return new Promise((resolve, reject) => {
                if (typeof Chart !== 'undefined') return resolve();
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        async function drawLangChart(entries) {
            const cv = $('#langChart');
            if (!cv || !entries.length) return;
            try { await loadChartJs(); } catch { return; }
            const COLORS = ['#8b5cf6', '#22d3ee', '#e879f9', '#34d399', '#fbbf24', '#60a5fa', '#f87171'];
            const themeCfg = () => getTheme() === 'light'
                ? { legend: '#454b66', border: '#f3f4fb', ttBg: 'rgba(255,255,255,0.95)', ttColor: '#14162a' }
                : { legend: '#9aa0b8', border: 'rgba(5,5,9,0.9)', ttBg: 'rgba(14,14,28,0.95)', ttColor: '#eef0ff' };
            let tc = themeCfg();
            const chart = new Chart(cv, {
                type: 'doughnut',
                data: {
                    labels: entries.map(([l]) => l),
                    datasets: [{
                        data: entries.map(([, c]) => c),
                        backgroundColor: COLORS,
                        borderColor: tc.border,
                        borderWidth: 3,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '68%',
                    animation: reduceMotion ? false : { animateRotate: true, duration: 1200, easing: 'easeOutQuart' },
                    plugins: {
                        legend: {
                            position: window.innerWidth < 520 ? 'bottom' : 'right',
                            labels: {
                                color: tc.legend, usePointStyle: true, pointStyle: 'circle',
                                font: { family: 'Sora', size: 11 }, padding: 14
                            }
                        },
                        tooltip: {
                            backgroundColor: tc.ttBg,
                            titleColor: tc.ttColor, bodyColor: tc.ttColor,
                            borderColor: 'rgba(139,92,246,0.4)', borderWidth: 1,
                            titleFont: { family: 'Space Grotesk' },
                            bodyFont: { family: 'JetBrains Mono', size: 11 },
                            callbacks: { label: (c) => ` ${c.label}: ${c.parsed} repos` }
                        }
                    }
                }
            });
            document.addEventListener('themechange', () => {
                tc = themeCfg();
                chart.data.datasets[0].borderColor = tc.border;
                chart.options.plugins.legend.labels.color = tc.legend;
                chart.options.plugins.tooltip.backgroundColor = tc.ttBg;
                chart.options.plugins.tooltip.titleColor = tc.ttColor;
                chart.options.plugins.tooltip.bodyColor = tc.ttColor;
                chart.update();
            });
        }
    }

    /* ── Contact form ──────────────────────────────────── */
    function contactForm() {
        const form = $('#contactForm');
        if (!form) return;
        const status = $('#formStatus');
        const btn = $('#submitBtn');
        const labelSpan = $('.btn-label', btn);
        const sendingSpan = $('.btn-sending', btn);

        const validate = (input) => {
            const field = input.closest('.field');
            const ok = input.checkValidity() && input.value.trim().length > 0;
            field.classList.toggle('invalid', !ok);
            return ok;
        };
        $$('input[required], textarea[required]', form).forEach((inp) => {
            inp.addEventListener('blur', () => validate(inp));
            inp.addEventListener('input', () => inp.closest('.field').classList.remove('invalid'));
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = $$('input[required], textarea[required]', form);
            /* map first so every field gets marked, not just the first invalid one */
            if (inputs.map(validate).includes(false)) {
                status.textContent = 'Please fill in all fields correctly.';
                status.className = 'form-status err';
                return;
            }
            labelSpan.hidden = true;
            sendingSpan.hidden = false;
            btn.disabled = true;
            status.textContent = '';
            try {
                const payload = new FormData(form);
                payload.append('_subject', 'Portfolio contact — new message');
                payload.append('_captcha', 'false');
                const res = await fetch('https://formsubmit.co/ajax/kartji005@gmail.com', {
                    method: 'POST',
                    headers: { Accept: 'application/json, text/plain, */*' },
                    body: payload
                });
                if (!res.ok) throw new Error('send failed');
                status.textContent = '✓ Message transmitted — I\'ll get back to you soon!';
                status.className = 'form-status ok';
                form.reset();
                toast('Message sent successfully 🚀');
            } catch {
                status.textContent = 'Transmission failed — email me directly at kartji005@gmail.com';
                status.className = 'form-status err';
            } finally {
                labelSpan.hidden = false;
                sendingSpan.hidden = true;
                btn.disabled = false;
            }
        });
    }

    /* ── Toast ─────────────────────────────────────────── */
    let toastTimer;
    function toast(msg) {
        const el = $('#toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
    }

    /* ── AI assistant (KAI) ────────────────────────────── */
    function aiAssistant() {
        const fab = $('#aiFab'), panel = $('#aiPanel'), close = $('#aiClose');
        const body = $('#aiBody'), form = $('#aiForm'), field = $('#aiField');
        if (!fab || !panel) return;

        const KNOWLEDGE = [
            {
                keys: ['skill', 'stack', 'tech', 'know', 'language', 'langchain', 'rag', 'agent'],
                a: 'Karthikeyan\'s core stack is <strong>agentic AI</strong>: LangChain, LangGraph, RAG, MCP, vector databases, embeddings, semantic search and prompt engineering — powered by <strong>Python</strong> and the Gemini API, with ML/DL/NLP depth and a React/Next.js full-stack foundation. Explore the <a href="#skills">skill constellation</a>.'
            },
            {
                keys: ['project', 'work', 'built', 'portfolio', 'best'],
                a: 'AI highlights: <strong>AI Consulting System</strong> (multi-domain LLM expert system — published research), <strong>AI Job Application Assistant</strong> (LLM career copilot), <strong>NutrifyAI</strong> (multimodal vision analysis), and a custom <strong>Address NER</strong> model at 92% F1 on Hugging Face. See <a href="#projects">all projects</a>.'
            },
            {
                keys: ['experience', 'job', 'zinnov', 'intern', 'career'],
                a: 'Currently <strong>Associate Data Analyst @ Zinnov</strong> (Sep 2025–present) — LLM role-mapping agents cutting manual effort ~90%, and a RAG entity-resolution system reconciling <strong>1.6M+ records</strong> at ~90% accuracy. Started at Zinnov as a Tech Intern and converted to full-time; earlier internships include Full Stack at OctaNet and IoT at Anna University MIT &amp; Sri Sairam. Details in <a href="#experience">Experience</a>.'
            },
            {
                keys: ['contact', 'email', 'reach', 'hire', 'phone', 'connect'],
                a: 'Reach out via <a href="mailto:kartji005@gmail.com">kartji005@gmail.com</a>, phone +91 93457 66900, or <a href="https://www.linkedin.com/in/karthikeyan2604/" target="_blank" rel="noopener">LinkedIn</a>. The <a href="#contact">contact form</a> works too!'
            },
            {
                keys: ['education', 'college', 'degree', 'study'],
                a: 'B.Tech in Information Technology, <strong>DMI College of Engineering</strong> (2021–2025), with 4 industry internships completed during the program.'
            },
            {
                keys: ['cert', 'credential', 'anthropic', 'claude', 'publication', 'paper', 'research'],
                a: '45 credentials across five categories — including <strong>Claude Certified Architect (Anthropic)</strong>, AI Agents in LangGraph (DeepLearning.AI), AWS Prompt Engineering, Hugging Face AI Agents Fundamentals and AMD AI Academy agent courses — plus two published research papers. See <a href="#certifications">Credentials</a>.'
            },
            {
                keys: ['resume', 'cv', 'download'],
                a: 'Grab the resume here: <a href="resume.pdf?v=2026-05" download>Download PDF</a> 📄'
            },
            {
                keys: ['hello', 'hi', 'hey', 'yo'],
                a: 'Hello! 👋 I\'m KAI, Karthikeyan\'s portfolio assistant. Ask me about his <a href="#skills">skills</a>, <a href="#projects">projects</a>, <a href="#experience">experience</a>, or how to <a href="#contact">get in touch</a>.'
            },
            {
                keys: ['who', 'about', 'karthikeyan'],
                a: 'Karthikeyan K is an <strong>AI Engineer</strong> from Chennai building multi-agent LLM systems at Zinnov. He designs agents that don\'t just answer — they retrieve context, take multi-step actions and automate real business workflows. Always exploring the newest AI frameworks.'
            }
        ];
        const FALLBACK = 'Interesting question! I know about Karthikeyan\'s <a href="#skills">skills</a>, <a href="#projects">projects</a>, <a href="#experience">experience</a>, <a href="#certifications">certifications</a> and <a href="#contact">contact info</a> — try one of those. 🤖';

        function setOpen(open) {
            panel.classList.toggle('open', open);
            panel.setAttribute('aria-hidden', String(!open));
            fab.setAttribute('aria-expanded', String(open));
            if (open && !body.childElementCount) {
                botReply('Hi! 👋 I\'m <strong>KAI</strong> — ask me anything about Karthikeyan\'s work, skills, or experience.');
            }
            if (open) field.focus();
        }
        fab.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
        close.addEventListener('click', () => setOpen(false));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

        function addMsg(html, who) {
            const div = document.createElement('div');
            div.className = 'ai-msg ' + who;
            div.innerHTML = html;
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
            return div;
        }

        function botReply(html) {
            const typing = document.createElement('div');
            typing.className = 'ai-msg bot ai-typing';
            typing.innerHTML = '<i></i><i></i><i></i>';
            body.appendChild(typing);
            body.scrollTop = body.scrollHeight;
            setTimeout(() => {
                typing.remove();
                addMsg(html, 'bot');
            }, reduceMotion ? 60 : 650 + Math.random() * 500);
        }

        function answer(q) {
            const lower = q.toLowerCase();
            const hit = KNOWLEDGE.find((k) => k.keys.some((key) => lower.includes(key)));
            botReply(hit ? hit.a : FALLBACK);
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = field.value.trim();
            if (!q) return;
            addMsg(esc(q), 'user');
            field.value = '';
            answer(q);
        });

        $$('#aiSuggest button').forEach((b) => {
            b.addEventListener('click', () => {
                setOpen(true);
                addMsg(esc(b.textContent), 'user');
                answer(b.dataset.q);
            });
        });
    }

    /* ── utils ─────────────────────────────────────────── */
    function esc(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }
})();
