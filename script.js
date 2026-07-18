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
        projectFilters();
        skillsOrbit();
        githubTelemetry();
        contactForm();
        aiAssistant();
        $('#currentYear') && ($('#currentYear').textContent = new Date().getFullYear());
    });

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
            const items = $$('.section-head, .glass-card, .project-card, .filter-bar', sec)
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
            const card = e.target.closest('.glass-card, .project-card');
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

    /* ── Project filters ───────────────────────────────── */
    function projectFilters() {
        const btns = $$('.filter-btn');
        const cards = $$('.project-card');
        if (!btns.length) return;
        btns.forEach((btn) => {
            btn.addEventListener('click', () => {
                btns.forEach((b) => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-pressed', String(b === btn));
                });
                const f = btn.dataset.filter;
                cards.forEach((card) => {
                    const show = f === 'all' || card.dataset.category === f;
                    card.classList.toggle('hide', !show);
                });
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            });
        });
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

        function drawLangChart(entries) {
            const cv = $('#langChart');
            if (!cv || typeof Chart === 'undefined' || !entries.length) return;
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
            if (!inputs.every(validate)) {
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
                a: 'Currently <strong>Associate Data Analyst @ Zinnov</strong> (Sep 2025–present) — LLM role-mapping agents cutting manual effort ~90%, and a RAG entity-resolution system reconciling <strong>1.6M+ records</strong> at ~90% accuracy. Six internships before that: Zinnov (Tech), MarcelloTech (UI), OctaNet (Full Stack), NoviTech (AI + Full Stack), and IoT at Anna University MIT &amp; Sri Sairam. Details in <a href="#experience">Experience</a>.'
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
                a: '20+ certifications including <strong>Claude Certified Architect (Anthropic)</strong>, Hugging Face AI Agents Fundamentals, AMD AI Academy agent courses and Google Cloud GenAI — plus a published paper: <strong>"AI-Driven Consulting: A Smart Expert System for Diverse Domains"</strong>. See <a href="#certifications">Credentials</a>.'
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
