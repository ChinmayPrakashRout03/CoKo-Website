/**
 * CoKo - Animated Audio Wave Background & Sparkles
 */

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let waves = [];
let particles = [];
let mouse = { x: -1000, y: -1000 };

// Configurations
const WAVE_COUNT = 60;
const BAR_WIDTH = 3;
const SPACING = 8;
const MAX_HEIGHT = 160;
const BASE_HEIGHT = 8;
const SPEED = 0.002;
const PARTICLE_COUNT = 80;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initWaves();
  initParticles();
}

function initWaves() {
  waves = [];
  const WAVES_PER_GROUP = WAVE_COUNT / 2;
  const groupWidth = WAVES_PER_GROUP * (BAR_WIDTH + SPACING);

  for (let i = 0; i < WAVE_COUNT; i++) {
    const isLeft = i < WAVES_PER_GROUP;
    const localI = isLeft ? i : (i - WAVES_PER_GROUP);
    
    // For left group: localI=WAVES_PER_GROUP-1 is closest to ghost. localI=0 is furthest.
    // For right group: localI=0 is closest to ghost. localI=WAVES_PER_GROUP-1 is furthest.
    const distFromEdge = isLeft 
      ? (WAVES_PER_GROUP - 1 - localI) * (BAR_WIDTH + SPACING) 
      : localI * (BAR_WIDTH + SPACING);
      
    // Taper down from 1.0 (near ghost) to 0 (far from ghost)
    let taper = 1 - (distFromEdge / groupWidth);
    if (taper < 0) taper = 0;
    
    // Curve the taper for an equalizer look
    taper = Math.pow(taper, 1.2);

    waves.push({
      isLeft: isLeft,
      distFromEdge: distFromEdge,
      basePhase: Math.random() * Math.PI * 2,
      freq: 0.5 + Math.random() * 1.5,
      multiplier: taper
    });
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedY: -Math.random() * 0.3 - 0.1,
      opacity: Math.random(),
      fadeSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1)
    });
  }
}

// Track mouse
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});
window.addEventListener('resize', resize);

function draw(time) {
  ctx.clearRect(0, 0, width, height);
  
  // Dynamically calculate the vertical center and edges based on the ghost's actual position
  const ghostEl = document.querySelector('.ghost-wrapper');
  let centerY = height / 2;
  let visualLeft = width / 2 - 135;
  let visualRight = width / 2 + 135;

  if (ghostEl) {
    const rect = ghostEl.getBoundingClientRect();
    // The headphones are slightly above the absolute center of the SVG
    centerY = rect.top + (rect.height / 2) - (rect.height * 0.03);
    
    // The ghost graphic takes up ~63% of the SVG wrapper's width
    const visualRadius = rect.width * 0.315; 
    const center = rect.left + rect.width / 2;
    visualLeft = center - visualRadius;
    visualRight = center + visualRadius;
  }

  // --- Draw Audio Waves ---
  for (let i = 0; i < waves.length; i++) {
    const wave = waves[i];
    
    // Calculate actual X position anchored to the left or right edge of the ghost
    const x = wave.isLeft ? (visualLeft - wave.distFromEdge) : (visualRight + wave.distFromEdge);
    
    // Oscillate height
    let currentHeight = BASE_HEIGHT + Math.abs(Math.sin(wave.basePhase + time * SPEED * wave.freq)) * (MAX_HEIGHT * wave.multiplier);
    
    // Mouse reaction
    const distToMouse = Math.abs(x - mouse.x);
    if (distToMouse < 150) {
      currentHeight += (150 - distToMouse) * 0.3;
    }

    // Fade opacity out as they move away from the ghost
    const WAVES_PER_GROUP = WAVE_COUNT / 2;
    const groupWidth = WAVES_PER_GROUP * (BAR_WIDTH + SPACING);
    let alpha = 0.5 - (wave.distFromEdge / groupWidth) * 0.4;
    if (alpha > 0.5) alpha = 0.5;
    if (alpha < 0) alpha = 0;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, centerY - currentHeight / 2, BAR_WIDTH, currentHeight, BAR_WIDTH / 2);
    } else {
      ctx.fillRect(x, centerY - currentHeight / 2, BAR_WIDTH, currentHeight);
    }
    ctx.fill();
  }

  // --- Draw Floating Sparkles/Stars ---
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    p.y += p.speedY;
    p.opacity += p.fadeSpeed;

    if (p.opacity > 1) { p.opacity = 1; p.fadeSpeed *= -1; }
    if (p.opacity < 0) { p.opacity = 0; p.fadeSpeed *= -1; }

    // Reset if offscreen
    if (p.y < 0) {
      p.y = height;
      p.x = Math.random() * width;
    }

    // Make stars near the center brighter
    const distFromCenterX = Math.abs(width/2 - p.x);
    const distFromCenterY = Math.abs(height/2 - p.y);
    const dist = Math.sqrt(distFromCenterX**2 + distFromCenterY**2);
    let particleAlpha = p.opacity;
    if (dist > 400) particleAlpha *= (800 - dist) / 400; // Fade out far away
    if (particleAlpha < 0) particleAlpha = 0;

    ctx.fillStyle = `rgba(255, 255, 255, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

// Start
resize();
requestAnimationFrame(draw);

// Hide top buttons on scroll
window.addEventListener('scroll', () => {
  const topButtons = document.querySelector('.top-buttons');
  if (topButtons) {
    if (window.scrollY > 50) {
      topButtons.classList.add('hidden');
    } else {
      topButtons.classList.remove('hidden');
    }
  }
});

// --- Carousel Logic for Quotes ---
const quotes = [
  "Good<br>Music<br>Better<br>Days.",
  "Just<br>Hit<br>Play<br>& Chill.",
  "Your<br>Vibe<br>Your<br>Rules."
];

let currentQuoteIndex = 0;
const quoteEl = document.getElementById('carousel-quote');
const dots = document.querySelectorAll('#carousel-dots .dot');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');

function updateCarousel(index) {
  if (!quoteEl) return;
  
  // Fade out
  quoteEl.style.opacity = 0;
  
  setTimeout(() => {
    currentQuoteIndex = index;
    quoteEl.innerHTML = quotes[currentQuoteIndex];
    
    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentQuoteIndex);
    });
    
    // Fade in
    quoteEl.style.opacity = 0.8;
  }, 200); // Wait for CSS transition (0.2s)
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    let newIndex = currentQuoteIndex - 1;
    if (newIndex < 0) newIndex = quotes.length - 1;
    updateCarousel(newIndex);
  });

  nextBtn.addEventListener('click', () => {
    let newIndex = (currentQuoteIndex + 1) % quotes.length;
    updateCarousel(newIndex);
  });

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      updateCarousel(idx);
    });
  });
}
