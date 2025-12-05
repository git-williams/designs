// Requires GSAP core + TextPlugin + MotionPathPlugin
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(TextPlugin, MotionPathPlugin);

  // ---- SELECT ELEMENTS ----
  const mouse = document.querySelector(".mouse-cursor");
  const button = document.querySelector(".cta-btn");
  const heroH1 = document.querySelector(".hero-text h1");
  const changingWord = heroH1.querySelector(".changing-word");
  const highlight = heroH1.querySelector(".highlight");

  const anchorA = document.getElementById("mouse-point-a");
  const anchorB = document.getElementById("mouse-point-b");
  const anchorC = document.getElementById("mouse-point-c");
  const anchorCTA = document.getElementById("mouse-point-cta");

  // ---- HERO TEXT SETUP ----
  const fullText = "Designs that impress.";
  const prefix = "Designs that ";
  const words = ["impress.", "convert.", "inspire.", "grow.", "lead."];
  const perChar = 0.05;

  heroH1.innerHTML = `
    <span class="typed-prefix"></span>
    <span class="word-container" style="position:relative; display:inline-block;">
      <span class="changing-word"></span>
      <span class="highlight"></span>
    </span>
  `;

  const typedPrefix = heroH1.querySelector(".typed-prefix");

  // Highlight styling
  highlight.style.position = "absolute";
  highlight.style.left = "0";
  highlight.style.bottom = "0";
  highlight.style.height = "1.2em";
  highlight.style.width = "0";
  highlight.style.zIndex = "-1";
  highlight.style.background = "rgba(100, 150, 255, 0.5)";
  highlight.style.transition = "none";

  // ---- HELPER: Get coords of anchors in page space ----
  const getCoords = () => {
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const rect = (el) => el.getBoundingClientRect();

    const a = rect(anchorA);
    const b = rect(anchorB);
    const c = rect(anchorC);
    const cta = rect(anchorCTA);
    const wordRect = rect(changingWord);

    return {
      ax: a.left + scrollX + a.width / 2,
      ay: a.top + scrollY + a.height / 2,
      bx: b.left + scrollX + b.width / 2,
      by: b.top + scrollY + b.height / 2,
      cx: c.left + scrollX + c.width / 2,
      cy: c.top + scrollY + c.height / 2,
      ctax: cta.left + scrollX + cta.width / 2,
      ctay: cta.top + scrollY + cta.height / 2,
      wordRect
    };
  };

  // ---- INITIAL MOUSE POSITION ----
  const setMouseStart = () => {
    const { ax, ay } = getCoords();
    gsap.set(mouse, { x: (ax || -300), y: (ay || window.innerHeight / 2), opacity: 0 });
  };
  setMouseStart();

  // ---- MASTER TIMELINE ----
  const tl = gsap.timeline();

  // ---- 1. Typing Animation ----
  const driver = { i: 0 };
  tl.to(driver, {
    i: fullText.length,
    duration: fullText.length * perChar,
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

  // ---- 2. Mouse enters to A (1.5s) ----
  tl.add(() => {
    const { ax, ay } = getCoords();
    gsap.to(mouse, { duration: 0.15, opacity: 1, ease: "power1.out" });
    gsap.to(mouse, {
      duration: 1.5,
      ease: "power2.inOut",
      motionPath: {
        path: [
          { x: ax - 260, y: ay - 120 },
          { x: ax - 140, y: ay - 60 },
          { x: ax - 60, y: ay - 20 },
          { x: ax, y: ay }
        ],
        curviness: 1.6,
        autoRotate: false
      }
    });
  });

  // ---- 3. Wait 0.4s at A ----
  tl.to({}, { duration: 0.4 });

  // ---- 4. Mouse A->B + highlight reveal (0.5s) ----
  tl.add(() => {
    const { bx, by, wordRect } = getCoords();
    const targetWidth = wordRect.width;
    highlight.style.width = "0px";

    gsap.to(mouse, { duration: 0.5, x: bx, y: by, ease: "power2.inOut" });
    gsap.to(highlight, { duration: 0.5, width: targetWidth, ease: "power2.inOut" });
  });

  // ---- 5. Pause 0.4s at B ----
  tl.to({}, { duration: 0.4 });

  // ---- 6. Word cycling & mouse swoop to CTA ----
  tl.add(() => {
    const { bx, by, ctax, ctay } = getCoords();
    const wordsToCycle = words.slice(1); // skip initial "impress."
    const wordDuration = 0.9;
    const totalCycleTime = wordsToCycle.length * wordDuration;

    // Mouse swoop path
    const swoopPath = [
      { x: bx, y: by },
      { x: bx - 80, y: by - 90 },
      { x: bx + 60, y: by - 120 },
      { x: bx - 30, y: by - 60 },
      { x: ctax - 120, y: ctay - 30 },
      { x: ctax, y: ctay }
    ];

    gsap.to(mouse, {
      duration: totalCycleTime,
      ease: "power1.inOut",
      motionPath: { path: swoopPath, curviness: 1.8, autoRotate: false }
    });

    // Cycle words
    wordsToCycle.forEach((w, idx) => {
      const isLast = idx === wordsToCycle.length - 1;
      gsap.delayedCall(idx * wordDuration, () => {
        changingWord.textContent = w;
        highlight.style.width = changingWord.offsetWidth + "px";
      });

      if (isLast) {
        gsap.delayedCall(idx * wordDuration + 0.1, () => {
          gsap.to(button, { scale: 1.08, duration: 0.09, ease: "power2.out" });
          gsap.to(button, { scale: 1, duration: 0.12, delay: 0.09, ease: "power2.in" });
          gsap.to(button, { backgroundColor: "#ff4081", duration: 0.07 });
          gsap.to(button, { backgroundColor: "#000", duration: 0.14, delay: 0.07 });
        });
      }
    });

    gsap.delayedCall(totalCycleTime - 0.05, () => {
      highlight.style.transition = "width 0.3s ease";
      gsap.to(highlight, { width: 0, duration: 0.4, ease: "power2.inOut" });
    });
  });

  // ---- 7. Mouse exits after CTA ----
  tl.add(() => {
    const { ctax, ctay } = getCoords();
    const offPath = [
      { x: ctax, y: ctay },
      { x: ctax + 120, y: ctay - 140 },
      { x: ctax + 420, y: ctay - 360 } // offscreen
    ];

    gsap.to(mouse, {
      duration: 1.05,
      ease: "power2.in",
      motionPath: { path: offPath, curviness: 1.6, autoRotate: false }
    });

    gsap.to(mouse, { opacity: 0, duration: 0.9, delay: 0.15 });
  });
});
