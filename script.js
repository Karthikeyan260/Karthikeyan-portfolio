document.addEventListener('DOMContentLoaded', () => {
    // Preloader
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1600);
    });

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init("2SaR4iNsIAD9SU7Ll");
    }

    // Set current year in footer
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80
        });
    }

    // Custom cursor (desktop only)
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let isMouseDown = false;

    if (cursor && cursorFollower) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)` + (isMouseDown ? ' scale(0.8)' : '');
        });

        function animateFollower() {
            const speed = 0.08;
            followerX += (mouseX - followerX) * speed;
            followerY += (mouseY - followerY) * speed;
            cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)` + (isMouseDown ? ' scale(0.8)' : '');
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        document.addEventListener('mousedown', () => {
            isMouseDown = true;
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(0.8)`;
            cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) scale(0.8)`;
        });

        document.addEventListener('mouseup', () => {
            isMouseDown = false;
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
            cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;
        });

        // Cursor hover effects on interactive elements
        const interactiveEls = document.querySelectorAll('a, button, .project-card, .skill-item, .stat-item, .pstat-item');
        interactiveEls.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
                cursorFollower.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
                cursorFollower.classList.remove('cursor-hover');
            });
        });
    }

    // Typed.js initialization
    if (typeof Typed !== 'undefined') {
        new Typed('#typed', {
            strings: [
                'Full Stack Developer',
                'IoT Enthusiast',
                'AI Developer',
                'Blockchain Developer',
                'Problem Solver'
            ],
            typeSpeed: 55,
            backSpeed: 35,
            backDelay: 2000,
            loop: true
        });
    } else {
        const typedElement = document.getElementById('typed');
        if (typedElement) {
            const strings = ['Full Stack Developer', 'IoT Enthusiast', 'AI Developer', 'Blockchain Developer', 'Problem Solver'];
            let currentString = 0;
            function updateText() {
                typedElement.textContent = strings[currentString];
                currentString = (currentString + 1) % strings.length;
            }
            updateText();
            setInterval(updateText, 3000);
        }
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            const isDark = body.classList.contains('dark-theme');
            themeToggle.innerHTML = isDark
                ? '<i class="fas fa-sun" aria-hidden="true"></i>'
                : '<i class="fas fa-moon" aria-hidden="true"></i>';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            // Prevent body scroll when menu is open
            body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
                menuToggle.focus();
            }
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

            if (navLinks) {
                navLinks.classList.remove('active');
                if (menuToggle) {
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
                body.style.overflow = '';
            }
        });
    });

    // Skills progress animation
    const skillItems = document.querySelectorAll('.skill-item');
    
    const animateProgress = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.progress');
                const progress = entry.target.dataset.progress;
                if (progressBar && progress) {
                    progressBar.style.width = `${progress}%`;
                }
                observer.unobserve(entry.target);
            }
        });
    };

    const progressObserver = new IntersectionObserver(animateProgress, { threshold: 0.3 });
    skillItems.forEach(item => progressObserver.observe(item));

    // AI Education progress bar animation
    const eduProgressBars = document.querySelectorAll('.edu-progress');
    const animateEduProgress = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = bar.dataset.width;
                if (targetWidth) {
                    setTimeout(() => { bar.style.width = `${targetWidth}%`; }, 80);
                }
                observer.unobserve(bar);
            }
        });
    };
    const eduProgressObserver = new IntersectionObserver(animateEduProgress, { threshold: 0.4 });
    eduProgressBars.forEach(bar => eduProgressObserver.observe(bar));

    // About stats counter animation (reusable)
    function animateCounter(el, target, duration) {
        let current = 0;
        const step = Math.ceil(target / (duration / 40));
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = current;
        }, 40);
    }

    const statNumbers = document.querySelectorAll('.stat-number');
    const animateStats = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                animateCounter(el, target, 1200);
                observer.unobserve(el);
            }
        });
    };

    const statsObserver = new IntersectionObserver(animateStats, { threshold: 0.5 });
    statNumbers.forEach(num => statsObserver.observe(num));

    // Project stats bar counter animation
    const pstatNumbers = document.querySelectorAll('.pstat-number');
    const animatePStats = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                animateCounter(el, target, 1000);
                observer.unobserve(el);
            }
        });
    };

    const pstatsObserver = new IntersectionObserver(animatePStats, { threshold: 0.3 });
    pstatNumbers.forEach(num => pstatsObserver.observe(num));

    // Project filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        const filter = btn.dataset.filter;
        const count = filter === 'all'
            ? projectCards.length
            : document.querySelectorAll(`.project-card[data-category="${filter}"]`).length;
        const countEl = btn.querySelector('.filter-count');
        if (countEl) countEl.textContent = count;
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const filter = btn.dataset.filter;

            projectCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden-card');
                    card.style.animation = 'none';
                    card.offsetHeight;
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.classList.add('hidden-card');
                }
            });
        });
    });

    // 3D Tilt effect on project cards (desktop only)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const TILT_RESET_DURATION = 500;
        projectCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);
                const dy = (e.clientY - cy) / (rect.height / 2);
                const tiltX = -(dy * 6);
                const tiltY = dx * 6;
                card.classList.add('tilt');
                card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
                card.style.boxShadow = `${-tiltY * 2}px ${tiltX * 2}px 32px rgba(124,58,237,0.18), var(--shadow-card)`;
            });
            card.addEventListener('mouseleave', () => {
                card.classList.remove('tilt');
                card.style.transform = '';
                card.style.boxShadow = '';
                card.style.transition = `transform ${TILT_RESET_DURATION}ms ease, box-shadow ${TILT_RESET_DURATION}ms ease`;
                setTimeout(() => { card.style.transition = ''; }, TILT_RESET_DURATION);
            });
        });
    }

    // Contact form
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const label = group.querySelector('label');
        if (!input || !label) return;

        input.addEventListener('focus', () => label.classList.add('active'));
        input.addEventListener('blur', () => {
            if (input.value === '') label.classList.remove('active');
        });
    });

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const templateParams = {
                from_name: formData.get('from_name'),
                from_email: formData.get('from_email'),
                message: formData.get('message')
            };

            if (!templateParams.from_name || !templateParams.from_email || !templateParams.message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }

            const submitBtn = contactForm.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            const btnIcon = submitBtn.querySelector('i');

            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            if (btnIcon) btnIcon.style.display = 'none';
            submitBtn.disabled = true;

            if (typeof emailjs !== 'undefined') {
                emailjs.send('service_tmnxdvw', 'template_p5xe9co', templateParams)
                    .then(() => handleFormSuccess())
                    .catch(() => handleFormFallback(templateParams));
            } else {
                setTimeout(() => handleFormFallback(templateParams), 1000);
            }

            function handleFormSuccess() {
                btnText.textContent = 'Message Sent!';
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                if (btnIcon) { btnIcon.className = 'fas fa-check'; btnIcon.style.display = 'inline'; }
                contactForm.reset();
                setTimeout(() => {
                    btnText.textContent = 'Send Message';
                    if (btnIcon) btnIcon.className = 'fas fa-paper-plane';
                    submitBtn.disabled = false;
                }, 3000);
                showNotification('Thank you! I\'ll get back to you soon.', 'success');
            }

            function handleFormFallback(data) {
                const subject = `Portfolio Contact from ${data.from_name}`;
                const bodyText = `Name: ${data.from_name}\nEmail: ${data.from_email}\n\nMessage:\n${data.message}`;
                const mailtoLink = `mailto:kartji005@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
                btnText.textContent = 'Opening Email';
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                if (btnIcon) { btnIcon.className = 'fas fa-envelope'; btnIcon.style.display = 'inline'; }
                window.open(mailtoLink, '_blank');
                contactForm.reset();
                setTimeout(() => {
                    btnText.textContent = 'Send Message';
                    if (btnIcon) btnIcon.className = 'fas fa-paper-plane';
                    submitBtn.disabled = false;
                }, 3000);
                showNotification('Your email client should open with the message pre-filled!', 'success');
            }
        });
    }

    // Notification function
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    // Update active nav link on scroll + navbar effect + scroll-to-top
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');
    const header = document.querySelector('header');
    const scrollTopBtn = document.getElementById('scrollTop');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - sectionHeight / 3) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            }
        });

        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        if (scrollTopBtn) {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Hero particles
    const canvas = document.getElementById('heroParticles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const MAX_CONNECTION_DISTANCE = 120;
        const LINE_BASE_OPACITY = 0.06;
        const PARTICLE_COUNT = window.innerWidth <= 768 ? 25 : 60;

        function resizeCanvas() {
            const hero = canvas.parentElement;
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function createParticle() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2.5 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.4 + 0.1
            };
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(createParticle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const isDark = document.body.classList.contains('dark-theme');
            const color = isDark ? '167, 139, 250' : '124, 58, 237';

            particles.forEach((p, i) => {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = p.x - particles[j].x;
                    const dy = p.y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_CONNECTION_DISTANCE) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${color}, ${LINE_BASE_OPACITY * (1 - dist / MAX_CONNECTION_DISTANCE)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }
});

