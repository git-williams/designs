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
