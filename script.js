document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.snap-section');
    const navDots = document.querySelectorAll('.nav-dots a');
    const scroller = document.querySelector('.scroller');

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
                if (theme === 'light') {
                    dotsContainer.style.filter = 'invert(1)';
                } else {
                    dotsContainer.style.filter = 'invert(0)';
                }
            } else {
                entry.target.classList.remove('in-view'); // Re-trigger animation on re-entry
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // 3. Seamless Zoom Transition Logic
    scroller.addEventListener('scroll', () => {
        const viewportHeight = window.innerHeight;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const content = section.querySelector('.content-wrapper');
            if (!content) return;

            // distance from center of viewport (0 is centered)
            const distanceFromCenter = rect.top;

            // Normalize distance: 0 when centered, 1 when one full viewport down, -1 when up
            let progress = distanceFromCenter / viewportHeight;

            let scale = 1;
            let opacity = 1;
            let blur = 0;

            if (progress <= 0) {
                // Section is LEAVING (scrolling up) or Centered
                // We want it to SCALE UP (zoom in) as it leaves
                // progress goes 0 -> -1
                scale = 1 + Math.abs(progress) * 2; // Zoom to 3x
                opacity = 1 - Math.abs(progress) * 1.5; // Fade out faster
                blur = Math.abs(progress) * 10;
            } else {
                // Section is ENTERING (from bottom)
                // We want it to start SMALL (zoom out) and grow to 1
                // progress goes 1 -> 0
                scale = 0.5 + (0.5 * (1 - progress)); // Starts at 0.5, goes to 1
                opacity = 1 - (progress * 0.5); // Starts at 0.5 opacity
            }

            // Clamp values
            if (opacity < 0) opacity = 0;

            // Apply Transform
            // Only apply if near viewport to save performance
            if (progress > -1.5 && progress < 1.5) {
                content.style.transform = `scale(${scale})`;
                content.style.opacity = opacity;
                content.style.filter = `blur(${blur}px)`;
            }
        });
    });
});
