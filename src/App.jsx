import { useEffect, useRef } from 'react';
import './App.css';

const PALETTE = [
  '#FFDBB4', '#F5C6A0', '#EBB48A', '#E0A070',
  '#D48C5C', '#C87848', '#B86A3A', '#A85C30',
  '#F0C8A8', '#E8B890', '#DCA878', '#CC9060',
  '#F8E0C8', '#C88050', '#B87040', '#E0B898',
];

function drawPenis(ctx, x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const sw = size * 0.34;
  const sh = size * 0.58;
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
    const sizeBase = isMobile ? 8 : 14;
    const sizeRange = isMobile ? 12 : 22;

    const particles = Array.from({ length: N_PARTICLES }, (_, i) => ({
      x:        Math.random() * W,
      y:        Math.random() * H,
      vx:       (Math.random() - 0.5) * 2.2,
      vy:       (Math.random() - 0.5) * 2.2,
      size:     sizeBase + Math.random() * sizeRange,
      angle:    Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      color:    PALETTE[i % PALETTE.length],
    }));

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

        if (p.x < -60)    p.x = W + 60;
        if (p.x > W + 60) p.x = -60;
        if (p.y < -60)    p.y = H + 60;
        if (p.y > H + 60) p.y = -60;

        drawPenis(ctx, p.x, p.y, p.size, p.angle, p.color);
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
