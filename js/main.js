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
  const wordContainer = document.querySelector(".word-container");

  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  // Step 1 — type "Designs that impress."
  tl.from(".hero-text", { x: -100, opacity: 0, duration: 1 })
    .from(".hero-cta", { x: 100, opacity: 0, duration: 1 }, "-=0.5")
    .to(mouse, { opacity: 1, duration: 0.5 }, "-=0.5")
    .to(changingWord, {
      text: "impress.",
      duration: 2,
      ease: "none"
    })
    // Move mouse to word
    .to(mouse, { x: 250, y: 300, duration: 1 })
    // Highlight slides in
    .to(highlight, { width: "100%", duration: 0.4, ease: "power2.out" }, "-=0.2")

    // Step 2 — cycle through words abruptly, updating highlight width instantly
    .add(() => {
      const adjustHighlight = (word) => {
        changingWord.textContent = word;
        // measure word width live
        const width = changingWord.offsetWidth;
        gsap.set(highlight, { width });
      };

      let i = 1;
      const nextWord = () => {
        if (i < words.length) {
          adjustHighlight(words[i]);
          i++;
          setTimeout(nextWord, 800); // small pause between words
        } else {
          // remove highlight when done cycling
          gsap.to(highlight, { width: 0, duration: 0.4, ease: "power2.inOut", delay: 0.3 });
        }
      };
      nextWord();
    })

    // Step 3 — move to CTA and click animation
    .to(mouse, { x: 800, y: 350, duration: 1, delay: 2 }) // delayed so highlight can finish
    .to(button, { scale: 1.2, backgroundColor: "#ff4081", duration: 0.2 })
    .to(button, { scale: 1, backgroundColor: "#000", duration: 0.3 })
    .to(mouse, { opacity: 0, duration: 0.5 });
});
