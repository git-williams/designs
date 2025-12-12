// Requires GSAP core + TextPlugin to be loaded on the page (MotionPathPlugin removed from mouse usage)
document.addEventListener("DOMContentLoaded", () => {

  // ================================
  // SCROLL SECTION REVEAL
  // ================================
  const sections = document.querySelectorAll(".wrapper2");
  const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85;
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top < triggerBottom) section.classList.add("visible2");
    });
  };
  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();

  // ================================
  // HEADER SHOW/HIDE ON SCROLL
  // ================================
  const header = document.querySelector(".main-header");
  const hero = document.querySelector(".hero");
  let lastScrollY = window.scrollY;

  const toggleHeader = () => {
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    const currentScroll = window.scrollY;

    if (currentScroll > heroBottom) {
      if (currentScroll < lastScrollY) header.classList.add("visible");
      else header.classList.add("hidden"), header.classList.remove("visible");
    } else {
      header.classList.add("visible"), header.classList.remove("hidden");
    }

    lastScrollY = currentScroll;
  };
  window.addEventListener("scroll", toggleHeader);
  toggleHeader();

  // ================================
  // HERO ANIMATION SETUP
  // ================================
  // keep TextPlugin in case other parts of the site use it
  gsap.registerPlugin(TextPlugin);

  const words = ["impress.", "convert.", "inspire.", "grow.", "lead."];
  const button = document.querySelector(".cta-btn");

  // H1 setup
  const heroH1 = document.querySelector(".hero-text h1");
  const wordContainer = heroH1.querySelector(".word-container");

  heroH1.insertAdjacentHTML("afterbegin", '<span class="typed-prefix"></span>');
  wordContainer.innerHTML = `<span class="changing-word"></span><span class="highlight"></span>`;

  const typedPrefix = heroH1.querySelector(".typed-prefix");
  const changingWord = heroH1.querySelector(".changing-word");
  const highlight = heroH1.querySelector(".highlight");

  highlight.style.position = "absolute";
  highlight.style.left = "0";
  highlight.style.bottom = "0";
  highlight.style.height = "1.2em";
  highlight.style.zIndex = "-1";
  highlight.style.width = "0px";
  highlight.style.background = "rgba(100,150,255,0.5)";

  // ================================
  // UTILITY: GET ABSOLUTE CENTER COORDS
  // ================================
  const center = el => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      left: r.left + window.scrollX + r.width / 2,
      top:  r.top  + window.scrollY + r.height / 2
    };
  };

  // ================================
  // REPLACEMENT MOUSE CURSOR (simple, robust)
  // - This replaces all previous GSAP mouse/anchor behavior.
  // - It will try to use the anchor elements if present:
  //     mouse-point-a, mouse-point-b, mouse-point-l1, mouse-point-l2, mouse-point-c, mouse-point-d
  //   and will gracefully no-op if an anchor is missing.
  // - Cursor is appended to document.body and positioned using page coordinates
  // ================================
  // Create cursor element if it doesn't exist
  let cursor = document.querySelector(".simple-mouse-cursor");
  if (!cursor) {
    cursor = document.createElement("div");
    cursor.className = "simple-mouse-cursor";
    // basic styles (you can override in site CSS)
    cursor.style.width = "25px";
    cursor.style.height = "25px";
    cursor.style.background = "black";
    cursor.style.borderRadius = "4px";
    cursor.style.position = "absolute";    // position relative to page
    cursor.style.transform = "translate(-50%, -50%)";
    cursor.style.willChange = "transform, opacity";
    cursor.style.opacity = "1";
    cursor.style.pointerEvents = "none";
    document.body.appendChild(cursor);
  }

  // helper to move cursor to page coordinates (using CSS transition)
  const moveCursorTo = (targetEl, durationSec = 0.5) => {
    return new Promise(resolve => {
      if (!targetEl) return resolve(); // nothing to move to

      const pos = center(targetEl);
      if (!pos) return resolve();

      // set transition for this movement
      cursor.style.transition = `transform ${durationSec}s ease`;
      // set transform to page coords (translate centers the element)
      // NOTE: translate expects pixel values; construct translate(xpx, ypx)
      cursor.style.transform = `translate(${pos.left}px, ${pos.top}px) translate(-50%, -50%)`;

      // resolve after duration (plus tiny buffer)
      setTimeout(resolve, Math.max(50, durationSec * 1000 + 30));
    });
  };

  // helper to move cursor offscreen to the right (exit)
  const moveCursorOffscreen = (durationSec = 0.45) => {
    return new Promise(resolve => {
      const exitX = window.innerWidth + 300;
      // keep vertical center where it is (read current top from transform)
      // reading exact transform values is messy; we'll just keep top same as last computed using getBoundingClientRect of cursor
      const rect = cursor.getBoundingClientRect();
      const top = rect.top + window.scrollY + rect.height / 2;

      cursor.style.transition = `transform ${durationSec}s ease`;
      cursor.style.transform = `translate(${exitX}px, ${top}px) translate(-50%, -50%)`;

      setTimeout(resolve, Math.max(50, durationSec * 1000 + 30));
    });
  };

  // ================================
  // MASTER TIMELINE (keeps all original timing / text behavior)
  // but we replace the GSAP mouse movement steps with calls to the simple cursor above
  // ================================
  const tl = gsap.timeline();

  // H1 slide + fade
  gsap.set(heroH1, { x: -28, opacity: 0 });
  tl.to(heroH1, { duration: 0.6, x: 0, opacity: 1, ease: "power2.out" }, 0);

  // Typing animation
  const fullText = "Designs that impress.";
  const prefix   = "Designs that ";
  const perChar  = 0.05;
  const driver = { i: 0 };
  const totalChars = fullText.length;

  tl.to(driver, {
    i: totalChars,
    duration: totalChars * perChar,
    ease: "none",
    onUpdate: () => {
      const idx = Math.floor(driver.i);
      if (idx <= prefix.length) {
        typedPrefix.textContent = fullText.slice(0, idx);
        changingWord.textContent = "";
      } else {
        typedPrefix.textContent = prefix;
        changingWord.textContent = fullText.slice(prefix.length, idx);
      }
    }
  }, 0);

  // --------------------
  // STEP 1: START → A
  // --------------------
  // (originally moved mouse here via GSAP; now call our moveCursorTo at this point in the timeline)
  tl.add(() => {
    const A = document.getElementById("mouse-point-a") || document.getElementById("A");
    // original GSAP used duration 1.5 for this movement
    moveCursorTo(A, 1.5).catch(() => {});
  });
  // preserve the original short gap
  tl.to({}, { duration: 0.4 });

  // --------------------
  // STEP 2: A → B
  // --------------------
  tl.add(() => {
    const B = document.getElementById("mouse-point-b") || document.getElementById("B");
    const t = 0.5;
    const targetWidth = changingWord.offsetWidth + "px";

    moveCursorTo(B, t).catch(() => {});
    // keep highlight animation exactly as original
    gsap.to(highlight, { duration: t, width: targetWidth, ease: "power2.inOut" });
  });
  tl.to({}, { duration: 0.4 });

  // --------------------
  // STEP 3: B → L1 → L2 → C
  // --------------------
  tl.add(() => {
    const L1 = document.getElementById("mouse-point-l1") || document.getElementById("L1");
    const L2 = document.getElementById("mouse-point-l2") || document.getElementById("L2");
    const C  = document.getElementById("mouse-point-c")  || document.getElementById("C");

    const wordsToCycle = words.slice(1); // keep existing word cycling logic
    const wordDuration = 0.9;
    const totalTime = wordsToCycle.length * wordDuration;

    // Chain cursor moves with timed setTimeouts to match the word cycling timing:
    // move to L1, then after wordDuration -> L2, then after 2*wordDuration -> C
    if (L1) moveCursorTo(L1, wordDuration).catch(() => {});
    if (L2) setTimeout(() => moveCursorTo(L2, wordDuration).catch(() => {}), wordDuration * 1000);
    if (C)  setTimeout(() => moveCursorTo(C,  wordDuration).catch(() => {}), wordDuration * 1000 * 2);

    // Keep existing word cycling and button micro animations
    wordsToCycle.forEach((w, idx) => {
      const isLast = idx === wordsToCycle.length - 1;
      gsap.delayedCall(idx * wordDuration, () => {
        changingWord.textContent = w;
        highlight.style.width = changingWord.offsetWidth + "px";
      });
      if (isLast) {
        gsap.delayedCall(idx * wordDuration + 0.1, () => {
          gsap.to(button, { scale: 1.08, duration: 0.09 });
          gsap.to(button, { scale: 1.0, duration: 0.12, delay: 0.09 });
          gsap.to(button, { backgroundColor: "#ff4081", duration: 0.07 });
          gsap.to(button, { backgroundColor: "#000", duration: 0.14, delay: 0.07 });
        });
      }
    });

    gsap.delayedCall(totalTime - 0.05, () => gsap.to(highlight, { width: 0, duration: 0.4 }));
    // keep the original extra pause after this block
    gsap.delayedCall(totalTime, () => tl.to({}, { duration: 0.8 }));
  });

  // --------------------
  // STEP 4: C → D exit
  // --------------------
  tl.add(() => {
    const D = document.getElementById("mouse-point-d") || document.getElementById("D");
    // original exit used keyframes: first 0.6s to D, then 0.45s to offscreen
    const firstDuration = 0.6;
    const secondDuration = 0.45;

    if (D) {
      moveCursorTo(D, firstDuration).catch(() => {});
      // wait firstDuration then move offscreen
      setTimeout(() => {
        moveCursorOffscreen(secondDuration).catch(() => {});
      }, firstDuration * 1000);
    } else {
      // if D missing, still try to move offscreen gently
      moveCursorOffscreen(firstDuration + secondDuration).catch(() => {});
    }
  });

  // (end of DOMContentLoaded)
});
