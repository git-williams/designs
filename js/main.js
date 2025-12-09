// Requires GSAP core + TextPlugin + MotionPathPlugin to be loaded on the page
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
  // HERO ANIMATION SETUP
  // ================================
  gsap.registerPlugin(TextPlugin, MotionPathPlugin);

  const words = ["impress.", "convert.", "inspire.", "grow.", "lead."];
  const mouse = document.querySelector(".mouse-cursor");
  const button = document.querySelector(".cta-btn");

  // Anchors
  const anchorA  = document.getElementById("mouse-point-a");
  const anchorB  = document.getElementById("mouse-point-b");
  const anchorL1 = document.getElementById("mouse-point-l1");
  const anchorL2 = document.getElementById("mouse-point-l2");
  const anchorC  = document.getElementById("mouse-point-c");
  const anchorD  = document.getElementById("mouse-point-d");

  // H1 setup
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

  const setMouseStart = () => {
    const A = center(anchorA);
    gsap.set(mouse, { left: A.left - 380, top: A.top - 180, opacity: 1 });
  };
  setMouseStart();

  // ================================
  // MASTER TIMELINE
  // ================================
  const tl = gsap.timeline();

  // H1 slide + fade
  gsap.set(heroH1, { x: -28, opacity: 0 });
  tl.to(heroH1, { duration: 0.6, x: 0, opacity: 1, ease: "power2.out" }, 0);

  // Typing animation
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
  // CLEAN MOUSE MOVEMENT (A → B → L1 → L2 → C → D → exit)
  // ================================
  const getCenters = () => ({
    A:  center(anchorA),
    B:  center(anchorB),
    L1: center(anchorL1),
    L2: center(anchorL2),
    C:  center(anchorC),
    D:  center(anchorD)
  });

  const mouseTL = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  tl.add(() => {

    const P = getCenters();

    // Reset start
    gsap.set(mouse, { left: P.A.left - 380, top: P.A.top - 180 });

    mouseTL
      // OFFSCREEN → A
      .to(mouse, {
        duration: 1.5,
        left: P.A.left,
        top:  P.A.top
      })

      // A → B
      .to(mouse, {
        duration: 0.8,
        left: P.B.left,
        top:  P.B.top
      }, "+=0.2")

      // B → L1
      .to(mouse, {
        duration: 0.9,
        left: P.L1.left,
        top:  P.L1.top
      })

      // L1 → L2
      .to(mouse, {
        duration: 0.9,
        left: P.L2.left,
        top:  P.L2.top
      })

      // L2 → C
      .to(mouse, {
        duration: 0.9,
        left: P.C.left,
        top:  P.C.top
      })

      // C → D
      .to(mouse, {
        duration: 1,
        left: P.D.left,
        top:  P.D.top
      }, "+=0.2")

      // D → EXIT
      .to(mouse, {
        duration: 1,
        left: window.innerWidth + 300,
        top:  P.D.top
      });

  });

});
