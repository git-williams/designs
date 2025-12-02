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
  gsap.registerPlugin(TextPlugin);

  const words = ["impress.", "convert.", "inspire.", "grow.", "lead."];
  const mouse = document.querySelector(".mouse-cursor");
  const button = document.querySelector(".cta-btn");

  // Grab the H1 inside .hero-text and replace its content immediately
  const heroH1 = document.querySelector(".hero-text h1");

  // Build controlled structure for typing + highlight
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
  // width stays 0 until we animate it
  highlight.style.width = "0px";
  // keep the same background as your CSS (in case CSS didn't load yet)
  // (If your CSS already sets it, this line is harmless.)
  highlight.style.background = "rgba(100, 150, 255, 0.5)";

  // Typing config
  const fullText = "Designs that impress.";
  const prefix = "Designs that ";
  const perChar = 0.05; // seconds per character — tweak if you want faster/slower

  // Create main timeline. Keep default easing for other tweens.
  const tl = gsap.timeline();

  // ---- STEP 1: Typing (first thing to run) ----
  // We create a driver and animate its value from 0 to fullText.length.
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

  // ---- After typing: animate highlight entrance to cover first word ----
  tl.add(() => {
    // compute needed width for the first typed last-word
    const w = changingWord.offsetWidth;
    // animate highlight width smoothly
    gsap.to(highlight, { width: w, duration: 0.4, ease: "power2.out" });

    // after entrance completes, remove CSS transition so further width changes snap instantly
    setTimeout(() => {
      highlight.style.transition = "none";
    }, 420);
  }, "+=0.06"); // tiny gap to feel natural after typing ends

  // ---- Bring mouse in (after highlight begins) ----
  // First make mouse visible (opacity) then move it.
  tl.to(mouse, { opacity: 1, duration: 0.25 }, "-=0.15");
  tl.to(mouse, { x: 250, y: 300, duration: 0.9, ease: "power2.inOut" }, "-=0.1");

  // ---- STEP 2: Word cycling (instant highlight jumps) ----
  // We'll start cycling after a short pause to let the highlight finish its entrance.
  tl.add(() => {
    let i = 1; // start from second word (first is already 'impress.')
    const cycleInterval = 300; // ms between word switches (fast)

    function cycleNext() {
      if (i < words.length) {
        changingWord.textContent = words[i];
        // instant width jump (no CSS transition)
        const newW = changingWord.offsetWidth;
        highlight.style.width = newW + "px";
        i++;
        setTimeout(cycleNext, cycleInterval);
      } else {
        // final: animate highlight exit smoothly
        highlight.style.transition = "width 0.3s ease";
        gsap.to(highlight, { width: 0, duration: 0.4, ease: "power2.inOut" });
      }
    }

    // ensure highlight had time to animate-in before starting
    setTimeout(cycleNext, 500);
  }, "+=0.05");

  // ---- STEP 3: Mouse moves to CTA and button click animation ----
  // Keep the same final sequence as original (delayed move so cycling can complete)
  tl.to(mouse, { x: 800, y: 350, duration: 1, delay: 4 });
  tl.to(button, { scale: 1.2, backgroundColor: "#ff4081", duration: 0.2 });
  tl.to(button, { scale: 1, backgroundColor: "#000", duration: 0.3 });
  tl.to(mouse, { opacity: 0, duration: 0.5 });
});
