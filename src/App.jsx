import { useEffect, useRef } from 'react';
import './App.css';

// Gradient stops: small=light skin, large=near black
const SKIN_STOPS = [
  { t: 0.00, r: 255, g: 219, b: 180 }, // #FFDBB4 very light
  { t: 0.25, r: 235, g: 180, b: 138 }, // #EBB48A light
  { t: 0.50, r: 200, g: 120, b:  72 }, // #C87848 medium
  { t: 0.75, r: 120, g:  56, b:  18 }, // #783812 dark brown
  { t: 1.00, r:  20, g:   8, b:   0 }, // #140800 near black
];

function skinColor(t) {
  let lo = SKIN_STOPS[0], hi = SKIN_STOPS[SKIN_STOPS.length - 1];
  for (let i = 0; i < SKIN_STOPS.length - 1; i++) {
    if (t >= SKIN_STOPS[i].t && t <= SKIN_STOPS[i + 1].t) {
      lo = SKIN_STOPS[i];
      hi = SKIN_STOPS[i + 1];
      break;
    }
  }
  const s = (t - lo.t) / (hi.t - lo.t);
  const r = Math.round(lo.r + (hi.r - lo.r) * s);
  const g = Math.round(lo.g + (hi.g - lo.g) * s);
  const b = Math.round(lo.b + (hi.b - lo.b) * s);
  return `rgb(${r},${g},${b})`;
}

function drawVagina(ctx, x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const w = size * 0.62;  // outer width
  const h = size;          // outer height

  // Labia majora — outer oval
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
  ctx.fill();

  // Labia minora — slightly darker inner oval
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.52, h * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  // Center slit — almond / vesica shape
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.52);
  ctx.bezierCurveTo( w * 0.28, -h * 0.12,  w * 0.28,  h * 0.12, 0,  h * 0.52);
  ctx.bezierCurveTo(-w * 0.28,  h * 0.12, -w * 0.28, -h * 0.12, 0, -h * 0.52);
  ctx.fill();

  ctx.restore();
}

function drawPenis(ctx, x, y, size, shRatio, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const sw = size * 0.34;
  const sh = size * shRatio;
  const gr = size * 0.27;
  const br = size * 0.22;

  ctx.shadowBlur = 0;
  ctx.fillStyle  = color;

  ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

  ctx.beginPath();
  ctx.arc(0, -sh / 2, gr, Math.PI, 0, false);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-br * 0.55, sh / 2, br, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(br * 0.55, sh / 2, br, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

const N_PARTICLES = 55;
const POOP_CHANCE   = 1 / 2400; // ~every 40s at 60fps
const VAGINA_CHANCE = 1 / 300;  // ~every 5s at 60fps

function spawnVagina(W, H) {
  const fromLeft = Math.random() < 0.5;
  const size = 28 + Math.random() * 32; // 28–60px
  return {
    x:        fromLeft ? -size : W + size,
    y:        size + Math.random() * (H - size * 2),
    vx:       (fromLeft ? 1 : -1) * (1.4 + Math.random() * 1.4),
    vy:       (Math.random() - 0.5) * 0.7,
    size,
    angle:    Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.018,
    color:    skinColor(Math.random() * 0.65),
  };
}

function spawnPoop(W, H) {
  const fromLeft = Math.random() < 0.5;
  const size = 55 + Math.random() * 35;
  return {
    x:        fromLeft ? -size : W + size,
    y:        size + Math.random() * (H - size * 2),
    vx:       (fromLeft ? 1 : -1) * (1.2 + Math.random() * 1.2),
    vy:       (Math.random() - 0.5) * 0.6,
    size,
    angle:    (Math.random() - 0.5) * 0.3,
    rotSpeed: (Math.random() - 0.5) * 0.008,
  };
}

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    function onResize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
    }
    window.addEventListener('resize', onResize);

    const poops   = [];
    const vaginas = [];

    const isMobile = W < 600;
    const sizeMin  = isMobile ?  8 : 14;
    const sizeMax  = isMobile ? 40 : 72; // doubled from previous max

    const particles = Array.from({ length: N_PARTICLES }, () => {
      const t    = Math.random();            // 0=smallest/lightest, 1=biggest/darkest
      const size    = sizeMin + t * (sizeMax - sizeMin);
      const shRatio = 0.32 + t * 0.62; // short & stubby when small, long when large
      return {
        x:        Math.random() * W,
        y:        Math.random() * H,
        vx:       (Math.random() - 0.5) * 2.2,
        vy:       (Math.random() - 0.5) * 2.2,
        size,
        shRatio,
        angle:    Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        color:    skinColor(t),
      };
    });

    let raf;

    function tick() {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x     += p.vx;
        p.y     += p.vy;
        p.angle += p.rotSpeed;

        if (p.x < -80)    p.x = W + 80;
        if (p.x > W + 80) p.x = -80;
        if (p.y < -80)    p.y = H + 80;
        if (p.y > H + 80) p.y = -80;

        drawPenis(ctx, p.x, p.y, p.size, p.shRatio, p.angle, p.color);
      }

      // Spawn vaginas every few seconds
      if (Math.random() < VAGINA_CHANCE) vaginas.push(spawnVagina(W, H));

      for (let i = vaginas.length - 1; i >= 0; i--) {
        const v = vaginas[i];
        v.x += v.vx;
        v.y += v.vy;
        v.angle += v.rotSpeed;
        if (v.x < -(v.size + 20) || v.x > W + v.size + 20) {
          vaginas.splice(i, 1);
          continue;
        }
        drawVagina(ctx, v.x, v.y, v.size, v.angle, v.color);
      }

      // Rarely spawn a poop
      if (Math.random() < POOP_CHANCE) poops.push(spawnPoop(W, H));

      // Move and draw poops; remove when fully off-screen
      for (let i = poops.length - 1; i >= 0; i--) {
        const p = poops[i];
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.rotSpeed;
        if (p.x < -(p.size + 20) || p.x > W + p.size + 20) {
          poops.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💩', 0, 0);
        ctx.restore();
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Shake-to-fart: DeviceMotion + Web Audio synthesis
  useEffect(() => {
    if (!window.DeviceMotionEvent) return;

    let audioCtx = null;
    let cooldown = false;
    let lastAccel = null;
    // Sliding-window: collect timestamps of shake peaks, trigger after enough in 2s
    const shakeTimes = [];
    const SHAKE_THRESHOLD = 8;   // m/s² delta per event — lower = more sensitive
    const SHAKE_WINDOW    = 2000; // ms
    const SHAKE_COUNT     = 20;  // events needed within the window

    function ensureCtx() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    async function playFart() {
      const ctx = ensureCtx();
      // Always resume — async, must await before scheduling audio
      await ctx.resume();

      const duration = 0.55 + Math.random() * 0.45;
      const rate = ctx.sampleRate;
      const buf  = ctx.createBuffer(1, Math.floor(rate * duration), rate);
      const data = buf.getChannelData(0);

      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        data[i] = last * 3.5;
      }

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(380, ctx.currentTime);
      lpf.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(2.5, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      src.connect(lpf);
      lpf.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    }

    function onMotion(e) {
      const a = e.accelerationIncludingGravity || e.acceleration;
      if (!a) return;
      const cur = { x: a.x ?? 0, y: a.y ?? 0, z: a.z ?? 0 };

      if (lastAccel) {
        const delta = Math.abs(cur.x - lastAccel.x)
                    + Math.abs(cur.y - lastAccel.y)
                    + Math.abs(cur.z - lastAccel.z);

        if (delta > SHAKE_THRESHOLD) {
          const now = Date.now();
          shakeTimes.push(now);
          // Evict old entries outside the window
          const cutoff = now - SHAKE_WINDOW;
          while (shakeTimes.length && shakeTimes[0] < cutoff) shakeTimes.shift();

          if (!cooldown && shakeTimes.length >= SHAKE_COUNT) {
            cooldown = true;
            shakeTimes.length = 0;
            playFart();
            setTimeout(() => { cooldown = false; }, 3000);
          }
        }
      }

      lastAccel = cur;
    }

    function attachMotion() {
      window.addEventListener('devicemotion', onMotion);
    }

    // First user touch: unlock AudioContext + (iOS) request motion permission
    async function onFirstGesture() {
      ensureCtx();
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const perm = await DeviceMotionEvent.requestPermission();
          if (perm === 'granted') attachMotion();
        } catch {}
      }
    }

    window.addEventListener('touchstart', onFirstGesture, { once: true });
    window.addEventListener('click',      onFirstGesture, { once: true });

    // Android: attach motion immediately (no permission needed)
    if (typeof DeviceMotionEvent.requestPermission !== 'function') {
      attachMotion();
    }

    return () => {
      window.removeEventListener('devicemotion', onMotion);
      audioCtx?.close();
    };
  }, []);

  return (
    <div className="wrap">
      <canvas ref={canvasRef} className="bg-canvas" />
      <div className="content">
        <h1 className="title">FAYDED</h1>
        <p className="tagline">coming soon</p>
      </div>
    </div>
  );
}
