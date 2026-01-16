// Simple fade-in animation for About page
document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".about-section");

    sections.forEach((section, index) => {
        section.style.opacity = 0;
        section.style.transform = "translateY(20px)";

        setTimeout(() => {
            section.style.transition = "all 0.6s ease";
            section.style.opacity = 1;
            section.style.transform = "translateY(0)";
        }, index * 200);
    });
});
