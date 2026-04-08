document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.snap-section');
    const navDots = document.querySelectorAll('.nav-dots a');
    const scroller = document.querySelector('.scroller');
    const progressBar = document.querySelector('.journey-progress');
    const starLayers = {
        back: document.querySelector('.stars-back'),
        mid: document.querySelector('.stars-mid'),
        front: document.querySelector('.stars-front')
    };

    const buildStars = (container, count, minSize, maxSize) => {
        if (!container) return;

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i += 1) {
            const star = document.createElement('span');
            const size = minSize + Math.random() * (maxSize - minSize);

            star.className = 'star';
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 120}%`;
            fragment.appendChild(star);
        }

        container.replaceChildren(fragment);
    };

    buildStars(starLayers.back, 70, 1, 2.2);
    buildStars(starLayers.mid, 45, 1.2, 2.8);
    buildStars(starLayers.front, 24, 1.6, 3.6);

    // 1. Text Splitting for "Letter Pop"
    const headings = document.querySelectorAll('h1, h2, .utau-name');
    headings.forEach(h => {
        const text = h.textContent.trim();
        h.innerHTML = text.split('').map((char, i) => {
            if (char === ' ') return `<span class="char" style="display:inline">&nbsp;</span>`;
            return `<span class="char" style="animation-delay: ${i * 0.03}s">${char}</span>`;
        }).join('');
    });

    // 2. Intersection Observer for Nav & Class Toggles
    const observerOptions = {
        root: scroller,
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');

                // Update Nav
                navDots.forEach(dot => {
                    dot.classList.remove('active');
                    if (dot.getAttribute('href') === `#${entry.target.id}`) {
                        dot.classList.add('active');
                    }
                });

                // Theme Aware UI
                const theme = entry.target.dataset.theme;
                const dotsContainer = document.querySelector('.nav-dots');
                const rail = document.querySelector('.journey-rail');
                if (theme === 'light') {
                    dotsContainer.style.filter = 'invert(1)';
                    if (rail) rail.style.filter = 'invert(1)';
                } else {
                    dotsContainer.style.filter = 'invert(0)';
                    if (rail) rail.style.filter = 'invert(0)';
                }
            } else {
                entry.target.classList.remove('in-view'); // Re-trigger animation on re-entry
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // 3. Journey Motion Logic
    const updateScrollEffects = () => {
        const viewportHeight = window.innerHeight;
        const maxScroll = scroller.scrollHeight - scroller.clientHeight;
        const scrollProgress = maxScroll > 0 ? scroller.scrollTop / maxScroll : 0;

        if (progressBar) {
            progressBar.style.transform = `scaleY(${Math.max(scrollProgress, 0.08)})`;
        }

        if (starLayers.back) {
            starLayers.back.style.transform = `translate3d(0, ${scrollProgress * -60}px, 0)`;
        }

        if (starLayers.mid) {
            starLayers.mid.style.transform = `translate3d(0, ${scrollProgress * -140}px, 0)`;
        }

        if (starLayers.front) {
            starLayers.front.style.transform = `translate3d(0, ${scrollProgress * -260}px, 0)`;
        }

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const content = section.querySelector('.content-wrapper');
            if (!content) return;

            const centerOffset = rect.top + (rect.height / 2) - (viewportHeight / 2);
            const normalized = Math.max(-1, Math.min(1, centerOffset / viewportHeight));
            const absNormalized = Math.abs(normalized);
            const translateY = normalized * 36;
            const rotateX = normalized * -8;
            const scale = 1 - (absNormalized * 0.08);
            const opacity = 1 - (absNormalized * 0.32);

            content.style.transform = `translate3d(0, ${translateY}px, 0) rotateX(${rotateX}deg) scale(${scale})`;
            content.style.opacity = `${Math.max(0.45, opacity)}`;
        });
    };

    scroller.addEventListener('scroll', updateScrollEffects, { passive: true });
    window.addEventListener('resize', updateScrollEffects);
    updateScrollEffects();
});
