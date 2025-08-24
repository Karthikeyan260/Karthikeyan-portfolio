document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Custom cursor
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let isMouseDown = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)` + (isMouseDown ? ' scale(0.8)' : '');
    });

    function animateFollower() {
        // Lower speed for even smoother lag
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

    // Typed.js initialization
    if (typeof Typed !== 'undefined') {
        const typed = new Typed('#typed', {
            strings: [
                'Full Stack Developer',
                'IoT Enthusiast',
                'AI Developer',
                'Blockchain Developer'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true
        });
    } else {
        // Fallback for typed effect
        const typedElement = document.getElementById('typed');
        if (typedElement) {
            const strings = [
                'Full Stack Developer',
                'IoT Enthusiast', 
                'AI Developer',
                'Blockchain Developer'
            ];
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
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        themeToggle.innerHTML = body.classList.contains('dark-theme') 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu after clicking
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    // Skills progress animation
    const skillItems = document.querySelectorAll('.skill-item');
    
    const animateProgress = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.progress');
                const progress = entry.target.dataset.progress;
                progressBar.style.width = `${progress}%`;
                observer.unobserve(entry.target);
            }
        });
    };

    const progressObserver = new IntersectionObserver(animateProgress, {
        threshold: 0.5
    });

    skillItems.forEach(item => {
        progressObserver.observe(item);
    });

    // Form animation
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const label = group.querySelector('label');

        input.addEventListener('focus', () => {
            label.classList.add('active');
        });

        input.addEventListener('blur', () => {
            if (input.value === '') {
                label.classList.remove('active');
            }
        });
    });

    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const templateParams = {
            from_name: formData.get('from_name'),
            from_email: formData.get('from_email'),
            message: formData.get('message')
        };

        // Validate form
        if (!templateParams.from_name || !templateParams.from_email || !templateParams.message) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }

        // Get button elements
        const submitBtn = contactForm.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        const btnIcon = submitBtn.querySelector('i');

        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        btnIcon.style.display = 'none';
        submitBtn.disabled = true;

        // Try EmailJS first, fallback to mailto if unavailable
        if (typeof emailjs !== 'undefined') {
            // EmailJS is available
            emailjs.send('service_tmnxdvw', 'template_p5xe9co', templateParams)
                .then((response) => {
                    console.log('SUCCESS!', response.status, response.text);
                    handleFormSuccess();
                })
                .catch((error) => {
                    console.error('FAILED...', error);
                    handleFormFallback(templateParams);
                });
        } else {
            // EmailJS not available, use fallback
            setTimeout(() => {
                handleFormFallback(templateParams);
            }, 1000); // Simulate processing time
        }

        function handleFormSuccess() {
            // Show success state
            btnText.textContent = 'Message Sent!';
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            btnIcon.className = 'fas fa-check';
            btnIcon.style.display = 'inline';
            
            // Reset form
            contactForm.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                btnText.textContent = 'Send Message';
                btnIcon.className = 'fas fa-paper-plane';
                submitBtn.disabled = false;
            }, 3000);
            
            // Show success message
            showNotification('Thank you for your message! I will get back to you soon.', 'success');
        }

        function handleFormFallback(data) {
            // Create mailto link with form data
            const subject = `Portfolio Contact from ${data.from_name}`;
            const body = `Name: ${data.from_name}\nEmail: ${data.from_email}\n\nMessage:\n${data.message}`;
            const mailtoLink = `mailto:kartji005@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // Show success state
            btnText.textContent = 'Opening Email';
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            btnIcon.className = 'fas fa-envelope';
            btnIcon.style.display = 'inline';
            
            // Open mailto link
            window.open(mailtoLink, '_blank');
            
            // Reset form
            contactForm.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                btnText.textContent = 'Send Message';
                btnIcon.className = 'fas fa-paper-plane';
                submitBtn.disabled = false;
            }, 3000);
            
            // Show instruction message
            showNotification('Your email client should open with the message pre-filled. Please send it from there!', 'success');
        }
    });

    // Notification function
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide and remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Update active nav link on scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

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
            if (item.getAttribute('href').slice(1) === current) {
                item.classList.add('active');
            }
        });
    });
});

