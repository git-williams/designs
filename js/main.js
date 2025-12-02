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
  const changingWord = document.querySelector(".changing-word");
  const highlight = document.querySelector(".highlight");
  const mouse = document.querySelector(".mouse-cursor");
  const button = document.querySelector(".cta-btn");

  // Remove highlight transition between word changes — only animate in/out
  highlight.style.transition = "none";

  // Typing function
  function typeText(element, text, speed = 0.06) {
    return gsap.to(element, {
      duration: text.length * speed,
      text: text,
      ease: "none"
    });
  }

  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  // ===== Step 1 — Fade hero, show mouse, TYPE OUT first word =====
  tl.from(".hero-text", { x: -100, opacity: 0, duration: 1 })
    .from(".hero-cta", { x: 100, opacity: 0, duration: 1 }, "-=0.5")
    .to(mouse, { opacity: 1, duration: 0.5 }, "-=0.5")

    // Reset text, then type it
    .add(() => {
      changingWord.textContent = "";
    })
    .add(typeText(changingWord, "Designs that impress.", 0.065))

    // Move mouse toward the word
    .to(mouse, { x: 250, y: 300, duration: 1 })

    // Highlight slides in smoothly (only this first time)
    .to(
      highlight,
      { width: "100%", duration: 0.4, ease: "power2.out" },
      "-=0.2"
    )

    // ===== Step 2 — Cycle through words instantly (no delay, no smooth resize) =====
    .add(() => {
      const adjustInstant = (word) => {
        changingWord.textContent = word;
        const width = changingWord.offsetWidth;
        highlight.style.transition = "none"; // no animation between words
        highlight.style.width = width + "px";
      };

      let i = 1;

      const nextWord = () => {
        if (i < words.length) {
          adjustInstant(words[i]);
          i++;
          setTimeout(nextWord, 500); // faster switching
        } else {
          // Final removal of highlight — animated
          highlight.style.transition = "width 0.3s ease";
          gsap.to(highlight, { width: 0, duration: 0.4 });
        }
      };

      // Give highlight time to finish full intro animation BEFORE cycling words
      setTimeout(() => nextWord(), 500);
    })

    // ===== Step 3 — Move mouse to CTA, click animation =====
    .to(mouse, { x: 800, y: 350, duration: 1, delay: 4 }) // match highlight cycle duration
    .to(button, { scale: 1.2, backgroundColor: "#ff4081", duration: 0.2 })
    .to(button, { scale: 1, backgroundColor: "#000", duration: 0.3 })
    .to(mouse, { opacity: 0, duration: 0.5 });
});
