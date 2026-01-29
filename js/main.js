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
  // HERO SLIDE + FADE IN ON LOAD
  // ================================
  const heroH1 = document.querySelector(".hero-text");
  if (heroH1 && typeof gsap !== "undefined") {

    // Start state
    gsap.set(heroH1, {
      x: -28,
      opacity: 0
    });

    // Animate in
    gsap.to(heroH1, {
      duration: 0.6,
      x: 0,
      opacity: 1,
      ease: "power2.out"
    });
  }

});
