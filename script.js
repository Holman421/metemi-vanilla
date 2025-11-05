/* ========================================
   METEMI - Main JavaScript
   Plain HTML/CSS/JS Version
   ======================================== */

// Global state
let lenis = null;
let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

/* ========================================
   SAFARI HERO FALLBACK
   ======================================== */
function initSafariHeroFallback() {
  if (isSafari) {
    // Hide videos and show logo images in hero section
    const heroVideos = document.querySelectorAll(".hero-video");
    const heroLogos = document.querySelectorAll(".hero-fallback-logo");

    heroVideos.forEach((video) => {
      video.style.display = "none";
    });

    heroLogos.forEach((logo) => {
      logo.style.display = "block";
    });
  }
}

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
    // Safari optimization: disable smooth touch as it can cause issues
    smoothTouch: isSafari ? false : false,
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

// Generic word switcher animation that can be used with any element
function createWordSwitcher(config) {
  const {
    selector,
    phrases,
    delay = 1,
    splitType = "chars", // "chars" or "words"
  } = config;

  const element = document.querySelector(selector);
  if (!element || typeof SplitText === "undefined") {
    console.error(
      `SplitText plugin not loaded or element not found: ${selector}`
    );
    return;
  }

  let currentIndex = 0;
  let currentSplit = null;

  // Function to format text with line breaks for mobile
  const formatTextForMobile = (text) => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return text;

    // Split "Meet people at/in/from your [location]" into two lines
    // Pattern: "Meet people [at/in/from] your [location]"
    const patterns = [
      { find: /^(Meet people from )(.+)$/i, replace: "$1<br>$2" },
      { find: /^(Meet people )(at|in) (your .+)$/i, replace: "$1$2<br>$3" },
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern.find);
      if (match) {
        return text.replace(pattern.find, pattern.replace);
      }
    }

    return text;
  };

  // Initialize with first phrase
  const initialText = formatTextForMobile(phrases[currentIndex]);
  element.innerHTML = initialText;

  // Store initial dimensions to prevent layout shift
  const initialHeight = element.offsetHeight;
  element.style.minHeight = `${initialHeight}px`;

  currentSplit = new SplitText(element, { type: splitType });

  // Function to animate transition
  function animateSwitch() {
    const nextIndex = (currentIndex + 1) % phrases.length;
    const units =
      splitType === "chars" ? currentSplit.chars : currentSplit.words;

    // Animate out current units with stagger (randomized)
    gsap.to(units, {
      duration: 0.2,
      y: 30,
      opacity: 0,
      rotation: () => gsap.utils.random(-15, 15),
      scale: 0.5,
      ease: "back.in(2)",
      stagger: {
        each: 0.015,
        from: "random",
      },
      onComplete: () => {
        // Revert split and update text
        currentSplit.revert();
        const nextText = formatTextForMobile(phrases[nextIndex]);
        element.innerHTML = nextText;
        currentSplit = new SplitText(element, { type: splitType });

        const newUnits =
          splitType === "chars" ? currentSplit.chars : currentSplit.words;

        // Set initial state for new units (coming from below)
        gsap.set(newUnits, {
          y: 30,
          opacity: 0,
          rotation: () => gsap.utils.random(-15, 15),
          scale: 0.5,
        });

        // Animate in new units with stagger (also randomized)
        gsap.to(newUnits, {
          duration: 0.2,
          y: 0,
          opacity: 1,
          rotation: 0,
          scale: 1,
          ease: "back.out(2)",
          stagger: {
            each: 0.015,
            from: "random",
          },
          onComplete: () => {
            currentIndex = nextIndex;
            // Wait before next transition
            gsap.delayedCall(delay, animateSwitch);
          },
        });
      },
    });
  }

  // Start the animation cycle after initial delay
  gsap.delayedCall(delay, animateSwitch);
}

function wordSwitcherAnimation() {
  // Original hero word switcher
  createWordSwitcher({
    selector: ".word-switcher",
    phrases: ["people", "groups"],
    delay: 1,
    splitType: "chars",
  });

  // New "Meet people at..." word switcher
  createWordSwitcher({
    selector: ".third-title",
    phrases: [
      "Meet people at your café",
      "Meet people in your building",
      "Meet people at your gym",
      "Meet people at your cowork",
      "Meet people from your class",
    ],
    delay: 1.25, // Longer delay since phrases are longer
    splitType: "chars",
  });
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
      ease: "elastic.out(1.3,0.4)",
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
      start: "top 85%",
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

function heroAnimation() {
  const heroLogo = document.querySelector("[hero-logo]");
  const heroTitle = document.querySelector(".hero-content .title-big");
  const buttonContainer = document.querySelector(
    ".hero-content .button-container"
  );

  if (!heroLogo || !heroTitle) return;

  // Split text for animations
  const logoSplit = new SplitText(heroLogo, {
    type: "words",
    wordsClass: "split-word",
  });

  const titleSplit = new SplitText(heroTitle, {
    type: "lines",
    linesClass: "split-line",
  });

  // Create master timeline
  const tl = gsap.timeline();

  // Logo animations (run simultaneously at position 0)
  tl.fromTo(
    heroLogo,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.5,
      ease: "power4.inOut",
    },
    0
  ).fromTo(
    logoSplit.words,
    { letterSpacing: "0.4em" },
    {
      letterSpacing: "0em",
      duration: 1.5,
      ease: "power4.inOut",
    },
    0
  );

  // Animate Safari fallback logo images if on Safari
  if (isSafari) {
    const heroFallbackLogos = document.querySelectorAll(
      ".hero-content .hero-fallback-logo"
    );

    if (heroFallbackLogos.length > 0) {
      heroFallbackLogos.forEach((logo) => {
        gsap.set(logo, { opacity: 0, scale: 0.8 });

        tl.to(
          logo,
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=1.2" // Start during logo text animation
        );
      });
    }
  }

  // Title animations (start after logo completes)
  tl.to(
    heroTitle,
    {
      opacity: 1,
      duration: 0.75,
      ease: "power2.out",
    },
    "-=0.7"
  ).from(
    titleSplit.lines,
    {
      duration: 0.75,
      y: "75%",
      opacity: 0,
      ease: "back.out",
      stagger: 0.1,
    },
    "<" // Start at the same time as the previous animation
  );

  // Button container animation (slight overlap with title)
  if (buttonContainer) {
    tl.fromTo(
      buttonContainer,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.6" // Start 0.3s before the previous animation completes
    );
  }
}

function animateTitleXScrub() {
  const element = document.querySelector("[title-x-scrub]");

  gsap.fromTo(
    element,
    {
      x: "0%",
    },
    {
      x: "-75%",
      duration: 1,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top 65%",
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
          start: "top 100%",
          end: "bottom 70%",
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

  const mainTop = 80;
  const offset = 0;

  const imagesArray = [
    { element: firstImage, start: `-=100px 100%`, end: "top 80%" },
    { element: secondImage, start: `-=100px 70%`, end: "top 55%" },
    { element: thirdImage, start: `-=100px 50%`, end: "top 40%" },
  ];

  imagesArray.forEach(({ element, start, end }) => {
    gsap.fromTo(
      element,
      {
        y: "75%",
      },
      {
        y: "0%",
        duration: 1,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: start,
          end: end,
          scrub: 1.5,
          markers: false,
        },
      }
    );
  });
}

function parallaxAnimation() {
  const parallaxElements = document.querySelectorAll("[parallax]");

  parallaxElements.forEach((element) => {
    // Safari optimization: only set will-change when actively animating
    // element.style.willChange = "transform";

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
        // Safari optimization
        onEnter: () => {
          element.style.willChange = "transform";
        },
        onLeave: () => {
          element.style.willChange = "auto";
        },
        onEnterBack: () => {
          element.style.willChange = "transform";
        },
        onLeaveBack: () => {
          element.style.willChange = "auto";
        },
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
   MOBILE CARD CAROUSEL - GENERIC FUNCTION
   ======================================== */
function animateMobileCardCarousel(config) {
  const {
    containerSelector,
    containerElement,
    pinTargetSelector,
    buttonSelector,
    cardSelectors,
    cardElements,
    columnPercentageOffset = 250,
    pinType = "transform",
    shouldCreateWrapper = false,
    wrapperConfig = null,
  } = config;

  // Get container element
  const pinContainer =
    containerElement ||
    (containerSelector.startsWith("#")
      ? document.getElementById(containerSelector.slice(1))
      : document.querySelector(containerSelector));

  if (!pinContainer) return;

  // Get pin target
  const pinTarget = pinContainer.querySelector(pinTargetSelector);
  if (!pinTarget) return;

  let buttons = [];
  let cards = [];
  let finalPinTarget = pinTarget;

  // Handle wrapper creation for big-grid-mobile
  if (shouldCreateWrapper && wrapperConfig) {
    const title = pinContainer.querySelector(wrapperConfig.titleSelector);
    if (title) {
      const pinnedWrapper = document.createElement("div");
      pinnedWrapper.className = wrapperConfig.wrapperClass;

      const parent = title.parentNode;
      parent.insertBefore(pinnedWrapper, title);

      pinnedWrapper.appendChild(title);
      pinnedWrapper.appendChild(pinTarget);

      // Create buttons dynamically
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "carousel-controls";
      buttonsContainer.innerHTML = `
        <div class="carousel-btn carousel-btn-active" ${wrapperConfig.buttonAttribute}></div>
        <div class="carousel-btn" ${wrapperConfig.buttonAttribute}></div>
        <div class="carousel-btn" ${wrapperConfig.buttonAttribute}></div>
      `;
      pinnedWrapper.appendChild(buttonsContainer);

      finalPinTarget = pinnedWrapper;
    }
  }

  // Get buttons
  if (buttonSelector) {
    buttons = Array.from(pinContainer.querySelectorAll(buttonSelector));
  }

  // Get cards
  if (cardElements) {
    cards = cardElements.filter(Boolean);
  } else if (cardSelectors) {
    cards = cardSelectors
      .map((selector) =>
        selector.startsWith("#")
          ? document.getElementById(selector.slice(1))
          : pinContainer.querySelector(selector)
      )
      .filter(Boolean);
  }

  // Initialize card positions
  cards.forEach((card, idx) => {
    gsap.set(card, {
      x: 0, // Clear any existing x transforms
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
        x: 0, // Keep x at 0
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
    pin: finalPinTarget,
    scrub: 1,
    markers: false,
    pinType: pinType,
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

// Specific implementations using the generic function
function animateHowMobileCards() {
  const pinContainer = document.getElementById("how-mobile-pin-container");
  if (!pinContainer) return;

  animateMobileCardCarousel({
    containerElement: pinContainer,
    // Pin the container-mobile-inner which has the content
    pinTargetSelector: ".container-mobile-inner",
    buttonSelector: "#how-mobile-btn",
    cardSelectors: [
      "#how-mobile-card-1",
      "#how-mobile-card-2",
      "#how-mobile-card-3",
    ],
    pinType: "fixed", // Use fixed for better Safari compatibility
  });
}

function animateChangesMobileCards() {
  const pinContainer = document.getElementById("changes-mobile-pin-container");
  if (!pinContainer) return;

  // Cards are inside the card-container, not at the root level
  const cards = [
    pinContainer.querySelector("#changes-mobile-card-1"),
    pinContainer.querySelector("#changes-mobile-card-2"),
    pinContainer.querySelector("#changes-mobile-card-3"),
  ].filter(Boolean);

  animateMobileCardCarousel({
    containerElement: pinContainer,
    pinTargetSelector: ".mobile-change-inner",
    buttonSelector: "[data-changes-mobile-btn]",
    cardElements: cards,
    pinType: "fixed", // Use fixed for better Safari compatibility
  });
}

function animateBigGridMobileCards() {
  const pinContainer = document.querySelector(".big-grid-mobile");
  if (!pinContainer) return;

  const cards = [
    pinContainer.querySelector(".first.column"),
    pinContainer.querySelector(".second.column"),
    pinContainer.querySelector(".third.column"),
  ].filter(Boolean);

  animateMobileCardCarousel({
    containerElement: pinContainer,
    pinTargetSelector: ".big-grid-container",
    buttonSelector: "[data-big-grid-mobile-btn]",
    cardElements: cards,
    shouldCreateWrapper: true,
    wrapperConfig: {
      titleSelector: ".big-grid-title",
      wrapperClass: "big-grid-pinned-wrapper",
      buttonAttribute: "data-big-grid-mobile-btn",
    },
    pinType: "fixed", // Use fixed for better Safari compatibility
  });
}

/* ========================================
   MASTER INITIALIZATION
   ======================================== */
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.registerPlugin(SplitText);

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
  animateTitleXScrub();
  heroAnimation();
  animateTextsLetterSpacingScrub();
  // initAnimatedNumbers();
  animateHowMobileCards();
  animateChangesMobileCards();
  animateBigGridMobileCards();
}

/* ========================================
   DOM READY - MAIN ENTRY POINT
   ======================================== */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Metemi initialized");

  // Initialize Safari hero fallback immediately
  initSafariHeroFallback();

  // Initialize video lazy loading
  if (typeof initVideoOptimization === "function") {
    initVideoOptimization();
  }

  initLenis();

  window.addEventListener("load", () => {
    console.log("Initializing animations");
    initAnimations();
  });
});
