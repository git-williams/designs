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
  // HERO TEXT ANIMATION (UNCHANGED)
  // ================================
  gsap.registerPlugin(TextPlugin);

  const words = ["impress.", "convert.", "inspire.", "grow.", "lead."];
  const button = document.querySelector(".cta-btn");

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

  // HERO typing timeline
  const tl = gsap.timeline();

  gsap.set(heroH1, { x: -28, opacity: 0 });
  tl.to(heroH1, { duration: 0.6, x: 0, opacity: 1, ease: "power2.out" }, 0);

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

}); // END DOMContentLoaded



// ==========================================================
// SIMPLE ABCD CURSOR ANIMATION — FULLY REPLACES OLD SYSTEM
// ==========================================================
window.addEventListener("load", () => {
  const cursor = document.getElementById("cursor");
  const wrapper = document.querySelector(".points-wrapper");
  const pointIds = ["A", "B", "C", "D"];

  const delays = {
    before: 500,
    between: 600,
    atPoint: 400
  };

  function getLocalPosition(el) {
    const wrapperRect = wrapper.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left - wrapperRect.left + rect.width / 2,
      y: rect.top - wrapperRect.top + rect.height / 2
    };
  }

  function moveCursorToPoint(pointEl) {
    return new Promise(resolve => {
      const { x, y } = getLocalPosition(pointEl);
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      setTimeout(resolve, delays.atPoint);
    });
  }

  async function runAnimation() {
    await new Promise(res => setTimeout(res, delays.before));

    for (let i = 0; i < pointIds.length; i++) {
      const point = document.getElementById(pointIds[i]);
      await moveCursorToPoint(point);
      if (i < pointIds.length - 1) {
        await new Promise(res => setTimeout(res, delays.between));
      }
    }
  }

  runAnimation();
});
