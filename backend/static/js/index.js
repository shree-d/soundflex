// ===============================
// SoundFlex Landing Page JS
// ===============================

// Floating music icons random motion
const icons = document.querySelectorAll(".music-icons span");

icons.forEach(icon => {
  const duration = 8 + Math.random() * 6;
  const delay = Math.random() * 5;

  icon.style.animationDuration = `${duration}s`;
  icon.style.animationDelay = `${delay}s`;
});

// Mouse move parallax effect
document.addEventListener("mousemove", (e) => {
  const x = (window.innerWidth / 2 - e.pageX) / 40;
  const y = (window.innerHeight / 2 - e.pageY) / 40;

  icons.forEach((icon, index) => {
    const speed = (index + 1) * 0.3;
    icon.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
  });
});

// CTA button pulse effect
const buttons = document.querySelectorAll(".btn");

buttons.forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    btn.style.boxShadow = "0 0 20px rgba(123,47,247,0.6)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.boxShadow = "none";
  });
});

// Page load animation
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
});

console.log("🎧 SoundFlex Landing Page Loaded");
