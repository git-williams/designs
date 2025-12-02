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
  // Register the GSAP plugins we use
  gsap.registerPlugin(TextPlugin, MotionPathPlugin);

  const words = ["impress.", "convert.", "inspire.", "grow.", "lead."];
  const mouse = document.querySelector(".mouse-cursor");
  const button = document.querySelector(".cta-btn");

  // Grab the H1 inside .hero-text and replace its content immediately
  const heroH1 = document.querySelector(".hero-text h1");

  // Build controlled structure for typing + highlight (keeps existing CSS intact)
  heroH1.innerHTML =
    '<span class="typed-prefix"></span>' +
    '<span class="word-container" style="position:relative; display:inline-block;">' +
    '<span class="changing-word"></span>' +
    '<span class="highlight"></span>' +
    "</span>";

  const typedPrefix = heroH1.querySelector(".typed-prefix");
  const changingWord = heroH1.querySelector(".changing-word");
  const highlight = heroH1.querySelector(".highlight");

  // Ensure highlight initial CSS doesn't animate between width changes (we will control entrance/exit with GSAP)
  highlight.style.transition = "none";
  highlight.style.position = "absolute";
  highlight.style.left = "0";
  highlight.style.bottom = "0";
  highlight.style.height = "1.2em";
  highlight.style.zIndex = "-1";
  highlight.style.width = "0px";
  highlight.style.background = "rgba(100, 150, 255, 0.5)";

  // Typing config
  const fullText = "Designs that impress.";
  const prefix = "Designs that ";
  const perChar = 0.05; // seconds per character — tweak if you want faster/slower

  // Main timeline
  const tl = gsap.timeline();

  // ---- STEP 1: Typing (first thing to run) ----
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

  // Pause briefly after typing so the sentence sits before the mouse enters and highlight starts
  const postTypingHold = 0.5; // seconds
  tl.to({}, { duration: postTypingHold }); // simple delay

  // Compute key coordinates for A (left of word), B (right of word), C (button center).
  // We will compute them when needed (after layout), but decide to measure now:
  const getCoords = () => {
    const wordRect = changingWord.getBoundingClientRect();
    const btnRect = button.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();

    // Use viewport coords; GSAP x/y will place the mouse transform relative to initial transform.
    // We'll position mouse center to these coordinates.
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Point A: left edge of changingWord (vertically center on the word's midline)
    const ax = wordRect.left + scrollX; // left side
    const ay = wordRect.top + scrollY + wordRect.height / 2;

    // Point B: right edge of changingWord
    const bx = wordRect.left + scrollX + wordRect.width;
    const by = ay;

    // Point C: center of CTA button
    const cx = btnRect.left + scrollX + btnRect.width / 2;
    const cy = btnRect.top + scrollY + btnRect.height / 2;

    return { ax, ay, bx, by, cx, cy, wordRect };
  };

  // Ensure mouse starts off-screen left and invisible
  // We'll set its initial transform position based on viewport (so GSAP tweens move in absolute pixels)
  const initMousePos = () => {
    const coords = getCoords();
    // start off-screen left, slightly above the word center for a nice arc
    const startX = coords.ax - 300; // well off to the left
    const startY = coords.ay - 120;
    gsap.set(mouse, { x: startX, y: startY, opacity: 0 });
  };

  // init positions now (typing may take a bit, but this gives starting spot)
  initMousePos();

  // ---- STEP 2: Mouse arc into Point A ----
  // We'll create a short curved path into ax,ay.
  tl.add(() => {
    // in case layout changed during typing, recompute coords
    const coords = getCoords();
    initMousePos(); // ensure starting position consistent
    const { ax, ay } = coords;

    // show mouse while moving
    // Motion path: small downward arc landing on point A
    gsap.to(mouse, {
      duration: 0.95,
      opacity: 1,
      ease: "power2.out"
    });

    // curved approach using MotionPathPlugin
    gsap.to(mouse, {
      duration: 0.95,
      ease: "power2.inOut",
      motionPath: {
        path: [
          { x: coords.ax - 260, y: coords.ay - 120 }, // start curve control
          { x: coords.ax - 120, y: coords.ay - 30 }, // mid
          { x: ax, y: ay } // land at A
        ],
        curviness: 1.6,
        autoRotate: false
      }
    });
  });

  // Pause at A for 0.2s
  const pauseA = 0.2;
  tl.to({}, { duration: pauseA });

  // ---- STEP 3: From A -> B: Straight line; highlight expands simultaneously ----
  // We'll compute the full width needed to cover the (current) word and animate highlight in same time as mouse moves.
  tl.add(() => {
    const coords = getCoords();
    const { ax, ay, bx, by, wordRect } = coords;

    // Start highlight at 0 width (left aligned)
    highlight.style.width = "0px";
    highlight.style.transition = "none";

    // Expose target width — the highlight should grow to the width of the changingWord
    const targetWidth = wordRect.width + "px";

    const tAB = 0.6; // seconds to move from A to B (straight)
    // Move mouse in a straight line to B
    gsap.to(mouse, {
      duration: tAB,
      x: bx,
      y: by,
      ease: "power2.inOut"
    });

    // Simultaneously animate highlight width so it looks like the mouse drags it
    gsap.to(highlight, { duration: tAB, width: targetWidth, ease: "power2.inOut" });
  });

  // Pause at B for 0.2s
  const pauseB = 0.2;
  tl.to({}, { duration: pauseB });

  // ---- STEP 4: Word cycling while mouse swoops toward C ----
  // We'll drive word changes with a timeline-driven driver tween so it syncs with the mouse swoop.
  // Config:
  const cycleInterval = 300; // ms per word change
  const cycleCount = words.length - 1; // number of changes (we already showed index 0)
  const totalCycleTime = (cycleCount * cycleInterval) / 1000; // convert to seconds

  tl.add(() => {
    // recompute coords in case responsive layout changes
    const coords = getCoords();
    const { bx, by, cx, cy } = coords;

    // Ensure highlight snaps instantly while cycling
    highlight.style.transition = "none";

    // driver controls progress from 0 -> 1 across totalCycleTime
    const driverCycle = { t: 0 };
    let lastIndex = 0; // current index in words array (0 is initial)

    // Mouse swoop path: a few bezier control points to create smooth loops, ending at Point C
    // We'll make the path start from current mouse position (approximately B), loop, then head to C.
    const startX = bx;
    const startY = by;

    // Build an array of path points to simulate swoops. These are relative to document coords.
    const swoopPath = [
      { x: startX, y: startY },
      { x: startX - 80, y: startY - 90 }, // up-left arch
      { x: startX + 60, y: startY - 130 }, // up-right swoop
      { x: startX - 30, y: startY - 60 }, // small loop
      { x: cx - 120, y: cy - 30 }, // approach C
      { x: cx, y: cy } // land at C
    ];

    // Start the mouse swoop that lasts exactly totalCycleTime (so words change while it moves)
    gsap.to(mouse, {
      duration: totalCycleTime,
      ease: "power1.inOut",
      motionPath: {
        path: swoopPath,
        curviness: 1.8,
        autoRotate: false
      }
    });

    // driver tween controls the words — same duration as mouse swoop
    gsap.to(driverCycle, {
      t: 1,
      duration: totalCycleTime,
      ease: "none",
      onUpdate: () => {
        // compute how many ms have "elapsed"
        const elapsedMs = driverCycle.t * totalCycleTime * 1000;
        // index increments each cycleInterval
        let index = 1 + Math.floor(elapsedMs / cycleInterval);
        if (index > words.length - 1) index = words.length - 1;
        if (index !== lastIndex) {
          lastIndex = index;
          changingWord.textContent = words[index];
          // snap highlight width instantly to match the new word
          const newW = changingWord.offsetWidth;
          highlight.style.width = newW + "px";
        }
      },
      onComplete: () => {
        // at the very end of cycling, the final word is already set
        // animate highlight exit smoothly shortly after (we'll time the button pop with a small offset)
        highlight.style.transition = "width 0.3s ease";
        gsap.to(highlight, { width: 0, duration: 0.4, ease: "power2.inOut" });
      }
    });

    // Important: schedule the button "pop" to happen 0.1s AFTER the final word appears.
    // Since driverCycle duration = totalCycleTime, we set a delayed call:
    const popDelay = totalCycleTime + 0.1; // seconds from now
    gsap.delayedCall(popDelay, () => {
      // The mouse should be arriving at Point C around this same time.
      // Button pop: quick scale change + color flash (user requested no mouse size change)
      gsap.to(button, { scale: 1.08, duration: 0.09, ease: "power2.out" });
      gsap.to(button, { scale: 1, duration: 0.12, delay: 0.09, ease: "power2.in" });
      // background flash (temporary)
      gsap.to(button, { backgroundColor: "#ff4081", duration: 0.07 });
      gsap.to(button, { backgroundColor: "#000", duration: 0.14, delay: 0.07 });
    });

    // After the swoop finishes, mouse should pause at C for 0.8s before exiting.
    // We'll schedule a small timeline-based delay (using a delayedCall).
    gsap.delayedCall(totalCycleTime + 0.01, () => {
      // small pause achieved in the main TL by adding an empty tween of 0.8s
      // but because we're inside an add callback, we'll push a blank tween onto the main timeline:
      tl.to({}, { duration: 0.8 });
    });
  });

  // ---- STEP 5: Mouse exits after pause at C (arc off-screen) ----
  // After the previous paused 0.8s (scheduled inside onComplete), we now fly the mouse off-screen.
  // We'll append these tweens to tl so they run after the pause inserted above.
  tl.add(() => {
    const coords = getCoords();
    const { cx, cy } = coords;

    // create an upward-right arc offscreen
    const offPath = [
      { x: cx, y: cy },
      { x: cx + 120, y: cy - 140 },
      { x: cx + 420, y: cy - 360 } // offscreen
    ];

    gsap.to(mouse, {
      duration: 1.05,
      ease: "power2.in",
      motionPath: { path: offPath, curviness: 1.6, autoRotate: false }
    });

    // fade out as it leaves
    gsap.to(mouse, { opacity: 0, duration: 0.9, delay: 0.15 });
  });

  // End of timeline - nothing else appended.
});
