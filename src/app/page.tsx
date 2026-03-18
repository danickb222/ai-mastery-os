"use client";
// rebuild

import { useEffect, useRef, useState } from "react";
import { DiagnosticTerminal } from "@/components/DiagnosticTerminal";
import { MultiAgentCanvas } from "@/components/MultiAgentCanvas";


const DOMAINS_DATA = [
  { num: '01', title: 'Prompt Engineering', desc: 'Write prompts that produce consistent, professional outputs across every model.', tier: 'FOUNDATIONAL' },
  { num: '02', title: 'System Prompts', desc: 'Design system prompts that enforce behavior, tone, and constraints reliably.', tier: 'FOUNDATIONAL' },
  { num: '03', title: 'Reasoning Chains', desc: 'Build chains of thought that solve complex problems step by step.', tier: 'ADVANCED' },
  { num: '04', title: 'Output Control', desc: 'Get exactly the format, length, and structure you need every time.', tier: 'FOUNDATIONAL' },
  { num: '05', title: 'AI Workflows', desc: "Chain AI calls into repeatable, production-grade pipelines that don't break.", tier: 'ADVANCED' },
  { num: '06', title: 'Context Management', desc: 'Master context windows, memory, and state across long sessions.', tier: 'ADVANCED' },
  { num: '07', title: 'Role Prompting', desc: 'Set precise personas and behavioral profiles. The difference between a toy and a specialist.', tier: 'ADVANCED' },
  { num: '08', title: 'Data Extraction', desc: 'Pull structured data from unstructured text reliably and at scale.', tier: 'ADVANCED' },
  { num: '09', title: 'AI Evaluation', desc: 'Score and compare AI outputs programmatically. Build evals that work.', tier: 'ADVANCED' },
  { num: '10', title: 'Tool Ecosystem', desc: 'Integrate AI with real tools — APIs, databases, code interpreters.', tier: 'FOUNDATIONAL' },
  { num: '11', title: 'Multi-Agent Systems', desc: "Orchestrate networks of agents that collaborate and produce results humans can't match alone.", tier: 'EXPERT' },
  { num: '12', title: 'Ethics & Risk', desc: 'Understand where AI fails and how to operate responsibly at professional scale.', tier: 'ADVANCED' },
];

const COMP_ROWS: { feature: string; dojo: 'yes'; udemy: 'yes'|'no'|'partial'; udemyNote?: string; yt: 'yes'|'no'|'partial'; ytNote?: string }[] = [
  { feature: 'Hands-on scored drills',          dojo: 'yes', udemy: 'no',                            yt: 'no' },
  { feature: 'AI-graded rubric feedback',       dojo: 'yes', udemy: 'no',                            yt: 'no' },
  { feature: 'Measurable skill score',          dojo: 'yes', udemy: 'partial', udemyNote: 'Quiz %',  yt: 'no' },
  { feature: 'Weakness & gap analysis',         dojo: 'yes', udemy: 'no',                            yt: 'no' },
  { feature: 'Progressive difficulty tiers',     dojo: 'yes', udemy: 'no',                            yt: 'no' },
  { feature: 'Deliberate practice loops',       dojo: 'yes', udemy: 'partial', udemyNote: 'Quizzes', yt: 'no' },
  { feature: 'Proof of real ability',           dojo: 'yes', udemy: 'partial', udemyNote: 'Certificate', yt: 'no' },
  { feature: 'Results in under 10 minutes',     dojo: 'yes', udemy: 'no',                            yt: 'no' },
];

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

export default function Dashboard() {
  const isMobile = useIsMobile();
  const [scrollHidden, setScrollHidden] = useState(false);

  // ── Scroll indicator — disappear on first scroll ──
  useEffect(() => {
    const hide = () => setScrollHidden(true);
    window.addEventListener('scroll', hide, { passive: true, once: true } as EventListenerOptions);
    return () => window.removeEventListener('scroll', hide);
  }, []);

  // ── All landing page JS behaviors ──
  useEffect(() => {
    const WORDS = [
      'founders.','builders.','students.','starters.','creators.',
      'pioneers.','hustlers.','strivers.','explorers.',
      'learners.','seekers.','achievers.','tinkerers.','operators.',
      'doers.','makers.','students.','teachers.'
    ];

    const s = document.createElement('style');
    s.textContent = [
      '@keyframes cblink{0%,100%{opacity:1}50%{opacity:0}}',
      '@keyframes ring-pulse{0%{opacity:0.6;transform:scale(1)}100%{opacity:0;transform:scale(1.08)}}',
      '@keyframes scroll-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}',
      '@keyframes amber-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.75)}}',
      '@keyframes drift{from{transform:translateX(0)}to{transform:translateX(-50%)}}',
    ].join('');
    document.head.appendChild(s);

    // ── Three.js WebGL hero shader ──
    function initHeroCanvas() {
      const container = document.getElementById('hero-shader');
      if (!container || !(window as any).THREE) return;
      const THREE = (window as any).THREE;

      const camera = new THREE.Camera();
      camera.position.z = 1;
      const scene = new THREE.Scene();
      const geometry = new THREE.PlaneBufferGeometry(2, 2);

      const uniforms = {
        time:       { type: 'f',  value: 1.0 },
        resolution: { type: 'v2', value: new THREE.Vector2() },
        mouseX:     { type: 'f',  value: 0.5 },
        mouseY:     { type: 'f',  value: 0.5 }
      };

      const vertexShader = [
        'void main() {',
        '  gl_Position = vec4(position, 1.0);',
        '}'
      ].join('\n');

      const fragmentShader = [
        '#define TWO_PI 6.2831853072',
        '#define PI 3.14159265359',
        'precision highp float;',
        'uniform vec2 resolution;',
        'uniform float time;',
        'uniform float mouseX;',
        'uniform float mouseY;',
        'float random(in float x){ return fract(sin(x)*1e4); }',
        'float random(vec2 st){ return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }',
        'void main(void) {',
        '  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);',
        '  uv += vec2(mouseX - 0.5, mouseY - 0.5) * 0.08;',
        '  vec2 fMosaicScal = vec2(3.5, 1.8);',
        '  vec2 vScreenSize = vec2(320.0, 320.0);',
        '  uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);',
        '  uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);',
        '  float t = time * 0.055 + random(uv.x) * 0.38;',
        '  float lineWidth = 0.00075;',
        '  vec3 color = vec3(0.0);',
        '  for(int j = 0; j < 3; j++){',
        '    for(int i = 0; i < 5; i++){',
        '      color[j] += lineWidth * float(i*i) / abs(fract(t - 0.01*float(j) + float(i)*0.01)*1.0 - length(uv));',
        '    }',
        '  }',
        '  float r = color[2] * 0.05;',
        '  float g = color[1] * 0.78 + color[2] * 0.3;',
        '  float b = color[0] * 0.55 + color[1] * 0.6 + color[2] * 0.5;',
        '  gl_FragColor = vec4(r, g, b, 1.0);',
        '}'
      ].join('\n');

      const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const resize = () => {
        const rect = container.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        uniforms.resolution.value.x = renderer.domElement.width;
        uniforms.resolution.value.y = renderer.domElement.height;
      };
      resize();
      window.addEventListener('resize', resize);

      const onMouseMove = (e: MouseEvent) => {
        uniforms.mouseX.value += (e.clientX / window.innerWidth  - uniforms.mouseX.value) * 0.04;
        uniforms.mouseY.value += (e.clientY / window.innerHeight - uniforms.mouseY.value) * 0.04;
      };
      window.addEventListener('mousemove', onMouseMove);

      const animate = () => {
        requestAnimationFrame(animate);
        uniforms.time.value += 0.05;
        renderer.render(scene, camera);
      };
      animate();
    }

    function initWordSwitcher() {
      const wrap = document.getElementById('wswrap');
      const slotA = document.getElementById('wsA');
      const slotB = document.getElementById('wsB');
      if (!wrap || !slotA || !slotB) return;

      const shuffled = [...WORDS].sort(() => Math.random() - .5);
      let idx = 0;
      let active: HTMLElement = slotA;
      let standby: HTMLElement = slotB;

      const heroH = document.querySelector('.hero-h') as HTMLElement;
      const cs = getComputedStyle(heroH);
      const probe = document.createElement('span');
      probe.style.cssText = [
        'position:fixed','top:0','left:0',
        'visibility:hidden','pointer-events:none',
        'font-family:' + cs.fontFamily,
        'font-size:'   + cs.fontSize,
        'font-style:italic',
        'line-height:' + cs.lineHeight,
        'letter-spacing:' + cs.letterSpacing,
        'white-space:nowrap'
      ].join(';');
      document.body.appendChild(probe);

      probe.textContent = 'operators.';
      const lineH = probe.getBoundingClientRect().height;
      const clipH = Math.ceil(lineH * 1.32);

      let maxW = 0;
      shuffled.forEach(w => {
        probe.textContent = w;
        const bw = probe.getBoundingClientRect().width;
        if (bw > maxW) maxW = bw;
      });
      document.body.removeChild(probe);

      wrap.style.width    = Math.ceil(maxW) + 'px';
      wrap.style.height   = clipH + 'px';
      wrap.style.position = 'relative';
      wrap.style.overflow = 'hidden';

      // Both slots stacked at the same position — pure opacity sequential crossfade
      [slotA, slotB].forEach(s => {
        s.style.position   = 'absolute';
        s.style.top        = '0';
        s.style.left       = '0';
        s.style.width      = '100%';
        s.style.transition = 'none';
        s.style.transform  = 'none';
      });

      active.textContent    = shuffled[0];
      active.style.opacity  = '1';
      standby.style.opacity = '0';

      setInterval(() => {
        idx = (idx + 1) % shuffled.length;

        // Phase 1 (200ms): outgoing word fully fades to opacity 0
        active.style.transition = 'opacity 200ms ease-out';
        active.style.opacity    = '0';

        setTimeout(() => {
          // Set incoming word while nothing is visible
          standby.textContent      = shuffled[idx];
          standby.style.transition = 'none';
          standby.style.opacity    = '0';

          requestAnimationFrame(() => {
            // Phase 2 (200ms): incoming word fades in
            standby.style.transition = 'opacity 200ms ease-out';
            standby.style.opacity    = '1';
            [active, standby] = [standby, active];
          });
        }, 200);
      }, 2500);
    }

    function revealId(id: string, dur = .7) {
      const el = document.getElementById(id); if (!el) return;
      el.style.transition = `opacity ${dur}s cubic-bezier(0,0,.2,1),transform ${dur}s cubic-bezier(0,0,.2,1)`;
      el.style.opacity = '1'; el.style.transform = 'translateY(0)';
    }

    function animateNumber(id: string, from: number, to: number, dur: number) {
      const el = document.getElementById(id); if (!el) return;
      const start = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = String(Math.floor(from + ease(p) * (to - from)));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = String(to);
      };
      requestAnimationFrame(tick);
    }

    function startHero() {
      const hline1 = document.getElementById('hline1');
      if (hline1) hline1.textContent = 'The AI gym for';
      const l2 = document.getElementById('hline2');
      if (l2) { l2.style.transition = 'opacity .3s ease'; l2.style.opacity = '1'; }
      initWordSwitcher();
      setTimeout(() => revealId('hsub', .75), 80);
      setTimeout(() => revealId('hbtns', .75), 176);
    }

    function initDriftCarousel() {
      const inner = document.getElementById('feat-drift') as HTMLElement | null;
      const outer = document.getElementById('feat-wrap') as HTMLElement | null;
      if (!inner || !outer) return;
      const totalCards = inner.children.length;
      const origCards = totalCards / 2;
      const duration = Math.max(20, origCards * 2.5);
      inner.style.animation = `drift ${duration}s linear infinite`;
      outer.style.cursor = 'grab';
      outer.style.overflowX = 'auto';
      // Pause/resume on hover
      outer.addEventListener('mouseenter', () => { inner.style.animationPlayState = 'paused'; });
      outer.addEventListener('mouseleave', () => {
        if (!isDown) { inner.style.animationPlayState = 'running'; outer.style.cursor = 'grab'; }
      });
      outer.addEventListener('touchstart', () => { inner.style.animationPlayState = 'paused'; }, { passive: true });
      outer.addEventListener('touchend', () => { setTimeout(() => { inner.style.animationPlayState = 'running'; }, 1500); });
      // Mouse drag
      let isDown = false, startX = 0, scrollLeft = 0;
      outer.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - outer.offsetLeft;
        scrollLeft = outer.scrollLeft;
        outer.style.cursor = 'grabbing';
        inner.style.animationPlayState = 'paused';
      });
      outer.addEventListener('mouseup', () => {
        isDown = false;
        outer.style.cursor = 'grab';
        setTimeout(() => { inner.style.animationPlayState = 'running'; }, 1000);
      });
      outer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - outer.offsetLeft;
        outer.scrollLeft = scrollLeft - (x - startX) * 2;
      });
    }

    // ── Multi-agent carousel card canvas ──
    function initMultiAgentCanvas(canvas: HTMLCanvasElement): () => void {
      const ctxRaw = canvas.getContext('2d');
      if (!ctxRaw) return () => {};
      const ctx: CanvasRenderingContext2D = ctxRaw;
      const t0 = performance.now();
      let rafId = 0;
      function resize() {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      const ndefs = [
        { nx: 0.50, ny: 0.24, label: 'Classifier', color: '#f59e0b' },
        { nx: 0.18, ny: 0.78, label: 'Responder',  color: '#22c55e' },
        { nx: 0.82, ny: 0.78, label: 'Escalation', color: '#60a5fa' },
      ];
      function draw(now: number) {
        const rect = canvas.getBoundingClientRect();
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
      return () => cancelAnimationFrame(rafId);
    }

    // ── Sparse green particle background ──
    function initParticles(canvasId: string): () => void {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
      if (!canvas) return () => {};
      const ctxRaw = canvas.getContext('2d');
      if (!ctxRaw) return () => {};
      const ctx: CanvasRenderingContext2D = ctxRaw;
      let rafId = 0;
      type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number };
      let particles: Particle[] = [];
      function spawn(W: number, H: number): Particle[] {
        const count = Math.max(4, Math.floor(W * H / 20000));
        return Array.from({ length: count }, () => ({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.4 + 0.5,
          alpha: 0.12 + Math.random() * 0.08,
        }));
      }
      function resize() {
        const rect = canvas!.getBoundingClientRect();
        if (!rect.width) return;
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvas!.width = rect.width * dpr;
        canvas!.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        particles = spawn(rect.width, rect.height);
      }
      resize();
      window.addEventListener('resize', resize);
      function draw() {
        const rect = canvas!.getBoundingClientRect();
        const W = rect.width, H = rect.height;
        if (!W || !H) { rafId = requestAnimationFrame(draw); return; }
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        });
        // Connection lines
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(34,197,94,${(1 - d / 120) * 0.06})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
        // Dots
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34,197,94,${p.alpha})`;
          ctx.fill();
        });
        rafId = requestAnimationFrame(draw);
      }
      rafId = requestAnimationFrame(draw);
      return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
    }


    // Load Three.js
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js';
    threeScript.onload = () => {};
    document.head.appendChild(threeScript);

    const page = document.getElementById('page');
    if (page) page.classList.add('show');
    if ((window as any).THREE) {
      initHeroCanvas();
    } else {
      const tCheck = setInterval(() => {
        if ((window as any).THREE) { clearInterval(tCheck); initHeroCanvas(); }
      }, 50);
    }
    initDriftCarousel();

    // Init multi-agent carousel card canvases
    const maCanvasCleanups: (() => void)[] = [];
    document.querySelectorAll('.ma-canvas').forEach(cv => {
      const cleanup = initMultiAgentCanvas(cv as HTMLCanvasElement);
      maCanvasCleanups.push(cleanup);
    });


    // Particle backgrounds — Why section
    let whyParticlesCleanup: (() => void) | null = null;
    let whyParticlesObs: IntersectionObserver | null = null;
    const whySect = document.getElementById('why');
    if (whySect) {
      whyParticlesObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !whyParticlesCleanup) {
            whyParticlesCleanup = initParticles('why-particles');
            whyParticlesObs!.disconnect();
          }
        });
      }, { threshold: 0.05 });
      whyParticlesObs.observe(whySect);
    }

    // Particle backgrounds — CTA section
    let ctaParticlesCleanup: (() => void) | null = null;
    let ctaParticlesObs: IntersectionObserver | null = null;
    const ctaSectForParticles = document.getElementById('cta');
    if (ctaSectForParticles) {
      ctaParticlesObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !ctaParticlesCleanup) {
            ctaParticlesCleanup = initParticles('cta-particles');
            ctaParticlesObs!.disconnect();
          }
        });
      }, { threshold: 0.05 });
      ctaParticlesObs.observe(ctaSectForParticles);
    }

    // Domain card hover states
    document.querySelectorAll('.fcard').forEach(card => {
      const el = card as HTMLElement;
      const isLive = (el.style.border || '').includes('34,197,94');
      const origBorder = el.style.border;
      const origTransform = el.style.transform || '';
      el.style.transition = 'transform 0.2s ease, border-color 0.2s ease, border 0.2s ease, opacity 0.2s ease';
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'translateY(-3px) scale(1.01)';
        if (isLive) {
          el.style.borderColor = 'rgba(34,197,94,0.45)';
        } else {
          el.style.border = '1px solid rgba(255,255,255,0.15)';
        }
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = origTransform;
        if (isLive) {
          el.style.borderColor = 'rgba(34,197,94,0.25)';
        } else {
          el.style.border = origBorder;
        }
      });
    });

    startHero();

    // Scroll progress bar
    const handleScroll = () => {
      const bar = document.getElementById('bar');
      if (bar) bar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Generic .rv reveal — excludes h2.sh which get their own threshold-0.3 observer below
    const rvEls = document.querySelectorAll('.rv:not(h2.sh)');
    const rvObservers: IntersectionObserver[] = [];
    rvEls.forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
      }, { threshold: .08, rootMargin: '-20px' });
      obs.observe(el);
      rvObservers.push(obs);
    });

    // Section headline IO — threshold 0.3, anim-hidden → anim-visible
    const headlineEls = document.querySelectorAll('h2.sh');
    const headlineObs: IntersectionObserver[] = [];
    headlineEls.forEach(h => {
      (h as HTMLElement).classList.add('anim-hidden');
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('anim-visible');
            (e.target as HTMLElement).classList.add('vis');
            obs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      obs.observe(h);
      headlineObs.push(obs);
    });

    // .div sweep
    const divEls = document.querySelectorAll('.div');
    const divObservers: IntersectionObserver[] = [];
    divEls.forEach(d => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) setTimeout(() => d.classList.add('swept'), 50); });
      }, { threshold: .5 });
      obs.observe(d);
      divObservers.push(obs);
    });


    // Why pillars: fade-up anim-hidden → anim-visible with stagger
    const pillarsEl = document.querySelector('.why-pillars');
    let pillarsObs: IntersectionObserver | null = null;
    if (pillarsEl) {
      const pillars = pillarsEl.querySelectorAll('.pillar');
      // Set initial hidden state (override CSS translate-from-corners)
      pillars.forEach(p => {
        const el = p as HTMLElement;
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
      });
      pillarsObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const ps = pillarsEl.querySelectorAll('.pillar');
            const delays = [0, 100, 200, 300];
            ps.forEach((p, i) => {
              setTimeout(() => {
                const el = p as HTMLElement;
                el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, delays[i]);
            });
            pillarsObs!.disconnect();
          }
        });
      }, { threshold: 0.2 });
      pillarsObs.observe(pillarsEl);

      // Pillar hover states
      pillars.forEach(p => {
        const el = p as HTMLElement;
        const isTr = el.classList.contains('tr');
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'translateY(-2px)';
          if (isTr) {
            el.style.borderColor = 'rgba(34,197,94,0.4)';
          } else {
            el.style.borderColor = 'rgba(255,255,255,0.15)';
          }
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'translateY(0)';
          el.style.borderColor = isTr ? 'rgba(34,197,94,0.2)' : '';
        });
      });
    }

    // Bento cards appear + score animation
    const bcards = document.querySelectorAll('.bcard');
    const bcardObs: IntersectionObserver[] = [];
    let bentoFired = false;
    bcards.forEach((card, i) => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => {
              card.classList.add('appeared');
              if (card.classList.contains('wide') && !bentoFired) {
                bentoFired = true;
                animateNumber('bento-score', 0, 85, 1200);
                const fills = card.querySelectorAll('.bc-bar-fill') as NodeListOf<HTMLElement>;
                const vals = [85, 0, 0, 0, 0];
                const barDelays = [200, 350, 500, 650, 800];
                fills.forEach((fill, fi) => {
                  setTimeout(() => {
                    fill.style.transition = 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)';
                    fill.style.width = vals[fi] + '%';
                  }, barDelays[fi]);
                });
                // Proficient badge fades in last
                const rankEl = card.querySelector('.bc-ls-rank') as HTMLElement | null;
                if (rankEl) {
                  rankEl.style.opacity = '0';
                  rankEl.style.transition = 'none';
                  setTimeout(() => {
                    rankEl.style.transition = 'opacity 300ms ease';
                    rankEl.style.opacity = '1';
                  }, 1000);
                }
              }
            }, i * 70);
            obs.disconnect();
          }
        });
      }, { threshold: .12 });
      obs.observe(card);
      bcardObs.push(obs);
    });

    // Feature cards appear
    const fcards = document.querySelectorAll('.fcard');
    const fcardObs: IntersectionObserver[] = [];
    fcards.forEach((card, i) => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => card.classList.add('appeared'), i * 70);
            obs.disconnect();
          }
        });
      }, { threshold: .08 });
      obs.observe(card);
      fcardObs.push(obs);
    });

    // Comparison table — single observer: rows reveal, then checkmark spring + ✗ fade
    const ctBodyEl = document.querySelector('.ct-body');
    const ctObs: IntersectionObserver[] = [];
    if (ctBodyEl) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;

          // Reveal all rows immediately
          ctBodyEl.querySelectorAll('.ct-row').forEach(r => r.classList.add('vis'));

          // ✓ checkmarks: scale(0)→scale(1) spring bounce, 40ms stagger
          let delay = 0;
          ctBodyEl.querySelectorAll('.ct-check.ct-yes').forEach(el => {
            const h = el as HTMLElement;
            h.style.display = 'inline-flex';
            h.style.transform = 'scale(0)';
            h.style.transition = 'none';
            const d = delay;
            requestAnimationFrame(() => {
              setTimeout(() => {
                h.style.transition = 'transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1)';
                h.style.transform = 'scale(1)';
              }, d);
            });
            delay += 40;
          });

          // ✗ icons: opacity 0→0.5 simultaneously (subtle)
          ctBodyEl.querySelectorAll('.ct-check.ct-no').forEach(el => {
            const h = el as HTMLElement;
            h.style.opacity = '0';
            h.style.transition = 'none';
            requestAnimationFrame(() => {
              h.style.transition = 'opacity 300ms ease';
              h.style.opacity = '0.5';
            });
          });

          obs.disconnect();
        });
      }, { threshold: 0.1 });
      obs.observe(ctBodyEl);
      ctObs.push(obs);
    }

    // ── Lamp canvas animation ──
    let lampRaf = 0;
    function initLampCanvas() {
      const canvas = document.getElementById('lamp-canvas') as HTMLCanvasElement | null;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      function resize() {
        const rect = canvas!.getBoundingClientRect();
        canvas!.width  = rect.width  * window.devicePixelRatio;
        canvas!.height = rect.height * window.devicePixelRatio;
        ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      resize();
      window.addEventListener('resize', resize);
      const t0 = performance.now();
      function drawLamp(now: number) {
        const rect = canvas!.getBoundingClientRect();
        const W = rect.width, H = rect.height;
        ctx!.clearRect(0, 0, W, H);
        const t = (now - t0) / 1000;
        const angle = (Math.PI / 12) * Math.sin(t * 0.55); // ±15°
        const cx = W / 2;
        const beamLen = H * 1.1;
        const ex = cx + Math.sin(angle) * beamLen;
        const ey = H + Math.cos(angle) * beamLen * 0.1;
        const grad = ctx!.createRadialGradient(cx, -20, 0, cx, -20, beamLen);
        grad.addColorStop(0,   'rgba(0,212,255,0.18)');
        grad.addColorStop(0.4, 'rgba(0,212,255,0.06)');
        grad.addColorStop(1,   'rgba(0,212,255,0)');
        ctx!.beginPath();
        ctx!.moveTo(cx - 30, 0);
        ctx!.lineTo(cx + 30, 0);
        ctx!.lineTo(ex + 80, ey);
        ctx!.lineTo(ex - 80, ey);
        ctx!.closePath();
        ctx!.fillStyle = grad;
        ctx!.fill();
        // Pulsing source glow
        const pulse = 0.6 + 0.4 * Math.sin(t * 1.8);
        const glow = ctx!.createRadialGradient(cx, 0, 0, cx, 0, 60);
        glow.addColorStop(0,   `rgba(0,212,255,${0.25 * pulse})`);
        glow.addColorStop(1,   'rgba(0,212,255,0)');
        ctx!.beginPath();
        ctx!.arc(cx, 0, 60, 0, Math.PI * 2);
        ctx!.fillStyle = glow;
        ctx!.fill();
        lampRaf = requestAnimationFrame(drawLamp);
      }
      lampRaf = requestAnimationFrame(drawLamp);
    }

    // Init lamp when CTA section comes into view
    const ctaSect = document.getElementById('cta');
    let lampObs: IntersectionObserver | null = null;
    if (ctaSect) {
      lampObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { initLampCanvas(); lampObs!.disconnect(); }
        });
      }, { threshold: 0.1 });
      lampObs.observe(ctaSect);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      rvObservers.forEach(o => o.disconnect());
      headlineObs.forEach(o => o.disconnect());
      divObservers.forEach(o => o.disconnect());
      bcardObs.forEach(o => o.disconnect());
      fcardObs.forEach(o => o.disconnect());
      ctObs.forEach(o => o.disconnect());
      if (pillarsObs) pillarsObs.disconnect();
      if (lampObs)    lampObs.disconnect();
      if (lampRaf)    cancelAnimationFrame(lampRaf);
      maCanvasCleanups.forEach(c => c());
      if (whyParticlesObs)   whyParticlesObs.disconnect();
      if (whyParticlesCleanup) whyParticlesCleanup();
      if (ctaParticlesObs)   ctaParticlesObs.disconnect();
      if (ctaParticlesCleanup) ctaParticlesCleanup();
      const driftEl = document.getElementById('feat-drift');
      if (driftEl) driftEl.style.animation = 'none';
    };
  }, []);

  const scrollToCta = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper: tier badge class
  const tierClass = (tier: string) =>
    tier === 'FOUNDATIONAL' ? 'badge-foundational' :
    tier === 'EXPERT'       ? 'badge-expert' : 'badge-advanced';

  return (
    <>
      <div id="page">
        <div id="bar"></div>

        {/* ── Nav ── */}
        <nav className="landing-nav" style={{
          position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, background: "rgba(8,9,12,0.88)",
          backdropFilter: "blur(32px) saturate(220%)", WebkitBackdropFilter: "blur(32px) saturate(220%)",
          border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18,
          padding: "0 8px", height: 50, display: "flex", alignItems: "center", gap: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
          whiteSpace: "nowrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <a href="/" style={{
              fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: "0.3em",
              color: "rgba(255,255,255,0.22)", textTransform: "uppercase", textDecoration: "none",
              padding: "6px 16px 6px 10px", marginRight: 4, borderRight: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              AI DOJO
              <span style={{
                fontFamily: "var(--font-code)", fontSize: 8, letterSpacing: "0.16em", color: "var(--cyan)",
                background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", borderRadius: 4, padding: "1px 5px",
              }}>BETA</span>
            </a>
            {isMobile === false && <div className="nav-tabs" style={{ display: "flex", gap: 2 }}>
              <a href="/" style={{
                fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.9)", padding: "6px 14px",
                borderRadius: 11, background: "rgba(255,255,255,0.08)", textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>Dashboard</a>
              <a href="/curriculum" style={{
                fontSize: 12.5, fontWeight: 400, color: "rgba(255,255,255,0.28)", padding: "6px 14px",
                borderRadius: 11, background: "transparent", textDecoration: "none", border: "1px solid transparent",
                transition: "all 150ms ease",
              }}>Train</a>
              <a href="/profile" style={{
                fontSize: 12.5, fontWeight: 400, color: "rgba(255,255,255,0.28)", padding: "6px 14px",
                borderRadius: 11, background: "transparent", textDecoration: "none", border: "1px solid transparent",
                transition: "all 150ms ease",
              }}>Profile</a>
            </div>}
            {isMobile === false && <a href="/diagnostic" style={{
              marginLeft: 8, padding: "6px 14px", background: "#fff", borderRadius: 10,
              color: "#000", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
            }}>Start Diagnostic</a>}
            {isMobile && <a href="/diagnostic" style={{
              marginLeft: 8, padding: "6px 14px", background: "#fff", borderRadius: 10,
              color: "#000", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
            }}>Diagnose</a>}
          </div>
        </nav>

        {/* ── 1. Hero ── */}
        <section id="hero">
          <div id="hero-shader"></div>
          <div className="hero-orb"></div>
          <div className="hv1"></div>
          <div className="hv2"></div>
          <div className="hv3"></div>
          <div className="hero-in">
            <h1 className="hero-h">
              <span className="line1" id="hline1"></span>
              <span className="line2" id="hline2" style={{ opacity: 0 }}>
                <span className="ws-wrap" id="wswrap">
                  <span className="ws-slot" id="wsA"></span>
                  <span className="ws-slot" id="wsB"></span>
                </span>
              </span>
            </h1>
            <p className="hero-sub" id="hsub">
              No certificates. No passive watching.<br />
              Just drills, scores, and a number that tells you<br />
              exactly where you stand against everyone else.
            </p>
            <div className="hero-btns" id="hbtns">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <a href="/diagnostic" className="btn-solid">
                  Start Diagnostic{" "}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <div style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.2)',
                  animation: 'ring-pulse 3s ease-out infinite',
                  pointerEvents: 'none',
                }} />
              </div>
            </div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 32,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              opacity: scrollHidden ? 0 : 0.35,
              transition: 'opacity 0.3s ease',
              animation: 'scroll-bounce 1.5s ease-in-out infinite',
            }}>
              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1 }}>∨</span>
            </div>
          </div>
        </section>

        <div className="div" id="dv1"></div>

        {/* ── 2. Why AI Dojo ── */}
        <section id="why" style={{ position: 'relative' }}>
          <canvas id="why-particles" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.45, zIndex: 0 }} />
          <div className="sec" style={{ position: 'relative', zIndex: 1 }}>
            <div className="why-layout">
              <div>
                <div className="tag rv">Why AI Dojo</div>
                <h2 className="sh rv d1">Built for the gap between knowing and <em>doing.</em></h2>
                <p className="why-lede rv d2">
                  Most AI training teaches you to watch. We measure what you can build, debug, and deliver under real professional conditions.
                </p>
              </div>
              <div className="why-pillars">
                <div className="pillar tl">
                  <span className="pi-n">01</span>
                  <div className="pi-t">Construction-based drills</div>
                  <div className="pi-d">You build real outputs. Scored against a professional rubric. No partial credit for effort.</div>
                </div>
                <div className="pillar tr" style={{ border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 0 20px rgba(34,197,94,0.06)' }}>
                  <span className="pi-n">02</span>
                  <div className="pi-t">A number that doesn&apos;t lie</div>
                  <div className="pi-d">Your score is earned, not given. You see exactly what you can do and where the gap is.</div>
                </div>
                <div className="pillar bl">
                  <span className="pi-n">03</span>
                  <div className="pi-t">No completion certificates</div>
                  <div className="pi-d">The only credential AI Dojo produces is competence — measurable, verifiable, undeniable.</div>
                </div>
                <div className="pillar br">
                  <span className="pi-n">04</span>
                  <div className="pi-t">7 domains on the roadmap</div>
                  <div className="pi-d">From prompt engineering to multi-agent systems. Every area a professional AI operator must command. 1 live now.</div>
                  <span style={{
                    display: 'inline-block',
                    marginTop: 10,
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    color: 'rgba(34,197,94,0.85)',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    padding: '2px 8px',
                    borderRadius: 100,
                  }}>OPEN BETA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="div" id="dv2"></div>

        {/* ── 3. Bento / Platform ── */}
        <section id="bento">
          <div className="sec" style={{ paddingTop: 60, paddingBottom: 60 }}>
            <div className="bento-head">
              <div className="tag">Platform</div>
              <h2 className="sh rv">Everything built around your <em>score.</em></h2>
            </div>
            <div className="bento-grid">

              {/* Card 1 — wide: Performance dashboard */}
              <div className="bcard wide" style={{ maxHeight: 360, overflow: 'hidden', position: 'relative' }}>
                <div className="bc-icon">📊</div>
                <div className="bc-t">Performance dashboard</div>
                <div className="bc-d">Every drill. Every score. Every gap. Your full operator profile — updated in real time.</div>
                {/* Fade gradient at bottom of card */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, rgba(7,7,10,0.95))', pointerEvents: 'none', zIndex: 1 }} />
                <div className="bc-live-score">
                  <div className="bc-ls-top">
                    <div className="bc-ls-num" id="bento-score">0</div>
                    <div className="bc-ls-info">
                      <span className="bc-ls-rank">Proficient</span>
                      <span className="bc-ls-tier">Prompt Engineering</span>
                    </div>
                  </div>
                  <div className="bc-ls-bars">
                    {[
                      { lbl: 'Prompt Engineering', val: 85, note: '' },
                      { lbl: 'Output Control',     val: 0,  note: 'not yet trained' },
                      { lbl: 'System Prompts',     val: 0,  note: '' },
                      { lbl: 'Role Prompting',     val: 0,  note: '' },
                      { lbl: 'Reasoning Chains',   val: 0,  note: '' },
                    ].map(row => (
                      <div key={row.lbl} className="bc-bar-row">
                        <div className="bc-bar-lbl">{row.lbl}</div>
                        <div className="bc-bar-track">
                          <div className="bc-bar-fill" style={{ width: 0 }}></div>
                        </div>
                        <div className="bc-bar-val" style={{ color: row.val === 0 ? 'rgba(255,255,255,0.2)' : undefined }}>
                          {row.val === 0 ? (row.note || '—') : row.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2 — 7 domains */}
              <div className="bcard" style={{ maxHeight: 360, overflow: 'hidden' }}>
                <div className="bc-icon">🗂</div>
                <div className="bc-t">7 domains</div>
                <div className="bc-d">1 live now · more launching monthly</div>
                <div className="bc-domains">
                  {['Prompts', 'Output', 'Systems', 'Roles', 'Reasoning', 'Extraction', 'Evaluation'].map(d => (
                    <div key={d} className="bc-dp">{d}</div>
                  ))}
                </div>
                <div className="bc-tiers">
                  <span className="tbadge tb-f">Foundational</span>
                  <span className="tbadge tb-a">Advanced</span>
                  <span className="tbadge tb-e">Expert</span>
                </div>
              </div>

              {/* Card 3 — amber: AI scored */}
              <div className="bcard amber bcard-glow" style={{ padding: 20 }}>
                <div className="bc-icon" style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, fontSize: 16, borderRadius: 10, marginBottom: 16 }}>⚡</div>
                <div className="bc-t">AI-scored in seconds</div>
                <div className="bc-d">Submit your output. Real score against a professional rubric. No waiting. No humans in the loop.</div>
              </div>

              {/* Card 4 — Progress tracking */}
              <div className="bcard bcard-glow" style={{ padding: 20 }}>
                <div className="bc-icon" style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, fontSize: 16, borderRadius: 10, marginBottom: 16 }}>📈</div>
                <div className="bc-t">Track your growth</div>
                <div className="bc-d">Every drill scored, every improvement tracked. See exactly how your skills develop over time.</div>
              </div>

              {/* Card 5 — amber: No shortcuts */}
              <div className="bcard amber bcard-glow" style={{ padding: 20 }}>
                <div className="bc-icon" style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, fontSize: 16, borderRadius: 10, marginBottom: 16 }}>🔒</div>
                <div className="bc-t">No shortcuts</div>
                <div className="bc-d">No multiple choice. No partial credit. No effort scores. Only output quality moves your number.</div>
              </div>

            </div>
          </div>
        </section>

        <div className="div" id="dv3"></div>

        {/* ── 4. Drill Preview ── */}
        <section id="codesnip">
          <div className="sec">
            <div className="code-grid">
              <div>
                <div className="tag rv">The diagnostic</div>
                <h2 className="sh rv d1">See what a <em>scored drill</em> actually looks like.</h2>
                <p className="code-desc rv d2">Every drill gives you a brief, a target, and a rubric. You produce the output. AI scores it in seconds against weighted criteria — no partial credit.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                    Average score on first attempt: 34 / 100
                  </span>
                </div>
              </div>
              <DiagnosticTerminal />
            </div>
          </div>
        </section>

        <div className="div" id="dv4"></div>

        {/* ── 5. Horizontal scroll / domains ── */}
        <section id="features">
          <div className="feat-head">
            <div className="tag rv">Drills</div>
            <h2 className="sh rv d1">What you actually train <em>inside.</em></h2>
          </div>
          <div id="feat-wrap" style={{ position: 'relative', overflow: 'hidden', cursor: 'default' }}>
            {/* Left edge fade */}
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: 60, zIndex: 2, pointerEvents: 'none',
              background: 'linear-gradient(to right, #08090c 0%, transparent 100%)',
            }} />
            {/* Right edge fade */}
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 60, zIndex: 2, pointerEvents: 'none',
              background: 'linear-gradient(to left, #08090c 0%, transparent 100%)',
            }} />
            <div id="feat-drift" style={{ display: 'flex', gap: 14, padding: '0 48px 48px', willChange: 'transform' }}>
              {/* Original set — Prompt Engineering first, OPEN BETA; rest COMING SOON */}
              {[DOMAINS_DATA[0], ...DOMAINS_DATA.slice(1)].map(d => {
                const isLive = d.num === '01';
                return (
                  <div key={d.num} className="fcard appeared" style={{
                    opacity: isLive ? 1 : 0.55,
                    border: isLive ? '1px solid rgba(34,197,94,0.25)' : undefined,
                  }}>
                    <span className="fc-num">DOMAIN {d.num}</span>
                    <div className="fc-t">{d.title}</div>
                    <div className="fc-d">{d.desc}</div>
                    {isLive ? (
                      <span style={{
                        display: 'inline-block',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        color: 'rgba(34,197,94,0.85)',
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        padding: '2px 8px',
                        borderRadius: 100,
                      }}>OPEN BETA</span>
                    ) : (
                      <span style={{
                        display: 'inline-block',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        color: 'rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '2px 8px',
                        borderRadius: 100,
                      }}>COMING SOON</span>
                    )}
                  </div>
                );
              })}
              {/* Multi-Agent Systems — animated preview card */}
              <div className="fcard appeared" style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(245,158,11,0.2)',
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
              }}>
                <div style={{ padding: '20px 20px 12px' }}>
                  <span className="fc-num">DOMAIN 11</span>
                  <div className="fc-t">Multi-Agent Systems</div>
                  <div className="fc-d" style={{ marginBottom: 10 }}>Orchestrate networks of agents that collaborate and produce results humans can&apos;t match alone.</div>
                  <span style={{
                    display: 'inline-block', fontSize: 10, letterSpacing: '0.1em',
                    color: 'rgba(245,158,11,0.8)', background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: 100,
                  }}>COMING SOON</span>
                </div>
                <canvas className="ma-canvas" style={{ width: '100%', height: 140, display: 'block', flexShrink: 0 }} />
              </div>
              {/* Duplicate set for seamless loop */}
              {[DOMAINS_DATA[0], ...DOMAINS_DATA.slice(1)].map(d => {
                const isLive = d.num === '01';
                return (
                  <div key={d.num + '-dup'} className="fcard appeared" aria-hidden="true" style={{
                    opacity: isLive ? 1 : 0.55,
                    border: isLive ? '1px solid rgba(34,197,94,0.25)' : undefined,
                  }}>
                    <span className="fc-num">DOMAIN {d.num}</span>
                    <div className="fc-t">{d.title}</div>
                    <div className="fc-d">{d.desc}</div>
                    {isLive ? (
                      <span style={{
                        display: 'inline-block',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        color: 'rgba(34,197,94,0.85)',
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        padding: '2px 8px',
                        borderRadius: 100,
                      }}>OPEN BETA</span>
                    ) : (
                      <span style={{
                        display: 'inline-block',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        color: 'rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '2px 8px',
                        borderRadius: 100,
                      }}>COMING SOON</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="div" id="dv5"></div>

        {/* ── 6. Comparison ── */}
        <section id="comparison">
          <div className="sec">
            <div className="comp-header">
              <div className="tag rv">Comparison</div>
              <h2 className="sh rv d1">Why not just <em>take a course?</em></h2>
              <p className="comp-lead rv d2">
                Most AI education rewards watching. AI Dojo rewards building. Here&apos;s what that actually means.
              </p>
            </div>

            {/* ── Comparison Table ── */}
            <div className="comp-table">
              <div className="ct-head">
                <div className="ct-h ct-feature-h">What matters</div>
                <div className="ct-h ct-hl">AI Dojo</div>
                <div className="ct-h">Udemy / Coursera</div>
                <div className="ct-h">YouTube / Free</div>
              </div>
              <div className="ct-body">
                {COMP_ROWS.map((row, i) => (
                  <div key={row.feature} className="ct-row" style={{ transitionDelay: `${i * 0.07}s` }}>
                    <div className="ct-cell ct-feature">{row.feature}</div>
                    <div className="ct-cell ct-dojo"><span className="ct-check ct-yes">✓</span></div>
                    <div className="ct-cell ct-other">
                      {row.udemy === 'yes' && <span className="ct-check ct-yes">✓</span>}
                      {row.udemy === 'no' && <span className="ct-check ct-no">✗</span>}
                      {row.udemy === 'partial' && <span className="ct-partial">{row.udemyNote}</span>}
                    </div>
                    <div className="ct-cell ct-other">
                      {row.yt === 'yes' && <span className="ct-check ct-yes">✓</span>}
                      {row.yt === 'no' && <span className="ct-check ct-no">✗</span>}
                      {row.yt === 'partial' && <span className="ct-partial">{row.ytNote}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Closing line ── */}
            <p style={{
              textAlign: 'center',
              fontSize: 16,
              color: 'rgba(255,255,255,0.4)',
              marginTop: 32,
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
            }}>
              The difference isn&apos;t what you learn. It&apos;s what you can prove.
            </p>

            {/* ── Comparison Cards (mobile only) ── */}
            <div className="comparison-cards" style={{ display: 'none' }}>
              {COMP_ROWS.map((row) => (
                <div key={row.feature} style={{
                  background: 'var(--bg3)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, padding: '18px 20px', marginBottom: 12,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>{row.feature}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cyan)' }}>AI Dojo</span>
                      <span className="ct-check ct-yes">✓</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>Udemy</span>
                      {row.udemy === 'yes' && <span className="ct-check ct-yes">✓</span>}
                      {row.udemy === 'no' && <span className="ct-check ct-no">✗</span>}
                      {row.udemy === 'partial' && <span className="ct-partial">{row.udemyNote}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>YouTube</span>
                      {row.yt === 'yes' && <span className="ct-check ct-yes">✓</span>}
                      {row.yt === 'no' && <span className="ct-check ct-no">✗</span>}
                      {row.yt === 'partial' && <span className="ct-partial">{row.ytNote}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── 7. Multi-Agent Preview ── */}
        <section id="multiagent-preview" style={{ padding: '40px 0 40px', position: 'relative' }}>
          <div className="sec">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              {/* COMING NEXT eyebrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#f59e0b',
                  animation: 'amber-pulse 2s ease-in-out infinite',
                }} />
                <span style={{
                  fontFamily: 'var(--font-code)', fontSize: 10, letterSpacing: '0.2em',
                  textTransform: 'uppercase' as const, color: 'rgba(245,158,11,0.7)',
                }}>COMING SOON</span>
              </div>
              <h2 className="sh" style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 34, fontWeight: 400, fontStyle: 'italic',
                color: 'rgba(255,255,255,0.88)', lineHeight: 1.3, marginBottom: 14,
              }}>Train the hardest skill in AI.</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', maxWidth: 460, margin: '0 auto' }}>
                Orchestrating agents that think, delegate, and deliver — together.
              </p>
            </div>

            {/* Canvas */}
            <MultiAgentCanvas />

            {/* Feature pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' as const, marginBottom: 22 }}>
              {['Orchestration patterns', 'Agent handoffs', 'Failure recovery'].map(pill => (
                <span key={pill} style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.45)',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  padding: '5px 14px', borderRadius: 100,
                }}>{pill}</span>
              ))}
            </div>

            {/* Coming pill + waitlist */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
              <span style={{
                fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' as const,
                color: 'rgba(245,158,11,0.8)', background: 'rgba(245,158,11,0.07)',
                border: '1px solid rgba(245,158,11,0.2)', padding: '4px 12px',
                borderRadius: 100, fontFamily: 'var(--font-code)',
              }}>COMING Q3 2026</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
                Join the waitlist for early access
              </span>
            </div>
          </div>
        </section>

        {/* ── 8. CTA ── */}
        <section id="cta" style={{ position: 'relative', overflow: 'hidden' }}>
          <canvas id="lamp-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.55 }} />
          <canvas id="cta-particles" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.5, zIndex: 0 }} />
          <div className="cta-in" style={{ position: 'relative', zIndex: 1 }}>
            <div className="cta-tag rv">Step one</div>
            <h2 className="cta-h rv d1">Find out where you <em>actually</em> stand.</h2>
            <p className="cta-sub rv d2">3 drills. 8 minutes. No account required. Your score tells you exactly where to start.</p>
            <div className="cta-btns-wrap rv d3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <a href="/diagnostic" className="btn-solid">
                Start Diagnostic{" "}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="cta-note rv d4">Free to start · No account required</div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ padding: '32px 28px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '8px' }}>
            © 2026 AI Dojo · Built by Daniel Brocato
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
            Next.js · Claude API · OpenAI · Vercel ·{' '}
            <a href="https://www.linkedin.com/in/daniel-brocato" target="_blank" rel="noopener noreferrer"
              style={{ color: '#00d4ff', textDecoration: 'none' }}>LinkedIn ↗</a>
            {' '}·{' '}
            <a href="https://github.com/danickb222" target="_blank" rel="noopener noreferrer"
              style={{ color: '#00d4ff', textDecoration: 'none' }}>GitHub ↗</a>
          </div>
        </footer>

      </div>
    </>
  );
}
