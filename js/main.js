// main.js
// Requires GSAP core + TextPlugin + MotionPathPlugin to be loaded on the page
document.addEventListener("DOMContentLoaded", () => {

  // ================================
  // SCROLL SECTION REVEAL (keeps original behavior)
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
  // HEADER SHOW/HIDE ON SCROLL (keeps original behavior)
  // ================================
  const header = document.querySelector(".main-header");
  const hero = document.querySelector(".hero");
  let lastScrollY = window.scrollY;

  const toggleHeader = () => {
    if (!hero) return;
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
  gsap.registerPlugin(TextPlugin, MotionPathPlugin);

  const words = ["impress.", "convert.", "inspire.", "grow.", "lead."];
  const mouse = document.querySelector(".mouse-cursor");
  const button = document.querySelector(".cta-btn");

  // Anchors (must exist in DOM — HTML file provides them)
  const anchorA  = document.getElementById("mouse-point-a");
  const anchorB  = document.getElementById("mouse-point-b");
  const anchorL1 = document.getElementById("mouse-point-l1");
  const anchorL2 = document.getElementById("mouse-point-l2");
  const anchorC  = document.getElementById("mouse-point-c");
  const anchorD  = document.getElementById("mouse-point-d");

  // H1 setup
  const heroH1 = document.querySelector(".hero-text h1");
  const wordContainer = heroH1.querySelector(".word-container");

  // Insert typed-prefix span if not present
  if (!heroH1.querySelector(".typed-prefix")) {
    heroH1.insertAdjacentHTML("afterbegin", '<span class="typed-prefix"></span>');
  }

  // ensure changing-word + highlight exist
  const changingWord = heroH1.querySelector(".changing-word");
  const highlight = heroH1.querySelector(".highlight");
  const typedPrefix = heroH1.querySelector(".typed-prefix");

  // defensive checks
  if (!changingWord || !highlight || !typedPrefix) {
    console.error("Required elements (.changing-word, .highlight, .typed-prefix) missing.");
    return;
  }

  // initial highlight styles (kept from original script)
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
  const centerOf = el => {
    if (!el) return { left: 0, top: 0 };
    const r = el.getBoundingClientRect();
    return {
      left: r.left + window.scrollX + r.width / 2,
      top:  r.top  + window.scrollY + r.height / 2
    };
  };

  // ================================
  // MOUSE INITIAL SETUP
  // ================================
  if (mouse) {
    mouse.style.position = "absolute";
    mouse.style.transform = "none";
    mouse.style.willChange = "left, top";
    mouse.style.opacity = 1;
    mouse.style.left = "0px";
    mouse.style.top  = "0px";
  }

  // place mouse offscreen-left at start (will re-set when movement starts)
  const setMouseStart = () => {
    // fallback center for anchor A if available
    const A = anchorA ? centerOf(anchorA) : { left: -200, top: 200 };
    gsap.set(mouse, { left: A.left - 380, top: A.top - 180, opacity: 1 });
  };
  setMouseStart();

  // ================================
  // MASTER TIMELINE (keeps your word typing & hero fade)
  // ================================
  const tl = gsap.timeline();

  // H1 slide + fade
  gsap.set(heroH1, { x: -28, opacity: 0 });
  tl.to(heroH1, { duration: 0.6, x: 0, opacity: 1, ease: "power2.out" }, 0);

  // Typing animation (keeps original behavior and timing)
  const fullText = "Designs that impress.";
  const prefix   = "Designs that ";
  const perChar  = 0.05;
  const driver = { i: 0 };
  const totalChars = fullText.length;
  const typingDuration = totalChars * perChar;

  tl.to(driver, {
    i: totalChars,
    duration: typingDuration,
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
      // update highlight width to follow the changing word during typing
      highlight.style.width = changingWord.offsetWidth + "px";
    }
  }, 0);

  // The word-cycling behavior (keep the earlier approach for cycling words and CTA pulse)
  // We'll keep the original staged approach but we will *not* rely on anchor positions until the mouse moves.

  // cycle words after the typed prefix finishes
  tl.add(() => {
    // this block cycles words and animates highlight/button as you had before
    const wordsToCycle = words.slice(1); // skip first since typed already shows "impress."
    const wordDuration = 0.9;
    const totalTime = wordsToCycle.length * wordDuration;

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

  }, typingDuration); // add after typing completes

  // ================================
  // MOUSE MOVEMENT: compute anchors at time of run and run a dedicated timeline
  // This is decoupled from the main timeline but scheduled to start after the typing cycle.
  // ================================
  const moveMouseAlongAnchors = () => {
    // measure centers fresh
    const P = {
      A:  centerOf(anchorA),
      B:  centerOf(anchorB),
      L1: centerOf(anchorL1),
      L2: centerOf(anchorL2),
      C:  centerOf(anchorC),
      D:  centerOf(anchorD)
    };

    // set a safe start position relative to A (offscreen-left)
    gsap.set(mouse, { left: (P.A.left || 0) - 380, top: (P.A.top || 200) - 180, opacity: 1 });

    // build a timeline for the mouse (easy to tweak)
    const mouseTL = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // OFFSCREEN → A
    mouseTL.to(mouse, { duration: 1.3, left: P.A.left, top: P.A.top });

    // A → B
    mouseTL.to(mouse, { duration: 0.7, left: P.B.left, top: P.B.top }, "+=0.12");

    // B → L1 → L2 → C (use chained tweens)
    mouseTL.to(mouse, { duration: 0.9, left: P.L1.left, top: P.L1.top });
    mouseTL.to(mouse, { duration: 0.9, left: P.L2.left, top: P.L2.top });
    mouseTL.to(mouse, { duration: 0.85, left: P.C.left, top: P.C.top });

    // small CTA pop animation is already triggered earlier; add slight pause
    mouseTL.to(mouse, { duration: 0.45, left: P.D.left, top: P.D.top }, "+=0.18");

    // exit to the right
    mouseTL.to(mouse, { duration: 0.9, left: window.innerWidth + 300, top: P.D.top }, "+=0.06");

    // return the timeline in case you want to play/pause externally
    return mouseTL;
  };

  // schedule the mouse movement to start once the word-cycling finishes.
  // We'll wait for: typingDuration + words cycle time
  const wordsToCycleDuration = (words.length - 1) * 0.9; // matches earlier wordDuration
  const mouseStartDelay = typingDuration + wordsToCycleDuration + 0.05;

  // To ensure we measure layout after font rendering / highlight sizing etc,
  // run in a requestAnimationFrame after the delay.
  gsap.delayedCall(mouseStartDelay, () => {
    // measure again on the next frame to be extra safe
    requestAnimationFrame(() => {
      moveMouseAlongAnchors();
    });
  });

  // OPTIONAL: expose a small function to re-run the mouse sequence for debugging
  window.__playMouseDemo = () => {
    requestAnimationFrame(() => moveMouseAlongAnchors());
  };

});
