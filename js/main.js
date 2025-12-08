// Requires GSAP core + TextPlugin + MotionPathPlugin to be loaded on the page
document.addEventListener("DOMContentLoaded", () => {

  // ================================
  // SCROLL SECTION REVEAL (unchanged)
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
  // HEADER SHOW/HIDE ON SCROLL (unchanged)
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
  gsap.registerPlugin(TextPlugin, MotionPathPlugin);

  const words = ["impress.", "convert.", "inspire.", "grow.", "lead."];
  const mouse = document.querySelector(".mouse-cursor");
  const button = document.querySelector(".cta-btn");

  // NEW ANCHORS
  const anchorA  = document.getElementById("mouse-point-a");
  const anchorB  = document.getElementById("mouse-point-b");
  const anchorL1 = document.getElementById("mouse-point-l1");
  const anchorL2 = document.getElementById("mouse-point-l2");
  const anchorC  = document.getElementById("mouse-point-c");
  const anchorD  = document.getElementById("mouse-point-d");

  // Grab H1 + word-container
  const heroH1 = document.querySelector(".hero-text h1");
  const wordContainer = heroH1.querySelector(".word-container");

  // Insert typed prefix BEFORE the existing word container
  heroH1.insertAdjacentHTML("afterbegin", '<span class="typed-prefix"></span>');

  // Replace ONLY inner content of the word-container (safe)
  wordContainer.innerHTML = `
    <span class="changing-word"></span>
    <span class="highlight"></span>
  `;

  const typedPrefix = heroH1.querySelector(".typed-prefix");
  const changingWord = heroH1.querySelector(".changing-word");
  const highlight = heroH1.querySelector(".highlight");

  // highlight base position
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
    const r = el.getBoundingClientRect();
    return {
      left: r.left + window.scrollX + r.width / 2,
      top:  r.top  + window.scrollY + r.height / 2
    };
  };

  // Ensure the mouse element is positioned in document coordinate space
  // (so left/top assignments line up with center(...) values).
  // This is done in JS so you don't have to edit CSS — but you can also add similar CSS if you prefer.
  if (mouse) {
    mouse.style.position = mouse.style.position || "absolute";
    mouse.style.transform = "none";
    mouse.style.willChange = "left, top";
    // ensure it has an explicit left/top so GSAP animates them cleanly
    mouse.style.left = mouse.style.left || "0px";
    mouse.style.top  = mouse.style.top  || "0px";
  }


  // ================================
  // SET INITIAL MOUSE POSITION (offscreen left)
  // ================================
  const setMouseStart = () => {
    const A = center(anchorA);
    gsap.set(mouse, {
      left: A.left - 380,
      top:  A.top - 180,
      opacity: 1
    });
  };

  setMouseStart();


  // ================================
  // MASTER TIMELINE
  // ================================
  const tl = gsap.timeline();

  // ========== H1 SLIDE + FADE ==========
  gsap.set(heroH1, { x: -28, opacity: 0 });
  tl.to(heroH1, {
    duration: 0.6,
    x: 0,
    opacity: 1,
    ease: "power2.out"
  }, 0);


  // ========== TYPING ANIMATION (unchanged) ==========
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


  // ================================
  // STEP 1: START → A (LINEAR)
  // ================================
  tl.add(() => {
    const A = center(anchorA);

    // animate left/top directly so it matches document coords
    gsap.to(mouse, {
      duration: 1.5,
      ease: "power2.inOut",
      left: A.left,
      top:  A.top
    });
  });

  tl.to({}, { duration: 0.4 }); // pause at A


  // ================================
  // STEP 2: A → B (LINEAR)
  // ================================
  tl.add(() => {
    const B = center(anchorB);

    const t = 0.5;
    const targetWidth = changingWord.offsetWidth + "px";

    gsap.to(mouse, {
      duration: t,
      ease: "power2.inOut",
      left: B.left,
      top:  B.top
    });

    gsap.to(highlight, {
      duration: t,
      width: targetWidth,
      ease: "power2.inOut"
    });
  });

  tl.to({}, { duration: 0.4 }); // pause at B


  // ================================
  // STEP 3: B → L1 → L2 → C (LINEAR)
  // ================================
  tl.add(() => {
    const B  = center(anchorB);
    const L1 = center(anchorL1);
    const L2 = center(anchorL2);
    const C  = center(anchorC);

    const wordsToCycle = words.slice(1); // ["convert.","inspire.","grow.","lead."]
    const wordDuration = 0.9;
    const totalCycleTime = wordsToCycle.length * wordDuration;

    // Move through the intermediate anchors in linear segments using keyframes.
    // Start from current mouse position (left/top), then go to L1, L2, C.
    // We approximate the initial segment duration to wordDuration as well so timing aligns.
    gsap.to(mouse, {
      duration: totalCycleTime,
      ease: "linear",
      keyframes: [
        { left: L1.left, top: L1.top, duration: wordDuration },
        { left: L2.left, top: L2.top, duration: wordDuration },
        { left: C.left,  top: C.top,  duration: wordDuration }
      ]
    });

    // ---- EXISTING WORD CYCLING LOGIC (unchanged) ----
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
          gsap.to(button, { backgroundColor: "#000",     duration: 0.14, delay: 0.07 });
        });
      }
    });

    gsap.delayedCall(totalCycleTime - 0.05, () => {
      gsap.to(highlight, { width: 0, duration: 0.4 });
    });

    // After the cycle finishes, pause at C (we preserve your previous pause)
    gsap.delayedCall(totalCycleTime, () => {
      tl.to({}, { duration: 0.8 }); // pause at C
    });
  });


  // ================================
  // STEP 4: C → D → exit right (LINEAR)
  // ================================
  tl.add(() => {
    const D = center(anchorD);
    const exitX = window.innerWidth + 300;

    gsap.to(mouse, {
      duration: 1.05,
      ease: "power2.inOut",
      keyframes: [
        { left: D.left, top: D.top, duration: 0.6 },
        { left: exitX,  top: D.top, duration: 0.45 }
      ]
    });
  });

});
