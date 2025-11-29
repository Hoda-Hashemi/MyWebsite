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

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('hero-bg').appendChild(renderer.domElement);

const particles = 5000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particles * 3);
for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 10;
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ color: 0x39ff14, size: 0.02, transparent: true, blending: THREE.AdditiveBlending });
const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);

camera.position.z = 5;

function animate(time) {
  requestAnimationFrame(animate);
  const pos = geometry.attributes.position.array;
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] += Math.sin(time * 0.001 + pos[i+1]) * 0.001; // X flow
    pos[i+1] += Math.cos(time * 0.001 + pos[i]) * 0.001; // Y vorticity
    if (Math.abs(pos[i]) > 5) pos[i] = -5; // Reset bounds
    if (Math.abs(pos[i+1]) > 5) pos[i+1] = -5;
  }
  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}
animate(0);

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.querySelector('.dark-2').addEventListener('change', (e) => {
    document.body.classList.toggle('dark-mode', e.target.checked);
  });

