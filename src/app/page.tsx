"use client";

import { useEffect, useRef, useState } from "react";
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
import { DOMAINS } from "@/core/content/domains";
import { getDrillsByDomain } from "@/core/content/drills";
import type { DrillResult } from "@/core/types/drills";

const TICKER_ITEMS = [
  { handle: 'operator_mk', action: 'scored', score: '92/100', domain: 'Prompt Engineering' },
  { handle: 'jzhang', action: 'completed', domain: 'Multi-Agent Systems' },
  { handle: 'sara_w', action: 'scored', score: '84/100', domain: 'Reasoning Chains' },
  { handle: 'devkris', action: 'moved to', domain: 'Tier III' },
  { handle: 'tomh', action: 'scored', score: '77/100', domain: 'Output Control' },
  { handle: 'an.lee', action: 'reached', domain: 'Top 10%' },
  { handle: 'rbenson', action: 'scored', score: '88/100', domain: 'Context Management' },
  { handle: 'mx_op', action: 'completed', domain: 'AI Workflows' },
];

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

const COMP_ROWS = [
  { feature: 'Real performance score',    dojo: 'yes', udemy: 'no',   yt: 'no'  },
  { feature: 'AI-scored outputs',          dojo: 'yes', udemy: 'no',   yt: 'no'  },
  { feature: 'Global percentile ranking',  dojo: 'yes', udemy: 'no',   yt: 'no'  },
  { feature: 'Construction-based drills',  dojo: 'yes', udemy: 'quiz', yt: 'no'  },
  { feature: 'Free diagnostic',            dojo: 'yes', udemy: 'paid', yt: 'yes' },
  { feature: 'Updated monthly',            dojo: 'yes', udemy: 'var',  yt: 'var' },
];

export default function Dashboard() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [arenaState, setArenaState] = useState<ArenaState | null>(null);
  const [lastSession, setLastSession] = useState<LastDrillSession | null>(null);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [daysSinceActive, setDaysSinceActive] = useState(0);
  const [comingSoonTab, setComingSoonTab] = useState<string | null>(null);
  const comingSoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Suppress "unused" warnings for dashboard state that gets populated but
  // isn't rendered directly on the marketing page
  void loaded; void profile; void domainScores; void arenaState;
  void lastSession; void scoreDelta; void daysSinceActive;

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

    // ── Drill animation (fires on scroll, then loops) ──
    function runDrillAnimation() {
      const body = document.getElementById('code-body');
      const cur  = document.getElementById('code-cur');
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

      // Reset
      const res = document.getElementById('code-result');
      if (res) { res.style.display = 'none'; res.classList.remove('show'); }
      const badge = document.getElementById('result-badge');
      const sub   = document.getElementById('result-sub');
      const num   = document.getElementById('result-num');
      if (badge) badge.textContent = '';
      if (sub)   sub.textContent = '';
      if (num)   num.textContent = '0';

      body.innerHTML = '';
      body.appendChild(cur);
      cur.style.display = 'inline';

      let lineIdx = 0, charIdx = 0;
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
          const sub   = document.getElementById('result-sub');
          if (badge) badge.textContent = 'Top 12% on this drill';
          if (sub)   sub.textContent   = '→ Rubric: clarity 23 · format 22 · edge_cases 21 · efficiency 22';
        }, 400);
        // Loop after 4s hold
        setTimeout(runDrillAnimation, 4000);
      }));
    }

    function initDragScroll() {
      const el = document.getElementById('featscroll'); if (!el) return;
      let down = false, sx = 0, sl = 0;
      el.addEventListener('mousedown', (e: MouseEvent) => { down = true; sx = e.pageX - el.offsetLeft; sl = el.scrollLeft; });
      el.addEventListener('mouseleave', () => down = false);
      el.addEventListener('mouseup',    () => down = false);
      el.addEventListener('mousemove',  (e: MouseEvent) => {
        if (!down) return; e.preventDefault();
        el.scrollLeft = sl - (e.pageX - el.offsetLeft - sx);
      });
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
    initDragScroll();
    startHero();

    // Scroll progress bar
    const handleScroll = () => {
      const bar = document.getElementById('bar');
      if (bar) bar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Generic .rv reveal
    const rvEls = document.querySelectorAll('.rv');
    const rvObservers: IntersectionObserver[] = [];
    rvEls.forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
      }, { threshold: .08, rootMargin: '-20px' });
      obs.observe(el);
      rvObservers.push(obs);
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

    // Code window — fires on scroll, then loops via showResult
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

    // Why pillars: merge-in animation
    const pillarsEl = document.querySelector('.why-pillars');
    let pillarsObs: IntersectionObserver | null = null;
    if (pillarsEl) {
      pillarsObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const pillars = pillarsEl.querySelectorAll('.pillar');
            pillars.forEach((p, i) => setTimeout(() => p.classList.add('merged'), i * 90));
            pillarsObs!.disconnect();
          }
        });
      }, { threshold: .15 });
      pillarsObs.observe(pillarsEl);
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
                animateNumber('bento-score', 0, 71, 1200);
                const fills = card.querySelectorAll('.bc-bar-fill') as NodeListOf<HTMLElement>;
                const vals = [88, 74, 42];
                fills.forEach((fill, fi) => {
                  setTimeout(() => { fill.style.width = vals[fi] + '%'; }, 400 + fi * 180);
                });
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

    // Comparison rows appear + checkmark pop
    const ctRows = document.querySelectorAll('.ct-row');
    const ctObs: IntersectionObserver[] = [];
    ctRows.forEach((row, i) => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => {
              row.classList.add('appeared');
              setTimeout(() => {
                row.querySelectorAll('.ct-check').forEach(c => c.classList.add('popped'));
              }, 220);
            }, i * 80);
            obs.disconnect();
          }
        });
      }, { threshold: .2 });
      obs.observe(row);
      ctObs.push(obs);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      rvObservers.forEach(o => o.disconnect());
      divObservers.forEach(o => o.disconnect());
      bcardObs.forEach(o => o.disconnect());
      fcardObs.forEach(o => o.disconnect());
      ctObs.forEach(o => o.disconnect());
      if (codeObs)    codeObs.disconnect();
      if (pillarsObs) pillarsObs.disconnect();
    };
  }, []);

  function showComingSoon(href: string) {
    setComingSoonTab(href);
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    comingSoonTimer.current = setTimeout(() => setComingSoonTab(null), 2000);
  }

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
              <a href="/profile" style={{
                fontSize: 12.5, fontWeight: 400, color: "rgba(255,255,255,0.28)", padding: "6px 14px",
                borderRadius: 11, background: "transparent", textDecoration: "none", border: "1px solid transparent",
                transition: "all 150ms ease",
              }}>Profile</a>
            </div>
            <a href="/diagnostic" style={{
              marginLeft: 8, padding: "6px 14px", background: "#fff", borderRadius: 10,
              color: "#000", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
            }}>Start Diagnostic</a>
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
              <a href="/diagnostic" className="btn-solid">
                Begin Diagnostic{" "}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#cta" className="btn-line" onClick={scrollToCta}>
                Join Waitlist{" "}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          <div className="hero-scroll">
            <div className="scr-rod"></div>
            <span className="scr-txt">Scroll</span>
          </div>
        </section>

        <div className="div" id="dv1"></div>

        {/* ── 2. Why AI Dojo ── */}
        <section id="why">
          <div className="sec">
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
                <div className="pillar tr">
                  <span className="pi-n">02</span>
                  <div className="pi-t">A number that doesn&apos;t lie</div>
                  <div className="pi-d">Your score lives in a global distribution. You see exactly where you rank and what the gap is.</div>
                </div>
                <div className="pillar bl">
                  <span className="pi-n">03</span>
                  <div className="pi-t">No completion certificates</div>
                  <div className="pi-d">The only credential AI Dojo produces is competence — measurable, verifiable, undeniable.</div>
                </div>
                <div className="pillar br">
                  <span className="pi-n">04</span>
                  <div className="pi-t">12 domains, one standard</div>
                  <div className="pi-d">From prompt engineering to multi-agent systems. Every area a professional AI operator must command.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="div" id="dv2"></div>

        {/* ── 3. Bento / Platform ── */}
        <section id="bento">
          <div className="sec">
            <div className="bento-head">
              <div className="tag">Platform</div>
              <h2 className="sh rv">Everything built around your <em>score.</em></h2>
            </div>
            <div className="bento-grid">

              {/* Card 1 — wide: Performance dashboard */}
              <div className="bcard wide">
                <div className="bc-icon">📊</div>
                <div className="bc-t">Performance dashboard</div>
                <div className="bc-d">Every drill. Every score. Every gap. Your full operator profile — updated in real time.</div>
                <div className="bc-live-score">
                  <div className="bc-ls-top">
                    <div className="bc-ls-num" id="bento-score">0</div>
                    <div className="bc-ls-info">
                      <span className="bc-ls-rank">Top 34% globally</span>
                      <span className="bc-ls-tier">Tier II Operator</span>
                    </div>
                  </div>
                  <div className="bc-ls-bars">
                    {[
                      { lbl: 'Prompt Engineering',  val: 88 },
                      { lbl: 'Reasoning Chains',    val: 74 },
                      { lbl: 'Multi-Agent Systems', val: 42 },
                    ].map(row => (
                      <div key={row.lbl} className="bc-bar-row">
                        <div className="bc-bar-lbl">{row.lbl}</div>
                        <div className="bc-bar-track">
                          <div className="bc-bar-fill" style={{ width: 0 }}></div>
                        </div>
                        <div className="bc-bar-val">{row.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2 — 12 domains */}
              <div className="bcard">
                <div className="bc-icon">🗂</div>
                <div className="bc-t">12 domains</div>
                <div className="bc-d">62 drills across 3 tiers — new content added monthly.</div>
                <div className="bc-domains">
                  {['Prompts', 'Systems', 'Reasoning', 'Output', 'Agents', 'Ethics'].map(d => (
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
              <div className="bcard amber">
                <div className="bc-icon">⚡</div>
                <div className="bc-t">AI-scored in seconds</div>
                <div className="bc-d">Submit your output. Real score against a professional rubric. No waiting. No humans in the loop.</div>
              </div>

              {/* Card 4 — Global leaderboard */}
              <div className="bcard">
                <div className="bc-icon">🌐</div>
                <div className="bc-t">Global leaderboard</div>
                <div className="bc-d">Every score ranked against every operator. The gap is always visible. The motivation is always real.</div>
              </div>

              {/* Card 5 — amber: No shortcuts */}
              <div className="bcard amber">
                <div className="bc-icon">🔒</div>
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
              </div>
              <div className="code-window" id="code-window">
                <div className="cw-bar">
                  <div className="cw-dot cw-d1"></div>
                  <div className="cw-dot cw-d2"></div>
                  <div className="cw-dot cw-d3"></div>
                  <span className="cw-title">drill_01_prompt_engineering.md</span>
                </div>
                <div id="code-body" style={{ padding: 24, fontFamily: 'var(--font-code)', fontSize: 12.5, lineHeight: 1.8, height: 340, whiteSpace: 'pre', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  <span id="code-cur" className="code-cursor"></span>
                </div>
                <div id="code-result" style={{ margin: '0 24px 24px', padding: '16px 20px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10, display: 'none', opacity: 0, transform: 'translateY(8px)', transition: 'opacity .5s, transform .5s' }}>
                  <div className="cr-score">
                    <span id="result-num">0</span>/100
                    <span className="cr-badge" id="result-badge"></span>
                  </div>
                  <div className="cr-sub" id="result-sub"></div>
                </div>
              </div>
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
          <div className="feat-scroll-wrap">
            <div className="feat-scroll" id="featscroll">
              {DOMAINS_DATA.map(d => (
                <div key={d.num} className="fcard">
                  <span className="fc-num">DOMAIN {d.num}</span>
                  <div className="fc-t">{d.title}</div>
                  <div className="fc-d">{d.desc}</div>
                  <span className={`fc-tag badge ${tierClass(d.tier)}`}>{d.tier}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="div" id="dv5"></div>

        {/* ── 6. Comparison table ── */}
        <section id="comparison">
          <div className="sec">
            <div className="tag rv">Comparison</div>
            <h2 className="sh rv d1">Why not just <em>take a course?</em></h2>
            <div className="comp-table">
              <div className="ct-head">
                <div className="ct-h">Feature</div>
                <div className="ct-h hl">AI Dojo</div>
                <div className="ct-h">Udemy / Coursera</div>
                <div className="ct-h">YouTube / Free</div>
              </div>
              {COMP_ROWS.map(row => (
                <div key={row.feature} className="ct-row">
                  <div className="ct-cell feature">{row.feature}</div>
                  {/* AI Dojo */}
                  <div className="ct-cell hl">
                    <span className="ct-check yes">✓</span>
                  </div>
                  {/* Udemy */}
                  <div className="ct-cell">
                    {row.udemy === 'no'   && <span className="ct-check no">✗</span>}
                    {row.udemy === 'yes'  && <span className="ct-check yes">✓</span>}
                    {row.udemy === 'quiz' && <span className="ct-partial">Quiz only</span>}
                    {row.udemy === 'paid' && <span className="ct-partial">Paid</span>}
                    {row.udemy === 'var'  && <span className="ct-partial">Varies</span>}
                  </div>
                  {/* YouTube */}
                  <div className="ct-cell">
                    {row.yt === 'no'  && <span className="ct-check no">✗</span>}
                    {row.yt === 'yes' && <span className="ct-check yes">✓</span>}
                    {row.yt === 'var' && <span className="ct-partial">Varies</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. Live ticker ── */}
        <div id="ticker">
          <div className="ticker-wrap">
            <span className="ticker-label">Live activity</span>
            <div className="ticker-track">
              <div className="ticker-scroll">
                {/* Duplicate items once for seamless loop */}
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                  <div key={i} className="tick-item">
                    <div className="tick-dot"></div>
                    <span className="tick-text">
                      <strong style={{ color: 'rgba(255,255,255,0.55)' }}>{item.handle}</strong>
                      {' '}{item.action}{' '}
                      {item.score && <span className="tick-score">{item.score}</span>}
                      {item.score && ' · '}
                      {item.domain}
                    </span>
                    <span className="tick-sep">·</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 8. CTA ── */}
        <section id="cta">
          <div className="cta-in">
            <div className="cta-tag rv">Step one</div>
            <h2 className="cta-h rv d1">Find out where you <em>actually</em> stand.</h2>
            <p className="cta-sub rv d2">5 drills. 8 minutes. No account required. Your score tells you exactly where to start.</p>
            <a href="/diagnostic" className="btn-solid rv d3">
              Begin Diagnostic{" "}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <div className="cta-note rv d4">Free to start · No account required</div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ padding: '32px 28px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', margin: 0 }}>
            © 2025 AI Dojo · Built by Daniel Brocato
          </p>
        </footer>

      </div>
    </>
  );
}
