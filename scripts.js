// Arcade Interactions: Neon Confetti on Click + Scroll Reveals
document.addEventListener('DOMContentLoaded', () => {
    // Neon Confetti Burst on Nav Clicks (basement.studio insp: Explosive feedback)
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        const burst = document.createElement('div');
        burst.style.position = 'absolute';
        burst.style.left = `${e.clientX}px`;
        burst.style.top = `${e.clientY}px`;
        burst.style.width = '20px';
        burst.style.height = '20px';
        burst.style.background = 'radial-gradient(#39ff14, transparent)';
        burst.style.animation = 'confetti-burst 0.5s ease-out';
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 500); // Clean up
      });
    });
  
    // Scroll Reveal: Fade-in Sections like Arcade Levels
    const sections = document.querySelectorAll('h1, h2, p');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.transition = 'opacity 0.5s, transform 0.5s';
        }
      });
    }, { threshold: 0.1 });
  
    sections.forEach(sec => {
      sec.style.opacity = 0;
      sec.style.transform = 'translateY(20px)';
      observer.observe(sec);
    });
  });
  
 
