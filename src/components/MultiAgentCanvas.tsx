'use client';

import { useEffect, useRef } from 'react';

// ── Static definitions ──────────────────────────────────────────

const NODE_DEFS = [
  { id: 'ticket',     label: 'TICKET',     fx: 0.50, fy: 0.10, sides: 4, baseR: 18, rotation: Math.PI / 4 },
  { id: 'classifier', label: 'CLASSIFIER', fx: 0.20, fy: 0.52, sides: 6, baseR: 26, rotation: Math.PI / 6 },
  { id: 'responder',  label: 'RESPONDER',  fx: 0.50, fy: 0.82, sides: 6, baseR: 22, rotation: Math.PI / 6 },
  { id: 'escalation', label: 'ESCALATION', fx: 0.80, fy: 0.52, sides: 6, baseR: 26, rotation: Math.PI / 6 },
] as const;

const TRACE_DEFS: { id: string; waypoints: [number, number][] }[] = [
  {
    id: 'ticket-classifier',
    waypoints: [[0.5, 0.10], [0.5, 0.22], [0.28, 0.22], [0.2, 0.30], [0.2, 0.52]],
  },
  {
    id: 'classifier-escalation',
    waypoints: [[0.2, 0.52], [0.2, 0.38], [0.5, 0.38], [0.8, 0.38], [0.8, 0.52]],
  },
  {
    id: 'classifier-responder',
    waypoints: [[0.2, 0.52], [0.2, 0.68], [0.5, 0.68], [0.5, 0.82]],
  },
];

// ── Component ───────────────────────────────────────────────────

export function MultiAgentCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const labelsRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    const labelsDiv = labelsRef.current;
    if (!container || !canvas || !labelsDiv) return;

    const el = container as HTMLDivElement;
    const cv = canvas as HTMLCanvasElement;

    const ctxRaw = cv.getContext('2d');
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    // ── Mutable animation state ──

    type NodeAnim = {
      id: string; label: string;
      fx: number; fy: number; sides: number; baseR: number; rotation: number;
      glow: number; pulse: number; breath: number;
      state: 'idle' | 'active' | 'done';
      outputText: string;
    };
    type TraceAnim = {
      id: string; waypoints: [number, number][];
      progress: number | null;
      onComplete: (() => void) | null;
    };

    const nodes: Record<string, NodeAnim> = {};
    NODE_DEFS.forEach(d => {
      nodes[d.id] = {
        ...d,
        glow: 0, pulse: 0,
        breath: Math.random() * Math.PI * 2,
        state: 'idle',
        outputText: '',
      };
    });

    const traces: Record<string, TraceAnim> = {};
    TRACE_DEFS.forEach(d => {
      traces[d.id] = { ...d, progress: null, onComplete: null };
    });

    // ── Label DOM elements ──

    labelsDiv.innerHTML = '';

    const labelEls: Record<string, {
      div: HTMLDivElement;
      nameEl?:   HTMLElement;
      statusEl?: HTMLElement;
      outputEl?: HTMLElement;
    }> = {};

    // Ticket label
    const ticketDiv = document.createElement('div');
    ticketDiv.style.cssText = 'position:absolute;pointer-events:none;text-align:center;transform:translateX(-50%);';
    const ticketLine1 = document.createElement('div');
    ticketLine1.style.cssText = 'font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.25);font-family:system-ui;line-height:1.6;';
    ticketLine1.textContent = 'INCOMING';
    const ticketLine2 = document.createElement('div');
    ticketLine2.style.cssText = 'font-size:10px;font-style:italic;color:rgba(255,255,255,0.45);font-family:system-ui;white-space:nowrap;';
    ticketLine2.textContent = '"Payment failed, charged twice"';
    ticketDiv.appendChild(ticketLine1);
    ticketDiv.appendChild(ticketLine2);
    labelsDiv.appendChild(ticketDiv);
    labelEls['ticket'] = { div: ticketDiv };

    // Agent labels
    (['classifier', 'responder', 'escalation'] as const).forEach(id => {
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;pointer-events:none;text-align:center;transform:translateX(-50%);';

      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-family:system-ui;color:rgba(34,197,94,0.45);line-height:1.5;';
      nameEl.textContent = id.toUpperCase();

      const statusEl = document.createElement('div');
      statusEl.style.cssText = 'font-size:9px;font-family:system-ui;color:rgba(255,255,255,0.18);line-height:1.4;';
      statusEl.textContent = 'Ready';

      const outputEl = document.createElement('div');
      outputEl.style.cssText = 'font-size:10px;font-family:monospace;color:rgba(255,255,255,0.2);line-height:1.4;max-width:130px;word-break:break-word;';
      outputEl.textContent = '';

      d.appendChild(nameEl);
      d.appendChild(statusEl);
      d.appendChild(outputEl);
      labelsDiv.appendChild(d);
      labelEls[id] = { div: d, nameEl, statusEl, outputEl };
    });

    // ── Canvas sizing + label positioning ──

    let W = 0, H = 0;

    function resize() {
      const cw = el.offsetWidth;
      if (!cw) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ch  = Math.round(cw * 0.52);
      cv.width  = cw * dpr;
      cv.height = ch * dpr;
      cv.style.width  = cw + 'px';
      cv.style.height = ch + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = cw;
      H = ch;
      positionLabels();
    }

    function positionLabels() {
      if (!W || !H) return;
      const isMobile = W <= 768;
      const scale    = W / 600;
      const mobF     = isMobile ? 0.8 : 1;

      // Ticket — above
      const tn  = nodes['ticket'];
      const tx  = tn.fx * W;
      const ty  = tn.fy * H;
      const tR  = tn.baseR * scale * mobF;
      labelEls['ticket'].div.style.left = tx + 'px';
      labelEls['ticket'].div.style.top  = (ty - tR - 52) + 'px';
      const tChildren = labelEls['ticket'].div.children;
      if (tChildren[0]) (tChildren[0] as HTMLElement).style.fontSize = isMobile ? '8px' : '9px';
      if (tChildren[1]) (tChildren[1] as HTMLElement).style.fontSize = isMobile ? '9px' : '10px';

      // Agents — below (+38px from node center)
      (['classifier', 'responder', 'escalation'] as const).forEach(id => {
        const n  = nodes[id];
        const nx = n.fx * W;
        const ny = n.fy * H;
        const nr = n.baseR * scale * mobF;
        const le = labelEls[id];
        le.div.style.left = nx + 'px';
        le.div.style.top  = (ny + nr + 38) + 'px';
        if (le.nameEl)   le.nameEl.style.fontSize   = isMobile ? '9px'  : '10px';
        if (le.statusEl) le.statusEl.style.fontSize = isMobile ? '8px'  : '9px';
        if (le.outputEl) le.outputEl.style.fontSize = isMobile ? '9px'  : '10px';
      });
    }

    function updateLabelState(id: string) {
      const n  = nodes[id];
      const le = labelEls[id];
      if (!le?.nameEl || !le.statusEl || !le.outputEl) return;
      const isActive = n.state === 'active';
      const isDone   = n.state === 'done';
      le.nameEl.style.color   = isActive ? 'rgba(34,197,94,0.95)' : 'rgba(34,197,94,0.45)';
      le.statusEl.textContent = isDone ? 'Done' : isActive ? 'Processing' : 'Ready';
      le.statusEl.style.color = isDone
        ? 'rgba(34,197,94,0.4)'
        : isActive
          ? 'rgba(34,197,94,0.65)'
          : 'rgba(255,255,255,0.18)';
      le.outputEl.style.color = isActive ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.2)';
    }

    // ── Draw helpers ──

    function drawGrid() {
      if (!W || !H) return;
      const spacing = W / 20;
      ctx.strokeStyle = 'rgba(34,197,94,0.04)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      for (let x = 0; x <= W; x += spacing) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 0; y <= H; y += spacing) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
    }

    function segLengths(pts: [number, number][]): number[] {
      return pts.slice(1).map((p, i) => {
        const dx = p[0] - pts[i][0], dy = p[1] - pts[i][1];
        return Math.sqrt(dx * dx + dy * dy);
      });
    }

    function strokePath(pts: [number, number][], style: string, lw: number) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
      ctx.strokeStyle = style;
      ctx.lineWidth   = lw;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.setLineDash([]);
      ctx.stroke();
    }

    function drawAllTraces() {
      Object.values(traces).forEach(tr => {
        const pts: [number, number][] = tr.waypoints.map(([fx, fy]) => [fx * W, fy * H]);

        // Static trace (always visible)
        strokePath(pts, 'rgba(34,197,94,0.15)', 4);
        strokePath(pts, 'rgba(34,197,94,0.5)',  1.5);

        // Corner dots at intermediate waypoints
        pts.slice(1, -1).forEach(p => {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34,197,94,0.4)';
          ctx.fill();
        });

        // Active animation
        if (tr.progress !== null && tr.progress > 0) {
          const segs     = segLengths(pts);
          const totalLen = segs.reduce((s, l) => s + l, 0);
          const target   = totalLen * Math.min(tr.progress, 1);
          let   covered  = 0;
          let   leadX    = pts[0][0], leadY = pts[0][1];
          const tPts: [number, number][] = [[pts[0][0], pts[0][1]]];

          for (let i = 0; i < segs.length; i++) {
            if (covered + segs[i] >= target) {
              const t = (target - covered) / segs[i];
              leadX = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t;
              leadY = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
              tPts.push([leadX, leadY]);
              break;
            }
            tPts.push([pts[i + 1][0], pts[i + 1][1]]);
            covered += segs[i];
          }

          if (tPts.length >= 2) {
            strokePath(tPts, 'rgba(34,197,94,0.5)',  6);
            strokePath(tPts, 'rgba(34,197,94,1.0)',  2);
          }

          // Leading edge
          ctx.beginPath(); ctx.arc(leadX, leadY, 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34,197,94,0.15)'; ctx.fill();
          ctx.beginPath(); ctx.arc(leadX, leadY, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34,197,94,1.0)';  ctx.fill();
        }
      });
    }

    function polygon(cx: number, cy: number, r: number, sides: number, rot: number) {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = rot + (i * Math.PI * 2) / sides;
        i === 0
          ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
          : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath();
    }

    function drawAllNodes() {
      if (!W || !H) return;
      Object.values(nodes).forEach(n => {
        const scale  = W / 600;
        const mobF   = W <= 768 ? 0.8 : 1;
        const bScale = 1 + 0.03 * Math.sin(n.breath);
        const x = n.fx * W, y = n.fy * H;
        const r = n.baseR * scale * mobF * bScale;
        const isActive = n.state !== 'idle';

        // Outer glow
        if (n.glow > 0.01) {
          const glowR = r + n.glow * 45 * scale;
          const grad  = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowR);
          grad.addColorStop(0, `rgba(34,197,94,${n.glow * 0.18})`);
          grad.addColorStop(1, 'rgba(34,197,94,0)');
          ctx.beginPath(); ctx.arc(x, y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grad; ctx.fill();
        }

        // Pulse ring
        if (n.pulse > 0 && n.pulse < 1) {
          ctx.beginPath();
          ctx.arc(x, y, r + n.pulse * 60 * scale * mobF, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(34,197,94,${(1 - n.pulse) * 0.55})`;
          ctx.lineWidth = 1.5; ctx.setLineDash([]); ctx.stroke();
        }

        // Polygon body
        polygon(x, y, r, n.sides, n.rotation);
        ctx.fillStyle = isActive
          ? `rgba(34,197,94,${0.12 + n.glow * 0.08})`
          : 'rgba(34,197,94,0.04)';
        ctx.fill();
        ctx.strokeStyle = isActive
          ? `rgba(34,197,94,${0.6 + n.glow * 0.4})`
          : `rgba(34,197,94,${0.2 + Math.sin(n.breath) * 0.06})`;
        ctx.lineWidth = isActive ? 2 : 1.2;
        ctx.setLineDash([]); ctx.stroke();

        // Center pad
        ctx.beginPath(); ctx.arc(x, y, 2.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? 'rgba(34,197,94,0.9)' : 'rgba(34,197,94,0.3)';
        ctx.fill();

        // Mounting pads (hexagons only)
        if (n.sides === 6) {
          for (let i = 0; i < 6; i++) {
            const a  = n.rotation + (i * Math.PI * 2) / 6;
            const px = x + r * 0.72 * Math.cos(a);
            const py = y + r * 0.72 * Math.sin(a);
            ctx.beginPath(); ctx.arc(px, py, 1.5 * scale, 0, Math.PI * 2);
            ctx.fillStyle = isActive ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.15)';
            ctx.fill();
          }
        }
      });
    }

    // ── Animation loop ──

    let raf      = 0;
    let lastTime = 0;

    function loop(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime  = now;

      // Update node animations
      Object.values(nodes).forEach(n => {
        n.breath += dt * 0.8;
        if (n.glow   > 0) n.glow   = Math.max(0, n.glow - dt * 0.6);
        if (n.pulse  > 0) {
          n.pulse += dt * 0.9;
          if (n.pulse >= 1) n.pulse = 0;
        }
      });

      // Update trace animations
      Object.values(traces).forEach(tr => {
        if (tr.progress !== null) {
          tr.progress += dt * 1.1;
          if (tr.progress >= 1) {
            tr.progress = null;
            const cb = tr.onComplete;
            tr.onComplete = null;
            if (cb) cb();
          }
        }
      });

      // Render
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#04060a';
      ctx.fillRect(0, 0, W, H);
      drawGrid();
      drawAllTraces();
      drawAllNodes();

      raf = requestAnimationFrame(loop);
    }

    // ── Sequence controller ──

    const timers:    ReturnType<typeof setTimeout>[]  = [];
    const ivals:     ReturnType<typeof setInterval>[] = [];
    let   alive = true;

    function T(fn: () => void, ms: number) {
      const t = setTimeout(() => { if (alive) fn(); }, ms);
      timers.push(t);
    }

    function typeOutput(id: string, text: string, speed: number, onDone: () => void) {
      let i = 0;
      nodes[id].outputText = '';
      const le = labelEls[id];
      if (le?.outputEl) le.outputEl.textContent = '';
      const iv = setInterval(() => {
        if (!alive) { clearInterval(iv); return; }
        i++;
        nodes[id].outputText = text.slice(0, i);
        if (le?.outputEl) le.outputEl.textContent = nodes[id].outputText;
        if (i >= text.length) {
          clearInterval(iv);
          const idx = ivals.indexOf(iv);
          if (idx !== -1) ivals.splice(idx, 1);
          onDone();
        }
      }, speed);
      ivals.push(iv);
    }

    function clearOutput(id: string) {
      nodes[id].outputText = '';
      const le = labelEls[id];
      if (le?.outputEl) le.outputEl.textContent = '';
    }

    function runSequence() {
      // Reset all nodes
      Object.values(nodes).forEach(n => {
        n.state = 'idle'; n.glow = 0; n.pulse = 0;
        clearOutput(n.id);
        updateLabelState(n.id);
      });
      // Reset all traces
      Object.values(traces).forEach(tr => { tr.progress = null; tr.onComplete = null; });

      // Step 1 — 400ms: activate ticket
      T(() => {
        nodes['ticket'].state = 'active';
        nodes['ticket'].glow  = 0.7;
        nodes['ticket'].pulse = 0.01;

        // Step 2 — 600ms: start ticket→classifier trace
        T(() => {
          traces['ticket-classifier'].progress   = 0;
          traces['ticket-classifier'].onComplete = () => {

            // Step 3: fire classifier
            nodes['classifier'].state = 'active';
            nodes['classifier'].glow  = 1;
            nodes['classifier'].pulse = 0.01;
            updateLabelState('classifier');

            typeOutput('classifier', 'URGENT — billing issue, double charge. HIGH', 28, () => {

              // Step 4: classifier done, wait 500ms
              nodes['classifier'].state = 'done';
              updateLabelState('classifier');

              T(() => {
                // Step 5: start classifier→escalation trace
                traces['classifier-escalation'].progress   = 0;
                traces['classifier-escalation'].onComplete = () => {

                  // Step 6: classifier→idle, fire escalation
                  nodes['classifier'].state = 'idle';
                  clearOutput('classifier');
                  updateLabelState('classifier');

                  nodes['escalation'].state = 'active';
                  nodes['escalation'].glow  = 1;
                  nodes['escalation'].pulse = 0.01;
                  updateLabelState('escalation');

                  typeOutput('escalation', 'Escalation brief: billing team, 2hr review', 25, () => {

                    // Step 7: escalation done, wait 2800ms
                    nodes['escalation'].state = 'done';
                    updateLabelState('escalation');

                    T(() => {
                      // Step 8: reset ticket + escalation, wait 1800ms
                      nodes['escalation'].state = 'idle';
                      nodes['ticket'].state     = 'idle';
                      nodes['ticket'].glow      = 0;
                      clearOutput('escalation');
                      updateLabelState('escalation');

                      T(() => runSequence(), 1800); // Step 9: loop
                    }, 2800);
                  });
                };
              }, 500);
            });
          };
        }, 600);
      }, 400);
    }

    // ── Start ──

    resize();
    raf = requestAnimationFrame((now) => {
      lastTime = now;
      raf = requestAnimationFrame(loop);
    });

    // Start sequence after a frame to ensure canvas is sized
    const startTimer = setTimeout(() => { if (alive) runSequence(); }, 100);
    timers.push(startTimer);

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      ivals.forEach(clearInterval);
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
      <div
        ref={labelsRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
