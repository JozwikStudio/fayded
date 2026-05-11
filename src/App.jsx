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
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle  = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

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

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
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
