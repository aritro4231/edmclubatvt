import { useEffect, useRef } from 'react';

const blobs = [
  { color: 'rgba(255,46,146,0.30)', x: .25, y: .3, r: .35, sx: .00011, sy: .00016, phase: 0 },
  { color: 'rgba(34,230,255,0.24)', x: .7, y: .55, r: .4, sx: .00014, sy: .0001, phase: 2 },
  { color: 'rgba(138,63,252,0.28)', x: .5, y: .75, r: .32, sx: .00009, sy: .00013, phase: 4 },
  { color: 'rgba(212,255,63,0.10)', x: .85, y: .2, r: .28, sx: .00013, sy: .00012, phase: 6 },
];

export default function AmbientBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let width, height, dpr;
    function draw(time = 0) {
      ctx.clearRect(0, 0, width, height);
      for (const blob of blobs) {
        const drift = motion.matches ? 0 : time;
        const x = (blob.x + Math.sin(drift * blob.sx + blob.phase) * .12) * width;
        const y = (blob.y + Math.cos(drift * blob.sy + blob.phase) * .1) * height;
        const radius = blob.r * Math.max(width, height);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!motion.matches && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function restart() {
      cancelAnimationFrame(frame);
      if (!document.hidden) draw(performance.now());
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      restart();
    }
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', restart);
    motion.addEventListener('change', restart);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', restart);
      motion.removeEventListener('change', restart);
    };
  }, []);
  return <><canvas ref={canvasRef} id="bg-canvas" aria-hidden="true" /><div className="grain" aria-hidden="true" /></>;
}
