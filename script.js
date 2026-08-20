document.addEventListener('DOMContentLoaded', () => {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Header : ombre/flou renforcés au scroll ---
    const header = document.querySelector('header');
    const onScroll = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // --- Menu mobile ---
    const navToggle = document.getElementById('nav-toggle');
    const navLinksWrapper = document.getElementById('nav-links');

    const closeMobileMenu = () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinksWrapper.classList.remove('is-open');
    };

    navToggle.addEventListener('click', () => {
        const isOpen = navLinksWrapper.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // --- Mode clair / sombre ---
    const themeToggle = document.getElementById('theme-toggle');
    const applyThemeLabel = (theme) => {
        const goingToDark = theme === 'dark';
        themeToggle.setAttribute('aria-pressed', String(goingToDark));
        themeToggle.setAttribute('aria-label', goingToDark ? 'Activer le mode clair' : 'Activer le mode sombre');
    };
    applyThemeLabel(document.documentElement.getAttribute('data-theme') || 'light');

    themeToggle.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        applyThemeLabel(next);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });

    // --- Défilement lissé et ralenti (molette) ---
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const canSmoothScroll = !reduceMotion && finePointer;
    const scrollState = { current: window.scrollY, target: window.scrollY, raf: null };

    const clampScrollTarget = () => {
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
        scrollState.target = Math.min(Math.max(scrollState.target, 0), max);
    };

    const stepScroll = () => {
        scrollState.current += (scrollState.target - scrollState.current) * 0.18;
        if (Math.abs(scrollState.target - scrollState.current) < 0.4) {
            scrollState.current = scrollState.target;
            window.scrollTo(0, scrollState.current);
            scrollState.raf = null;
            return;
        }
        window.scrollTo(0, scrollState.current);
        scrollState.raf = requestAnimationFrame(stepScroll);
    };

    const goToScroll = (targetY) => {
        scrollState.target = targetY;
        clampScrollTarget();
        if (!scrollState.raf) {
            scrollState.current = window.scrollY;
            scrollState.raf = requestAnimationFrame(stepScroll);
        }
    };

    if (canSmoothScroll) {
        window.addEventListener('wheel', (e) => {
            if (e.target.closest('.modal-content')) return;
            e.preventDefault();
            goToScroll(scrollState.target + e.deltaY * 0.85);
        }, { passive: false });

        window.addEventListener('scroll', () => {
            if (!scrollState.raf) {
                scrollState.current = window.scrollY;
                scrollState.target = window.scrollY;
            }
        }, { passive: true });

        window.addEventListener('resize', clampScrollTarget);
    }

    // --- Navigation : scroll vers section + fermeture du menu mobile au clic ---
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            closeMobileMenu();
            if (!target) return;

            if (canSmoothScroll) {
                const headerOffset = header.offsetHeight;
                goToScroll(target.getBoundingClientRect().top + window.scrollY - headerOffset + 1);
            } else {
                target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
            }
        });
    });

    // --- Scrollspy : surligne le lien de nav de la section visible ---
    const sections = Array.from(navLinks)
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach(section => spyObserver.observe(section));
    }

    // --- Révélation au scroll ---
    const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    if ('IntersectionObserver' in window && revealTargets.length) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealTargets.forEach(el => revealObserver.observe(el));
    } else {
        revealTargets.forEach(el => el.classList.add('is-visible'));
    }

    // --- Champ d'étoiles dans le hero ---
    const starfield = document.getElementById('starfield');
    if (starfield && !reduceMotion) {
        const STAR_COUNT = 60;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < STAR_COUNT; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            const size = (Math.random() * 2 + 1).toFixed(1);
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
            star.style.animationDuration = `${(Math.random() * 3 + 3).toFixed(2)}s`;
            fragment.appendChild(star);
        }
        starfield.appendChild(fragment);
    }

    // --- Curseur personnalisé : point lumineux (souris fine uniquement) ---
    if (!reduceMotion && finePointer && window.matchMedia('(hover: hover)').matches) {
        const cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        document.body.appendChild(cursorDot);
        document.documentElement.classList.add('has-custom-cursor');

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let dotX = mouseX;
        let dotY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.classList.add('is-visible');
        });

        document.addEventListener('mouseleave', () => cursorDot.classList.remove('is-visible'));

        const interactiveSelector = 'a, button, .project-tile, [role="button"]';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactiveSelector)) cursorDot.classList.add('is-active');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactiveSelector)) cursorDot.classList.remove('is-active');
        });

        const animateCursor = () => {
            dotX += (mouseX - dotX) * 0.18;
            dotY += (mouseY - dotY) * 0.18;
            cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        };
        animateCursor();
    }

    // --- Gestion de la modale de projet ---
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('.modal-close');
    const projectTiles = document.querySelectorAll('.project-tile');
    let lastFocusedTile = null;

    const openModal = (tile) => {
        const title = tile.querySelector('h3').innerText;
        const detailsHTML = tile.querySelector('.project-full-details').innerHTML;

        lastFocusedTile = tile;
        modalTitle.innerText = title;
        modalBody.innerHTML = detailsHTML;

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
            closeModalBtn.focus();
        }, 10);
    };

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            if (lastFocusedTile) lastFocusedTile.focus();
        }, 300);
    };

    projectTiles.forEach(tile => {
        tile.addEventListener('click', () => openModal(tile));
        tile.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(tile);
            }
        });
    });

    closeModalBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

});
