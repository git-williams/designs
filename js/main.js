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

  // We'll recreate the h1 content for controlled typing.
  const heroH1 = document.querySelector(".hero-text h1");

  // Initially ensure highlight has no CSS transition for instant jumps (we'll animate entrance/exit with GSAP)
  // If the highlight element doesn't exist yet, we'll set style once we create it below.
  // highlight variable will be defined later after we set the h1 markup.
  let highlight;

  // Typing settings
  const fullText = "Designs that impress.";
  const prefix = "Designs that ";
  const speedPerChar = 0.05; // seconds per character (tweak to taste)

  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  // ===== Step 1 — TYPE OUT "Designs that impress." letter-by-letter
  tl.from(".hero-text", { x: -100, opacity: 0, duration: 1 })
    .from(".hero-cta", { x: 100, opacity: 0, duration: 1 }, "-=0.5")
    .to(mouse, { opacity: 1, duration: 0.5 }, "-=0.5")

    // Replace the H1 content with two spans:
    //  - typedPrefix: for "Designs that "
    //  - word-container -> changing-word + highlight (we'll type into changing-word for the last word)
    .add(() => {
      heroH1.innerHTML =
        '<span class="typed-prefix"></span>' +
        '<span class="word-container"><span class="changing-word"></span><span class="highlight"></span></span>';
      // now query the elements we need
      const typedPrefix = heroH1.querySelector(".typed-prefix");
      const changingWord = heroH1.querySelector(".changing-word");
      highlight = heroH1.querySelector(".highlight");
      // make sure highlight CSS transition is none for instantaneous jump changes later
      highlight.style.transition = "none";

      // Prepare an object to drive the typing via GSAP so it is part of the timeline
      const driver = { i: 0 };
      const total = fullText.length;
      // Add the typing tween into the main timeline so it plays in order
      const typingTween = gsap.to(driver, {
        i: total,
        duration: total * speedPerChar,
        ease: "none",
        onUpdate: function () {
          const idx = Math.floor(driver.i);
          // characters for prefix part
          if (idx <= prefix.length) {
            typedPrefix.textContent = fullText.slice(0, idx);
            changingWord.textContent = ""; // not typing last word yet
          } else {
            typedPrefix.textContent = prefix;
            // type into changingWord for the remainder
            changingWord.textContent = fullText.slice(prefix.length, idx);
          }
        }
      });

      // Add typingTween to timeline manually (since we're inside a .add callback)
      tl.add(typingTween, ">"); // play it immediately after current position
    })

    // After typing completes, move mouse to the word and animate highlight in smoothly (GSAP)
    .add(() => {
      // re-query in case scope changed
      const changingWord = heroH1.querySelector(".changing-word");
      highlight = heroH1.querySelector(".highlight");

      // compute width needed for highlight to cover the first word
      const wordWidth = changingWord.offsetWidth;
      // Position highlight to align with changing word (ensure word-container is positioned relative)
      // We'll animate the highlight width using GSAP for a smooth entrance.
      gsap.to(highlight, { width: wordWidth + "px", duration: 0.4, ease: "power2.out" });

      // After entrance animation finishes, disable CSS transitions so subsequent width changes snap instantly
      setTimeout(() => {
        highlight.style.transition = "none";
      }, 420); // slightly after the 0.4s animation completes
    }, "+=0") // immediate after typing tween

    // Move the mouse into position (timing is aligned so highlight can finish before cycling)
    .to(mouse, { x: 250, y: 300, duration: 0.9 }, "-=0.15")

    // ===== Step 2 — Cycle through words instantly (no smooth resize between words) =====
    .add(() => {
      const changingWord = heroH1.querySelector(".changing-word");
      highlight = heroH1.querySelector(".highlight");

      const adjustInstant = (word) => {
        changingWord.textContent = word;
        const width = changingWord.offsetWidth;
        // Instant jump (no CSS transition) between widths
        highlight.style.transition = "none";
        highlight.style.width = width + "px";
      };

      let i = 1;

      const nextWord = () => {
        if (i < words.length) {
          adjustInstant(words[i]);
          i++;
          setTimeout(nextWord, 300); // faster switching (300ms)
        } else {
          // Final removal: make exit smooth
          highlight.style.transition = "width 0.3s ease";
          gsap.to(highlight, { width: 0, duration: 0.4, ease: "power2.inOut" });
        }
      };

      // Start cycling only after the entrance highlight animation had time to complete
      setTimeout(() => nextWord(), 500);
    })

    // ===== Step 3 — Move mouse to CTA, click animation =====
    .to(mouse, { x: 800, y: 350, duration: 1, delay: 4 }) // delayed so highlight can finish
    .to(button, { scale: 1.2, backgroundColor: "#ff4081", duration: 0.2 })
    .to(button, { scale: 1, backgroundColor: "#000", duration: 0.3 })
    .to(mouse, { opacity: 0, duration: 0.5 });
});
