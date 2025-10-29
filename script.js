/* ========================================
   METEMI - Main JavaScript
   Plain HTML/CSS/JS Version
   ======================================== */

// Global state
let lenis = null;

/* ========================================
   LENIS SMOOTH SCROLL INITIALIZATION
   ======================================== */
function initLenis() {
  if (typeof Lenis === 'undefined') {
    console.error('Lenis is not loaded');
    return;
  }
  
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Integrate Lenis with GSAP ScrollTrigger
  lenis.on('scroll', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.update();
    }
  });
}


/* ========================================
   GSAP ANIMATION FUNCTIONS
   ======================================== */

function wordSwitcherAnimation() {
  const wordElement = document.querySelector('.word-switcher');
  if (!wordElement || typeof SplitText === 'undefined') {
    console.error('SplitText plugin not loaded or element not found');
    return;
  }

  const words = ['people', 'groups'];
  let currentIndex = 0;
  let currentSplit = null;

  // Initialize with first word
  wordElement.textContent = words[currentIndex];
  currentSplit = new SplitText(wordElement, { type: 'chars' });

  // Function to animate word transition
  function animateWordSwitch() {
    const nextIndex = (currentIndex + 1) % words.length;
    
    // Animate out current letters with stagger
    gsap.to(currentSplit.chars, {
      duration: 0.4,
      y: -30,
      opacity: 0,
      rotation: () => gsap.utils.random(-15, 15),
      scale: 0.5,
      ease: 'back.in(2)',
      stagger: {
        each: 0.03,
        from: 'random'
      },
      onComplete: () => {
        // Revert split and update text
        currentSplit.revert();
        wordElement.textContent = words[nextIndex];
        currentSplit = new SplitText(wordElement, { type: 'chars' });
        
        // Set initial state for new chars
        gsap.set(currentSplit.chars, {
          y: 30,
          opacity: 0,
          rotation: () => gsap.utils.random(-15, 15),
          scale: 0.5
        });
        
        // Animate in new letters with stagger
        gsap.to(currentSplit.chars, {
          duration: 0.5,
          y: 0,
          opacity: 1,
          rotation: 0,
          scale: 1,
          ease: 'back.out(2)',
          stagger: {
            each: 0.04,
            from: 'start'
          },
          onComplete: () => {
            currentIndex = nextIndex;
            // Wait before next transition
            gsap.delayedCall(2.5, animateWordSwitch);
          }
        });
      }
    });
  }

  // Start the animation cycle after initial delay
  gsap.delayedCall(2.5, animateWordSwitch);
}

function logoSplitAnimation() {
  const logo = document.querySelector('.anim-logo');
  if (!logo) return;

  gsap.to(logo, {
    duration: 0.75,
    y: '0%',
    ease: 'power2.out',
    delay: 0.25,
    scrollTrigger: {
      trigger: logo,
      start: 'top 90%',
    },
  });
}

function popInAnimation() {
  const elements = document.querySelectorAll('.anim-pop-in');

  elements.forEach((element) => {
    gsap.fromTo(
      element,
      {
        scale: 0,
        opacity: 0,
      },
      {
        duration: 1.5,
        scale: 1,
        opacity: 1,
        ease: 'elastic.out(1.25,0.4)',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });
}

function fadeInAnimation() {
  const elements = document.querySelectorAll('.anim-fade-in');

  elements.forEach((element) => {
    gsap.set(element, {
      opacity: 0,
      y: '100%',
    });

    gsap.to(element, {
      duration: 0.8,
      opacity: 1,
      y: '0%',
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: '-100% 80%',
        toggleActions: 'play none none reverse',
        markers: false,
      },
    });
  });
}

function fadeLeftAnimation() {
  const elements = document.querySelectorAll('.anim-fade-left');

  elements.forEach((element) => {
    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: '-100px',
      },
      {
        duration: 0.8,
        opacity: 1,
        x: '0',
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });
}

function fadeRightAnimation() {
  const elements = document.querySelectorAll('.anim-fade-right');

  elements.forEach((element) => {
    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: '100px',
      },
      {
        duration: 0.8,
        opacity: 1,
        x: '0',
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });
}

function outlineTextReveal() {
  const outlineTexts = document.querySelectorAll('.text-outline-krakov');

  outlineTexts.forEach((text) => {
    gsap.fromTo(
      text,
      {
        color: 'transparent',
      },
      {
        duration: 1,
        color: 'white',
        ease: 'power2.out',
        scrollTrigger: {
          trigger: text,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });
}

function parallaxAnimation() {
  const parallaxElements = document.querySelectorAll('.parallax');

  parallaxElements.forEach((element) => {
    element.style.willChange = 'transform';
    
    const offset = parseFloat(element.dataset.offset || '0');
    const offsetMobile = parseFloat(element.dataset.offsetMobile || element.dataset.offset || '0');
    const isMobile = window.innerWidth < 768;
    const initialOffset = isMobile && element.dataset.offsetMobile ? offsetMobile : offset;

    // Set initial offset position
    gsap.set(element, {
      y: initialOffset,
    });

    gsap.to(element, {
      y: () => {
        const isMobile = window.innerWidth < 768;
        const elementSpeed = isMobile && element.dataset.speedMobile
          ? parseFloat(element.dataset.speedMobile)
          : parseFloat(element.dataset.speed || '1');
        const elementOffset = isMobile && element.dataset.offsetMobile
          ? parseFloat(element.dataset.offsetMobile)
          : parseFloat(element.dataset.offset || '0');
        return elementOffset + elementSpeed * 100;
      },
      ease: 'none',
      force3D: true,
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        scrub: true,
      },
    });
  });

  // Object-position parallax for images/videos
  const objectParallaxEls = document.querySelectorAll('.parallax-object');

  objectParallaxEls.forEach((element) => {
    const media = element;
    const isMobile = window.innerWidth < 768;

    const offsetX = isMobile && media.dataset.offsetXMobile
      ? parseFloat(media.dataset.offsetXMobile)
      : parseFloat(media.dataset.offsetX || '50');
    const offsetY = isMobile && media.dataset.offsetYMobile
      ? parseFloat(media.dataset.offsetYMobile)
      : parseFloat(media.dataset.offsetY || '50');

    const speedX = isMobile && media.dataset.speedMobile
      ? parseFloat(media.dataset.speedMobile)
      : parseFloat(media.dataset.speedX || '0');
    const speedY = isMobile && media.dataset.speedMobile
      ? parseFloat(media.dataset.speedMobile)
      : parseFloat(media.dataset.speedY || '1');

    // Set initial object-position
    media.style.objectPosition = `${offsetX}% ${offsetY}%`;

    const proxy = { x: offsetX, y: offsetY };

    gsap.to(proxy, {
      x: offsetX + speedX * 100,
      y: offsetY + speedY * 100,
      ease: 'none',
      onUpdate: () => {
        media.style.objectPosition = `${proxy.x}% ${proxy.y}%`;
      },
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}


/* ========================================
   ANIMATED NUMBER IMPLEMENTATION
   ======================================== */
function initAnimatedNumbers() {
  const numbers = document.querySelectorAll('.animated-number');

  numbers.forEach((element) => {
    const value = parseFloat(element.dataset.value || '0');
    const duration = parseFloat(element.dataset.duration || '2');
    const ease = element.dataset.ease || 'power1.out';
    const decimals = parseInt(element.dataset.decimals || '0', 10);
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const separator = element.dataset.separator || ',';
    const scrollTriggerStart = element.dataset.start || 'top 80%';
    const scrollTriggerEnd = element.dataset.end || undefined;
    const once = element.dataset.once !== 'false';
    const delay = parseFloat(element.dataset.delay || '0');
    const useLerp = element.dataset.lerp === 'true';
    const lerpFactor = parseFloat(element.dataset.lerpFactor || '0.1');

    const counter = { value: 0 };
    let displayValue = 0;

    const formatNumber = (num) => {
      const fixedNum = num.toFixed(decimals);
      const parts = fixedNum.split('.');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return decimals > 0 && parts[1] ? `${integerPart}.${parts[1]}` : integerPart;
    };

    if (useLerp) {
      const lerp = (start, end, factor) => start + (end - start) * factor;
      
      let hasCompleted = false;
      let isAnimating = false;
      let delayTimer = null;

      const animation = gsap.to(counter, {
        value: value,
        duration: duration,
        ease: ease,
        paused: delay > 0,
        scrollTrigger: {
          trigger: element,
          start: scrollTriggerStart,
          end: scrollTriggerEnd,
          toggleActions: once ? 'play none none none' : 'play none none reset',
          onEnter: () => {
            if (delay > 0) {
              delayTimer = gsap.delayedCall(delay, () => {
                isAnimating = true;
                animation.play();
              });
            } else {
              isAnimating = true;
            }
          },
        },
        onStart: () => {
          isAnimating = true;
        },
      });

      const tickerCallback = () => {
        if (!hasCompleted && isAnimating) {
          displayValue = lerp(displayValue, counter.value, lerpFactor);

          const diff = Math.abs(counter.value - displayValue);
          if (diff < 0.01) {
            displayValue = counter.value;
            hasCompleted = true;
            isAnimating = false;
          }

          element.textContent = `${prefix}${formatNumber(displayValue)}${suffix}`;
        }
      };

      gsap.ticker.add(tickerCallback);
    } else {
      // Standard GSAP easing without lerp
      let delayTimer = null;

      const animation = gsap.to(counter, {
        value: value,
        duration: duration,
        ease: ease,
        paused: delay > 0,
        scrollTrigger: {
          trigger: element,
          start: scrollTriggerStart,
          end: scrollTriggerEnd,
          toggleActions: once ? 'play none none none' : 'play none none reset',
          onEnter: () => {
            if (delay > 0) {
              delayTimer = gsap.delayedCall(delay, () => {
                animation.play();
              });
            }
          },
        },
        onUpdate: () => {
          element.textContent = `${prefix}${formatNumber(counter.value)}${suffix}`;
        },
      });
    }
  });
}


/* ========================================
   MASTER INITIALIZATION
   ======================================== */
function initAnimations() {
  if (typeof gsap === 'undefined') {
    console.error('GSAP is not loaded');
    return;
  }

  // Register GSAP plugins
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
  
  if (typeof SplitText !== 'undefined') {
    gsap.registerPlugin(SplitText);
  }

  // Initialize all animations
  wordSwitcherAnimation();
  logoSplitAnimation();
  outlineTextReveal();
  popInAnimation();
  fadeInAnimation();
  fadeLeftAnimation();
  fadeRightAnimation();
  parallaxAnimation();
  initAnimatedNumbers();

  // Ensure ScrollTrigger accounts for video sizing
  const videos = Array.from(document.querySelectorAll('video'));
  const needsRefresh = videos.some((v) => v.readyState < 2);
  
  if (needsRefresh) {
    videos.forEach((v) => {
      if (v.readyState < 2) {
        const onReady = () => {
          requestAnimationFrame(() => ScrollTrigger.refresh());
        };
        v.addEventListener('loadedmetadata', onReady, { once: true });
        v.addEventListener('loadeddata', onReady, { once: true });
      }
    });
  }

  // Fallback refresh after page load
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}


/* ========================================
   DOM READY - MAIN ENTRY POINT
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Metemi initialized');
  
  // Initialize Lenis smooth scroll
  initLenis();
  
  // Initialize GSAP animations
  initAnimations();
});
