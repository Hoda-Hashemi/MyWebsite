// Modern Neon UX: Subtle Interactions
document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor: Sniper Glow
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);
  
    document.addEventListener('mousemove', e => {
      gsap.to(cursor, { duration: 0.2, left: `${e.pageX}px`, top: `${e.pageY}px`, ease: 'power2.out' });
    });
  
    document.querySelectorAll('a, button, .card').forEach(el => {
      el.addEventListener('mouseover', () => cursor.classList.add('hover'));
      el.addEventListener('mouseout', () => cursor.classList.remove('hover'));
    });
  
    // Subtle Confetti: Neon Sparks on Click (modern burst)
    document.querySelectorAll('nav a, .card').forEach(link => {
      link.addEventListener('click', (e) => {
        const burst = document.createElement('div');
        burst.style.position = 'absolute';
        burst.style.left = `${e.clientX}px`;
        burst.style.top = `${e.clientY}px`;
        burst.style.width = '20px'; burst.style.height = '20px';
        burst.style.background = 'radial-gradient(#39ff14, transparent)';
        burst.style.opacity = 0.8;
        document.body.appendChild(burst);
        gsap.to(burst, { duration: 0.5, scale: 3, opacity: 0, ease: 'power3.out', onComplete: () => burst.remove() });
      });
    });
  
    // Scroll Reveals: Figma-Like Parallax Slides
    gsap.utils.toArray('section, main').forEach((sec, i) => {
      gsap.from(sec, {
        y: 100, opacity: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: sec, start: 'top 80%', scrub: true, toggleActions: 'play none none reverse' }
      });
      // Subtle Parallax: Bg shift on scroll
      gsap.to(sec, { backgroundPositionY: '50%', y: -50, duration: 1, scrollTrigger: { trigger: sec, scrub: true } });
    });
  
    // Three.js Particles: Subtle Flow (adaptive resize)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('hero-bg').appendChild(renderer.domElement);
  
    const particles = 3000; // Reduced for subtlety
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particles * 3);
    for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 10;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
    const material = new THREE.PointsMaterial({ color: 0x39ff14, size: 0.01, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  
    camera.position.z = 5;
  
    function animate(time) {
      requestAnimationFrame(animate);
      const pos = geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += Math.sin(time * 0.0005 + pos[i+1]) * 0.0005; // Slower, subtle flow
        pos[i+1] += Math.cos(time * 0.0005 + pos[i]) * 0.0005;
        if (Math.abs(pos[i]) > 5) pos[i] = -5;
        if (Math.abs(pos[i+1]) > 5) pos[i+1] = -5;
      }
      geometry.attributes.position.needsUpdate = true;
      particleSystem.rotation.y += 0.0002; // Gentle rotate
      renderer.render(scene, camera);
    }
    animate(0);
  
    // Adaptive Resize: Modern Fluid
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  
    // Toggle: Smooth Neon Transition
    document.querySelector('.dark-2').addEventListener('change', (e) => {
      gsap.to('body', { duration: 0.5, backgroundColor: e.target.checked ? '#111' : '#1a1a1a', ease: 'power2.inOut' });
      document.body.classList.toggle('dark-mode', e.target.checked);
    });
  });

