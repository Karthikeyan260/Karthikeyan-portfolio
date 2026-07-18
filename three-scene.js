/* three-scene.js — Neural constellation hero background (Three.js) */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function init() {
        const canvas = document.getElementById('heroCanvas3D');
        if (!canvas || typeof THREE === 'undefined' || reduceMotion) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050509, 0.035);

        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.z = 16;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
            powerPreference: 'low-power'
        });
        /* ── Neural nodes ── */
        const isMobile = window.innerWidth < 760;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.4 : 1.75));
        const COUNT = isMobile ? 70 : 170;
        const SPREAD = 26;
        const LINK_DIST = isMobile ? 4.2 : 4.8;

        const positions = new Float32Array(COUNT * 3);
        const velocities = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * SPREAD;
            positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.62;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
            velocities[i * 3] = (Math.random() - 0.5) * 0.012;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.012;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.006;
        }

        const nodeGeo = new THREE.BufferGeometry();
        nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        /* soft glowing dot sprite */
        const dotCanvas = document.createElement('canvas');
        dotCanvas.width = dotCanvas.height = 64;
        const dctx = dotCanvas.getContext('2d');
        const grad = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(190,160,255,1)');
        grad.addColorStop(0.35, 'rgba(139,92,246,0.7)');
        grad.addColorStop(1, 'rgba(139,92,246,0)');
        dctx.fillStyle = grad;
        dctx.fillRect(0, 0, 64, 64);
        const dotTex = new THREE.CanvasTexture(dotCanvas);

        const nodeMat = new THREE.PointsMaterial({
            size: isMobile ? 0.34 : 0.42,
            map: dotTex,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            color: 0xa78bfa
        });
        const points = new THREE.Points(nodeGeo, nodeMat);
        scene.add(points);

        /* a few accent nodes (cyan) */
        const accentGeo = new THREE.BufferGeometry();
        const accentPos = new Float32Array(18 * 3);
        for (let i = 0; i < 18; i++) {
            accentPos[i * 3] = (Math.random() - 0.5) * SPREAD;
            accentPos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.6;
            accentPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        accentGeo.setAttribute('position', new THREE.BufferAttribute(accentPos, 3));
        const accentMat = new THREE.PointsMaterial({
            size: 0.55, map: dotTex, transparent: true, depthWrite: false,
            blending: THREE.AdditiveBlending, color: 0x22d3ee
        });
        scene.add(new THREE.Points(accentGeo, accentMat));

        /* ── Connections ── */
        const MAX_LINKS = COUNT * 4;
        const linePositions = new Float32Array(MAX_LINKS * 6);
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({
            color: 0x8b5cf6, transparent: true, opacity: 0.14,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(lines);

        /* ── Theme adaptation (additive blending vanishes on light bg) ── */
        let baseLineOpacity = 0.14;
        function applyTheme(t) {
            const light = t === 'light';
            nodeMat.color.set(light ? 0x6d28d9 : 0xa78bfa);
            accentMat.color.set(light ? 0x0e7490 : 0x22d3ee);
            lineMat.color.set(light ? 0x7c3aed : 0x8b5cf6);
            baseLineOpacity = light ? 0.30 : 0.14;
            scene.fog.color.set(light ? 0xf3f4fb : 0x050509);
            nodeMat.opacity = light ? 0.75 : 1;
            accentMat.opacity = light ? 0.8 : 1;
            const blend = light ? THREE.NormalBlending : THREE.AdditiveBlending;
            [nodeMat, accentMat, lineMat].forEach((m) => { m.blending = blend; m.needsUpdate = true; });
        }
        applyTheme(document.documentElement.dataset.theme);
        document.addEventListener('themechange', (e) => applyTheme(e.detail));

        /* ── Mouse parallax ── */
        let targetX = 0, targetY = 0, curX = 0, curY = 0;
        window.addEventListener('pointermove', (e) => {
            targetX = (e.clientX / window.innerWidth - 0.5) * 2;
            targetY = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        /* ── Resize ── */
        function resize() {
            const w = canvas.clientWidth || window.innerWidth;
            const h = canvas.clientHeight || window.innerHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        /* ── Visibility gating ── */
        let visible = true, inView = true;
        document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; }, { threshold: 0 })
                .observe(canvas);
        }

        const HALF_X = SPREAD / 2, HALF_Y = SPREAD * 0.31, HALF_Z = 6;
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            if (!visible || !inView) return;
            const t = clock.getElapsedTime();

            const pos = nodeGeo.attributes.position.array;
            for (let i = 0; i < COUNT; i++) {
                const ix = i * 3;
                pos[ix] += velocities[ix];
                pos[ix + 1] += velocities[ix + 1];
                pos[ix + 2] += velocities[ix + 2];
                if (Math.abs(pos[ix]) > HALF_X) velocities[ix] *= -1;
                if (Math.abs(pos[ix + 1]) > HALF_Y) velocities[ix + 1] *= -1;
                if (Math.abs(pos[ix + 2]) > HALF_Z) velocities[ix + 2] *= -1;
            }
            nodeGeo.attributes.position.needsUpdate = true;

            /* rebuild links */
            let ptr = 0, linkCount = 0;
            for (let i = 0; i < COUNT && linkCount < MAX_LINKS; i++) {
                const ix = i * 3;
                for (let j = i + 1; j < COUNT && linkCount < MAX_LINKS; j++) {
                    const jx = j * 3;
                    const dx = pos[ix] - pos[jx];
                    const dy = pos[ix + 1] - pos[jx + 1];
                    const dz = pos[ix + 2] - pos[jx + 2];
                    if (dx * dx + dy * dy + dz * dz < LINK_DIST * LINK_DIST) {
                        linePositions[ptr++] = pos[ix];
                        linePositions[ptr++] = pos[ix + 1];
                        linePositions[ptr++] = pos[ix + 2];
                        linePositions[ptr++] = pos[jx];
                        linePositions[ptr++] = pos[jx + 1];
                        linePositions[ptr++] = pos[jx + 2];
                        linkCount++;
                    }
                }
            }
            lineGeo.setDrawRange(0, linkCount * 2);
            lineGeo.attributes.position.needsUpdate = true;

            /* gentle scene drift + parallax */
            curX += (targetX - curX) * 0.04;
            curY += (targetY - curY) * 0.04;
            scene.rotation.y = curX * 0.14 + Math.sin(t * 0.05) * 0.05;
            scene.rotation.x = curY * 0.1;
            camera.position.x = curX * 0.6;
            camera.position.y = -curY * 0.4;
            camera.lookAt(scene.position);

            lineMat.opacity = baseLineOpacity + Math.sin(t * 0.8) * 0.035;

            renderer.render(scene, camera);
        }
        animate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
