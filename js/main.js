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

  const heroH1 = document.querySelector(".hero-text h1");
  const mouse = document.querySelector(".mouse-cursor");
  const button = document.querySelector(".cta-btn");

  // Wipe hero text immediately so no flicker / fade-in of old content
  heroH1.innerHTML =
    '<span class="typed-prefix"></span>' +
    '<span class="word-container"><span class="changing-word"></span><span class="highlight"></span></span>';

  const typedPrefix = heroH1.querySelector(".typed-prefix");
  const changingWord = heroH1.querySelector(".changing-word");
  const highlight = heroH1.querySelector(".highlight");
  highlight.style.transition = "none";

  // The full sentence
  const fullText = "Designs that impress.";
  const prefix = "Designs that ";

  const speedPerChar = 0.05;

  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  // ===== STEP 1 — TYPE FULL SENTENCE FIRST =====
  tl.add(() => {
    const driver = { i: 0 };
    const total = fullText.length;

    tl.to(driver, {
      i: total,
      duration: total * speedPerChar,
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
    });
  })

    // ===== After typing → highlight first word =====
    .add(() => {
      const width = changingWord.offsetWidth;

      gsap.to(highlight, { width, duration: 0.4, ease: "power2.out" });

      setTimeout(() => (highlight.style.transition = "none"), 420);
    })

    // ===== Mouse slides in AFTER typing and highlight =====
    .to(mouse, { opacity: 1, duration: 0.2 }, "-=0.1")
    .to(mouse, { x: 260, y: 300, duration: 1 }, "-=0.1")

    // ===== STEP 2 — Word cycle (instant highlight jumps) =====
    .add(() => {
      let idx = 1;

      function nextWord() {
        changingWord.textContent = words[idx];
        highlight.style.width = changingWord.offsetWidth + "px";

        if (idx < words.length - 1) {
          idx++;
          setTimeout(nextWord, 350);
        } else {
          // final highlight removal
          highlight.style.transition = "width 0.3s ease";
          gsap.to(highlight, { width: 0, duration: 0.4 });
        }
      }

      setTimeout(nextWord, 500);
    })

    // ===== STEP 3 — Mouse → CTA click =====
    .to(mouse, { x: 800, y: 350, duration: 1, delay: 4 })
    .to(button, { scale: 1.2, backgroundColor: "#ff4081", duration: 0.2 })
    .to(button, { scale: 1, backgroundColor: "#000", duration: 0.3 })
    .to(mouse, { opacity: 0, duration: 0.5 });
});
