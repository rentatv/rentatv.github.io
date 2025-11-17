// script.js - trailing neon "coś" podążające za kursorem
(() => {
  const canvas = document.getElementById('cursorCanvas');
  const ctx = canvas.getContext('2d', {alpha: true});
  let DPR = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    DPR = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.ceil(window.innerWidth * DPR);
    canvas.height = Math.ceil(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // particle buffer
  const particles = [];
  const maxParticles = 60; // trail length
  const colors = [
    {r:0,g:255,b:246},
    {r:124,g:77,b:255},
    {r:255,g:0,b:230}
  ];

  // smoothing
  let pointer = {x: window.innerWidth/2, y: window.innerHeight/2};
  let target = {x: pointer.x, y: pointer.y};

  // utility
  function rand(min, max){ return Math.random()*(max-min)+min; }

  // push a new particle
  function spawn(x,y){ 
    const c = colors[Math.floor(rand(0, colors.length))];
    particles.push({
      x, y,
      vx: rand(-0.6,0.6),
      vy: rand(-0.6,0.6),
      life: 1, // 1 -> 0
      decay: rand(0.012, 0.035),
      size: rand(6, 26),
      color: c
    });
    if(particles.length > maxParticles) particles.shift();
  }

  // mouse / touch handlers
  function move(x,y){
    target.x = x;
    target.y = y;
    // spawn a few for richer trail
    for(let i=0;i<2;i++) spawn(x + rand(-8,8), y + rand(-8,8));
  }

  window.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    if(e.touches && e.touches[0]) {
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    }
  }, {passive:true});

  // animation loop
  let last = performance.now();
  function frame(now){
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;

    // smooth pointer follow
    pointer.x += (target.x - pointer.x) * (0.22 + dt*6);
    pointer.y += (target.y - pointer.y) * (0.22 + dt*6);

    // spawn a faint core at pointer occasionally
    if(Math.random() < 0.25) spawn(pointer.x, pointer.y);

    // clear with low alpha for trailing persistence
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(2,2,6,0.12)';
    ctx.fillRect(0,0,canvas.width/DPR,canvas.height/DPR);

    // draw particles
    for(let i = particles.length - 1; i >= 0; i--){
      const p = particles[i];
      // physics
      p.x += p.vx + (pointer.x - p.x) * 0.03;
      p.y += p.vy + (pointer.y - p.y) * 0.03;
      p.vx *= 0.98; p.vy *= 0.98;
      p.life -= p.decay;

      // draw radial gradient
      const alpha = Math.max(0, p.life);
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grd.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${0.95*alpha})`);
      grd.addColorStop(0.4, `rgba(${p.color.r},${p.color.g},${p.color.b},${0.25*alpha})`);
      grd.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
      ctx.beginPath();
      ctx.fillStyle = grd;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();

      // thin outer ring for neon effect
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${0.16*alpha})`;
      ctx.lineWidth = Math.max(1, p.size * 0.12);
      ctx.arc(p.x, p.y, p.size * 1.1, 0, Math.PI*2);
      ctx.stroke();

      if(p.life <= 0) particles.splice(i,1);
    }

    // optional small core dot directly under pointer
    ctx.beginPath();
    const coreSize = 8 + Math.sin(now/120)*2;
    const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, coreSize*3);
    const cidx = Math.floor((now/400)%colors.length);
    const c = colors[cidx];
    gradient.addColorStop(0, `rgba(${c.r},${c.g},${c.b},0.95)`);
    gradient.addColorStop(0.25, `rgba(${c.r},${c.g},${c.b},0.22)`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.arc(pointer.x, pointer.y, coreSize*3, 0, Math.PI*2);
    ctx.fill();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // hide cursor on mobile too by adding CSS class - already body cursor none but some mobile UAs show it
  // prevent selection
  document.addEventListener('selectstart', e => e.preventDefault());

  // safety: if pointer idle, gently spawn subtle particles in center to keep scene alive
  setInterval(() => {
    if(Math.hypot(target.x - pointer.x, target.y - pointer.y) < 10 && Math.random() < 0.4) {
      spawn(window.innerWidth * (0.35 + Math.random()*0.3), window.innerHeight * (0.35 + Math.random()*0.3));
    }
  }, 900);

})();
