'use client';

import { useEffect, useRef } from 'react';

export function MultiAgentCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const ctxRaw = canvas.getContext('2d');
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;
    const t0 = performance.now();
    let rafId = 0;

    function resize() {
      const cw = container!.offsetWidth;
      if (!cw) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ch  = Math.round(cw * 0.52);
      canvas!.width        = cw * dpr;
      canvas!.height       = ch * dpr;
      canvas!.style.width  = cw + 'px';
      canvas!.style.height = ch + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const ndefs = [
      { nx: 0.50, ny: 0.24, label: 'Classifier', color: '#f59e0b' },
      { nx: 0.18, ny: 0.78, label: 'Responder',  color: '#22c55e' },
      { nx: 0.82, ny: 0.78, label: 'Escalation', color: '#60a5fa' },
    ];

    function draw(now: number) {
      const rect = canvas!.getBoundingClientRect();
      const W = rect.width, H = rect.height;
      if (!W || !H) { rafId = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);
      const t = (now - t0) / 1000;
      const nPos = ndefs.map(n => ({ x: n.nx * W, y: n.ny * H, label: n.label, color: n.color }));
      // Dashed connection lines
      ctx.save();
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      [[0,1],[1,2],[2,0]].forEach(([a, b]) => {
        ctx.beginPath(); ctx.moveTo(nPos[a].x, nPos[a].y); ctx.lineTo(nPos[b].x, nPos[b].y); ctx.stroke();
      });
      ctx.restore();
      // Animated packet
      const segDur = 1.1;
      const loopDur = segDur * 3;
      const tp = t % loopDur;
      const seg = tp < segDur ? 0 : tp < segDur * 2 ? 1 : 2;
      const frac = seg === 0 ? tp / segDur : seg === 1 ? (tp - segDur) / segDur : (tp - segDur * 2) / segDur;
      const ef = frac < 0.5 ? 2 * frac * frac : -1 + (4 - 2 * frac) * frac;
      const fromN = nPos[seg % 3], toN = nPos[(seg + 1) % 3];
      const px = fromN.x + (toN.x - fromN.x) * ef;
      const py = fromN.y + (toN.y - fromN.y) * ef;
      const pColor = ndefs[seg % 3].color;
      // Trail
      for (let i = 5; i >= 0; i--) {
        const tf = Math.max(0, frac - (i + 1) * 0.07);
        const te = tf < 0.5 ? 2*tf*tf : -1+(4-2*tf)*tf;
        ctx.beginPath();
        ctx.arc(fromN.x + (toN.x - fromN.x) * te, fromN.y + (toN.y - fromN.y) * te, Math.max(0.3, 2.2 - i * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = pColor + Math.round(Math.max(0, 0.45 - i * 0.07) * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
      // Packet
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = pColor; ctx.fill();
      // Node glow on arrival
      nPos.forEach((n, i) => {
        const aTime = i * segDur;
        const gA = tp > aTime && tp < aTime + 0.45 ? 0.22 * Math.sin(Math.PI * (tp - aTime) / 0.45) : 0;
        if (gA > 0) {
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 22);
          grad.addColorStop(0, n.color + Math.round(gA * 255).toString(16).padStart(2, '0'));
          grad.addColorStop(1, n.color + '00');
          ctx.beginPath(); ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
          ctx.fillStyle = grad; ctx.fill();
        }
      });
      // Nodes
      nPos.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8,9,12,0.9)'; ctx.fill();
        ctx.strokeStyle = n.color + '88'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = 'bold 7px system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + 23);
      });
      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position:     'relative',
        width:        '100%',
        border:       '1px solid rgba(245,158,11,0.13)',
        borderRadius: 16,
        background:   'rgba(255,255,255,0.015)',
        overflow:     'hidden',
        marginBottom: 28,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
