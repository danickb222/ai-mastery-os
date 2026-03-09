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

        {/* Nav */}
        <nav>
          <a href="/" className="nav-logo">AI Dojo</a>
          <a href="/" className="nav-a on">Dashboard</a>
          <a href="/curriculum" className="nav-a">Train</a>
          <a href="/arena" className="nav-a">Arena</a>
          <a href="/lab" className="nav-a">Lab</a>
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
            <div id="waitlist" style={{ marginTop: 40 }}>
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
                    style={{ display: 'flex', gap: 10, maxWidth: 480 }}
                  >
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={waitlistEmail}
                      onChange={e => setWaitlistEmail(e.target.value)}
                      style={{
                        width: 280, padding: '12px 16px',
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
