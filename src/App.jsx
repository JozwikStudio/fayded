import { useEffect, useRef } from 'react';
import './App.css';

const PALETTE = [
  '#ff2d87', '#ff69b4', '#ff1493', '#ff007f',
  '#e91e8c', '#c0397a', '#9d4edd', '#da70d6',
  '#ff6eb4', '#ff40a0', '#fc0fc0', '#ff85c8',
];

function drawPenis(ctx, x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const sw = size * 0.34;   // shaft width
  const sh = size * 0.58;   // shaft height
  const gr = size * 0.27;   // glans radius
  const br = size * 0.22;   // ball radius

  ctx.shadowBlur  = size * 0.9;
  ctx.shadowColor = color;
  ctx.fillStyle   = color;

  // Shaft
  ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

  // Glans dome (semicircle on top, wider than shaft)
  ctx.beginPath();
  ctx.arc(0, -sh / 2, gr, Math.PI, 0, false);
  ctx.fill();

  // Left testicle
  ctx.beginPath();
  ctx.arc(-br * 0.55, sh / 2, br, 0, Math.PI * 2);
  ctx.fill();

  // Right testicle
  ctx.beginPath();
  ctx.arc(br * 0.55, sh / 2, br, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function sampleLetterPositions(text, W, H) {
  const off    = document.createElement('canvas');
  off.width    = W;
  off.height   = H;
  const ctx    = off.getContext('2d');
  const fontSize = Math.min(Math.floor(W * 0.19), 210);

  ctx.font          = `900 ${fontSize}px Impact, 'Arial Black', Arial`;
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'middle';
  ctx.fillStyle     = '#fff';
  ctx.fillText(text, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const step = Math.max(5, Math.floor(fontSize / 28));
  const pts  = [];

  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 100) pts.push([x, y]);
    }
  }

  // Fisher-Yates shuffle
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }

  return pts;
}

const T_SCATTER  = 2200;
const T_CONVERGE = 3000;
const N_PARTICLES = 480;

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const W      = window.innerWidth;
    const H      = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    const pts = sampleLetterPositions('FAYDED', W, H);
    if (pts.length === 0) return;

    // Build target list — repeat positions if fewer than N_PARTICLES
    const targets = Array.from({ length: N_PARTICLES },
      (_, i) => pts[i % pts.length]);

    const particles = targets.map((t, i) => ({
      x:        Math.random() * W,
      y:        Math.random() * H,
      tx:       t[0],
      ty:       t[1],
      vx:       (Math.random() - 0.5) * 7,
      vy:       (Math.random() - 0.5) * 7,
      size:     7 + Math.random() * 9,
      angle:    Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.14,
      color:    PALETTE[i % PALETTE.length],
      wOff:     Math.random() * Math.PI * 2,
      wSpd:     0.012 + Math.random() * 0.018,
    }));

    const t0 = Date.now();
    let raf;

    function tick() {
      const elapsed = Date.now() - t0;
      const phase   = elapsed < T_SCATTER ? 0
                    : elapsed < T_SCATTER + T_CONVERGE ? 1
                    : 2;

      // Clear
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle  = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      for (const p of particles) {
        if (phase === 0) {
          // Scatter — chaotic flight
          p.x     += p.vx;
          p.y     += p.vy;
          p.angle += p.rotSpeed;
          if (p.x < -70)    p.x = W + 70;
          if (p.x > W + 70) p.x = -70;
          if (p.y < -70)    p.y = H + 70;
          if (p.y > H + 70) p.y = -70;

        } else if (phase === 1) {
          // Converge — spring toward target with damping
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          p.vx += dx * 0.038;
          p.vy += dy * 0.038;
          p.vx *= 0.86;
          p.vy *= 0.86;
          p.x  += p.vx;
          p.y  += p.vy;
          const cProg = (elapsed - T_SCATTER) / T_CONVERGE;
          p.angle += p.rotSpeed * (1 - cProg * 0.92);

        } else {
          // Settled — gentle organic float
          p.wOff += p.wSpd;
          p.x     = p.tx + Math.sin(p.wOff) * 1.6;
          p.y     = p.ty + Math.cos(p.wOff * 1.13) * 1.6;
          p.angle += p.rotSpeed * 0.07;
        }

        drawPenis(ctx, p.x, p.y, p.size, p.angle, p.color);
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="wrap">
      <canvas ref={canvasRef} />
      <p className="tagline">coming soon</p>
    </div>
  );
}
