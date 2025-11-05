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
      // past hero section
      if (currentScroll < lastScrollY) {
        header.classList.add("visible");
        header.classList.remove("hidden");
      } else {
        header.classList.add("hidden");
        header.classList.remove("visible");
      }
    } else {
      // inside or above hero
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

  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  // Slide in hero elements
  tl.from(".hero-text", { x: -100, opacity: 0, duration: 1 })
    .from(".hero-cta", { x: 100, opacity: 0, duration: 1 }, "-=0.5")
    .to(mouse, { opacity: 1, duration: 0.5 }, "-=0.5")

    // Move mouse to word
    .to(mouse, { x: 250, y: 300, duration: 1 })
    .to(highlight, { width: "60%", duration: 0.4 }, "-=0.3")

    // Cycle words
    .add(() => {
      let i = 1;
      const cycleWords = () => {
        if (i < words.length) {
          gsap.to(changingWord, { text: words[i], duration: 0.4 });
          i++;
          setTimeout(cycleWords, 600);
        }
      };
      cycleWords();
    })

    // Remove highlight
    .to(highlight, { width: 0, duration: 0.4, delay: 0.2 })

    // Move to CTA and click
    .to(mouse, { x: 800, y: 350, duration: 1 })
    .to(button, { scale: 1.2, backgroundColor: "#ff4081", duration: 0.2 })
    .to(button, { scale: 1, backgroundColor: "#000", duration: 0.3 })
    .to(mouse, { opacity: 0, duration: 0.5 });
});
