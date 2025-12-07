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
  const anchorC = document.getElementById("mouse-point-c"); // this is the CTA anchor in your markup
  // anchorD might not exist in DOM; we'll compute offscreen D dynamically

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

  // compute key coordinates: A,B,C and CTA centered in document coords
  const getCoords = () => {
    const wordContainerRect = heroH1.querySelector(".word-container").getBoundingClientRect();
    const wordRect = changingWord.getBoundingClientRect();
    const btnRect = button.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // anchor elements (they are positioned relative to their parents)
    const aRect = anchorA.getBoundingClientRect();
    const bRect = anchorB.getBoundingClientRect();
    const cRect = anchorC.getBoundingClientRect();

    const ax = aRect.left + scrollX + aRect.width / 2;
    const ay = aRect.top + scrollY + aRect.height / 2;

    const bx = bRect.left + scrollX + bRect.width / 2;
    const by = bRect.top + scrollY + bRect.height / 2;

    const cx = cRect.left + scrollX + cRect.width / 2;
    const cy = cRect.top + scrollY + cRect.height / 2;

    return {
      ax,
      ay,
      bx,
      by,
      cx,
      cy,
      wordRect,
      btnRect
    };
  };

  // ensure mouse is positioned offscreen-left initially (relative to the document)
  const setMouseStart = () => {
    const coords = getCoords();
    // if anchors not yet placed in DOM or zero-size, fallback to some reasonable values
    const startX = (coords.ax || window.innerWidth * 0.2) - 360; // well offscreen left
    const startY = (coords.ay || window.innerHeight / 2) - 120;
    // IMPORTANT: keep opacity = 1 (no fades). Place offscreen so it isn't visible initially.
    gsap.set(mouse, { x: startX, y: startY, opacity: 1 });
  };

  // run initial set
  setMouseStart();

  // prepare H1 entrance: quick slide+fade-in from left (finishes quickly before typing completes)
  // set initial transform for heroH1 so it slides in
  gsap.set(heroH1, { x: -28, opacity: 0 });

  // create master timeline
  const tl = gsap.timeline();

  // ---- H1 entrance (quick slide+fade) ----
  // We run this at the very start of the master timeline; it finishes quickly (0.6s)
  tl.to(heroH1, {
    duration: 0.6, // quick entrance (option 1: A - finish before typing completes)
    x: 0,
    opacity: 1,
    ease: "power2.out"
  }, 0); // start at time 0

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
  }, 0); // start typing at time 0 as well (runs in parallel with H1 entrance)

  // After typing: WAIT 1.5s but mouse should be entering during that 1.5s and landing at A
  const enterDuration = 1.5; // seconds

  // compute a motion path from offscreen start to anchor A (we'll compute path using getCoords)
  tl.add(() => {
    // recompute coords (layout settled)
    const coords = getCoords();
    const { ax, ay } = coords;

    // build approach path: start a bit left & up from A then sweep down onto A
    const startX = (ax || window.innerWidth * 0.3) - 360; // firmly offscreen left
    const startY = (ay || window.innerHeight / 2) - 120;

    // use MotionPathPlugin to curve into A
    gsap.to(mouse, {
      duration: enterDuration,
      ease: "power2.inOut",
      motionPath: {
        path: [
          { x: startX, y: startY },
          { x: ax - 240, y: ay - 120 },
          { x: ax - 120, y: ay - 40 },
          { x: ax - 20, y: ay - 10 },
          { x: ax, y: ay }
        ],
        curviness: 2.2,
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

  // ---- STEP 4: Word cycling while mouse swoops to CTA (B -> C dramatic looping) ----
  // Word durations (how long each word sits). We'll use 0.9s per word so each reads comfortably.
  const wordDuration = 0.9; // seconds
  const wordsToCycle = words.slice(1); // exclude initial "impress."
  const totalCycleTime = wordsToCycle.length * wordDuration; // seconds

  tl.add(() => {
    // recompute coords
    const coords = getCoords();
    const { bx, by, cx, cy } = coords;

    // snap highlight to immediate changes
    highlight.style.transition = "none";

    // prepare a dramatic swoop/loop path starting at B and ending at C
    const startX = bx;
    const startY = by;

    // More dramatic/longer path points so swoop and looping are visible.
    // Duration here = totalCycleTime so mouse travels while words cycle, landing at C as final word "lead." appears.
    const swoopPath = [
      { x: startX, y: startY },
      { x: startX - 120, y: startY - 140 }, // big upward left loop
      { x: startX + 80, y: startY - 220 },  // top of loop
      { x: startX + 220, y: startY - 120 }, // come down on the right
      { x: cx - 160, y: cy - 80 },
      { x: cx - 40, y: cy - 20 },
      { x: cx, y: cy }
    ];

    gsap.to(mouse, {
      duration: totalCycleTime,
      ease: "power1.inOut",
      motionPath: {
        path: swoopPath,
        curviness: 2.6,
        autoRotate: false
      }
    });

    // Now drive each word display in sequence. We'll use timeline-style manual scheduling:
    wordsToCycle.forEach((w, idx) => {
      const isLast = idx === wordsToCycle.length - 1;

      gsap.delayedCall(idx * wordDuration, () => {
        changingWord.textContent = w;
        // snap highlight width to new word instantly (recompute width)
        const newW = changingWord.offsetWidth;
        highlight.style.width = newW + "px";
      });

      if (isLast) {
        // schedule the "button pop" 0.1s after the final word (landing at C)
        gsap.delayedCall(idx * wordDuration + 0.1, () => {
          // quick click/pop animation
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

    // After mouse reaches CTA (C), add a short pause (we'll queue it on the main timeline)
    // We'll schedule a tiny delayedCall to insert that pause into the main timeline:
    gsap.delayedCall(totalCycleTime + 0.02, () => {
      tl.to({}, { duration: 0.8 }); // pause at C before exiting to D
    });
  });

  // ---- STEP 5: Mouse exits after pause at CTA (C -> D offscreen right) ----
  tl.add(() => {
    const coords = getCoords();
    const { cx, cy } = coords;

    // compute D offscreen-right coords
    const offscreenRightX = window.scrollX + window.innerWidth + 420;
    const offscreenRightY = cy - 360;

    const offPath = [
      { x: cx, y: cy },
      { x: cx + 120, y: cy - 140 },
      { x: cx + 320, y: cy - 260 },
      { x: offscreenRightX, y: offscreenRightY } // offscreen
    ];

    gsap.to(mouse, {
      duration: 1.05,
      ease: "power2.in",
      motionPath: { path: offPath, curviness: 1.8, autoRotate: false }
    });

    // keep opacity 1 — no fade out
    // Mouse will simply be outside viewport after the motion path ends.
  });

  // start the timeline (it's already built and will play automatically)
});
