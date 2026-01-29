// ================================
// CORE PAGE LOGIC
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
      if (rect.top < triggerBottom) {
        section.classList.add("visible2");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();



  // ================================
  // HERO SLIDE + FADE + BLUR IN
  // ================================
  const hero = document.querySelector(".hero-heading");
  if (hero && typeof gsap !== "undefined") {

    gsap.to(hero, {
      delay: 0.12,
      duration: 0.8,
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      ease: "power3.out"
    });

  }

});
