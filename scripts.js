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
  
const cursor = document.createElement('div');
cursor.classList.add('custom-cursor');
document.body.appendChild(cursor);

document.addEventListener('mousemove', e => {
cursor.style.left = `${e.pageX}px`;
cursor.style.top = `${e.pageY}px`;
});

document.querySelectorAll('a').forEach(a => {
a.addEventListener('mouseover', () => cursor.classList.add('hover'));
a.addEventListener('mouseout', () => cursor.classList.remove('hover'));
});

gsap.from('.tagline', { opacity: 0, y: 50, duration: 1, ease: 'power2.out' });
gsap.utils.toArray('section').forEach(sec => {
  gsap.from(sec, { opacity: 0, y: 100, duration: 1, scrollTrigger: { trigger: sec, start: 'top 80%' } });
});

