/* three-scene.js – 3D animations for Karthikeyan K Portfolio */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ *
     *  Utility helpers
     * ------------------------------------------------------------------ */
    function lerp(a, b, t) { return a + (b - a) * t; }
    function randRange(min, max) { return Math.random() * (max - min) + min; }

    /* ------------------------------------------------------------------ *
     *  1. HERO 3D SCENE
     *     – Replaces the 2-D canvas with a Three.js WebGL scene containing:
     *       • floating wireframe icosahedron  (main centrepiece)
     *       • rotating torus-knot              (right side)
     *       • spinning octahedron              (left side)
     *       • 3-D star-field particles
     *       • mouse-driven camera parallax
     * ------------------------------------------------------------------ */
    function setupHeroScene(THREE) {
        var canvas = document.getElementById('heroCanvas3D');
        if (!canvas) return;

        var hero   = document.querySelector('.hero');
        var W = hero ? hero.offsetWidth  : window.innerWidth;
        var H = hero ? hero.offsetHeight : window.innerHeight;

        var scene    = new THREE.Scene();
        var camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
        camera.position.set(0, 0, 9);

        var renderer = new THREE.WebGLRenderer({
            canvas       : canvas,
            alpha        : true,
            antialias    : true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        /* ── theme colours ─────────────────────────────────────── */
        var C_PURPLE  = 0x7c3aed;
        var C_BLUE    = 0x2563eb;
        var C_LPURPLE = 0x8b5cf6;
        var C_CYAN    = 0x06b6d4;

        /* ── helpers ───────────────────────────────────────────── */
        function wireMesh(geo, color, opacity) {
            return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
                color       : color,
                wireframe   : true,
                transparent : true,
                opacity     : opacity
            }));
        }

        /* ── main icosahedron ──────────────────────────────────── */
        var ico = wireMesh(new THREE.IcosahedronGeometry(2.1, 1), C_PURPLE, 0.35);
        ico.position.set(0, 0, -1);
        scene.add(ico);

        /* ── torus-knot (right) ────────────────────────────────── */
        var tk = wireMesh(new THREE.TorusKnotGeometry(1.05, 0.28, 80, 10), C_BLUE, 0.30);
        tk.position.set(4.5, 1.8, -3);
        scene.add(tk);

        /* ── octahedron (left) ─────────────────────────────────── */
        var oct = wireMesh(new THREE.OctahedronGeometry(1.0, 0), C_LPURPLE, 0.45);
        oct.position.set(-4.8, -1.6, -1);
        scene.add(oct);

        /* ── dodecahedron (extra depth) ────────────────────────── */
        var dod = wireMesh(new THREE.DodecahedronGeometry(0.7, 0), C_CYAN, 0.35);
        dod.position.set(-2.5, 2.5, -4);
        scene.add(dod);

        /* ── small floating spheres ────────────────────────────── */
        var smallCols = [C_PURPLE, C_BLUE, C_LPURPLE, C_CYAN, C_PURPLE];
        var smalls = Array.from({ length: 8 }, function (_, i) {
            var m = wireMesh(new THREE.SphereGeometry(0.13, 8, 8), smallCols[i % smallCols.length], 0.65);
            m.position.set(randRange(-6, 6), randRange(-3.5, 3.5), randRange(-5, 0));
            scene.add(m);
            return { mesh: m, phase: randRange(0, Math.PI * 2), speed: randRange(0.4, 0.9), r: randRange(0.25, 0.55) };
        });

        /* ── 3-D star particles ────────────────────────────────── */
        var N_STARS = 350;
        var starPos = new Float32Array(N_STARS * 3);
        for (var i = 0; i < N_STARS; i++) {
            starPos[i * 3]     = randRange(-18, 18);
            starPos[i * 3 + 1] = randRange(-14, 14);
            starPos[i * 3 + 2] = randRange(-12, 2);
        }
        var starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        var starPts = new THREE.Points(starGeo, new THREE.PointsMaterial({
            color: C_PURPLE, size: 0.045, transparent: true, opacity: 0.75
        }));
        scene.add(starPts);

        /* ── a second star-layer (blue) ────────────────────────── */
        var N_STARS2 = 200;
        var starPos2 = new Float32Array(N_STARS2 * 3);
        for (var j = 0; j < N_STARS2; j++) {
            starPos2[j * 3]     = randRange(-18, 18);
            starPos2[j * 3 + 1] = randRange(-14, 14);
            starPos2[j * 3 + 2] = randRange(-12, 2);
        }
        var starGeo2 = new THREE.BufferGeometry();
        starGeo2.setAttribute('position', new THREE.BufferAttribute(starPos2, 3));
        var starPts2 = new THREE.Points(starGeo2, new THREE.PointsMaterial({
            color: C_BLUE, size: 0.03, transparent: true, opacity: 0.55
        }));
        scene.add(starPts2);

        /* ── mouse tracking ────────────────────────────────────── */
        var tMouseX = 0, tMouseY = 0;
        var cMouseX = 0, cMouseY = 0;
        document.addEventListener('mousemove', function (e) {
            tMouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
            tMouseY = (e.clientY / window.innerHeight - 0.5) * -2;
        });

        /* ── resize ────────────────────────────────────────────── */
        window.addEventListener('resize', function () {
            var nW = hero ? hero.offsetWidth : window.innerWidth;
            var nH = hero ? hero.offsetHeight : window.innerHeight;
            camera.aspect = nW / nH;
            camera.updateProjectionMatrix();
            renderer.setSize(nW, nH);
        });

        /* ── animation loop ────────────────────────────────────── */
        var t = 0;
        var heroVisible = true;
        var obsHero = new IntersectionObserver(function (entries) {
            heroVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        if (hero) obsHero.observe(hero);

        function animateHero() {
            requestAnimationFrame(animateHero);
            if (!heroVisible) return;
            t += 0.012;

            /* smooth camera parallax */
            cMouseX = lerp(cMouseX, tMouseX, 0.04);
            cMouseY = lerp(cMouseY, tMouseY, 0.04);
            camera.position.x = lerp(camera.position.x, cMouseX * 1.5, 0.05);
            camera.position.y = lerp(camera.position.y, cMouseY * 1.0, 0.05);
            camera.lookAt(0, 0, 0);

            /* rotate main objects */
            ico.rotation.x += 0.003;
            ico.rotation.y += 0.005;
            tk.rotation.x  += 0.006;
            tk.rotation.z  += 0.004;
            oct.rotation.x += 0.004;
            oct.rotation.y += 0.007;
            dod.rotation.x += 0.005;
            dod.rotation.z += 0.006;

            /* floating bob */
            ico.position.y = Math.sin(t * 0.6) * 0.3;
            tk.position.y  = 1.8 + Math.sin(t * 0.8 + 1.0) * 0.25;
            oct.position.y = -1.6 + Math.sin(t * 0.7 + 2.0) * 0.22;
            dod.position.y = 2.5 + Math.sin(t * 0.5 + 0.5) * 0.2;

            /* small spheres drift */
            smalls.forEach(function (s, idx) {
                s.phase += 0.01 * s.speed;
                s.mesh.position.x += Math.sin(s.phase + idx) * 0.005;
                s.mesh.position.y += Math.cos(s.phase * 0.7 + idx) * 0.004;
                s.mesh.rotation.y += 0.02;
            });

            /* gentle star-field drift */
            starPts.rotation.y  += 0.00025;
            starPts.rotation.x  += 0.00015;
            starPts2.rotation.y -= 0.0002;
            starPts2.rotation.x += 0.00012;

            renderer.render(scene, camera);
        }
        animateHero();
    }

    /* ------------------------------------------------------------------ *
     *  2. SKILLS 3D TECH-SPHERE
     *     – Orbiting sphere with floating rings and coloured dots
     * ------------------------------------------------------------------ */
    function setupSkillsSphere(THREE) {
        var canvas = document.getElementById('skillsSphereCanvas');
        if (!canvas) return;

        var container = canvas.parentElement;
        var W = container.offsetWidth;
        var H = 340;
        canvas.height = H;

        var scene    = new THREE.Scene();
        var camera   = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
        camera.position.set(0, 0, 7);

        var renderer = new THREE.WebGLRenderer({
            canvas  : canvas,
            alpha   : true,
            antialias: true
        });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        var C_P = 0x7c3aed;
        var C_B = 0x2563eb;
        var C_L = 0x8b5cf6;
        var C_C = 0x06b6d4;
        var C_G = 0x10b981;

        /* central wireframe sphere */
        var mainSphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.3, 32, 32),
            new THREE.MeshBasicMaterial({ color: C_P, wireframe: true, transparent: true, opacity: 0.22 })
        );
        scene.add(mainSphere);

        /* inner solid glow */
        var innerSphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.05, 16, 16),
            new THREE.MeshBasicMaterial({ color: C_L, transparent: true, opacity: 0.07 })
        );
        scene.add(innerSphere);

        /* icosahedron shell */
        var icoShell = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.5, 1),
            new THREE.MeshBasicMaterial({ color: C_B, wireframe: true, transparent: true, opacity: 0.12 })
        );
        scene.add(icoShell);

        /* orbiting torus rings */
        function makeRing(r, color, opacity, rx, ry) {
            var m = new THREE.Mesh(
                new THREE.TorusGeometry(r, 0.025, 8, 64),
                new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity })
            );
            m.rotation.x = rx || 0;
            m.rotation.y = ry || 0;
            scene.add(m);
            return m;
        }
        var ring1 = makeRing(2.3, C_P, 0.45, Math.PI / 3, 0);
        var ring2 = makeRing(2.9, C_B, 0.30, Math.PI / 5, Math.PI / 4);
        var ring3 = makeRing(3.5, C_C, 0.20, Math.PI / 2, Math.PI / 6);

        /* orbiting dots (tech-nodes) */
        var nodeColors = [C_P, C_B, C_L, C_C, C_G];
        var nodes = Array.from({ length: 24 }, function (_, i) {
            var geo = new THREE.SphereGeometry(0.07, 8, 8);
            var mat = new THREE.MeshBasicMaterial({ color: nodeColors[i % nodeColors.length], transparent: true, opacity: 0.9 });
            var m = new THREE.Mesh(geo, mat);
            var theta = (i / 24) * Math.PI * 2;
            var phi   = Math.acos(2 * Math.random() - 1);
            var r     = 2.3 + Math.random() * 1.0;
            m.position.set(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );
            scene.add(m);
            return { mesh: m, speed: randRange(0.25, 0.55), phase: randRange(0, Math.PI * 2), baseR: r };
        });

        /* resize */
        window.addEventListener('resize', function () {
            var nW = container.offsetWidth;
            camera.aspect = nW / H;
            camera.updateProjectionMatrix();
            renderer.setSize(nW, H);
        });

        /* hover pause */
        var paused = false;
        canvas.addEventListener('mouseenter', function () { paused = true; });
        canvas.addEventListener('mouseleave', function () { paused = false; });

        var skillsVisible = false;
        var obsSkills = new IntersectionObserver(function (entries) {
            skillsVisible = entries[0].isIntersecting;
        }, { threshold: 0.1 });
        var skillsSection = document.getElementById('skills');
        if (skillsSection) obsSkills.observe(skillsSection);

        var t = 0;
        function animateSphere() {
            requestAnimationFrame(animateSphere);
            if (!skillsVisible) return;
            if (!paused) {
                t += 0.01;
                mainSphere.rotation.y += 0.003;
                mainSphere.rotation.x += 0.001;
                innerSphere.rotation.y -= 0.002;
                icoShell.rotation.y   += 0.002;
                icoShell.rotation.x   += 0.001;
                ring1.rotation.z += 0.005;
                ring2.rotation.z -= 0.004;
                ring2.rotation.x += 0.002;
                ring3.rotation.y += 0.006;
                ring3.rotation.z -= 0.003;
            }
            nodes.forEach(function (n, i) {
                var ang = t * n.speed + n.phase;
                var phi = Math.sin(t * 0.25 + i * 0.4) * Math.PI;
                var r   = n.baseR + Math.sin(t * 0.5 + n.phase) * 0.2;
                n.mesh.position.x = r * Math.sin(phi) * Math.cos(ang);
                n.mesh.position.y = r * Math.cos(phi) * 0.6;
                n.mesh.position.z = r * Math.sin(phi) * Math.sin(ang);
            });
            renderer.render(scene, camera);
        }
        animateSphere();
    }

    /* ------------------------------------------------------------------ *
     *  3. SECTION FLOATING DECORATION SPHERES
     *     Subtle background 3-D geometry for About / Experience sections
     * ------------------------------------------------------------------ */
    function setupSectionDeco(THREE) {
        var canvases = document.querySelectorAll('.section-deco-canvas');
        canvases.forEach(function (canvas) {
            var container = canvas.parentElement;
            var W = container.offsetWidth;
            var H = container.offsetHeight;
            if (!W || !H) return;

            var scene  = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
            camera.position.z = 6;

            var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
            renderer.setSize(W, H);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

            /* a couple of rotating wireframe shapes */
            var s1 = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.9, 0),
                new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.2 })
            );
            s1.position.set(2, 0.5, 0);
            scene.add(s1);

            var s2 = new THREE.Mesh(
                new THREE.TorusGeometry(0.6, 0.15, 8, 32),
                new THREE.MeshBasicMaterial({ color: 0x2563eb, wireframe: true, transparent: true, opacity: 0.18 })
            );
            s2.position.set(-2, -0.5, -1);
            scene.add(s2);

            window.addEventListener('resize', function () {
                var nW = container.offsetWidth;
                var nH = container.offsetHeight;
                camera.aspect = nW / nH;
                camera.updateProjectionMatrix();
                renderer.setSize(nW, nH);
            });

            var t = 0;
            var visible = false;
            var obs = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0 });
            obs.observe(container);

            (function loop() {
                requestAnimationFrame(loop);
                if (!visible) return;
                t += 0.01;
                s1.rotation.x += 0.004;
                s1.rotation.y += 0.006;
                s2.rotation.x += 0.006;
                s2.rotation.z += 0.005;
                s1.position.y = 0.5 + Math.sin(t * 0.7) * 0.3;
                s2.position.y = -0.5 + Math.sin(t * 0.5 + 1) * 0.25;
                renderer.render(scene, camera);
            })();
        });
    }

    /* ------------------------------------------------------------------ *
     *  4. PROJECT CARD 3-D TILT EFFECT
     *     Pure JS: reads mouse position relative to card and applies
     *     CSS perspective-tilt transform + dynamic highlight gradient.
     * ------------------------------------------------------------------ */
    function setupCardTilt() {
        var cards = document.querySelectorAll('.project-card');
        var MAX_TILT = 10; /* degrees */
        var TILT_RESET = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';

        cards.forEach(function (card) {
            var pendingEnd = null;

            card.addEventListener('mouseenter', function () {
                card.style.transition = 'transform 0.1s ease';
                if (pendingEnd) {
                    card.removeEventListener('transitionend', pendingEnd);
                    pendingEnd = null;
                }
            });

            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var relX = (e.clientX - rect.left) / rect.width  - 0.5;
                var relY = (e.clientY - rect.top)  / rect.height - 0.5;
                var rotX = (-relY * MAX_TILT).toFixed(2);
                var rotY = ( relX * MAX_TILT).toFixed(2);
                card.style.transform =
                    `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
                card.style.setProperty('--tilt-gx', `${((relX + 0.5) * 100).toFixed(1)}%`);
                card.style.setProperty('--tilt-gy', `${((relY + 0.5) * 100).toFixed(1)}%`);
                card.classList.add('tilt-active');
            });

            card.addEventListener('mouseleave', function () {
                card.style.transition = 'transform 0.5s ease';
                card.style.transform = TILT_RESET;
                card.classList.remove('tilt-active');
                pendingEnd = function () {
                    card.style.transform = '';
                    card.style.transition = '';
                    card.removeEventListener('transitionend', pendingEnd);
                    pendingEnd = null;
                };
                card.addEventListener('transitionend', pendingEnd);
            });
        });
    }

    /* ------------------------------------------------------------------ *
     *  5. SKILL ITEM 3-D LIFT EFFECT
     * ------------------------------------------------------------------ */
    function setupSkillLift() {
        var items = document.querySelectorAll('.skill-item');
        items.forEach(function (item) {
            item.addEventListener('mouseenter', function () {
                item.classList.add('skill-lifted');
            });
            item.addEventListener('mouseleave', function () {
                item.classList.remove('skill-lifted');
            });
        });
    }

    /* ------------------------------------------------------------------ *
     *  Bootstrap – wait for Three.js to be available
     * ------------------------------------------------------------------ */
    function boot() {
        var THREE = window.THREE;
        if (!THREE) return;
        setupHeroScene(THREE);
        setupSkillsSphere(THREE);
        setupSectionDeco(THREE);
        setupCardTilt();
        setupSkillLift();
    }

    /* three-scene.js is deferred, so DOM is ready when this runs. */
    boot();
})();
