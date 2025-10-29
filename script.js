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
  if (typeof Lenis === "undefined") {
    console.error("Lenis is not loaded");
    return;
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
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
  lenis.on("scroll", () => {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.update();
    }
  });
}

/* ========================================
   GSAP ANIMATION FUNCTIONS
   ======================================== */

function wordSwitcherAnimation() {
  const wordElement = document.querySelector(".word-switcher");
  if (!wordElement || typeof SplitText === "undefined") {
    console.error("SplitText plugin not loaded or element not found");
    return;
  }

  const words = ["people", "groups"];
  let currentIndex = 0;
  let currentSplit = null;

  // Initialize with first word
  wordElement.textContent = words[currentIndex];
  currentSplit = new SplitText(wordElement, { type: "chars" });

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
      ease: "back.in(2)",
      stagger: {
        each: 0.03,
        from: "random",
      },
      onComplete: () => {
        // Revert split and update text
        currentSplit.revert();
        wordElement.textContent = words[nextIndex];
        currentSplit = new SplitText(wordElement, { type: "chars" });

        // Set initial state for new chars
        gsap.set(currentSplit.chars, {
          y: 30,
          opacity: 0,
          rotation: () => gsap.utils.random(-15, 15),
          scale: 0.5,
        });

        // Animate in new letters with stagger
        gsap.to(currentSplit.chars, {
          duration: 0.5,
          y: 0,
          opacity: 1,
          rotation: 0,
          scale: 1,
          ease: "back.out(2)",
          stagger: {
            each: 0.04,
            from: "start",
          },
          onComplete: () => {
            currentIndex = nextIndex;
            // Wait before next transition
            gsap.delayedCall(1.5, animateWordSwitch);
          },
        });
      },
    });
  }

  // Start the animation cycle after initial delay
  gsap.delayedCall(1.5, animateWordSwitch);
}

function popInAnimation() {
  const elements = document.querySelectorAll("[anim-pop-in]");

  elements.forEach((element) => {
    gsap.set(element, {
      scale: 0,
      opacity: 0,
    });

    const enterAnim = gsap.to(element, {
      duration: 1.5,
      scale: 1,
      opacity: 1,
      ease: "elastic.out(1,0.4)",
      paused: true,
    });

    const exitAnim = gsap.to(element, {
      duration: 0.1,
      scale: 0,
      opacity: 0,
      ease: "power2.in",
      paused: true,
    });

    ScrollTrigger.create({
      trigger: element,
      start: "top 90%",
      end: "top 40%",
      markers: false,
      onEnter: () => {
        enterAnim.restart();
        enterAnim.play();
      },
    });

    ScrollTrigger.create({
      trigger: element,
      start: "top 100%",
      end: "top 100%",
      markers: false,
      onLeaveBack: () => {
        exitAnim.restart();
        exitAnim.play();
      },
    });
  });
}

function fadeAnimation() {
  const elements = document.querySelectorAll("[anim-fade]");

  elements.forEach((element) => {
    const startTrigger = element.dataset.start || "top 90%";

    gsap.set(element, {
      opacity: 0,
    });

    gsap.to(element, {
      duration: 0.8,
      opacity: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: startTrigger,
        toggleActions: "play none none reverse",
        markers: false,
      },
    });
  });
}

function fadeInAnimation() {
  const elements = document.querySelectorAll("[anim-fade-in]");

  elements.forEach((element) => {
    const startTrigger = element.dataset.start || "top 90%";

    gsap.set(element, {
      opacity: 0,
      y: "100%",
    });

    gsap.to(element, {
      duration: 0.8,
      opacity: 1,
      y: "0%",
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: startTrigger,
        toggleActions: "play none none reverse",
        markers: false,
      },
    });
  });
}

function fadeLeftAnimation() {
  const elements = document.querySelectorAll("[anim-fade-left]");

  elements.forEach((element) => {
    const startTrigger = element.dataset.start || "top 90%";

    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: "-100px",
      },
      {
        duration: 0.8,
        opacity: 1,
        x: "0",
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: startTrigger,
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}

function fadeRightAnimation() {
  const elements = document.querySelectorAll("[anim-fade-right]");

  elements.forEach((element) => {
    const startTrigger = element.dataset.start || "top 90%";

    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: "100px",
      },
      {
        duration: 0.8,
        opacity: 1,
        x: "0",
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: startTrigger,
          markers: false,
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}

function animateTextsAppear() {
  const elements = document.querySelectorAll("[text-appear]");

  elements.forEach((element) => {
    const startTrigger = element.dataset.start || "top 85%";

    const split = new SplitText(element, {
      type: "lines",
      linesClass: "split-line",
    });

    gsap.from(split.lines, {
      duration: 0.75,
      y: "75%",
      opacity: 0,
      ease: "back.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: element,
        start: startTrigger,
        toggleActions: "play none none reverse",
      },
    });
  });
}

function animateTextsLetterSpacing() {
  const elements = document.querySelectorAll("[letter-spacing]");

  elements.forEach((element) => {
    const split = new SplitText(element, {
      type: "words",
      wordsClass: "split-word",
    });

    gsap.fromTo(
      split.words,
      {
        letterSpacing: "0.4em",
        opacity: 0,
      },
      {
        letterSpacing: "0em",
        opacity: 1,
        duration: 1.5,
        ease: "power4.inOut",
      }
    );
  });
}

function animateTitleXScrub() {
  const element = document.querySelector("[title-x-scrub]");

  gsap.fromTo(
    element,
    {
      x: "0%",
    },
    {
      x: "-250%",
      duration: 1,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top 75%",
        end: "bottom 25%",
        scrub: true,
        markers: false,
        scrub: 1.5,
      },
    }
  );
}

function animateTextsLetterSpacingScrub() {
  const elements = document.querySelectorAll("[letter-spacing-scrub]");

  elements.forEach((element) => {
    const split = new SplitText(element, {
      type: "words",
      wordsClass: "split-word",
    });

    gsap.fromTo(
      split.words,
      {
        letterSpacing: "0.4em",
      },
      {
        letterSpacing: "0em",
        duration: 1,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          end: "bottom 60%",
          scrub: true,
          markers: false,
        },
      }
    );
  });
}

function animateHowCardsImages() {
  const firstImage = document.querySelector("[why-card-image-1]");
  const secondImage = document.querySelector("[why-card-image-2]");
  const thirdImage = document.querySelector("[why-card-image-3]");

  const mainTop = 100;
  const offset = 5;

  const imagesArray = [
    { element: firstImage, start: `-=30% ${mainTop + offset}%` },
    { element: secondImage, start: `-=30% ${mainTop}%` },
    { element: thirdImage, start: `-=30% ${mainTop - offset}%` },
  ];

  imagesArray.forEach(({ element, start }) => {
    gsap.fromTo(
      element,
      {
        y: "50%",
      },
      {
        y: "0%",
        duration: 1,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: start,
          end: "top 70%",
          scrub: true,
          markers: false,
        },
      }
    );
  });
}

function parallaxAnimation() {
  const parallaxElements = document.querySelectorAll("[parallax]");

  parallaxElements.forEach((element) => {
    element.style.willChange = "transform";

    const offset = parseFloat(element.dataset.offset || "0");
    const offsetMobile = parseFloat(
      element.dataset.offsetMobile || element.dataset.offset || "0"
    );
    const isMobile = window.innerWidth < 768;
    const initialOffset =
      isMobile && element.dataset.offsetMobile ? offsetMobile : offset;
    const flipDirection = element.dataset.flipdirection === "true" ? -1 : 1;

    // Set initial offset position
    gsap.set(element, {
      y: initialOffset,
    });

    gsap.to(element, {
      y: () => {
        const isMobile = window.innerWidth < 768;
        const elementSpeed =
          isMobile && element.dataset.speedMobile
            ? parseFloat(element.dataset.speedMobile)
            : parseFloat(element.dataset.speed || "1");
        const elementOffset =
          isMobile && element.dataset.offsetMobile
            ? parseFloat(element.dataset.offsetMobile)
            : parseFloat(element.dataset.offset || "0");
        return elementOffset + elementSpeed * 100 * flipDirection;
      },
      ease: "none",
      force3D: true,
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        scrub: true,
      },
    });
  });

  // Object-position parallax for images/videos
  const objectParallaxEls = document.querySelectorAll(".parallax-object");

  objectParallaxEls.forEach((element) => {
    const media = element;
    const isMobile = window.innerWidth < 768;

    const offsetX =
      isMobile && media.dataset.offsetXMobile
        ? parseFloat(media.dataset.offsetXMobile)
        : parseFloat(media.dataset.offsetX || "50");
    const offsetY =
      isMobile && media.dataset.offsetYMobile
        ? parseFloat(media.dataset.offsetYMobile)
        : parseFloat(media.dataset.offsetY || "50");

    const speedX =
      isMobile && media.dataset.speedMobile
        ? parseFloat(media.dataset.speedMobile)
        : parseFloat(media.dataset.speedX || "0");
    const speedY =
      isMobile && media.dataset.speedMobile
        ? parseFloat(media.dataset.speedMobile)
        : parseFloat(media.dataset.speedY || "1");

    // Set initial object-position
    media.style.objectPosition = `${offsetX}% ${offsetY}%`;

    const proxy = { x: offsetX, y: offsetY };

    gsap.to(proxy, {
      x: offsetX + speedX * 100,
      y: offsetY + speedY * 100,
      ease: "none",
      onUpdate: () => {
        media.style.objectPosition = `${proxy.x}% ${proxy.y}%`;
      },
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

/* ========================================
   ANIMATED NUMBER IMPLEMENTATION
   ======================================== */
function initAnimatedNumbers() {
  const numbers = document.querySelectorAll(".animated-number");

  numbers.forEach((element) => {
    const value = parseFloat(element.dataset.value || "0");
    const duration = parseFloat(element.dataset.duration || "2");
    const ease = element.dataset.ease || "power1.out";
    const decimals = parseInt(element.dataset.decimals || "0", 10);
    const prefix = element.dataset.prefix || "";
    const suffix = element.dataset.suffix || "";
    const separator = element.dataset.separator || ",";
    const scrollTriggerStart = element.dataset.start || "top 80%";
    const scrollTriggerEnd = element.dataset.end || undefined;
    const once = element.dataset.once !== "false";
    const delay = parseFloat(element.dataset.delay || "0");
    const useLerp = element.dataset.lerp === "true";
    const lerpFactor = parseFloat(element.dataset.lerpFactor || "0.1");

    const counter = { value: 0 };
    let displayValue = 0;

    const formatNumber = (num) => {
      const fixedNum = num.toFixed(decimals);
      const parts = fixedNum.split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return decimals > 0 && parts[1]
        ? `${integerPart}.${parts[1]}`
        : integerPart;
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
          toggleActions: once ? "play none none none" : "play none none reset",
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

          element.textContent = `${prefix}${formatNumber(
            displayValue
          )}${suffix}`;
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
          toggleActions: once ? "play none none none" : "play none none reset",
          onEnter: () => {
            if (delay > 0) {
              delayTimer = gsap.delayedCall(delay, () => {
                animation.play();
              });
            }
          },
        },
        onUpdate: () => {
          element.textContent = `${prefix}${formatNumber(
            counter.value
          )}${suffix}`;
        },
      });
    }
  });
}

/* ========================================
   MOBILE CARD CAROUSEL (CONTAINER-MOBILE)
   ======================================== */
function animateHowMobileCards() {
  const pinContainer = document.getElementById("how-mobile-pin-container");

  const pinTarget = pinContainer.querySelector(".container-mobile-inner");
  const columnPercentageOffset = 250;

  const buttons = Array.from(document.querySelectorAll("#how-mobile-btn"));

  const cards = [
    document.getElementById("how-mobile-card-1"),
    document.getElementById("how-mobile-card-2"),
    document.getElementById("how-mobile-card-3"),
  ];

  // Initialize card positions
  cards.forEach((card, idx) => {
    if (card) {
      gsap.set(card, {
        xPercent: idx * columnPercentageOffset - 50,
      });
    }
  });

  const getCurrentStateIndex = (progress) => {
    if (progress >= 0.75) return 2;
    if (progress >= 0.4) return 1;
    return 0;
  };

  const updateButtonStates = (activeIndex) => {
    buttons.forEach((btn, i) => {
      if (i === activeIndex) {
        btn.classList.add("carousel-btn-active");
      } else {
        btn.classList.remove("carousel-btn-active");
      }
    });
  };

  const animateCardsToState = (stateIndex) => {
    cards.forEach((card, idx) => {
      if (card) {
        const offset = idx - stateIndex;
        gsap.to(card, {
          xPercent: offset * columnPercentageOffset - 50,
          duration: 0.5,
          ease: "power2.inOut",
        });
      }
    });
  };

  let lastIdx = 0;
  ScrollTrigger.create({
    trigger: pinContainer,
    start: "top top",
    end: "bottom bottom",
    pin: pinTarget,
    scrub: 1,
    pinType: pinTarget.style.willChange === "transform" ? "transform" : "fixed",
    onUpdate: (self) => {
      const currentStateIndex = getCurrentStateIndex(self.progress);

      if (currentStateIndex !== lastIdx) {
        updateButtonStates(currentStateIndex);
        animateCardsToState(currentStateIndex);
        lastIdx = currentStateIndex;
      }
    },
  });
}

function animateChangesMobileCards() {
  const pinContainer = document.getElementById("changes-mobile-pin-container");

  const pinTarget = pinContainer.querySelector(".mobile-change-inner");
  const columnPercentageOffset = 250;

  const buttons = Array.from(
    pinContainer.querySelectorAll("[data-changes-mobile-btn]")
  );

  const cards = [
    document.getElementById("changes-mobile-card-1"),
    document.getElementById("changes-mobile-card-2"),
    document.getElementById("changes-mobile-card-3"),
  ].filter(Boolean);

  cards.forEach((card, idx) => {
    gsap.set(card, {
      xPercent: idx * columnPercentageOffset - 50,
    });
  });

  const getCurrentStateIndex = (progress) => {
    if (progress >= 0.75) return 2;
    if (progress >= 0.4) return 1;
    return 0;
  };

  const updateButtonStates = (activeIndex) => {
    buttons.forEach((btn, idx) => {
      if (idx === activeIndex) {
        btn.classList.add("carousel-btn-active");
      } else {
        btn.classList.remove("carousel-btn-active");
      }
    });
  };

  const animateCardsToState = (stateIndex) => {
    cards.forEach((card, idx) => {
      const offset = idx - stateIndex;
      gsap.to(card, {
        xPercent: offset * columnPercentageOffset - 50,
        duration: 0.5,
        ease: "power2.inOut",
      });
    });
  };

  let lastIdx = 0;
  updateButtonStates(lastIdx);

  ScrollTrigger.create({
    trigger: pinContainer,
    start: "top top",
    end: "bottom bottom",
    pin: pinTarget,
    scrub: 1,
    markers: true,
    pinType: "transform",
    onUpdate: (self) => {
      const currentStateIndex = getCurrentStateIndex(self.progress);

      if (currentStateIndex !== lastIdx) {
        updateButtonStates(currentStateIndex);
        animateCardsToState(currentStateIndex);
        lastIdx = currentStateIndex;
      }
    },
  });
}

/* ========================================
   MASTER INITIALIZATION
   ======================================== */
function initAnimations() {
  if (typeof gsap === "undefined") {
    console.error("GSAP is not loaded");
    return;
  }

  // Register GSAP plugins
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (typeof SplitText !== "undefined") {
    gsap.registerPlugin(SplitText);
  }

  // Initialize all animations
  wordSwitcherAnimation();
  popInAnimation();
  fadeAnimation();
  fadeInAnimation();
  fadeLeftAnimation();
  fadeRightAnimation();
  parallaxAnimation();
  animateHowCardsImages();
  animateTextsAppear();
  animateTextsLetterSpacing();
  animateTitleXScrub();
  animateTextsLetterSpacingScrub();
  initAnimatedNumbers();
  animateHowMobileCards();
  animateChangesMobileCards();

  // Ensure ScrollTrigger accounts for video sizing
  const videos = Array.from(document.querySelectorAll("video"));
  const needsRefresh = videos.some((v) => v.readyState < 2);

  if (needsRefresh) {
    videos.forEach((v) => {
      if (v.readyState < 2) {
        const onReady = () => {
          requestAnimationFrame(() => ScrollTrigger.refresh());
        };
        v.addEventListener("loadedmetadata", onReady, { once: true });
        v.addEventListener("loadeddata", onReady, { once: true });
      }
    });
  }

  // Fallback refresh after page load
  window.addEventListener("load", () => ScrollTrigger.refresh(), {
    once: true,
  });
}

/* ========================================
   DOM READY - MAIN ENTRY POINT
   ======================================== */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Metemi initialized");

  // Initialize Lenis smooth scroll
  initLenis();

  // Wait for fonts to load before initializing animations
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      // Initialize GSAP animations after fonts are loaded
      initAnimations();
    });
  } else {
    // Fallback for browsers that don't support Font Loading API
    window.addEventListener("load", () => {
      initAnimations();
    });
  }
});
