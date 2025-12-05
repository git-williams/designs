// Requires GSAP core + TextPlugin + MotionPathPlugin to be loaded on the page
document.addEventListener("DOMContentLoaded", () => {
  // ===== Scroll-triggered section animation =====
  const sections = document.querySelectorAll(".wrapper2");

  const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < triggerBottom) {
        section.classList.add("visible2");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();

  // ===== Header scroll behavior =====
  const header = document.querySelector(".main-header");
  const hero = document.querySelector(".hero");
  let lastScrollY = window.scrollY;

  const toggleHeader = () => {
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    const currentScroll = window.scrollY;

    if (currentScroll > heroBottom) {
      if (currentScroll < lastScrollY) {
        header.classList.add("visible");
        header.classList.remove("hidden");
      } else {
        header.classList.add("hidden");
        header.classList.remove("visible");
      }
    } else {
      header.classList.add("visible");
      header.classList.remove("hidden");
    }

    lastScrollY = currentScroll;
  };

  window.addEventListener("scroll", toggleHeader);
  toggleHeader();

  // ===== HERO ANIMATION =====
  // Register GSAP plugins
  gsap.registerPlugin(TextPlugin, MotionPathPlugin);

  const words = ["impress.", "convert.", "inspire.", "grow.", "lead."];
  const mouse = document.querySelector(".mouse-cursor");
  const button = document.querySelector(".cta-btn");

  // Anchors
  const anchorA = document.getElementById("mouse-point-a");
  const anchorB = document.getElementById("mouse-point-b");
  const anchorC = document.getElementById("mouse-point-c");
  const anchorCTA = document.getElementById("mouse-point-cta");

  // Grab the H1 inside .hero-text and prepare structure
  const heroH1 = document.querySelector(".hero-text h1");

  heroH1.innerHTML =
    '<span class="typed-prefix"></span>' +
    '<span class="word-container" style="position:relative; display:inline-block;">' +
    '<span class="changing-word"></span>' +
    '<span class="highlight"></span>' +
    "</span>";

  const typedPrefix = heroH1.querySelector(".typed-prefix");
  const changingWord = heroH1.querySelector(".changing-word");
  const highlight = heroH1.querySelector(".highlight");

  // initial highlight styling
  highlight.style.transition = "none";
  highlight.style.position = "absolute";
  highlight.style.left = "0";
  highlight.style.bottom = "0";
  highlight.style.height = "1.2em";
  highlight.style.zIndex = "-1";
  highlight.style.width = "0px";
  highlight.style.background = "rgba(100, 150, 255, 0.5)";

  // typing settings
  const fullText = "Designs that impress.";
  const prefix = "Designs that ";
  const perChar = 0.05; // seconds per character

  // helper to get real coords for an element in document space
  const docCenter = (el) => {
    const r = el.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    return { x: r.left + scrollX + r.width / 2, y: r.top + scrollY + r.height / 2, rect: r };
  };

  // compute key coordinates: A,B,C, CTA centered in document coords
  const getCoords = () => {
    const wordContainerRect = heroH1.querySelector(".word-container").getBoundingClientRect();
    const wordRect = changingWord.getBoundingClientRect();
    const btnRect = button.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // anchor elements (they are positioned relative to their parents)
    // we'll translate their computed bounding client rect into page coords:
    const aRect = anchorA.getBoundingClientRect();
    const bRect = anchorB.getBoundingClientRect();
    const cRect = anchorC.getBoundingClientRect();
    const ctaRect = anchorCTA.getBoundingClientRect();

    const ax = aRect.left + scrollX + aRect.width / 2;
    const ay = aRect.top + scrollY + aRect.height / 2;

    const bx = bRect.left + scrollX + bRect.width / 2;
    const by = bRect.top + scrollY + bRect.height / 2;

    const cx = cRect.left + scrollX + cRect.width / 2;
    const cy = cRect.top + scrollY + cRect.height / 2;

    const ctax = ctaRect.left + scrollX + ctaRect.width / 2;
    const ctay = ctaRect.top + scrollY + ctaRect.height / 2;

    return {
      ax,
      ay,
      bx,
      by,
      cx,
      cy,
      ctax,
      ctay,
      wordRect
    };
  };

  // ensure mouse is positioned offscreen-left initially (relative to the document)
  const setMouseStart = () => {
    const coords = getCoords();
    // if anchors not yet placed in DOM or zero-size, fallback to some reasonable values
    const startX = (coords.ax || window.innerWidth * 0.2) - 300;
    const startY = (coords.ay || window.innerHeight / 2) - 120;
    gsap.set(mouse, { x: startX, y: startY, opacity: 0 });
  };

  // run initial set
  setMouseStart();

  // create master timeline
  const tl = gsap.timeline();

  // ---- STEP 1: Typing ----
  const driver = { i: 0 };
  const totalChars = fullText.length;
  tl.to(driver, {
    i: totalChars,
    duration: totalChars * perChar,
    ease: "none",
    onUpdate: function () {
      const idx = Math.floor(driver.i);
      if (idx <= prefix.length) {
        typedPrefix.textContent = fullText.slice(0, idx);
        changingWord.textContent = "";
      } else {
        typedPrefix.textContent = prefix;
        changingWord.textContent = fullText.slice(prefix.length, idx);
      }
    }
  });

  // After typing: WAIT 1.5s but mouse should be entering during that 1.5s and landing at A
  const enterDuration = 1.5; // seconds

  // compute a motion path from offscreen start to anchor A (we'll compute path using getCoords)
  tl.add(() => {
    // recompute coords (layout settled)
    const coords = getCoords();
    const { ax, ay } = coords;

    // set mouse visible and animate on a half-arch into A (duration = enterDuration)
    gsap.to(mouse, { duration: 0.15, opacity: 1, ease: "power1.out" });

    // build approach path: start a bit left & up from A then sweep down onto A
    const startX = (ax || window.innerWidth * 0.3) - 260;
    const startY = (ay || window.innerHeight / 2) - 120;

    // use MotionPathPlugin to curve into A
    gsap.to(mouse, {
      duration: enterDuration,
      ease: "power2.inOut",
      motionPath: {
        path: [
          { x: startX, y: startY },
          { x: ax - 140, y: ay - 60 },
          { x: ax - 60, y: ay - 20 },
          { x: ax, y: ay }
        ],
        curviness: 1.6,
        autoRotate: false
      }
    });
  });

  // after the mouse reaches A we wait 0.4s
  tl.to({}, { duration: 0.4 });

  // ---- STEP 3: Simultaneous highlight entrance AND mouse straight A->B (0.5s) ----
  tl.add(() => {
    const coords = getCoords();
    const { ax, ay, bx, by, wordRect } = coords;

    // target highlight width (word's width)
    const targetWidth = wordRect.width + "px";

    // ensure highlight starts at 0
    highlight.style.transition = "none";
    highlight.style.width = "0px";

    const tAB = 0.5;
    // move mouse in a straight line to B, and increase highlight in sync
    gsap.to(mouse, {
      duration: tAB,
      x: bx,
      y: by,
      ease: "power2.inOut"
    });

    gsap.to(highlight, {
      duration: tAB,
      width: targetWidth,
      ease: "power2.inOut"
    });
  });

  // pause at B for 0.4s
  tl.to({}, { duration: 0.4 });

  // ---- STEP 4: Word cycling while mouse swoops to CTA (words not too fast) ----
  // Word durations (how long each word sits). We'll use 0.9s per word so each reads comfortably.
  const wordDuration = 0.9; // seconds
  const wordsToCycle = words.slice(1); // exclude initial "impress."
  const totalCycleTime = wordsToCycle.length * wordDuration; // seconds

  tl.add(() => {
    // recompute coords
    const coords = getCoords();
    const { bx, by, ctax, ctay } = coords;

    // snap highlight to immediate changes
    highlight.style.transition = "none";

    // prepare a swoop path starting at B and ending at CTA center
    const startX = bx;
    const startY = by;

    const swoopPath = [
      { x: startX, y: startY },
      { x: startX - 80, y: startY - 90 },
      { x: startX + 60, y: startY - 120 },
      { x: startX - 30, y: startY - 60 },
      { x: ctax - 120, y: ctay - 30 },
      { x: ctax, y: ctay }
    ];

    // move the mouse along that path during totalCycleTime
    gsap.to(mouse, {
      duration: totalCycleTime,
      ease: "power1.inOut",
      motionPath: {
        path: swoopPath,
        curviness: 1.8,
        autoRotate: false
      }
    });

    // Now drive each word display in sequence. We'll use timeline-style manual scheduling:
    // For each word in wordsToCycle, set it then wait for wordDuration.
    // For the final word, we also trigger the button pop 0.1s after it appears.

    wordsToCycle.forEach((w, idx) => {
      const isLast = idx === wordsToCycle.length - 1;

      // set this word immediately in an atomic call
      // (we use gsap.delayedCall with 0 to ensure it's on the GSAP tick queue)
      gsap.delayedCall(idx * wordDuration, () => {
        changingWord.textContent = w;
        // snap highlight width to new word instantly
        const newW = changingWord.offsetWidth;
        highlight.style.width = newW + "px";
      });

      if (isLast) {
        // schedule the "button pop" 0.1s after the final word appears
        gsap.delayedCall(idx * wordDuration + 0.1, () => {
          // quick click/pop animation (no mouse size change)
          gsap.to(button, { scale: 1.08, duration: 0.09, ease: "power2.out" });
          gsap.to(button, { scale: 1, duration: 0.12, delay: 0.09, ease: "power2.in" });
          gsap.to(button, { backgroundColor: "#ff4081", duration: 0.07 });
          gsap.to(button, { backgroundColor: "#000", duration: 0.14, delay: 0.07 });
        });
      }
    });

    // At the end of the swoop and word cycling, animate highlight exit smoothly.
    gsap.delayedCall(totalCycleTime - 0.05, () => {
      highlight.style.transition = "width 0.3s ease";
      gsap.to(highlight, { width: 0, duration: 0.4, ease: "power2.inOut" });
    });

    // After mouse reaches CTA, we want a 0.8s pause. We'll schedule adding that pause to the main timeline.
    gsap.delayedCall(totalCycleTime + 0.02, () => {
      tl.to({}, { duration: 0.8 });
    });
  });

  // ---- STEP 5: Mouse exits after pause at CTA ----
  tl.add(() => {
    const coords = getCoords();
    const { ctax, ctay } = coords;

    const offPath = [
      { x: ctax, y: ctay },
      { x: ctax + 120, y: ctay - 140 },
      { x: ctax + 420, y: ctay - 360 } // offscreen
    ];

    gsap.to(mouse, {
      duration: 1.05,
      ease: "power2.in",
      motionPath: { path: offPath, curviness: 1.6, autoRotate: false }
    });

    gsap.to(mouse, { opacity: 0, duration: 0.9, delay: 0.15 });
  });

  // start the timeline (it's already built and will play automatically)
});
