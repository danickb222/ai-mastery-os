"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DrillPreview from "@/components/DrillPreview";
import { motion, AnimatePresence } from "framer-motion";
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
  const [comingSoonTab, setComingSoonTab] = useState<string | null>(null);
  const comingSoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // Show page immediately — no loader
    const page = document.getElementById('page');
    if (page) page.classList.add('show');
    if ((window as any).THREE) {
      initHeroCanvas();
    } else {
      const tCheck = setInterval(() => {
        if ((window as any).THREE) { clearInterval(tCheck); initHeroCanvas(); }
      }, 50);
    }
    initDragScroll();
    startHero();

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

    return () => {
      window.removeEventListener('scroll', handleScroll);
      rvObservers.forEach(obs => obs.disconnect());
      divObservers.forEach(obs => obs.disconnect());
      if (codeObs) codeObs.disconnect();
    };
  }, []);

  function showComingSoon(href: string) {
    setComingSoonTab(href);
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    comingSoonTimer.current = setTimeout(() => setComingSoonTab(null), 2000);
  }

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
      {/* Page */}
      <div id="page">

        {/* Nav — matches AppShell exactly */}
        <nav style={{
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
            <div style={{ display: "flex", gap: 2 }}>
              {/* Dashboard — active on homepage */}
              <a href="/" style={{
                fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.9)", padding: "6px 14px",
                borderRadius: 11, background: "rgba(255,255,255,0.08)", textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>Dashboard</a>
              {/* Train */}
              <a href="/curriculum" style={{
                fontSize: 12.5, fontWeight: 400, color: "rgba(255,255,255,0.28)", padding: "6px 14px",
                borderRadius: 11, background: "transparent", textDecoration: "none", border: "1px solid transparent",
                transition: "all 150ms ease",
              }}>Train</a>
              {/* Arena — locked */}
              <div style={{ position: "relative" }}>
                <button onClick={() => showComingSoon('/arena')} style={{
                  fontSize: 12.5, fontWeight: 400, color: "rgba(255,255,255,0.35)", padding: "6px 14px",
                  borderRadius: 11, background: "transparent", border: "1px solid transparent",
                  cursor: "default", fontFamily: "inherit",
                }}>Arena</button>
                <div style={{
                  position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                  marginTop: 6, background: "rgba(20,21,26,0.95)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6, padding: "4px 10px", fontFamily: "var(--font-code)", fontSize: 10,
                  letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap",
                  zIndex: 2000, pointerEvents: "none",
                  opacity: comingSoonTab === '/arena' ? 1 : 0, transition: "opacity 0.2s ease",
                }}>Coming soon</div>
              </div>
              {/* Lab — locked */}
              <div style={{ position: "relative" }}>
                <button onClick={() => showComingSoon('/lab')} style={{
                  fontSize: 12.5, fontWeight: 400, color: "rgba(255,255,255,0.35)", padding: "6px 14px",
                  borderRadius: 11, background: "transparent", border: "1px solid transparent",
                  cursor: "default", fontFamily: "inherit",
                }}>Lab</button>
                <div style={{
                  position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                  marginTop: 6, background: "rgba(20,21,26,0.95)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6, padding: "4px 10px", fontFamily: "var(--font-code)", fontSize: 10,
                  letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap",
                  zIndex: 2000, pointerEvents: "none",
                  opacity: comingSoonTab === '/lab' ? 1 : 0, transition: "opacity 0.2s ease",
                }}>Coming soon</div>
              </div>
              {/* Profile */}
              <a href="/profile" style={{
                fontSize: 12.5, fontWeight: 400, color: "rgba(255,255,255,0.28)", padding: "6px 14px",
                borderRadius: 11, background: "transparent", textDecoration: "none", border: "1px solid transparent",
                transition: "all 150ms ease",
              }}>Profile</a>
            </div>
            {/* Start Diagnostic white pill */}
            <a href="/diagnostic" style={{
              marginLeft: 8, padding: "6px 14px", background: "#fff", borderRadius: 10,
              color: "#000", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
            }}>Start Diagnostic</a>
          </div>
        </nav>

        {/* Hero */}
        <section id="hero">
          <div id="hero-shader"></div>
          <div className="hero-orb"></div>
          <div className="hv1"></div>
          <div className="hv2"></div>
          <div className="hv3"></div>
          <div className="hero-in">
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
              <a href="/diagnostic" className="btn-solid">
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
            <div id="waitlist" style={{ marginTop: 40, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 12 }}>
                EARLY ACCESS
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 24 }}>
                Join the waitlist.
              </h2>
              <AnimatePresence mode="wait">
                {waitlistStatus === 'done' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ color: 'var(--cyan)', fontFamily: 'var(--font-body)', fontSize: 15 }}
                  >
                    You&apos;re on the list. ✓
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleWaitlist}
                    style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
                  >
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={waitlistEmail}
                      onChange={e => setWaitlistEmail(e.target.value)}
                      style={{
                        width: 260, padding: '12px 16px',
                        background: 'var(--bg3)',
                        border: '1px solid var(--border)',
                        borderRadius: 10, color: '#fff',
                        fontFamily: 'var(--font-body)', fontSize: 14,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={waitlistStatus === 'loading'}
                      style={{
                        padding: '12px 24px',
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
                <p style={{ marginTop: 10, fontFamily: 'var(--font-code)', fontSize: 11, color: '#ef4444' }}>
                  Something went wrong. Try again.
                </p>
              )}
              <p style={{ marginTop: 14, fontFamily: 'var(--font-code)', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
                No spam. Early access to all 12 domains.
              </p>
            </div>
          </div>
          <div className="hero-scroll">
            <div className="scr-rod"></div>
            <span className="scr-txt">Scroll</span>
          </div>
        </section>

        <div className="div" id="dv3"></div>

        {/* Why AI Dojo */}
        <section style={{ padding: '80px 28px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 16 }}>
                WHY AI DOJO
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
                A different kind of platform.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {[
                { num: '01', title: 'Performance over certificates', desc: 'Most platforms teach. AI Dojo measures. The only metric that matters is your score.' },
                { num: '02', title: 'No passive learning', desc: 'Every session is a drill. Every drill is scored. You always know exactly where you stand.' },
                { num: '03', title: 'Built for professionals', desc: 'Designed for operators who use AI at work, not students watching videos.' },
                { num: '04', title: '12 domains, one standard', desc: 'From prompt engineering to multi-agent systems. Every area a professional AI operator must command.' },
              ].map((item, i) => (
                <div key={item.num} className="rv" style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14,
                  padding: '28px 24px', transitionDelay: `${i * 60}ms`,
                }}>
                  <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, letterSpacing: '0.16em', color: 'var(--cyan)', marginBottom: 14 }}>
                    {item.num} ·
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 10, lineHeight: 1.35 }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento grid */}
        <section style={{ padding: '0 28px 80px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
              <h2 className="rv" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
                Everything you need to operate<br />at the top level.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }}>
              {/* Card 1 — large */}
              <div className="rv" style={{
                gridColumn: 'span 7', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '32px 28px', minHeight: 260,
              }}>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 12 }}>
                  OPERATOR PROFILE
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>
                  Your operator profile
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 24, maxWidth: 340 }}>
                  Every drill. Every score. Every gap. Your full operator profile — updated in real time.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Prompt Engineering', pct: 84 },
                    { label: 'System Prompts', pct: 71 },
                    { label: 'Reasoning Chains', pct: 58 },
                    { label: 'Output Control', pct: 92 },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 148, flexShrink: 0 }}>{row.label}</div>
                      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${row.pct}%`, height: '100%', background: 'var(--cyan)', borderRadius: 2 }} />
                      </div>
                      <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--cyan)', width: 28, textAlign: 'right' }}>{row.pct}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Card 2 */}
              <div className="rv" style={{
                gridColumn: 'span 5', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '32px 28px',
              }}>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 12 }}>
                  SCORING
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>
                  Live AI scoring
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 24 }}>
                  Every submission evaluated against a weighted rubric in seconds.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 400, color: '#fff', lineHeight: 1 }}>88</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--cyan)', marginBottom: 4 }}>Top 12% on this drill</div>
                    <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>clarity · format · edges · efficiency</div>
                  </div>
                </div>
              </div>
              {/* Card 3 */}
              <div className="rv" style={{
                gridColumn: 'span 5', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '32px 28px',
              }}>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 12 }}>
                  COVERAGE
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>
                  12 domains
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 20 }}>
                  Every area of professional AI operation, structured and scored.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Prompts', 'Systems', 'Reasoning', 'Output', 'Agents', 'Ethics'].map(d => (
                    <span key={d} style={{
                      fontFamily: 'var(--font-code)', fontSize: 10, letterSpacing: '0.1em',
                      color: 'var(--cyan)', background: 'rgba(0,212,255,0.08)',
                      border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, padding: '4px 10px',
                    }}>{d}</span>
                  ))}
                </div>
              </div>
              {/* Card 4 */}
              <div className="rv" style={{
                gridColumn: 'span 7', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '32px 28px',
              }}>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 12 }}>
                  LEADERBOARD
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>
                  Global leaderboard
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 24, maxWidth: 340 }}>
                  Every score ranked against every operator. The gap is always visible.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { rank: '01', name: 'operator_7x', score: 97 },
                    { rank: '02', name: 'ml_practitioner', score: 94 },
                    { rank: '03', name: 'you', score: 88, highlight: true },
                    { rank: '04', name: 'prompt_master', score: 85 },
                  ].map(row => (
                    <div key={row.rank} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '8px 12px', borderRadius: 8,
                      background: row.highlight ? 'rgba(0,212,255,0.08)' : 'transparent',
                      border: row.highlight ? '1px solid rgba(0,212,255,0.18)' : '1px solid transparent',
                    }}>
                      <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.3)', width: 20 }}>{row.rank}</div>
                      <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: row.highlight ? 'var(--cyan)' : 'rgba(255,255,255,0.55)', flex: 1 }}>{row.name}</div>
                      <div style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: row.highlight ? 'var(--cyan)' : 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{row.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Drill Preview */}
        <section id="codesnip">
          <div className="sec">
            <div className="code-grid">
              <div className="rv">
                <div className="tag">The diagnostic</div>
                <h2 className="sh">See what a<br /><em>scored drill</em><br />actually looks like.</h2>
                <p className="code-desc">Every drill gives you a brief, a target, and a rubric. You produce the output. AI scores it in seconds against weighted criteria — no partial credit.</p>
              </div>
              <DrillPreview />
            </div>
          </div>
        </section>

        {/* Gap section */}
        <section id="gap" style={{ padding: '80px 28px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64, alignItems: 'center' }}>
            {/* Left: heading */}
            <div className="rv">
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 16 }}>
                The method
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 24 }}>
                Built for the gap between knowing and <em>doing.</em>
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 420 }}>
                You can read about prompt engineering for weeks. Or you can build 50 prompts, get scored on every one, and know exactly where you stand.
              </p>
            </div>
            {/* Right: feature cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Live AI scoring', desc: 'Every submission is evaluated against a weighted rubric in seconds — no partial credit, no ambiguity.' },
                { label: 'Precision feedback', desc: 'See exactly which criteria you hit or missed, with a score on every dimension of your output.' },
                { label: 'Adaptive difficulty', desc: 'The system routes you to your weakest areas. Harder drills unlock as you improve.' },
              ].map((item, i) => (
                <div key={item.label} className="rv" style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px',
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  transitionDelay: `${i * 80}ms`,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 5 }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12 Domains grid */}
        <section style={{ padding: '80px 28px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 16 }}>
                THE CURRICULUM
              </div>
              <h2 className="rv" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 16px' }}>
                12 domains. One complete skill set.
              </h2>
              <p className="rv" style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                Master every area of professional AI operation.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {[
                { num: '01', title: 'Prompt Engineering', desc: 'Write prompts that produce consistent, professional outputs across every model.', tier: 'FOUNDATIONAL' },
                { num: '02', title: 'System Prompts', desc: 'Design system prompts that enforce behavior, tone, and constraints reliably.', tier: 'FOUNDATIONAL' },
                { num: '03', title: 'Reasoning Chains', desc: 'Build chains of thought that solve complex problems step by step.', tier: 'ADVANCED' },
                { num: '04', title: 'Output Control', desc: 'Get exactly the format, length, and structure you need every time.', tier: 'FOUNDATIONAL' },
                { num: '05', title: 'AI Workflows', desc: 'Chain AI calls into repeatable, production-grade pipelines that don\'t break.', tier: 'ADVANCED' },
                { num: '06', title: 'Context Management', desc: 'Master context windows, memory, and state across long sessions.', tier: 'ADVANCED' },
                { num: '07', title: 'Role Prompting', desc: 'Set precise personas and behavioral profiles.', tier: 'ADVANCED' },
                { num: '08', title: 'Data Extraction', desc: 'Pull structured data from unstructured text reliably and at scale.', tier: 'ADVANCED' },
                { num: '09', title: 'AI Evaluation', desc: 'Score and compare AI outputs programmatically. Build evals that work.', tier: 'ADVANCED' },
                { num: '10', title: 'Tool Ecosystem', desc: 'Integrate AI with real tools — APIs, databases, code interpreters.', tier: 'FOUNDATIONAL' },
                { num: '11', title: 'Multi-Agent Systems', desc: 'Orchestrate networks of AI agents that collaborate on complex tasks.', tier: 'EXPERT' },
                { num: '12', title: 'Ethics & Risk', desc: 'Identify, mitigate, and manage risk in production AI systems.', tier: 'EXPERT' },
              ].map((domain, i) => {
                const tierStyle: React.CSSProperties = domain.tier === 'FOUNDATIONAL'
                  ? { color: 'var(--cyan)', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }
                  : domain.tier === 'ADVANCED'
                  ? { color: '#fb923c', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)' }
                  : { color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)' };
                return (
                  <div key={domain.num} className="rv" style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14,
                    padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 10,
                    transitionDelay: `${i * 40}ms`,
                  }}>
                    <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--cyan)' }}>
                      DOMAIN {domain.num}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                      {domain.title}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, flex: 1 }}>
                      {domain.desc}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <span style={{
                        fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.14em',
                        padding: '3px 8px', borderRadius: 5, ...tierStyle,
                      }}>{domain.tier}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '32px 28px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', margin: 0 }}>
            © 2025 AI Dojo · Built by Daniel Brocato
          </p>
        </footer>

      </div>
    </>
  );
}
