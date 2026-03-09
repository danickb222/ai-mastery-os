"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Target, Shield } from "lucide-react";
import {
  getOperatorProfile,
  setOperatorProfile,
  getItem,
  setItem,
  updateStreak,
  computeOperatorScore,
  getRankLabel,
  STORAGE_KEYS,
  type OperatorProfile,
  type DomainScore,
  type ArenaState,
  type LabSession,
  type LastDrillSession,
} from "@/core/storage";
import { DOMAINS, getDomainDrillCount } from "@/core/content/domains";
import { getDrillsByDomain, DRILLS } from "@/core/content/drills";
import type { DrillResult } from "@/core/types/drills";
import { ScoreCounter } from "@/components/ui/ScoreCounter";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function Dashboard() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [arenaState, setArenaState] = useState<ArenaState | null>(null);
  const [lastSession, setLastSession] = useState<LastDrillSession | null>(null);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [daysSinceActive, setDaysSinceActive] = useState(0);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  useEffect(() => {
    let p = getOperatorProfile();
    if (p) {
      p = updateStreak(p);

      const drillHistory = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
      const as = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
      const ls = getItem<LabSession[]>(STORAGE_KEYS.LAB_SESSIONS) || [];
      const lastDrill = getItem<LastDrillSession>(STORAGE_KEYS.LAST_DRILL_SESSION);

      const ds: DomainScore[] = DOMAINS.map(domain => {
        const domainDrills = getDrillsByDomain(domain.id);
        const completedDrills = drillHistory.filter(h =>
          domainDrills.some(d => d.id === h.drillId)
        );
        const avgScore = completedDrills.length > 0
          ? Math.round(completedDrills.reduce((sum, h) => sum + h.score, 0) / completedDrills.length)
          : 0;

        return {
          domainId: domain.id,
          score: avgScore,
          drillsCompleted: completedDrills.length,
          drillsTotal: domainDrills.length,
          lastAttempted: completedDrills.length > 0 ? completedDrills[completedDrills.length - 1].submittedAt : ""
        };
      });

      const newScore = computeOperatorScore(ds, as, ls);
      const newPercentile = Math.max(1, Math.round(100 - newScore));

      const oldScore = p.operatorScore;
      const delta = newScore - oldScore;

      p = {
        ...p,
        operatorScore: newScore,
        rankPercentile: newPercentile,
        rankLabel: getRankLabel(newPercentile),
        lastActive: new Date().toISOString(),
      };
      setOperatorProfile(p);

      const lastActive = getItem<string>(STORAGE_KEYS.LAST_ACTIVE);
      if (lastActive) {
        const diff = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000);
        setDaysSinceActive(diff);
      }

      setItem(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());

      setDomainScores(ds);
      setArenaState(as);
      setLastSession(lastDrill);
      setScoreDelta(delta);
    }
    setProfile(p);
    setLoaded(true);
  }, []);

  // ── All landing page JS behaviors ──
  useEffect(() => {
    const WORDS = [
      'founders.','builders.','students.','starters.','creators.',
      'dreamers.','pioneers.','hustlers.','strivers.','explorers.',
      'learners.','seekers.','achievers.','tinkerers.','operators.',
      'doers.','makers.','students.','hackers.','teachers.'
    ];

    // Add cursor keyframe
    const s = document.createElement('style');
    s.textContent = '@keyframes cblink{0%,100%{opacity:1}50%{opacity:0}}';
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

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader
      });

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

    function initCtaCanvas() {
      const canvas = document.getElementById('cta-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      const cont = document.getElementById('cta')!;
      let W: number, H: number, t = 0;
      const resize = () => { W = canvas.width = cont.offsetWidth; H = canvas.height = cont.offsetHeight; };
      resize(); window.addEventListener('resize', resize);
      const beams = [{cx:.3,cy:.4,a:-38,w:.4,s:.0004,p:0},{cx:.7,cy:.5,a:-42,w:.3,s:.0003,p:2},{cx:.5,cy:.3,a:-36,w:.2,s:.0005,p:1}];
      const draw = () => {
        t++; ctx.clearRect(0,0,W,H); ctx.fillStyle='#06070a'; ctx.fillRect(0,0,W,H);
        const hue=190+Math.sin(t*.00025)*20;
        beams.forEach((b: any) => {
          const pulse=Math.sin(t*b.s*1000+b.p)*.35+.65;
          const cx=b.cx*W,cy=b.cy*H,bw=b.w*W,len=W*2.5,rad=b.a*Math.PI/180;
          ctx.save();ctx.translate(cx,cy);ctx.rotate(rad);
          const g=ctx.createLinearGradient(0,-bw/2,0,bw/2);
          g.addColorStop(0,`hsla(${hue},100%,60%,0)`);
          g.addColorStop(.5,`hsla(${hue},100%,60%,${.15*pulse})`);
          g.addColorStop(1,`hsla(${hue},100%,60%,0)`);
          ctx.fillStyle=g; ctx.fillRect(-len/2,-bw/2,len,bw); ctx.restore();
        });
        requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    }

    function initLampCanvas() {
      const canvas = document.getElementById('lamp-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      let W: number, H: number;

      const resize = () => {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      let lampFired = false;
      let lampProgress = 0;
      let lampAnimating = false;

      function drawLamp(p: number) {
        ctx.clearRect(0, 0, W, H);
        if (p <= 0) return;

        const cx = W / 2;
        const cy = 0;
        const maxSpread = W * 0.52 * p;
        const beamDepth = H * 0.88 * p;

        const leftGrad = ctx.createLinearGradient(cx, cy, cx - maxSpread, beamDepth);
        leftGrad.addColorStop(0,   `rgba(0,212,255,${0.18 * p})`);
        leftGrad.addColorStop(0.5, `rgba(0,212,255,${0.10 * p})`);
        leftGrad.addColorStop(1,   'rgba(0,212,255,0)');
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - maxSpread, beamDepth);
        ctx.lineTo(cx, beamDepth * 0.1);
        ctx.closePath();
        ctx.fillStyle = leftGrad;
        ctx.fill();

        const rightGrad = ctx.createLinearGradient(cx, cy, cx + maxSpread, beamDepth);
        rightGrad.addColorStop(0,   `rgba(0,212,255,${0.18 * p})`);
        rightGrad.addColorStop(0.5, `rgba(0,212,255,${0.10 * p})`);
        rightGrad.addColorStop(1,   'rgba(0,212,255,0)');
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxSpread, beamDepth);
        ctx.lineTo(cx, beamDepth * 0.1);
        ctx.closePath();
        ctx.fillStyle = rightGrad;
        ctx.fill();

        const beamW = maxSpread * 2;
        const beamGrad = ctx.createLinearGradient(cx - beamW/2, 1, cx + beamW/2, 1);
        beamGrad.addColorStop(0,   'rgba(0,212,255,0)');
        beamGrad.addColorStop(0.2, `rgba(0,212,255,${0.9 * p})`);
        beamGrad.addColorStop(0.5, `rgba(180,240,255,${1.0 * p})`);
        beamGrad.addColorStop(0.8, `rgba(0,212,255,${0.9 * p})`);
        beamGrad.addColorStop(1,   'rgba(0,212,255,0)');
        ctx.beginPath();
        ctx.rect(cx - beamW/2, 0, beamW, 2);
        ctx.fillStyle = beamGrad;
        ctx.fill();

        const hotR = 120 * p;
        const hotGrad = ctx.createRadialGradient(cx, 2, 0, cx, 2, hotR);
        hotGrad.addColorStop(0,   `rgba(180,240,255,${0.7 * p})`);
        hotGrad.addColorStop(0.3, `rgba(0,212,255,${0.4 * p})`);
        hotGrad.addColorStop(1,   'rgba(0,212,255,0)');
        ctx.beginPath();
        ctx.arc(cx, 2, hotR, 0, Math.PI * 2);
        ctx.fillStyle = hotGrad;
        ctx.fill();

        const poolGrad = ctx.createRadialGradient(cx, beamDepth * 0.08, 0, cx, beamDepth * 0.08, 160 * p);
        poolGrad.addColorStop(0,   `rgba(0,212,255,${0.12 * p})`);
        poolGrad.addColorStop(1,   'rgba(0,212,255,0)');
        ctx.beginPath();
        ctx.arc(cx, beamDepth * 0.08, 160 * p, 0, Math.PI * 2);
        ctx.fillStyle = poolGrad;
        ctx.fill();
      }

      function animateLamp() {
        if (!lampAnimating) return;
        lampProgress += 0.018;
        if (lampProgress >= 1) { lampProgress = 1; lampAnimating = false; }
        const ep = 1 - Math.pow(1 - lampProgress, 3);
        drawLamp(ep);
        requestAnimationFrame(animateLamp);
      }

      (window as any).triggerLamp = () => {
        if (lampFired) return;
        lampFired = true;
        lampAnimating = true;
        animateLamp();
      };

      setInterval(() => {
        if (lampProgress >= 1) {
          const ep = 1 - Math.pow(1 - lampProgress, 3);
          const flicker = 1 + (Math.random() - 0.5) * 0.04;
          drawLamp(ep * flicker);
        }
      }, 80);
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

      wrap.style.width  = Math.ceil(maxW) + 'px';
      wrap.style.height = clipH + 'px';

      active.textContent      = shuffled[0];
      active.style.transform  = 'translateY(0px)';
      active.style.opacity    = '1';
      standby.style.transform = `translateY(${clipH}px)`;
      standby.style.opacity   = '0';

      setInterval(() => {
        idx = (idx + 1) % shuffled.length;
        standby.textContent = shuffled[idx];
        standby.style.transition = 'none';
        standby.style.transform  = `translateY(${clipH}px)`;
        standby.style.opacity    = '0';

        requestAnimationFrame(() => requestAnimationFrame(() => {
          const ease = '.52s cubic-bezier(.4,0,.2,1)';
          active.style.transition  = `transform ${ease},opacity ${ease}`;
          active.style.transform   = `translateY(-${clipH}px)`;
          active.style.opacity     = '0';
          standby.style.transition = `transform ${ease},opacity ${ease}`;
          standby.style.transform  = 'translateY(0px)';
          standby.style.opacity    = '1';
          [active, standby] = [standby, active];
        }));
      }, 2000);
    }

    function typeInto(id: string, text: string, cb?: () => void) {
      const el = document.getElementById(id);
      if (!el) return;
      const cur = document.createElement('span');
      cur.style.cssText = 'display:inline-block;width:3px;height:.78em;background:#fff;margin-left:4px;vertical-align:middle;animation:cblink .85s step-end infinite';
      el.appendChild(cur);
      let i = 0;
      const iv = setInterval(() => {
        if (i < text.length) { el.insertBefore(document.createTextNode(text[i++]), cur); }
        else {
          clearInterval(iv);
          setTimeout(() => { cur.style.transition = 'opacity .4s'; cur.style.opacity = '0'; setTimeout(() => { cur.remove(); if (cb) cb(); }, 400); }, 500);
        }
      }, 42);
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

    function countUp() {
      document.querySelectorAll('[data-count]').forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        const target = +(htmlEl.dataset.count || 0);
        const start = performance.now();
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1600, 1);
          htmlEl.textContent = String(Math.floor(ease(p) * target));
          if (p < 1) requestAnimationFrame(tick); else htmlEl.textContent = target.toLocaleString();
        };
        requestAnimationFrame(tick);
      });
    }

    function startHero() {
      setTimeout(() => {
        const p = document.getElementById('hpill');
        if (p) { p.style.transition = 'opacity .6s ease,transform .6s ease'; p.style.opacity = '1'; }
      }, 100);

      setTimeout(() => {
        typeInto('hline1', 'The AI gym for', () => {
          const l2 = document.getElementById('hline2');
          if (l2) { l2.style.transition = 'opacity .5s ease'; l2.style.opacity = '1'; }
          initWordSwitcher();
          setTimeout(() => revealId('hsub', .75), 200);
          setTimeout(() => revealId('hbtns', .75), 440);
          setTimeout(() => revealId('hnote', .6), 620);
          setTimeout(() => { revealId('hstats', .75); setTimeout(countUp, 200); }, 820);
        });
      }, 560);
    }

    function runDrillAnimation() {
      const body = document.getElementById('code-body');
      const cur = document.getElementById('code-cur');
      if (!body || !cur) return;

      const lines = [
        {t:'comment', text:'# DRILL 01 — Prompt Engineering\n'},
        {t:'comment', text:'# Domain: Foundational  |  Max score: 100\n\n'},
        {t:'key',     text:'BRIEF'},
        {t:'op',      text:':\n'},
        {t:'plain',   text:'  Write a prompt that extracts\n'},
        {t:'plain',   text:'  all named entities from a\n'},
        {t:'plain',   text:'  document and returns JSON.\n\n'},
        {t:'key',     text:'RUBRIC'},
        {t:'op',      text:':\n'},
        {t:'fn',      text:'  clarity       '},
        {t:'num',     text:'25pts\n'},
        {t:'fn',      text:'  output_format '},
        {t:'num',     text:'25pts\n'},
        {t:'fn',      text:'  edge_cases    '},
        {t:'num',     text:'25pts\n'},
        {t:'fn',      text:'  efficiency    '},
        {t:'num',     text:'25pts\n\n'},
        {t:'PAUSE',   text:''},
        {t:'key',     text:'SUBMITTING'},
        {t:'op',      text:'...'},
      ];

      body.innerHTML = '';
      body.appendChild(cur);

      let lineIdx = 0;
      let charIdx = 0;
      let currentSpan: HTMLElement | null = null;

      function typeNext() {
        if (lineIdx >= lines.length) { setTimeout(showResult, 400); return; }
        const line = lines[lineIdx];
        if (line.t === 'PAUSE') { lineIdx++; setTimeout(typeNext, 800); return; }
        if (charIdx === 0) {
          currentSpan = document.createElement('span');
          currentSpan.className = 'tok-' + line.t;
          body!.insertBefore(currentSpan, cur);
        }
        if (charIdx < line.text.length) {
          currentSpan!.textContent += line.text[charIdx];
          charIdx++;
          setTimeout(typeNext, line.t === 'comment' ? 22 : 28);
        } else {
          charIdx = 0; lineIdx++;
          setTimeout(typeNext, 14);
        }
      }
      typeNext();
    }

    function showResult() {
      const cur = document.getElementById('code-cur');
      if (cur) cur.style.display = 'none';
      const res = document.getElementById('code-result');
      if (!res) return;
      res.style.display = 'block';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        res.classList.add('show');
        animateNumber('result-num', 0, 88, 900);
        setTimeout(() => {
          const badge = document.getElementById('result-badge');
          const sub = document.getElementById('result-sub');
          if (badge) badge.textContent = 'Top 12% on this drill';
          if (sub) sub.textContent = '→ Rubric: clarity 23 · format 22 · edge_cases 21 · efficiency 22';
        }, 400);
      }));
    }

    function initDragScroll() {
      const el = document.getElementById('featscroll'); if (!el) return;
      let down = false, sx = 0, sl = 0;
      el.addEventListener('mousedown', (e: MouseEvent) => { down = true; sx = e.pageX - el.offsetLeft; sl = el.scrollLeft; });
      el.addEventListener('mouseleave', () => down = false);
      el.addEventListener('mouseup', () => down = false);
      el.addEventListener('mousemove', (e: MouseEvent) => { if (!down) return; e.preventDefault(); el.scrollLeft = sl - (e.pageX - el.offsetLeft - sx); });
    }

    // Load Three.js from CDN then init hero
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js';
    threeScript.onload = () => { /* THREE now available, initHeroCanvas called after loader */ };
    document.head.appendChild(threeScript);

    // Init lamp canvas immediately
    initLampCanvas();

    // Lamp IntersectionObserver
    let lampObs: IntersectionObserver | null = null;
    const ctaEl = document.getElementById('cta');
    if (ctaEl) {
      lampObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && (window as any).triggerLamp) {
            (window as any).triggerLamp();
          }
        });
      }, { threshold: 0.15 });
      lampObs.observe(ctaEl);
    }

    // Loader sequence
    const loaderDelay = setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('lo-exit');
      setTimeout(() => {
        if (loader) loader.style.display = 'none';
        const page = document.getElementById('page');
        if (page) page.classList.add('show');

        // Init Three.js hero shader
        if ((window as any).THREE) {
          initHeroCanvas();
        } else {
          const tCheck = setInterval(() => {
            if ((window as any).THREE) { clearInterval(tCheck); initHeroCanvas(); }
          }, 50);
        }

        initCtaCanvas();
        initDragScroll();
        startHero();
      }, 900);
    }, 2900);

    // Scroll progress bar
    const handleScroll = () => {
      const bar = document.getElementById('bar');
      if (bar) bar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Generic reveal
    const rvEls = document.querySelectorAll('.rv');
    const rvObservers: IntersectionObserver[] = [];
    rvEls.forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
      }, { threshold: .08, rootMargin: '-20px' });
      obs.observe(el);
      rvObservers.push(obs);
    });

    // Dividers
    const divEls = document.querySelectorAll('.div');
    const divObservers: IntersectionObserver[] = [];
    divEls.forEach(d => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) setTimeout(() => d.classList.add('swept'), 50); });
      }, { threshold: .5 });
      obs.observe(d);
      divObservers.push(obs);
    });

    // Why pillars
    const pillarsEl = document.getElementById('pillars');
    let pillarsObs: IntersectionObserver | null = null;
    if (pillarsEl) {
      pillarsObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            ['p1','p2','p3','p4'].forEach((id, i) => {
              setTimeout(() => { const el = document.getElementById(id); if (el) el.classList.add('merged'); }, i * 120);
            });
            pillarsObs!.disconnect();
          }
        });
      }, { threshold: .25 });
      pillarsObs.observe(pillarsEl);
    }

    // Bento
    const bentoGridEl = document.getElementById('bento-grid');
    let bentoFired = false;
    let bentoObs: IntersectionObserver | null = null;
    if (bentoGridEl) {
      bentoObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !bentoFired) {
            bentoFired = true;
            ['bcard-main','bcard-2','bcard-3','bcard-4','bcard-5'].forEach((id, i) => {
              setTimeout(() => { const c = document.getElementById(id); if (c) c.classList.add('appeared'); }, i * 110);
            });
            setTimeout(() => animateNumber('score-num', 0, 71, 2400), 300);
            setTimeout(() => {
              document.querySelectorAll('.bc-bar-fill').forEach((bar: Element, i) => {
                const b = bar as HTMLElement;
                setTimeout(() => { b.style.width = (b.dataset.w || '0') + '%'; }, i * 180);
              });
            }, 500);
            bentoObs!.disconnect();
          }
        });
      }, { threshold: .2 });
      bentoObs.observe(bentoGridEl);
    }

    // Code window
    const codeWindowEl = document.getElementById('code-window');
    let codeFired = false;
    let codeObs: IntersectionObserver | null = null;
    if (codeWindowEl) {
      codeObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !codeFired) {
            codeFired = true;
            codeWindowEl.classList.add('appeared');
            setTimeout(runDrillAnimation, 600);
            codeObs!.disconnect();
          }
        });
      }, { threshold: .3 });
      codeObs.observe(codeWindowEl);
    }

    // Feature cards
    const featObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('appeared'); featObs.unobserve(e.target); }
      });
    }, { threshold: .1, rootMargin: '0px -40px' });
    document.querySelectorAll('.fcard').forEach((c: Element, i: number) => {
      (c as HTMLElement).style.transitionDelay = `${i * 60}ms`;
      featObs.observe(c);
    });

    // Comparison rows
    const compTableEl = document.getElementById('comp-table');
    let compFired = false;
    let compObs: IntersectionObserver | null = null;
    if (compTableEl) {
      compObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !compFired) {
            compFired = true;
            const rows = document.querySelectorAll('.ct-row');
            rows.forEach((row: Element, i: number) => {
              setTimeout(() => {
                row.classList.add('appeared');
                setTimeout(() => {
                  row.querySelectorAll('.ct-check').forEach((ch: Element, j: number) => {
                    setTimeout(() => ch.classList.add('popped'), j * 80);
                  });
                }, 200);
              }, i * 120);
            });
            compObs!.disconnect();
          }
        });
      }, { threshold: .15 });
      compObs.observe(compTableEl);
    }

    return () => {
      clearTimeout(loaderDelay);
      window.removeEventListener('scroll', handleScroll);
      rvObservers.forEach(obs => obs.disconnect());
      divObservers.forEach(obs => obs.disconnect());
      if (pillarsObs) pillarsObs.disconnect();
      if (bentoObs) bentoObs.disconnect();
      if (codeObs) codeObs.disconnect();
      featObs.disconnect();
      if (compObs) compObs.disconnect();
      if (lampObs) lampObs.disconnect();
    };
  }, []);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setWaitlistStatus('loading');
    try {
      await fetch('https://formspree.io/f/xpwzkoqd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: waitlistEmail }),
      });
      setWaitlistStatus('done');
    } catch {
      setWaitlistStatus('error');
    }
  }

  return (
    <>
      {/* Loader */}
      <div id="loader">
        <div className="lo-logo">AI DOJO</div>
        <div className="lo-bar"><div className="lo-prog"></div></div>
        <div className="lo-sub">Initialising operator session</div>
      </div>

      {/* Scroll progress bar */}
      <div id="bar"></div>

      {/* Page */}
      <div id="page">

        {/* Nav */}
        <nav>
          <a href="/" className="nav-logo">AI Dojo</a>
          <a href="/" className="nav-a on">Dashboard</a>
          <a href="/curriculum" className="nav-a">Train</a>
          <a href="/arena" className="nav-a">Arena</a>
          <a href="/lab" className="nav-a">Lab</a>
          <a href="/run?mode=diagnostic" className="nav-cta">Start Diagnostic</a>
        </nav>

        {/* Hero */}
        <section id="hero">
          <div id="hero-shader"></div>
          <div className="hero-orb"></div>
          <div className="hv1"></div>
          <div className="hv2"></div>
          <div className="hv3"></div>
          <div className="hero-in">
            <div className="hero-pill" id="hpill">
              <div className="pill-dot"></div>
              <span className="pill-txt">Operator Training Platform — v2.0</span>
            </div>
            <h1 className="hero-h">
              <span className="line1" id="hline1"></span>
              <span className="line2" id="hline2" style={{opacity:0}}>
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
              <a href="/run?mode=diagnostic" className="btn-solid">
                Begin Diagnostic{" "}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="/curriculum" className="btn-line">
                View curriculum{" "}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <p className="hero-note" id="hnote">5 drills &nbsp;·&nbsp; no account required &nbsp;·&nbsp; ~8 minutes</p>
            <div className="hero-stats" id="hstats">
              <div className="hs">
                <span className="hs-n"><span className="c" data-count="2341">0</span></span>
                <span className="hs-l">Operators</span>
              </div>
              <div className="hs">
                <span className="hs-n" data-count="12">0</span>
                <span className="hs-l">Domains</span>
              </div>
              <div className="hs">
                <span className="hs-n">
                  <span className="c" data-count="71">0</span>
                  <span style={{fontSize:11,color:'rgba(255,255,255,.18)'}}>/100</span>
                </span>
                <span className="hs-l">Avg score</span>
              </div>
            </div>
          </div>
          <div className="hero-scroll">
            <div className="scr-rod"></div>
            <span className="scr-txt">Scroll</span>
          </div>
        </section>

        {/* Waitlist */}
        <section id="waitlist" style={{ padding: '64px 28px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 16 }}>
              EARLY ACCESS
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 32 }}>
              Be first when new domains unlock.
            </h2>
            <AnimatePresence mode="wait">
              {waitlistStatus === 'done' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--cyan)', fontFamily: 'var(--font-body)', fontSize: 15 }}
                >
                  <span style={{ fontSize: 20 }}>✓</span>
                  <span>You&apos;re on the list. We&apos;ll be in touch.</span>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleWaitlist}
                  style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto' }}
                >
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={waitlistEmail}
                    onChange={e => setWaitlistEmail(e.target.value)}
                    style={{
                      flex: 1, padding: '12px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 10, color: '#fff',
                      fontFamily: 'var(--font-body)', fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={waitlistStatus === 'loading'}
                    style={{
                      padding: '12px 20px',
                      background: waitlistStatus === 'loading' ? 'rgba(255,255,255,0.1)' : '#fff',
                      border: 'none', borderRadius: 10,
                      color: waitlistStatus === 'loading' ? 'rgba(255,255,255,0.4)' : '#000',
                      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                      cursor: waitlistStatus === 'loading' ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {waitlistStatus === 'loading' ? '...' : 'Join Waitlist'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            {waitlistStatus === 'error' && (
              <p style={{ marginTop: 12, fontFamily: 'var(--font-code)', fontSize: 11, color: '#ef4444' }}>
                Something went wrong. Try again.
              </p>
            )}
          </div>
        </section>

        <div className="div" id="dv1"></div>

        {/* Why AI Dojo */}
        <section id="why">
          <div className="sec">
            <div className="why-layout">
              <div className="rv">
                <div className="tag">Why AI Dojo</div>
                <h2 className="sh">Built for the gap<br />between knowing<br />and <em>doing.</em></h2>
                <p className="why-lede">Most AI training teaches you to watch. We measure what you can build, debug, and deliver under real professional conditions.</p>
              </div>
              <div className="why-pillars" id="pillars">
                <div className="pillar tl" id="p1">
                  <span className="pi-n">01</span>
                  <div className="pi-t">Construction-based drills</div>
                  <div className="pi-d">You build real outputs. Scored against a professional rubric. No partial credit for effort.</div>
                </div>
                <div className="pillar tr" id="p2">
                  <span className="pi-n">02</span>
                  <div className="pi-t">A number that doesn&apos;t lie</div>
                  <div className="pi-d">Your score lives in a global distribution. You see exactly where you rank and what the gap is.</div>
                </div>
                <div className="pillar bl" id="p3">
                  <span className="pi-n">03</span>
                  <div className="pi-t">No completion certificates</div>
                  <div className="pi-d">The only credential AI Dojo produces is competence — measurable, verifiable, undeniable.</div>
                </div>
                <div className="pillar br" id="p4">
                  <span className="pi-n">04</span>
                  <div className="pi-t">12 domains, one standard</div>
                  <div className="pi-d">From prompt engineering to multi-agent systems. Every area a professional AI operator must command.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="div" id="dv2"></div>

        {/* Platform / Bento */}
        <section id="bento">
          <div className="sec">
            <div className="bento-head rv">
              <div className="tag">Platform</div>
              <h2 className="sh" style={{fontSize:'clamp(42px,5vw,72px)'}}>Everything built<br />around <em>your score.</em></h2>
            </div>
            <div className="bento-grid" id="bento-grid">
              <div className="bcard wide" id="bcard-main">
                <div className="bc-icon">📊</div>
                <div className="bc-t">Performance dashboard</div>
                <div className="bc-d">Every drill. Every score. Every gap. Your full operator profile — updated in real time.</div>
                <div className="bc-live-score">
                  <div className="bc-ls-top">
                    <div className="bc-ls-num" id="score-num" style={{fontSize:72}}></div>
                    <div className="bc-ls-info">
                      <span className="bc-ls-rank">Top 34% globally</span>
                      <span className="bc-ls-tier">Tier II Operator</span>
                    </div>
                  </div>
                  <div className="bc-ls-bars">
                    <div className="bc-bar-row">
                      <span className="bc-bar-lbl">Prompt Engineering</span>
                      <div className="bc-bar-track"><div className="bc-bar-fill" data-w="88"></div></div>
                      <span className="bc-bar-val">88</span>
                    </div>
                    <div className="bc-bar-row">
                      <span className="bc-bar-lbl">Reasoning Chains</span>
                      <div className="bc-bar-track"><div className="bc-bar-fill" data-w="74"></div></div>
                      <span className="bc-bar-val">74</span>
                    </div>
                    <div className="bc-bar-row">
                      <span className="bc-bar-lbl">Multi-Agent Systems</span>
                      <div className="bc-bar-track"><div className="bc-bar-fill" data-w="42"></div></div>
                      <span className="bc-bar-val">42</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bcard" id="bcard-2">
                <div className="bc-icon">🗂</div>
                <div className="bc-t">12 domains</div>
                <div className="bc-d">62 drills across 3 tiers — new content added monthly.</div>
                <div className="bc-domains">
                  <div className="bc-dp">Prompts</div>
                  <div className="bc-dp">Systems</div>
                  <div className="bc-dp">Reasoning</div>
                  <div className="bc-dp">Output</div>
                  <div className="bc-dp">Agents</div>
                  <div className="bc-dp">Ethics</div>
                </div>
                <div className="bc-tiers">
                  <span className="tbadge tb-f">Foundational</span>
                  <span className="tbadge tb-a">Advanced</span>
                  <span className="tbadge tb-e">Expert</span>
                </div>
              </div>

              <div className="bcard amber" id="bcard-3">
                <div className="bc-icon">⚡</div>
                <div className="bc-t">AI-scored in seconds</div>
                <div className="bc-d">Submit your output. Real score against a professional rubric. No waiting. No humans in the loop.</div>
              </div>

              <div className="bcard" id="bcard-4">
                <div className="bc-icon">🌐</div>
                <div className="bc-t">Global leaderboard</div>
                <div className="bc-d">Every score ranked against every operator. The gap is always visible. The motivation is always real.</div>
              </div>

              <div className="bcard amber" id="bcard-5">
                <div className="bc-icon">🔒</div>
                <div className="bc-t">No shortcuts</div>
                <div className="bc-d">No multiple choice. No partial credit. No effort scores. Only output quality moves your number.</div>
              </div>
            </div>
          </div>
        </section>

        <div className="div" id="dv3"></div>

        {/* Diagnostic / Code */}
        <section id="codesnip">
          <div className="sec">
            <div className="code-grid">
              <div className="rv">
                <div className="tag">The diagnostic</div>
                <h2 className="sh">See what a<br /><em>scored drill</em><br />actually looks like.</h2>
                <p className="code-desc">Every drill gives you a brief, a target, and a rubric. You produce the output. AI scores it in seconds against weighted criteria — no partial credit.</p>
              </div>
              <div className="code-window" id="code-window">
                <div className="cw-bar">
                  <div className="cw-dot cw-d1"></div>
                  <div className="cw-dot cw-d2"></div>
                  <div className="cw-dot cw-d3"></div>
                  <span className="cw-title">drill_01_prompt_engineering.md</span>
                </div>
                <div id="code-body"><span className="code-cursor" id="code-cur"></span></div>
                <div id="code-result">
                  <div className="cr-score"><span id="result-num">0</span>/100 <span className="cr-badge" id="result-badge"></span></div>
                  <div className="cr-sub" id="result-sub"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="div" id="dv4"></div>

        {/* Drills / Feature Scroll */}
        <section id="features">
          <div className="feat-head rv">
            <div className="tag">Drills</div>
            <h2 className="sh">What you actually<br /><em>train inside.</em></h2>
          </div>
          <div className="feat-scroll-wrap">
            <div className="feat-scroll" id="featscroll">
              <div className="fcard"><span className="fc-num">DOMAIN 01</span><div className="fc-t">Prompt Engineering</div><div className="fc-d">Write prompts that produce consistent, professional outputs across every model.</div><span className="fc-tag tb-f">Foundational</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 02</span><div className="fc-t">System Prompts</div><div className="fc-d">Design system prompts that enforce behavior, tone, and constraints reliably.</div><span className="fc-tag tb-f">Foundational</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 03</span><div className="fc-t">Reasoning Chains</div><div className="fc-d">Build chains of thought that solve complex problems step by step.</div><span className="fc-tag tb-a">Advanced</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 04</span><div className="fc-t">Output Control</div><div className="fc-d">Get exactly the format, length, and structure you need every time.</div><span className="fc-tag tb-f">Foundational</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 05</span><div className="fc-t">AI Workflows</div><div className="fc-d">Chain AI calls into repeatable, production-grade pipelines that don&apos;t break.</div><span className="fc-tag tb-a">Advanced</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 06</span><div className="fc-t">Context Management</div><div className="fc-d">Master context windows, memory, and state across long sessions.</div><span className="fc-tag tb-a">Advanced</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 07</span><div className="fc-t">Role Prompting</div><div className="fc-d">Set precise personas and behavioral profiles. The difference between a toy and a specialist.</div><span className="fc-tag tb-a">Advanced</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 08</span><div className="fc-t">Data Extraction</div><div className="fc-d">Pull structured data from unstructured text reliably and at scale.</div><span className="fc-tag tb-a">Advanced</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 09</span><div className="fc-t">AI Evaluation</div><div className="fc-d">Score and compare AI outputs programmatically. Build evals that work.</div><span className="fc-tag tb-a">Advanced</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 10</span><div className="fc-t">Tool Ecosystem</div><div className="fc-d">Integrate AI with real tools — APIs, databases, code interpreters.</div><span className="fc-tag tb-f">Foundational</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 11</span><div className="fc-t">Multi-Agent Systems</div><div className="fc-d">Orchestrate networks of agents that collaborate and produce results humans can&apos;t match alone.</div><span className="fc-tag tb-e">Expert</span></div>
              <div className="fcard"><span className="fc-num">DOMAIN 12</span><div className="fc-t">Ethics &amp; Risk</div><div className="fc-d">Understand where AI fails and how to operate responsibly at professional scale.</div><span className="fc-tag tb-a">Advanced</span></div>
            </div>
          </div>
        </section>

        <div className="div" id="dv5"></div>

        {/* Comparison */}
        <section id="comparison">
          <div className="sec">
            <div className="rv">
              <div className="tag">Comparison</div>
              <h2 className="sh">Why not just<br /><em>take a course?</em></h2>
            </div>
            <div className="comp-table rv d2" id="comp-table">
              <div className="ct-head">
                <div className="ct-h">Feature</div>
                <div className="ct-h hl">AI Dojo</div>
                <div className="ct-h">Udemy / Coursera</div>
                <div className="ct-h">YouTube / Free</div>
              </div>
              <div className="ct-row"><div className="ct-cell feature">Real performance score</div><div className="ct-cell hl"><span className="ct-check yes">✓</span></div><div className="ct-cell"><span className="ct-check no">✗</span></div><div className="ct-cell"><span className="ct-check no">✗</span></div></div>
              <div className="ct-row"><div className="ct-cell feature">AI-scored outputs</div><div className="ct-cell hl"><span className="ct-check yes">✓</span></div><div className="ct-cell"><span className="ct-check no">✗</span></div><div className="ct-cell"><span className="ct-check no">✗</span></div></div>
              <div className="ct-row"><div className="ct-cell feature">Global percentile ranking</div><div className="ct-cell hl"><span className="ct-check yes">✓</span></div><div className="ct-cell"><span className="ct-check no">✗</span></div><div className="ct-cell"><span className="ct-check no">✗</span></div></div>
              <div className="ct-row"><div className="ct-cell feature">Construction-based drills</div><div className="ct-cell hl"><span className="ct-check yes">✓</span></div><div className="ct-cell"><span className="ct-partial">Quiz only</span></div><div className="ct-cell"><span className="ct-check no">✗</span></div></div>
              <div className="ct-row"><div className="ct-cell feature">Free diagnostic</div><div className="ct-cell hl"><span className="ct-check yes">✓</span></div><div className="ct-cell"><span className="ct-partial">Paid</span></div><div className="ct-cell"><span className="ct-check yes">✓</span></div></div>
              <div className="ct-row"><div className="ct-cell feature">Updated monthly</div><div className="ct-cell hl"><span className="ct-check yes">✓</span></div><div className="ct-cell"><span className="ct-partial">Varies</span></div><div className="ct-cell"><span className="ct-partial">Varies</span></div></div>
            </div>
          </div>
        </section>

        <div className="div" id="dv6"></div>

        <div className="div" id="dv7"></div>

        {/* CTA */}
        <section id="cta">
          <canvas id="cta-canvas"></canvas>
          <canvas id="lamp-canvas"></canvas>
          <div className="cta-vig"></div>
          <div className="cta-in">
            <div className="cta-tag rv">Step one</div>
            <h2 className="cta-h rv d1">Find out where<br />you <em>actually</em> stand.</h2>
            <p className="cta-sub rv d2">5 drills. 8 minutes. No account required.<br />Your score tells you exactly where to start.</p>
            <div className="rv d3">
              <a href="/run?mode=diagnostic" className="btn-solid" style={{display:'inline-flex'}}>
                Begin Diagnostic{" "}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <p className="cta-note rv d4">Free during beta &nbsp;·&nbsp; No account required</p>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div className="foot-top">
            <div>
              <span className="foot-col-head">Product</span>
              <div className="foot-links">
                <a href="/run?mode=diagnostic" className="foot-link">Diagnostic</a>
                <a href="/curriculum" className="foot-link">Curriculum</a>
                <a href="/arena" className="foot-link">Leaderboard</a>
              </div>
            </div>
            <div>
              <span className="foot-col-head">Domains</span>
              <div className="foot-links">
                <a href="/curriculum" className="foot-link">Prompt Engineering</a>
                <a href="/curriculum" className="foot-link">Reasoning Chains</a>
                <a href="/curriculum" className="foot-link">Multi-Agent Systems</a>
              </div>
            </div>
            <div>
              <span className="foot-col-head">Company</span>
              <div className="foot-links">
                <a href="/" className="foot-link">About</a>
                <a href="/" className="foot-link">Blog</a>
                <a href="/" className="foot-link">Contact</a>
              </div>
            </div>
            <div>
              <span className="foot-col-head">Legal</span>
              <div className="foot-links">
                <a href="/" className="foot-link">Privacy</a>
                <a href="/" className="foot-link">Terms</a>
              </div>
            </div>
          </div>
          <div className="foot-bot">
            <span className="foot-logo">AI Dojo</span>
            <span className="foot-line">The only platform that measures real capability, not completion.</span>
            <span className="foot-copy">© 2027</span>
          </div>
        </footer>

      </div>
    </>
  );
}
