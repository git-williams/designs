// ================================
// CORE PAGE LOGIC (UNCHANGED)
// ================================
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
  // HERO TEXT ANIMATION (TYPING)
  // ================================
  gsap.registerPlugin(TextPlugin);

  const button = document.querySelector(".cta-btn");

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
  highlight.style.transition = "width 0.25s ease, height 0.25s ease";

  const tl = gsap.timeline();

  // Slide/fade intro
  gsap.set(heroH1, { x: -28, opacity: 0 });
  tl.to(heroH1, { duration: 0.6, x: 0, opacity: 1, ease: "power2.out" }, 0);

  // Typing effect
  const fullText = "Designs that impress.";
  const prefix = "Designs that ";
  const perChar = 0.05;
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

  // ==========================================================
  // NEW HIGHLIGHT + WORD CYCLE (Starts after typing completes)
  // ==========================================================
  tl.add(() => {
    startHighlightCycle();
  }, ">"); // runs immediately after typing finishes

}); // END DOMContentLoaded



// ==========================================================
// HIGHLIGHT BEHAVIOR FUNCTION
// ==========================================================
function startHighlightCycle() {

  const changingWord = document.querySelector(".changing-word");
  const highlight = document.querySelector(".highlight");

  const cycleWords = ["inspire.", "grow.", "convert.", "lead."]; // 4 changes
  const timings = {
    delayBeforeHighlightIn: 500,
    delayBetweenWordChanges: 400,
    delayAfterLastWord: 600,
    slideDuration: 300
  };

  // Helper to instantly resize highlight to match text width
  function syncHighlightToWord() {
    highlight.style.transition = "none"; // instant
    highlight.style.width = changingWord.offsetWidth + "px";
    void highlight.offsetWidth; // force reflow to apply non-animated width
    highlight.style.transition = "width 0.25s ease, height 0.25s ease";
  }

  async function run() {

    // Delay after typing finishes
    await wait(timings.delayBeforeHighlightIn);

    // --- Step 1: Slide highlight IN ---
    const targetWidth = changingWord.offsetWidth + "px";
    highlight.style.width = targetWidth;
    highlight.style.height = "1.2em";

    // slide in = animate height (slide upward)
    highlight.style.height = "1.2em";

    await wait(timings.slideDuration);

    // --- Step 2: Word cycle (abrupt swaps) ---
    for (let i = 0; i < cycleWords.length; i++) {
      await wait(timings.delayBetweenWordChanges);

      changingWord.textContent = cycleWords[i];
      syncHighlightToWord(); // instantly resize highlight
    }

    // --- Step 3: Delay before slide out ---
    await wait(timings.delayAfterLastWord);

    // --- Step 4: Slide highlight OUT ---
    highlight.style.height = "0px";
    highlight.style.width = "0px";

    await wait(timings.slideDuration);
  }

  run();
}



// ==========================================================
// Utility
// ==========================================================
function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}



// ==========================================================
// CURSOR PATH ANIMATION (GSAP, STABLE)
// ==========================================================
window.addEventListener("load", () => {
  const cursor = document.getElementById("cursor");
  const wrapper = document.querySelector(".points-wrapper");

  if (!cursor || !wrapper || typeof gsap === "undefined") return;

  gsap.registerPlugin(MotionPathPlugin);

  // ------------------------------------------
  // ROUTE CONFIG
  // ------------------------------------------
  const route = [
    {
      id: "A",
      pause: 2000
    },
    {
      id: "B",
      duration: 3,
      pause: 600,
      curve: [
        { x: -60, y: -40 },
        { x: -30, y: 0 }
      ]
    },
    {
      id: "C",
      duration: 2,
      pause: 500,
      curve: [
        { x: 40, y: 60 },
        { x: 20, y: 20 }
      ]
    },
    {
      id: "D",
      duration: 1.5
    }
  ];

  // ------------------------------------------
  // HELPERS
  // ------------------------------------------
  function getLocalPosition(el) {
    const wrapperRect = wrapper.getBoundingClientRect();
    const rect = el.getBoundingClientRect();

    return {
      x: rect.left - wrapperRect.left + rect.width / 2,
      y: rect.top - wrapperRect.top + rect.height / 2
    };
  }

  // ------------------------------------------
  // MAIN ANIMATION
  // ------------------------------------------
  function runCursorPath() {
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" }
    });

    route.forEach((step, index) => {
      const point = document.getElementById(step.id);
      if (!point) return;

      const { x, y } = getLocalPosition(point);

      // First point: snap instantly
      if (index === 0) {
        tl.set(cursor, { x, y });
      } else {
        if (step.curve) {
          // Curved motion (relative to target)
          const path = step.curve.map(p => ({
            x: x + p.x,
            y: y + p.y
          }));

          // Ensure final point is exact
          path.push({ x, y });

          tl.to(cursor, {
            duration: step.duration || 1,
            motionPath: {
              path,
              curviness: 1.25
            }
          });
        } else {
          // Straight motion
          tl.to(cursor, {
            duration: step.duration || 1,
            x,
            y
          });
        }
      }

      // Pause at point
      if (step.pause) {
        tl.to({}, { duration: step.pause / 1000 });
      }
    });
  }

  runCursorPath();
});

