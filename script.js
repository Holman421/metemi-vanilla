/* ========================================
    METEMI - Main JavaScript
    Plain HTML/CSS/JS Version
    ======================================== */

// Global state
let lenis = null;

/* ========================================
    ANIMATED BUBBLE BACKGROUND
    ======================================== */
function initBubbleBackground() {
  const interBubble = document.querySelector(".interactive");
  if (!interBubble) return;

  let curX = 0;
  let curY = 0;
  let tgX = 0;
  let tgY = 0;

  function move() {
    curX += (tgX - curX) / 40;
    curY += (tgY - curY) / 40;
    interBubble.style.transform = `translate(${Math.round(
      curX
    )}px, ${Math.round(curY)}px)`;
    requestAnimationFrame(move);
  }

  window.addEventListener("mousemove", (event) => {
    tgX = event.clientX;
    tgY = event.clientY;
  });

  move();
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
      "at your café",
      "in your building",
      "at your gym",
      "at your cowork",
      "from your class",
    ],
    delay: 1.25, // Longer delay since phrases are longer
    splitType: "chars",
  });

  // Czech "lidí/skupin" word switcher
  createWordSwitcher({
    selector: ".word-switcher-people-groups",
    phrases: ["people", "groups", "neighbours"],
    delay: 1,
    splitType: "chars",
  });
}

function popInAnimation() {
  const elements = document.querySelectorAll("[anim-pop-in]");

  elements.forEach((element) => {
    // Check if this is a dm-wrapper with a dm-gray or dm-red child
    const dmElement = element.querySelector(".dm-gray, .dm-red");

    // Set initial state
    gsap.set(element, {
      scale: 0,
      opacity: 0,
    });

    // If it's a DM element, set initial blur to 0
    if (dmElement) {
      gsap.set(dmElement, {
        "--blur-amount": "0px",
      });
    }

    // Create the pop-in animation
    gsap.to(element, {
      duration: 1.5,
      scale: 1,
      opacity: 1,
      ease: "elastic.out(1.3,0.4)",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "top 40%",
        toggleActions: "play none none reverse",
        markers: false,
        onEnter: () => {
          // Reset blur when entering
          if (dmElement) {
            gsap.set(dmElement, { "--blur-amount": "0px" });
          }
        },
        onLeaveBack: () => {
          // Reset blur when scrolling back up
          if (dmElement) {
            gsap.set(dmElement, { "--blur-amount": "0px" });
          }
        },
      },
      onComplete: () => {
        // After pop-in completes, animate the blur in
        if (dmElement) {
          gsap.to(dmElement, {
            "--blur-amount": "13px",
            duration: 0.6,
            ease: "power2.inOut",
          });
        }
      },
      onReverseComplete: () => {
        // Reset blur when animation reverses
        if (dmElement) {
          gsap.set(dmElement, { "--blur-amount": "0px" });
        }
      },
    });
  });
}

// --- NEW LOGIC ADDED HERE ---

/**
 * Generic function to handle fade animations with optional group-based staggering.
 * It groups elements by data-group-name and creates a ScrollTriggered Timeline for each group.
 * If no groupName is found, it falls back to animating the element individually.
 * @param {string} selectorAttribute - The attribute to select elements (e.g., "[anim-fade]").
 * @param {object} initialProps - The initial GSAP properties (e.g., {opacity: 0, y: "100%"}).
 * @param {object} animationProps - The final GSAP properties (e.g., {opacity: 1, y: "0%"}).
 */
function groupFadeAnimation(selectorAttribute, initialProps, animationProps) {
  const allElements = document.querySelectorAll(selectorAttribute);

  if (allElements.length === 0) return;

  // 1. Group elements by data-group-name
  const groups = new Map();
  const individualElements = [];

  allElements.forEach((element) => {
    const groupName = element.dataset.groupName;

    if (groupName) {
      if (!groups.has(groupName)) {
        groups.set(groupName, {
          elements: [],
          // Take trigger and start from the first element in the group
          trigger: element,
          start: element.dataset.start || "top 90%",
        });
      }
      groups.get(groupName).elements.push(element);
    } else {
      individualElements.push(element);
    }
  });

  // 2. Animate Groups with Stagger
  groups.forEach((groupData, groupName) => {
    const { elements, trigger, start } = groupData;

    // Use a set to define initial properties for all elements in the group
    gsap.set(elements, initialProps);

    // Create a single Timeline for the group to control stagger
    const groupTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: start,
        toggleActions: "play none none reverse",
        markers: false,
      },
    });

    // Calculate stagger value (defaults to 0.1s if not set on the first element)
    const staggerValue = parseFloat(trigger.dataset.stagger || "0.2");

    // Animate all elements in the group with stagger
    groupTimeline.to(
      elements,
      {
        ...animationProps,
        stagger: staggerValue,
        // Ensure duration is applied to each individual item in the stagger
        duration: animationProps.duration || 0.8,
      },
      0
    ); // Start at time 0 of the timeline
  });

  // 3. Animate Individual Elements (Fallback to original logic)
  individualElements.forEach((element) => {
    const startTrigger = element.dataset.start || "top 90%";
    const duration =
      parseFloat(element.dataset.duration) || animationProps.duration;

    // Set initial state
    gsap.set(element, initialProps);

    gsap.to(element, {
      ...animationProps,
      duration: duration,
      scrollTrigger: {
        trigger: element,
        start: startTrigger,
        toggleActions: "play none none reverse",
        markers: false,
      },
    });
  });
}

function fadeAnimation() {
  groupFadeAnimation(
    "[anim-fade]",
    { opacity: 0 },
    { duration: 0.8, opacity: 1, ease: "power2.out" }
  );
}

function fadeInAnimation() {
  groupFadeAnimation(
    "[anim-fade-in]",
    { opacity: 0, y: "100%" },
    { duration: 0.8, opacity: 1, y: "0%", ease: "power2.out" }
  );
}

function fadeLeftAnimation() {
  groupFadeAnimation(
    "[anim-fade-left]",
    { opacity: 0, x: "-100px" },
    { duration: 0.8, opacity: 1, x: "0", ease: "power2.out" }
  );
}

function fadeRightAnimation() {
  groupFadeAnimation(
    "[anim-fade-right]",
    { opacity: 0, x: "100px" },
    { duration: 0.8, opacity: 1, x: "0", ease: "power2.out" }
  );
}

// --- END OF NEW LOGIC ---

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
  const heroVideos = document.querySelectorAll(".hero-video, .radar-instance");

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
      opacity: 0.5,
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

  // Title animations (start after logo completes)
  tl.to(
    heroTitle,
    {
      opacity: 1,
      duration: 0.9,
      ease: "power2.out",
    },
    "-=0.95"
  ).from(
    titleSplit.lines,
    {
      duration: 0.9,
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
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.3" // Start 0.3s before the previous animation completes
    );
  }

  // Hero video animation (both mobile and desktop)
  if (heroVideos.length > 0) {
    tl.fromTo(
      heroVideos,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.3"
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
    { element: firstImage, start: `-=75% 100%`, end: "-=50% 80%" },
    { element: secondImage, start: `-=75% 90%`, end: "-=50% 65%" },
    { element: thirdImage, start: `-=75% 65%`, end: "-=50% 50%" },
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

function scaleInAnimation() {
  // Calling the generic utility with properties for the scale-in effect.
  // The groupFadeAnimation function will now:
  // 1. Collect all elements with the class ".anim-scale-in".
  // 2. Automatically group elements sharing the same 'data-group-name'.
  // 3. Apply a default stagger of 0.1s to any group found (if 'data-stagger' isn't set).
  // 4. Animate individual elements (no group name) as before.
  groupFadeAnimation(
    ".anim-scale-in",
    { scale: 0.5, opacity: 0 }, // Initial GSAP properties (from scale 0.5 and fully transparent)
    { duration: 0.8, scale: 1, opacity: 1, ease: "power2.out" } // Final GSAP properties
  );
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
    VIDEO PLAY BUTTON HANDLER
    ======================================== */
function initVideoPlayButtons() {
  // Find all video containers with play buttons
  const videoContainers = document.querySelectorAll(".video-container");

  videoContainers.forEach((container) => {
    const playButton = container.querySelector(".video-play-button");
    const video = container.querySelector("video");

    if (playButton && video) {
      // Add click handler to play button - play the video
      playButton.addEventListener("click", () => {
        // Hide the play button with animation
        playButton.classList.add("hidden");

        // Play the video
        video.play().catch((error) => {
          console.log("Video play failed:", error);
          // Show button again if play fails
          playButton.classList.remove("hidden");
        });
      });

      // Add click handler to video - pause and show button
      video.addEventListener("click", () => {
        if (!video.paused) {
          video.pause();
          playButton.classList.remove("hidden");
        }
      });

      // Show button again if video is paused
      video.addEventListener("pause", () => {
        playButton.classList.remove("hidden");
      });

      // Hide button when video starts playing
      video.addEventListener("play", () => {
        playButton.classList.add("hidden");
      });

      // Show button when video ends
      video.addEventListener("ended", () => {
        playButton.classList.remove("hidden");
      });
    }
  });
}

/* ========================================
    DM-GRAY TYPING ANIMATION
    ======================================== */
function initDmGrayTyping() {
  const dmGrayElements = document.querySelectorAll(".dm-gray");

  dmGrayElements.forEach((element) => {
    const descriptionElement = element.querySelector(".description");
    if (!descriptionElement) return;

    // Store the original message text
    const originalMessage = descriptionElement.textContent;

    // Variables to track animation state
    let typingIndicator = null;
    let dotAnimation = null;
    let isAnimating = false;

    // Create typing indicator (three dots)
    const createTypingIndicator = () => {
      const indicator = document.createElement("div");
      indicator.className = "typing-indicator";
      indicator.innerHTML = `
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      `;
      return indicator;
    };

    // Typewriter effect function
    const typewriterEffect = (text, targetElement, speed = 30) => {
      return new Promise((resolve) => {
        targetElement.textContent = "";
        let index = 0;

        const typeChar = () => {
          if (index < text.length) {
            targetElement.textContent += text.charAt(index);
            index++;
            setTimeout(typeChar, speed);
          } else {
            resolve();
          }
        };

        typeChar();
      });
    };

    // Function to start the typing animation sequence
    const startTypingAnimation = () => {
      if (isAnimating) return;
      isAnimating = true;

      // Remove existing typing indicator if present
      if (typingIndicator) {
        typingIndicator.remove();
        typingIndicator = null;
      }

      // Kill any existing dot animation
      if (dotAnimation) {
        dotAnimation.kill();
        dotAnimation = null;
      }

      // Hide description and show typing indicator
      descriptionElement.style.visibility = "hidden";
      descriptionElement.style.position = "absolute";
      typingIndicator = createTypingIndicator();
      element.insertBefore(typingIndicator, descriptionElement);

      // Animate the typing indicator dots
      const dots = typingIndicator.querySelectorAll(".dot");
      dotAnimation = gsap.to(dots, {
        opacity: 0.3,
        duration: 0.4,
        stagger: 0.15,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // Wait for pop-in animation to complete (1.5s) + 1 second of typing indicator
      gsap.delayedCall(1.0, () => {
        // Kill dot animation before removing
        if (dotAnimation) {
          dotAnimation.kill();
          dotAnimation = null;
        }

        // Animate typing indicator out with fade and slight scale
        gsap.to(typingIndicator, {
          opacity: 0,
          scale: 0.8,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            if (typingIndicator) {
              typingIndicator.remove();
              typingIndicator = null;
            }

            // Show description element with initial state
            descriptionElement.style.visibility = "visible";
            descriptionElement.style.position = "relative";
            gsap.set(descriptionElement, { opacity: 0 });

            // Fade in the description
            gsap.to(descriptionElement, {
              opacity: 1,
              duration: 0.2,
              ease: "power2.out",
              onComplete: () => {
                isAnimating = false;
              },
            });

            // Start typewriter effect
            typewriterEffect(originalMessage, descriptionElement, 20);
          },
        });
      });
    };

    // Function to reset to typing indicator state
    const resetToTypingIndicator = () => {
      // Animate the description text out first
      if (descriptionElement.style.visibility !== "hidden") {
        gsap.to(descriptionElement, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            // Kill any ongoing animations
            if (dotAnimation) {
              dotAnimation.kill();
              dotAnimation = null;
            }

            // Remove typing indicator if it exists
            if (typingIndicator) {
              typingIndicator.remove();
              typingIndicator = null;
            }

            // Hide description
            descriptionElement.style.visibility = "hidden";
            descriptionElement.style.position = "absolute";
            descriptionElement.textContent = originalMessage;

            // Create and show new typing indicator
            typingIndicator = createTypingIndicator();
            element.insertBefore(typingIndicator, descriptionElement);

            isAnimating = false;
          },
        });
      } else {
        // If description is already hidden, just do immediate reset
        // Kill any ongoing animations
        if (dotAnimation) {
          dotAnimation.kill();
          dotAnimation = null;
        }

        // Remove typing indicator if it exists
        if (typingIndicator) {
          typingIndicator.remove();
          typingIndicator = null;
        }

        // Hide description
        descriptionElement.style.visibility = "hidden";
        descriptionElement.style.position = "absolute";
        descriptionElement.textContent = originalMessage;

        // Create and show new typing indicator
        typingIndicator = createTypingIndicator();
        element.insertBefore(typingIndicator, descriptionElement);

        isAnimating = false;
      }
    };

    // Initialize with typing indicator shown
    resetToTypingIndicator();

    // Initialize the animation sequence with ScrollTrigger
    ScrollTrigger.create({
      trigger: element,
      start: "top 85%",
      end: "top 40%",
      onEnter: () => {
        startTypingAnimation();
      },
      onLeaveBack: () => {
        resetToTypingIndicator();
      },
    });
  });
}

/* ========================================
    PORTRAIT SCROLL SCALE (GSAP + ScrollTrigger)
    ======================================== */
function portraitScrollScale() {
  const container = document.querySelector(".talk-to-images");
  if (!container) {
    console.log("talk-to-images container not found");
    return;
  }

  const portraitWrappers = document.querySelectorAll(".portret-wrapper");
  if (!portraitWrappers.length) {
    console.log("No portrait wrappers found");
    return;
  }

  console.log("Found", portraitWrappers.length, "portrait wrappers to animate");

  // Animate each portrait wrapper
  portraitWrappers.forEach((wrapper) => {
    gsap.fromTo(
      wrapper,
      {
        scale: 1,
      },
      {
        scale: 1.5,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: ".talk-to",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          markers: false,
        },
      }
    );
  });
}

/* ========================================
    CONFETTI EFFECT FOR GOOGLE PLAY BUTTONS
    ======================================== */
function initConfettiButtons() {
  // Target the specific button in image-right-text-split-2
  const confettiButton = document.querySelector(
    ".image-right-text-split-2 .google-play-badge"
  );

  if (confettiButton && typeof confetti !== "undefined") {
    let hasTriggered = false;

    const fireConfetti = () => {
      // Get button position for confetti origin
      const rect = confettiButton.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      // Fire confetti with custom colors matching your gradient theme
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
        ticks: 200,
        gravity: 1,
        decay: 0.94,
        startVelocity: 30,
        scalar: 1.2,
      });

      // Add a second burst slightly delayed for a more dramatic effect
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x, y },
          colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
        });
      }, 100);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x, y },
          colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
        });
      }, 100);
    };

    // Create ScrollTrigger for confetti animation
    ScrollTrigger.create({
      trigger: confettiButton,
      start: "top 75%", // Trigger when button reaches 75% down the viewport
      markers: false,
      once: true, // Only trigger once
      onEnter: () => {
        if (!hasTriggered) {
          hasTriggered = true;
          fireConfetti();
        }
      },
    });
  }
}

/* ========================================
    DYNAMIC BREAK LINE FOR WORD SWITCHER
    ======================================== */
function initDynamicBreakLine() {
  const targetElement = document.querySelector(".word-switcher-people-groups");
  if (!targetElement) return;

  const handleResize = () => {
    const isMobile = window.innerWidth <= 768;
    const previousSibling = targetElement.previousSibling;
    const isBreakLine =
      previousSibling &&
      previousSibling.nodeType === Node.ELEMENT_NODE &&
      previousSibling.tagName === "BR" &&
      previousSibling.classList.contains("dynamic-br");

    if (isMobile) {
      // If mobile and no break line exists, add it
      if (!isBreakLine) {
        const br = document.createElement("br");
        br.classList.add("dynamic-br");
        targetElement.parentNode.insertBefore(br, targetElement);
      }
    } else {
      // If desktop and break line exists, remove it
      if (isBreakLine) {
        previousSibling.remove();
      }
    }
  };

  // Initial check
  handleResize();

  // Add event listener
  window.addEventListener("resize", handleResize);
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
  scaleInAnimation();
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
  initVideoPlayButtons();
  initDmGrayTyping();
  portraitScrollScale();
  initConfettiButtons();
  initDynamicBreakLine();
}

/* ========================================
    DOM READY - MAIN ENTRY POINT
    ======================================== */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Metemi initialized");

  // Initialize video lazy loading
  if (typeof initVideoOptimization === "function") {
    initVideoOptimization();
  }

  initLenis();

  // Wait only for the hero background image to load before starting hero animation
  const heroContainer = document.querySelector(".hero-container");
  if (heroContainer) {
    const bgImageUrl = "assets/images/hero-bg.jpg";
    const img = new Image();

    img.onload = () => {
      console.log("Hero background loaded, starting hero animation");
      // Start hero animation immediately after background loads
      gsap.registerPlugin(ScrollTrigger);
      gsap.registerPlugin(SplitText);
      heroAnimation();
    };

    img.onerror = () => {
      console.log("Hero background failed to load, starting animation anyway");
      gsap.registerPlugin(ScrollTrigger);
      gsap.registerPlugin(SplitText);
      heroAnimation();
    };

    // Start loading the background image
    img.src = bgImageUrl;
  }

  // Initialize all other animations once DOM is interactive (don't wait for videos)
  // Use a small timeout to ensure GSAP plugins are loaded
  setTimeout(() => {
    console.log("Initializing other animations");
    gsap.registerPlugin(ScrollTrigger);
    gsap.registerPlugin(SplitText);

    // Initialize all animations except hero (already done)
    wordSwitcherAnimation();
    popInAnimation();
    fadeAnimation();
    fadeInAnimation();
    fadeLeftAnimation();
    scaleInAnimation();
    fadeRightAnimation();
    parallaxAnimation();
    animateHowCardsImages();
    animateTextsAppear();
    animateTitleXScrub();
    animateTextsLetterSpacingScrub();
    animateHowMobileCards();
    animateChangesMobileCards();
    animateBigGridMobileCards();
    initVideoPlayButtons();
    initDmGrayTyping();
    portraitScrollScale();
    initConfettiButtons();
  }, 100);
});

/* ========================================
    RANDOM SHIMMER EFFECT FOR GOOGLE PLAY BUTTONS AND HERO CTA
    ======================================== */
function initRandomShimmer() {
  const googlePlayButtons = document.querySelectorAll(".google-play-btn");
  const heroCTA = document.querySelector(".hero-cta");

  // Combine all buttons that should have shimmer effect
  const shimmerButtons = [...googlePlayButtons];
  if (heroCTA) {
    shimmerButtons.push(heroCTA);
  }

  if (shimmerButtons.length === 0) {
    console.log("No shimmer buttons found");
    return;
  }

  console.log(
    `✨ Found ${shimmerButtons.length} buttons for shimmer effect (${
      googlePlayButtons.length
    } Google Play + ${heroCTA ? 1 : 0} Hero CTA)`
  );

  // Function to trigger shimmer on a random button
  function triggerRandomShimmer() {
    // Pick a random button
    const randomIndex = Math.floor(Math.random() * shimmerButtons.length);
    const button = shimmerButtons[randomIndex];

    console.log(
      `✨ Triggering shimmer on button ${randomIndex + 1} of ${
        shimmerButtons.length
      }`
    );

    // Force a reflow to ensure the animation restarts properly
    button.classList.remove("shimmer-active");
    void button.offsetWidth; // Force reflow

    // Add shimmer class
    button.classList.add("shimmer-active");

    // Remove class after animation completes (800ms duration + small buffer)
    setTimeout(() => {
      button.classList.remove("shimmer-active");
      console.log("✨ Shimmer completed");
    }, 850);

    // Schedule next shimmer (random interval between 8-12 seconds)
    const nextInterval = 2000 + Math.random() * 3000; // 8-12 seconds
    console.log(
      `⏰ Next shimmer in ${Math.round(nextInterval / 1000)} seconds`
    );
    setTimeout(triggerRandomShimmer, nextInterval);
  }

  // Start the first shimmer after initial delay (2-4 seconds for testing)
  const initialDelay = 2000 + Math.random() * 2000;
  console.log(
    `⏰ Starting shimmer effect in ${Math.round(initialDelay / 1000)} seconds`
  );
  setTimeout(triggerRandomShimmer, initialDelay);
}

/* ========================================
    FIXED BOTTOM BANNER SCROLL BEHAVIOR
    ======================================== */
function initFixedBottomBanner() {
  const banner = document.querySelector(".fixed-bottom-banner");
  const closeButton = document.querySelector(".banner-close");
  if (!banner) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  let isDismissed = false;

  function updateBanner() {
    if (isDismissed) return; // Don't update if manually dismissed

    const currentScrollY = window.scrollY;
    const scrollingUp = currentScrollY < lastScrollY;
    const scrollingDown = currentScrollY > lastScrollY;

    // Show banner when scrolling up and not at the very top
    if (scrollingUp && currentScrollY > 300) {
      banner.classList.add("show");
    }

    // Hide banner when scrolling down
    if (scrollingDown) {
      banner.classList.remove("show");
    }

    // Hide banner when at the top of the page
    if (currentScrollY < 100) {
      banner.classList.remove("show");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  function onScroll() {
    if (!ticking && !isDismissed) {
      window.requestAnimationFrame(updateBanner);
      ticking = true;
    }
  }

  function dismissBanner() {
    isDismissed = true;
    banner.classList.remove("show");
    window.removeEventListener("scroll", onScroll);
  }

  // Close button handler
  if (closeButton) {
    closeButton.addEventListener("click", dismissBanner);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initBubbleBackground();
    initFixedBottomBanner();
    initRandomShimmer();
  });
} else {
  initBubbleBackground();
  initFixedBottomBanner();
  initRandomShimmer();
}
