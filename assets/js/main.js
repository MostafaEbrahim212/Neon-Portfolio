// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// LOCALIZATION (i18n) LOGIC
// ==========================================
let currentLang = localStorage.getItem('portfolio_lang') || 'en';
let i18nData = null;
let splitTitlesObj = null;

async function loadTranslations() {
    try {
        const response = await fetch('data.json');
        i18nData = await response.json();
        if (i18nData.config) buildDOM(i18nData.config);
        applyLanguage(currentLang);
        if (typeof initScrollAnimations === "function") initScrollAnimations();
    } catch (error) {
        console.error("Error loading translations. Make sure you are using a local server (like Live Server).", error);
    }
}

function applyLanguage(lang) {
    if (!i18nData) return;
    
    currentLang = lang;
    localStorage.setItem('portfolio_lang', lang);
    
    // Set Direction and Lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Change Font
    if (lang === 'ar') {
        document.documentElement.style.setProperty('--font-main', "'Cairo', sans-serif");
    } else {
        document.documentElement.style.setProperty('--font-main', "'Outfit', sans-serif");
    }
    
    // Update Button Text
    const langBtn = document.getElementById('lang-switch');
    if (langBtn) {
        langBtn.textContent = lang === 'ar' ? 'EN' : 'AR';
    }
    
    // Revert SplitType before changing text
    if (splitTitlesObj) {
        splitTitlesObj.revert();
    }
    
    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData[lang][key]) {
            if (el.classList.contains('char-wrap')) {
                if (lang === 'ar') {
                    el.innerHTML = i18nData[lang][key];
                } else {
                    const text = i18nData[lang][key];
                    el.innerHTML = '';
                    text.split('').forEach(char => {
                        const span = document.createElement('span');
                        span.innerHTML = char === ' ' ? '&nbsp;' : char;
                        span.style.display = 'inline-block';
                        el.appendChild(span);
                    });
                }
            } else {
                el.textContent = i18nData[lang][key];
            }
            
            if (el.classList.contains('nav-link')) {
                el.setAttribute('data-text', i18nData[lang][key]);
            }
        }
    });
    
    // Update infinite marquee items
    updateMarquee(lang);

    // Re-apply SplitType for titles
    setTimeout(() => {
        splitTitlesObj = new SplitType('.section-title', { types: lang === 'ar' ? 'words' : 'chars, words' });
        
        // Re-bind GSAP for new chars
        const elements = document.querySelectorAll(lang === 'ar' ? '.section-title .word' : '.section-title .char');
        gsap.set(elements, { y: 0, opacity: 1, clipPath: 'none' });

        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }, 120);
}

function updateMarquee(lang) {
    const marqueeContent = document.querySelector('.marquee-content');
    if (!marqueeContent || !i18nData || !i18nData[lang] || !i18nData[lang].marquee_items) return;
    
    const items = i18nData[lang].marquee_items;
    const generateSpans = () => items.map(text => `<span>${text}</span><span class="star">✦</span>`).join('');
    marqueeContent.innerHTML = generateSpans() + generateSpans();
}

document.getElementById('lang-switch')?.addEventListener('click', () => {
    applyLanguage(currentLang === 'en' ? 'ar' : 'en');
});

// Load translations initially
loadTranslations();

// ==========================================
// MOBILE NAVIGATION LOGIC
// ==========================================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-link');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ==========================================
// ACTIVE NAVIGATION LINK OBSERVER
// ==========================================
const sections = document.querySelectorAll('section, .projects');
const allNavLinks = document.querySelectorAll('.nav-link, .bottom-nav-item');

const navObserverOptions = {
    root: null,
    rootMargin: '-30% 0px -70% 0px', // Trigger mostly at the top of the viewport
    threshold: 0
};

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            allNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, navObserverOptions);

sections.forEach(section => {
    navObserver.observe(section);
});

// Smooth scroll intercept for Bottom Nav items
document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
            if (typeof lenis !== 'undefined') {
                lenis.scrollTo(targetEl, { offset: -20 });
            } else {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// ==========================================
// PRELOADER LOGIC
// ==========================================
let progress = 0;
const counterEl = document.querySelector('.preloader-counter');
const progressEl = document.querySelector('.preloader-progress');
const preloader = document.querySelector('.preloader');

// Prevent scrolling while preloader is active
document.body.style.overflow = 'hidden';

const updateProgress = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 1;
    if (progress > 100) progress = 100;
    
    if(counterEl) counterEl.textContent = progress + '%';
    if(progressEl) progressEl.style.width = progress + '%';
    
    if (progress === 100) {
        clearInterval(updateProgress);
        
        gsap.to(preloader, {
            y: "-100%",
            duration: 1,
            ease: "power4.inOut",
            delay: 0.5,
            onComplete: () => {
                preloader.style.display = 'none';
                document.body.style.overflow = 'auto';
                if(window.tlHero) window.tlHero.play(); // Start hero animation
            }
        });
    }
}, 50);

// ==========================================
// SCROLL PROGRESS BAR
// ==========================================
gsap.to('.scroll-progress-bar', {
    scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5
    },
    width: '100%',
    ease: 'none'
});

// ==========================================
// LENIS SMOOTH SCROLLING
// ==========================================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth curve
    smooth: true,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ==========================================
// VANTA.JS 3D BACKGROUND
// ==========================================
if(document.getElementById('vanta-bg')) {
    VANTA.NET({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x00ff88,
        backgroundColor: 0x08080a,
        points: 12.00,
        maxDistance: 22.00,
        spacing: 18.00
    });
}


// ==========================================
// CUSTOM CURSOR & MAGNETIC BUTTONS
// ==========================================
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const cursorGlow = document.querySelector('.cursor-glow');
const links = document.querySelectorAll('a, button, .tool-tag, .social-icon');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth cursor animation
function animateCursor() {
    // Cursor immediate follow
    cursorX += (mouseX - cursorX) * 0.5;
    cursorY += (mouseY - cursorY) * 0.5;
    
    // Follower lag
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    
    if(cursor && follower) {
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
    }
    if(cursorGlow) {
        cursorGlow.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
    }
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Magnetic effect on buttons & interactive elements
function bindInteractiveElements() {
    const targets = document.querySelectorAll('a, button, .tool-tag, .social-icon, .project-btn, .project-tag');
    targets.forEach(link => {
        if (link.dataset.cursorBound) return;
        link.dataset.cursorBound = "true";
        link.addEventListener('mouseenter', () => {
            if(cursor) cursor.classList.add('hover');
        });
        link.addEventListener('mouseleave', () => {
            if(cursor) cursor.classList.remove('hover');
            gsap.to(link, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
        
        // Magnetic pull
        link.addEventListener('mousemove', (e) => {
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(link, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });
}
bindInteractiveElements();


// ==========================================
// NAVIGATION & HAMBURGER
// ==========================================
const navbar = document.querySelector('.navbar');

// Navbar blur on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
if(hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if(hamburger) hamburger.classList.remove('active');
        if(navLinks) navLinks.classList.remove('active');
    });
});


// ==========================================
// INITIAL LOADING ANIMATIONS (HERO)
// ==========================================
const tlHero = gsap.timeline({ defaults: { ease: "power3.out" } });

// Split text simulation for Hero Title to handle animation properly
const charWrap = document.querySelectorAll('.char-wrap');
charWrap.forEach(el => {
    const text = el.textContent;
    el.innerHTML = '';
    text.split('').forEach(char => {
        const span = document.createElement('span');
        // Handle spaces properly so they don't collapse
        span.innerHTML = char === ' ' ? '&nbsp;' : char;
        span.style.display = 'inline-block';
        el.appendChild(span);
    });
});

// Play timeline (PAUSED INITIALLY, played by Preloader)
window.tlHero = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });

window.tlHero.from('.greeting', { 
    y: 30, 
    opacity: 0, 
    duration: 0.8 
})
.from('.char-wrap span, .char-wrap', { 
    y: 60, 
    opacity: 0, 
    duration: 0.8, 
    stagger: 0.03,
    ease: "back.out(1.5)"
}, "-=0.6")
.from('.hero-subtitle', { 
    y: 30, 
    opacity: 0, 
    duration: 0.8,
    onComplete: startTyping
}, "-=0.4")
.from('.hero-desc', { 
    y: 30, 
    opacity: 0, 
    duration: 0.8 
}, "-=0.6")
.from('.hero-cta', { 
    y: 30, 
    opacity: 0, 
    duration: 0.8 
}, "-=0.6")
.from('.scroll-indicator', { 
    opacity: 0, 
    y: -20, 
    duration: 1 
}, "-=0.2");


// ==========================================
// TYPING EFFECT (Hero Section)
// ==========================================
function startTyping() {
    const textEl = document.querySelector('.typing-text');
    if(!textEl) return;
    
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        if (!i18nData) return setTimeout(type, 500); // wait for data
        
        const words = [
            i18nData[currentLang].hero_subtitle_1,
            i18nData[currentLang].hero_subtitle_2,
            i18nData[currentLang].hero_subtitle_3,
            i18nData[currentLang].hero_subtitle_4
        ];
        
        const currentWord = words[wordIndex] || "";
        
        if (isDeleting) {
            textEl.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textEl.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = isDeleting ? 50 : 100;
        
        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before new word
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}


function buildDOM(config) {
    if (config.sections) {
        Object.keys(config.sections).forEach(sectionId => {
            const el = document.getElementById(sectionId);
            if (el) {
                el.style.display = config.sections[sectionId] ? '' : 'none';
                
                // Also hide nav link
                const navLink = document.querySelector(`.nav-link[href='#${sectionId}']`);
                if (navLink) {
                    navLink.parentElement.style.display = config.sections[sectionId] ? '' : 'none';
                }
            }
        });
    }

    if (config.socials) {
        const socialLinksContainer = document.getElementById('social-links');
        if (socialLinksContainer) {
            socialLinksContainer.innerHTML = '';
            if (config.socials.github) {
                socialLinksContainer.innerHTML += `<a href="${config.socials.github}" target="_blank" class="social-icon" data-tooltip="GitHub"><i class='bx bxl-github'></i></a>`;
            }
            if (config.socials.linkedin) {
                socialLinksContainer.innerHTML += `<a href="${config.socials.linkedin}" target="_blank" class="social-icon" data-tooltip="LinkedIn"><i class='bx bxl-linkedin'></i></a>`;
            }
            if (config.socials.website) {
                socialLinksContainer.innerHTML += `<a href="${config.socials.website}" target="_blank" class="social-icon" data-tooltip="Website"><i class='bx bx-globe'></i></a>`;
            }
        }
    }

    const skillsContainer = document.getElementById('skills-container');
    if (skillsContainer && config.skills) {
        let skillsHTML = '';
        
        if (config.skills.backend && config.skills.backend.length > 0) {
            skillsHTML += `
            <div class="skill-category">
                <div class="category-header">
                    <i class='bx bx-server'></i>
                    <h3 data-i18n="skills_backend">Backend Architecture</h3>
                </div>
                <div class="skill-grid">
                    ${config.skills.backend.map(skill => `
                    <div class="skill-card" data-tilt data-tilt-max="15" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1">
                        <div class="skill-icon"><i class='bx ${skill.icon}'></i></div>
                        <h4 data-i18n="${skill.id}_title"></h4>
                        <p data-i18n="${skill.id}_desc"></p>
                    </div>`).join('')}
                </div>
            </div>`;
        }

        if (config.skills.frontend && config.skills.frontend.length > 0) {
            skillsHTML += `
            <div class="skill-category mt-5">
                <div class="category-header">
                    <i class='bx bx-code-block'></i>
                    <h3 data-i18n="skills_frontend">Frontend Engineering</h3>
                </div>
                <div class="skill-grid">
                    ${config.skills.frontend.map(skill => `
                    <div class="skill-card" data-tilt data-tilt-max="15" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1">
                        <div class="skill-icon"><i class='bx ${skill.icon}'></i></div>
                        <h4 data-i18n="${skill.id}_title"></h4>
                        <p data-i18n="${skill.id}_desc"></p>
                    </div>`).join('')}
                </div>
            </div>`;
        }

        if (config.tools && config.tools.length > 0) {
            skillsHTML += `
            <div class="skill-category mt-5">
                <div class="category-header">
                    <i class='bx bx-wrench'></i>
                    <h3 data-i18n="skills_tools">Tools & Workflow</h3>
                </div>
                <div class="tools-flex">
                    ${config.tools.map(tool => `
                    <div class="tool-tag" data-tilt data-tilt-max="20" data-tilt-scale="1.05">
                        <i class='bx ${tool.icon}'></i> ${tool.name}
                    </div>`).join('')}
                </div>
            </div>`;
        }

        skillsContainer.innerHTML = skillsHTML;
    }

    const projectsTrack = document.getElementById('projects-track');
    if (projectsTrack) {
        projectsTrack.innerHTML = '<div style="width:100%; text-align:center; padding:50px; color:var(--accent-color);"><i class="bx bx-loader-alt bx-spin" style="font-size:30px;"></i></div>';
        
        fetch('https://api.github.com/users/MostafaEbrahim212/repos?sort=updated&per_page=6')
            .then(res => res.json())
            .then(repos => {
                if(!Array.isArray(repos)) throw new Error('Invalid API response');
                const projects = repos.filter(r => !r.fork).slice(0, 5);
                
                projectsTrack.innerHTML = projects.map(proj => {
                    const desc = proj.description || (currentLang === 'ar' ? 'لا يوجد وصف متاح.' : 'No description available.');
                    const langTag = proj.language ? `<span class="project-tag">${proj.language}</span>` : '';
                    
                    const tagsHTML = `
                        <div class="project-tags">
                            ${langTag}
                            <span class="project-tag"><i class='bx bx-star'></i> ${proj.stargazers_count}</span>
                            <span class="project-tag"><i class='bx bx-git-repo-forked'></i> ${proj.forks_count}</span>
                        </div>`;

                    return `
                    <div class="project-panel">
                        <div class="project-card repo-card" data-tilt data-tilt-max="5" data-tilt-speed="400">
                            <div class="repo-header">
                                <i class='bx bx-folder-open repo-icon'></i>
                                <div class="repo-links">
                                    ${proj.homepage ? `<a href="${proj.homepage}" target="_blank" data-tooltip="Live Demo"><i class='bx bx-link-external'></i></a>` : ''}
                                    <a href="${proj.html_url}" target="_blank" data-tooltip="GitHub"><i class='bx bxl-github'></i></a>
                                </div>
                            </div>
                            <div class="project-info repo-info">
                                <h3>${proj.name.replace(/-/g, ' ')}</h3>
                                <p style="display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">${desc}</p>
                            </div>
                            <div class="repo-footer">
                                ${tagsHTML}
                            </div>
                        </div>
                    </div>`;
                }).join('');
                
                projectsTrack.style.width = window.innerWidth > 900 ? `${projects.length * 100}vw` : '100%';
                
                if (typeof VanillaTilt !== 'undefined') {
                    VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
                }
                
                setTimeout(() => {
                    if(typeof window.initHorizontalScroll === 'function') window.initHorizontalScroll();
                    if(typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                }, 100);
            })
            .catch(err => {
                console.error('Error fetching github projects:', err);
                projectsTrack.innerHTML = '<div style="width:100%; text-align:center; padding:50px; color: #ff5f56;">Failed to load projects from GitHub.</div>';
            });
    }

    const experienceTimeline = document.getElementById('experience-timeline');
    if (experienceTimeline && config.experience) {
        let expHTML = `<div class="timeline-line"></div>`;
        expHTML += config.experience.map(exp => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content" data-tilt data-tilt-max="5" data-tilt-axis="y">
                <div class="timeline-date" data-i18n="${exp.id}_date"></div>
                <h3 class="timeline-role" data-i18n="${exp.id}_title"></h3>
                <h4 class="timeline-tech" data-i18n="${exp.id}_tech"></h4>
                <p data-i18n="${exp.id}_desc"></p>
            </div>
        </div>`).join('');
        experienceTimeline.innerHTML = expHTML;
    }

    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
    }
    if (typeof bindInteractiveElements === 'function') {
        bindInteractiveElements();
    }
}


function initScrollAnimations() {
    const isRTL = document.documentElement.dir === 'rtl';

    // Split Text Animation for Section Titles
    splitTitlesObj = new SplitType('.section-title', { types: isRTL ? 'words' : 'chars, words' });

    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title.querySelectorAll(isRTL ? '.word' : '.char'), {
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
            },
            y: 100,
            opacity: 0,
            stagger: 0.05,
            duration: 1.2,
            ease: 'power4.out'
        });
    });

    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        const line = header.querySelector('.title-line-anim');
        if (line) {
            gsap.from(line, {
                scrollTrigger: {
                    trigger: header,
                    start: "top 85%",
                },
                scaleX: 0,
                transformOrigin: isRTL ? "right center" : "left center",
                duration: 1,
                ease: "power3.out",
                delay: 0.3
            });
        }
    });

    // About Section
    gsap.from('.about-image', {
        scrollTrigger: {
            trigger: '.about',
            start: "top 75%",
        },
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from('.about-text > *', {
        scrollTrigger: {
            trigger: '.about',
            start: "top 75%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
    });


    // Skills Section (Individual Triggers for robust rendering)
    const skillCards = gsap.utils.toArray('.skill-card');
    skillCards.forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 90%", // Trigger slightly before it comes fully into view
            },
            y: 60,
            opacity: 0,
            duration: 0.7,
            ease: "back.out(1.5)"
        });
    });

    const toolTags = gsap.utils.toArray('.tool-tag');
    toolTags.forEach((tag, index) => {
        gsap.from(tag, {
            scrollTrigger: {
                trigger: '.tools-flex',
                start: "top 90%",
            },
            y: 30,
            opacity: 0,
            duration: 0.5,
            delay: index * 0.05,
            ease: "back.out(2)"
        });
    });


    // Responsive Projects Animation (GSAP matchMedia)
    window.initHorizontalScroll = function() {
        // Kill existing trigger if exists
        const oldTrigger = ScrollTrigger.getById("projectsHorizontal");
        if(oldTrigger) oldTrigger.kill();

        const mm = gsap.matchMedia();

        mm.add("(min-width: 901px)", () => {
            const projectsTrack = document.querySelector('.projects-track');
            if (projectsTrack) {
                let panels = gsap.utils.toArray('.project-panel');
                if (panels.length > 1) {
                    gsap.to(panels, {
                        xPercent: -100 * (panels.length - 1),
                        ease: "none",
                        scrollTrigger: {
                            id: "projectsHorizontal",
                            trigger: ".projects-container",
                            pin: true,
                            scrub: 1,
                            snap: 1 / (panels.length - 1),
                            end: () => "+=" + projectsTrack.offsetWidth
                        }
                    });
                }
            }
        });

        mm.add("(max-width: 900px)", () => {
            const cards = gsap.utils.toArray('.project-card');
            cards.forEach(card => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 88%",
                    },
                    y: 40,
                    opacity: 0,
                    duration: 0.7,
                    ease: "power3.out"
                });
            });
        });
    };
    
    // Call immediately (will run on empty/loading state initially, then re-run after fetch)
    window.initHorizontalScroll();


    // Experience Timeline
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, i) => {
        gsap.from(item.querySelector('.timeline-dot'), {
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
            },
            scale: 0,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(2)"
        });

        gsap.from(item.querySelector('.timeline-content'), {
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.1
        });
    });

    // Timeline Line drawing effect
    gsap.from('.timeline-line', {
        scrollTrigger: {
            trigger: '.timeline',
            start: "top 75%",
            end: "bottom 75%",
            scrub: 1.5 // Smooth scrubbing
        },
        scaleY: 0,
        transformOrigin: "top center",
        ease: "none"
    });


    // Contact Section
    gsap.from('.contact-text > *', {
        scrollTrigger: {
            trigger: '.contact',
            start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
    });

    gsap.from('.contact-form-wrapper', {
        scrollTrigger: {
            trigger: '.contact',
            start: "top 80%",
        },
        x: isRTL ? -50 : 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    // ==========================================
    // MICRO-INTERACTIONS (SOUNDS & TOAST)
    // ==========================================
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playMicroSound(type = 'success') {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if(type === 'success') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
        } else {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
        }
    }

    function showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'bx-check-circle' : 'bx-x-circle';
        
        toast.innerHTML = `<i class='bx ${icon}'></i> <span style="font-weight:600">${message}</span>`;
        container.appendChild(toast);

        try { playMicroSound(type); } catch(e){}

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // Form submission handler with Web3Forms & Toasts
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.querySelector('.submit-btn .btn-text');
        const originalText = i18nData ? i18nData[currentLang].contact_send_btn : btn.textContent;
        btn.textContent = i18nData ? i18nData[currentLang].contact_sending : "Sending...";
        
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
        .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                btn.textContent = i18nData ? i18nData[currentLang].contact_sent : "Message Sent!";
                showToast(currentLang === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message was sent successfully!', 'success');
                form.reset();
            } else {
                console.log(response);
                btn.textContent = i18nData ? i18nData[currentLang].contact_error : "Error Sending";
                showToast(currentLang === 'ar' ? 'حدث خطأ أثناء الإرسال.' : 'An error occurred while sending.', 'error');
            }
        })
        .catch(error => {
            console.log(error);
            btn.textContent = "Something went wrong!";
            showToast(currentLang === 'ar' ? 'حدث خطأ في الاتصال.' : 'A connection error occurred.', 'error');
        })
        .finally(() => {
            setTimeout(() => {
                btn.textContent = originalText;
            }, 3000);
        });
    });

    // Wait for all images and fonts to load then refresh ScrollTrigger to fix layout shifts
    Promise.all([
        document.fonts.ready,
        ...Array.from(document.images).filter(img => !img.complete).map(img => new Promise(res => {
            img.onload = img.onerror = res;
        }))
    ]).then(() => {
        ScrollTrigger.refresh();
    });
}

// ==========================================
// INTERACTIVE TERMINAL LOGIC
// ==========================================
const terminalInput = document.getElementById('terminal-input');
const terminalBody = document.getElementById('terminal-body');
const terminalWrapper = document.getElementById('draggable-terminal');

if (terminalInput && terminalBody && terminalWrapper) {
    terminalBody.addEventListener('click', () => terminalInput.focus());

    const commands = {
        'help': 'Available commands:\n- whoami\n- skills\n- projects\n- contact\n- github\n- clear\n- exit',
        'whoami': 'Mostafa Ebrahim\nFull Stack Developer (Laravel/Vue)\nMansoura, Egypt',
        'skills': 'PHP, Laravel, MySQL, JavaScript, HTML, CSS, Tailwind CSS',
        'projects': 'Check out the Projects section below or type "github" to see my repos.',
        'contact': 'Email: sasa9121963@gmail.com\nLinkedIn: mostafa-ebrahim-91384326a',
        'sudo': 'Nice try! You do not have root privileges here.',
    };

    terminalInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.trim().toLowerCase();
            terminalInput.value = '';

            const cmdLine = document.createElement('div');
            cmdLine.className = 'terminal-line';
            cmdLine.innerHTML = `<span class="prompt">guest@mostafa:~$</span> <span>${cmd}</span>`;
            terminalBody.insertBefore(cmdLine, terminalInput.parentElement);

            if (cmd === 'clear') {
                Array.from(terminalBody.children).forEach(child => {
                    if (child !== terminalInput.parentElement) {
                        child.remove();
                    }
                });
                return;
            }

            if (cmd === 'exit') {
                gsap.to(terminalWrapper, { opacity: 0, scale: 0.8, duration: 0.3, onComplete: () => terminalWrapper.style.display = 'none' });
                return;
            }

            if (cmd === 'github') {
                const resLine = document.createElement('div');
                resLine.className = 'term-response';
                resLine.textContent = 'Fetching latest repositories...';
                terminalBody.insertBefore(resLine, terminalInput.parentElement);
                
                try {
                    const response = await fetch('https://api.github.com/users/MostafaEbrahim212/repos?sort=updated&per_page=3');
                    const repos = await response.json();
                    
                    let repoText = 'Latest Open Source Contributions:\n';
                    repos.forEach(repo => {
                        repoText += `\n📦 ${repo.name}\n⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}\n🔗 ${repo.html_url}\n`;
                    });
                    resLine.textContent = repoText;
                } catch (error) {
                    resLine.textContent = 'Error fetching GitHub data. Please check connection.';
                }
                terminalBody.scrollTop = terminalBody.scrollHeight;
                return;
            }

            if (cmd !== '') {
                const response = commands[cmd] || `bash: ${cmd}: command not found`;
                const resLine = document.createElement('div');
                resLine.className = 'term-response';
                resLine.textContent = response;
                terminalBody.insertBefore(resLine, terminalInput.parentElement);
            }

            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    });

    let isDragging = false;
    let offsetX, offsetY;
    const header = terminalWrapper.querySelector('.terminal-header');

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = terminalWrapper.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        terminalWrapper.style.transform = 'none';
        terminalWrapper.style.left = rect.left + 'px';
        terminalWrapper.style.top = rect.top + 'px';
        terminalWrapper.style.right = 'auto'; 
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            terminalWrapper.style.left = (e.clientX - offsetX) + 'px';
            terminalWrapper.style.top = (e.clientY - offsetY) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    terminalWrapper.querySelector('.close-btn').addEventListener('click', () => {
        gsap.to(terminalWrapper, { opacity: 0, scale: 0.8, duration: 0.3, onComplete: () => terminalWrapper.style.display = 'none' });
    });
}

// ==========================================
// INTERACTIVE CV DOWNLOAD
// ==========================================
const cvBtn = document.getElementById('cv-download-btn');
if(cvBtn) {
    cvBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const icon = cvBtn.querySelector('i');
        const originalClass = icon.className;
        icon.className = 'bx bx-loader-alt bx-spin';
        
        showToast(currentLang === 'ar' ? 'جاري تجهيز السيرة الذاتية...' : 'Preparing CV for download...', 'success');
        
        setTimeout(() => {
            icon.className = 'bx bx-check';
            showToast(currentLang === 'ar' ? 'تم بدء التحميل!' : 'Download started!', 'success');
            
            // Dummy download action (replace href with actual CV link later)
            const a = document.createElement('a');
            a.href = '#'; 
            a.download = 'Mostafa_Ebrahim_CV.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            setTimeout(() => {
                icon.className = originalClass;
            }, 3000);
        }, 1500);
    });
}
