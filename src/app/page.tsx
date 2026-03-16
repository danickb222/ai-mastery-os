"use client";

import { useEffect, useState } from "react";


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
  { feature: 'Adaptive difficulty',             dojo: 'yes', udemy: 'no',                            yt: 'no' },
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
  
  // ── All landing page JS behaviors ──
  useEffect(() => {
    const WORDS = [
      'founders.','builders.','students.','starters.','creators.',
      'dreamers.','pioneers.','hustlers.','strivers.','explorers.',
      'learners.','seekers.','achievers.','tinkerers.','operators.',
      'doers.','makers.','students.','teachers.'
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
      standby.style.transform = `translateY(-${clipH}px)`;
      standby.style.opacity   = '0';

      setInterval(() => {
        idx = (idx + 1) % shuffled.length;
        standby.textContent = shuffled[idx];
        standby.style.transition = 'none';
        standby.style.transform  = `translateY(-${clipH}px)`;
        standby.style.opacity    = '0';

        requestAnimationFrame(() => requestAnimationFrame(() => {
          const ease = '.52s cubic-bezier(.4,0,.2,1)';
          active.style.transition  = `transform ${ease},opacity ${ease}`;
          active.style.transform   = `translateY(${clipH}px)`;
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

    // ── Drill animation — 6 phases: broken → fade → improved → cursor → click → score → loop ──
    function runDrillAnimation() {
      const body = document.getElementById('code-body');
      const cur  = document.getElementById('code-cur');
      if (!body || !cur) return;

      const res = document.getElementById('code-result');
      if (res) { res.style.display = 'none'; res.style.opacity = '0'; }
      const badge = document.getElementById('result-badge');
      const num   = document.getElementById('result-num');
      const submitBtn = document.getElementById('code-submit');
      const cursorDot = document.getElementById('cursor-dot');
      if (badge) { badge.textContent = ''; badge.style.opacity = '0'; }
      if (num)   num.textContent = '0';
      if (submitBtn) { submitBtn.style.display = 'none'; submitBtn.classList.remove('clicked'); }
      if (cursorDot) { cursorDot.style.display = 'none'; cursorDot.style.opacity = '0'; }

      body.innerHTML = '';
      body.appendChild(cur);
      cur.style.display = 'inline';

      // Phase 1 — realistic broken prompt (vague, no structure, common beginner mistakes)
      const brokenLines = [
        {t:'comment', text:'# Draft prompt\n\n'},
        {t:'err',     text:'Hey can you help me write a\n'},
        {t:'err',     text:'good email to my team about\n'},
        {t:'err',     text:'the AI project? Make it sound\n'},
        {t:'err',     text:'professional and also mention\n'},
        {t:'err',     text:'the budget stuff and timeline\n'},
        {t:'err',     text:'and everything else thats\n'},
        {t:'err',     text:'important. Thanks!\n'},
      ];

      // Phase 2 — realistic improved prompt (structured, constrained, professional)
      const goodLines = [
        {t:'key',     text:'ROLE'},
        {t:'op',      text:': '},
        {t:'plain',   text:'Senior program manager\n\n'},
        {t:'key',     text:'TASK'},
        {t:'op',      text:': '},
        {t:'plain',   text:'Write a project update email\n'},
        {t:'plain',   text:'  to the engineering team.\n\n'},
        {t:'key',     text:'CONTEXT'},
        {t:'op',      text:':\n'},
        {t:'fn',      text:'  Project: '},
        {t:'plain',   text:'Internal AI assistant\n'},
        {t:'fn',      text:'  Budget:  '},
        {t:'num',     text:'$140k / $200k spent\n'},
        {t:'fn',      text:'  Status:  '},
        {t:'plain',   text:'On track, 2 weeks ahead\n\n'},
        {t:'key',     text:'FORMAT'},
        {t:'op',      text:':\n'},
        {t:'plain',   text:'  - Subject line + 3 paragraphs\n'},
        {t:'plain',   text:'  - Bullet list for milestones\n'},
        {t:'plain',   text:'  - Max 180 words\n\n'},
        {t:'key',     text:'TONE'},
        {t:'op',      text:': '},
        {t:'plain',   text:'Direct, confident, no jargon\n'},
      ];

      function typeLines(lines: {t:string,text:string}[], onDone: () => void, speed?: number) {
        let lineIdx = 0, charIdx = 0;
        let currentSpan: HTMLElement | null = null;
        const baseSpeed = speed || 22;
        function typeNext() {
          if (lineIdx >= lines.length) { onDone(); return; }
          const line = lines[lineIdx];
          if (line.t === 'PAUSE') { lineIdx++; setTimeout(typeNext, 700); return; }
          if (charIdx === 0) {
            currentSpan = document.createElement('span');
            currentSpan.className = 'tok-' + line.t;
            body!.insertBefore(currentSpan, cur);
          }
          if (charIdx < line.text.length) {
            currentSpan!.textContent += line.text[charIdx];
            charIdx++;
            const delay = line.text[charIdx - 1] === '\n' ? baseSpeed + 8 : baseSpeed;
            setTimeout(typeNext, delay);
          } else { charIdx = 0; lineIdx++; setTimeout(typeNext, 6); }
        }
        typeNext();
      }

      // Phase 1: type broken prompt fast
      typeLines(brokenLines, () => {
        // Hold 1.4s so viewer reads the bad prompt
        setTimeout(() => {
          // Fade out broken prompt
          body!.style.transition = 'opacity 0.35s ease';
          body!.style.opacity = '0';
          setTimeout(() => {
            body!.innerHTML = '';
            body!.appendChild(cur);
            cur.style.display = 'inline';
            body!.style.opacity = '1';
            // Phase 2: type improved prompt
            typeLines(goodLines, () => {
              cur.style.display = 'none';
              // Phase 3: show submit button
              if (submitBtn) {
                submitBtn.style.display = 'inline-flex';
                submitBtn.style.opacity = '0';
                submitBtn.style.transform = 'translateY(6px)';
                requestAnimationFrame(() => {
                  submitBtn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                  submitBtn.style.opacity = '1';
                  submitBtn.style.transform = 'translateY(0)';
                });
              }
              // Phase 4: animate cursor toward button using real coordinates
              setTimeout(() => {
                const codeWin = document.getElementById('code-window');
                if (cursorDot && submitBtn && codeWin) {
                  const winRect = codeWin.getBoundingClientRect();
                  const btnRect = submitBtn.getBoundingClientRect();
                  // Start cursor: center of code body
                  const startX = (winRect.width * 0.55);
                  const startY = (btnRect.top - winRect.top - 40);
                  // End cursor: center of button
                  const endX = (btnRect.left - winRect.left + btnRect.width / 2 + 8);
                  const endY = (btnRect.top - winRect.top + btnRect.height / 2 + 2);

                  cursorDot.style.display = 'block';
                  cursorDot.style.opacity = '0';
                  cursorDot.style.left = startX + 'px';
                  cursorDot.style.top = startY + 'px';
                  cursorDot.style.transform = 'scale(1)';
                  cursorDot.style.transition = 'none';

                  requestAnimationFrame(() => {
                    cursorDot.style.transition = 'left 0.8s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
                    cursorDot.style.opacity = '1';
                    cursorDot.style.left = endX + 'px';
                    cursorDot.style.top = endY + 'px';
                  });

                  // Phase 5: click effect after cursor arrives at button
                  setTimeout(() => {
                    // Click pulse on cursor
                    cursorDot.style.transition = 'transform 0.1s ease';
                    cursorDot.style.transform = 'scale(0.65)';
                    setTimeout(() => {
                      cursorDot.style.transform = 'scale(1)';
                    }, 110);
                    // Button click visual feedback
                    submitBtn.classList.add('clicked');
                    submitBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => { submitBtn.style.transform = 'scale(1)'; }, 140);
                    // After click: fade out cursor + button, then show result
                    setTimeout(() => {
                      cursorDot.style.transition = 'opacity 0.25s ease';
                      cursorDot.style.opacity = '0';
                      submitBtn.style.transition = 'opacity 0.25s ease';
                      submitBtn.style.opacity = '0';
                      setTimeout(() => {
                        submitBtn.style.display = 'none';
                        cursorDot.style.display = 'none';
                        showResult();
                      }, 280);
                    }, 300);
                  }, 900);
                } else {
                  setTimeout(showResult, 400);
                }
              }, 650);
            }, 18);
          }, 380);
        }, 1400);
      }, 16);
    }

    function showResult() {
      const res = document.getElementById('code-result');
      if (!res) return;
      // Reset state
      res.style.display = 'flex';
      res.style.opacity = '0';
      res.style.transform = 'translateY(10px)';
      const bar = document.getElementById('result-bar');
      if (bar) bar.style.width = '0%';
      const badge = document.getElementById('result-badge');
      if (badge) { badge.textContent = ''; badge.style.opacity = '0'; }
      const rubric = document.getElementById('result-rubric');
      if (rubric) rubric.style.opacity = '0';
      const feedback = document.getElementById('result-feedback');
      if (feedback) feedback.style.opacity = '0';
      // Reset rubric fills
      res.querySelectorAll('.cr-rubric-fill').forEach((el) => {
        (el as HTMLElement).style.width = '0%';
        (el as HTMLElement).style.transition = 'none';
      });
      res.querySelectorAll('.cr-rubric-val').forEach((el) => {
        (el as HTMLElement).style.opacity = '0';
      });

      requestAnimationFrame(() => requestAnimationFrame(() => {
        // Fade in panel
        res.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        res.style.opacity = '1';
        res.style.transform = 'translateY(0)';

        // Animate score number 0 → 92
        animateNumber('result-num', 0, 92, 1000);

        // Animate main score bar
        setTimeout(() => {
          if (bar) {
            bar.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
            bar.style.width = '92%';
          }
        }, 150);

        // Show badge after score fills
        setTimeout(() => {
          if (badge) {
            badge.textContent = 'Top 8%';
            badge.style.transition = 'opacity 0.4s ease';
            badge.style.opacity = '1';
          }
        }, 700);

        // Show rubric rows with stagger
        setTimeout(() => {
          if (rubric) {
            rubric.style.transition = 'opacity 0.4s ease';
            rubric.style.opacity = '1';
          }
          res.querySelectorAll('.cr-rubric-fill').forEach((el, i) => {
            const target = (el as HTMLElement).getAttribute('data-target') || '0';
            setTimeout(() => {
              (el as HTMLElement).style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
              (el as HTMLElement).style.width = target + '%';
            }, i * 120);
          });
          res.querySelectorAll('.cr-rubric-val').forEach((el, i) => {
            setTimeout(() => {
              (el as HTMLElement).style.transition = 'opacity 0.3s ease';
              (el as HTMLElement).style.opacity = '1';
            }, i * 120 + 400);
          });
        }, 900);

        // Show feedback last
        setTimeout(() => {
          if (feedback) {
            feedback.style.transition = 'opacity 0.5s ease';
            feedback.style.opacity = '1';
          }
        }, 1600);

        // Loop back
        setTimeout(runDrillAnimation, 5500);
      }));
    }

    function initAutoScroll() {
      const _el = document.getElementById('featscroll'); if (!_el) return;
      const el = _el;
      let paused = false;
      let pauseTimer: ReturnType<typeof setTimeout> | null = null;
      let rafId = 0;
      const speed = 0.8; // px per frame (~48px/s at 60fps)

      function step() {
        if (!paused) {
          el.scrollLeft += speed;
          // Infinite loop: when past halfway (duplicate set), jump back
          const half = el.scrollWidth / 2;
          if (el.scrollLeft >= half) {
            el.scrollLeft -= half;
          }
        }
        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);

      const pauseScroll = () => {
        paused = true;
        if (pauseTimer) clearTimeout(pauseTimer);
        pauseTimer = setTimeout(() => { paused = false; }, 3000);
      };

      // Pause on any user interaction
      el.addEventListener('wheel', pauseScroll, { passive: true });
      el.addEventListener('touchstart', pauseScroll, { passive: true });
      el.addEventListener('mousedown', pauseScroll);
      el.addEventListener('pointerdown', pauseScroll);

      // Store cleanup ref
      (el as any)._autoScrollCleanup = () => {
        cancelAnimationFrame(rafId);
        if (pauseTimer) clearTimeout(pauseTimer);
      };
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
    initAutoScroll();
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
                animateNumber('bento-score', 0, 71, 2800);
                const fills = card.querySelectorAll('.bc-bar-fill') as NodeListOf<HTMLElement>;
                const vals = [88, 74, 42];
                fills.forEach((fill, fi) => {
                  setTimeout(() => { fill.style.width = vals[fi] + '%'; }, 400 + fi * 600);
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

    // Comparison table rows stagger reveal
    const ctRows = document.querySelectorAll('.ct-row');
    const ctObs: IntersectionObserver[] = [];
    ctRows.forEach((row, i) => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => row.classList.add('vis'), i * 70);
            obs.disconnect();
          }
        });
      }, { threshold: .1 });
      obs.observe(row);
      ctObs.push(obs);
    });

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
      divObservers.forEach(o => o.disconnect());
      bcardObs.forEach(o => o.disconnect());
      fcardObs.forEach(o => o.disconnect());
      ctObs.forEach(o => o.disconnect());
      if (codeObs)    codeObs.disconnect();
      if (pillarsObs) pillarsObs.disconnect();
      if (lampObs)    lampObs.disconnect();
      if (lampRaf)    cancelAnimationFrame(lampRaf);
      const scrollEl = document.getElementById('featscroll');
      if (scrollEl && (scrollEl as any)._autoScrollCleanup) (scrollEl as any)._autoScrollCleanup();
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
              <a href="/diagnostic" className="btn-solid">
                Begin Diagnostic{" "}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                  <div className="pi-d">Your score is earned, not given. You see exactly what you can do and where the gap is.</div>
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
                      <span className="bc-ls-rank">Proficient</span>
                      <span className="bc-ls-tier">Prompt Engineering</span>
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
                <div className="bc-d">Drills across 3 tiers — new domains launching monthly.</div>
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

              {/* Card 4 — Progress tracking */}
              <div className="bcard">
                <div className="bc-icon">📈</div>
                <div className="bc-t">Track your growth</div>
                <div className="bc-d">Every drill scored, every improvement tracked. See exactly how your skills develop over time.</div>
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
              <div className="code-window" id="code-window" style={{ position: 'relative' }}>
                <div className="cw-bar">
                  <div className="cw-dot cw-d1"></div>
                  <div className="cw-dot cw-d2"></div>
                  <div className="cw-dot cw-d3"></div>
                  <span className="cw-title">drill_01_prompt_engineering.md</span>
                </div>
                <div id="code-body" style={{ padding: 24, fontFamily: 'var(--font-code)', fontSize: 12.5, lineHeight: 1.8, minHeight: 300, whiteSpace: 'pre', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  <span id="code-cur" className="code-cursor"></span>
                </div>
                {/* Submit button (animated in by JS) */}
                <div id="code-submit" style={{
                  display: 'none', alignItems: 'center', justifyContent: 'center', gap: 8,
                  margin: '16px 24px 20px', padding: '11px 24px',
                  background: '#fff', color: '#000', borderRadius: 10,
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                  cursor: 'default', width: 'fit-content',
                  transition: 'transform 0.15s ease, opacity 0.3s ease, background 0.15s ease',
                }}>
                  Submit Prompt
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
                {/* Animated cursor dot */}
                <div id="cursor-dot" style={{
                  display: 'none', position: 'absolute', width: 18, height: 18,
                  pointerEvents: 'none', zIndex: 10, opacity: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3l14 8-8 3-3 8z" fill="rgba(255,255,255,0.9)" stroke="rgba(0,0,0,0.3)" strokeWidth="1"/>
                  </svg>
                </div>
                <div id="code-result" className="cr-panel">
                  {/* Score header */}
                  <div className="cr-header">
                    <div className="cr-score-wrap">
                      <span className="cr-label">Score</span>
                      <span className="cr-score-num" id="result-num">0</span>
                      <span className="cr-score-max">/100</span>
                    </div>
                    <span className="cr-badge" id="result-badge"></span>
                  </div>
                  {/* Score bar */}
                  <div className="cr-bar-track">
                    <div className="cr-bar-fill" id="result-bar"></div>
                  </div>
                  {/* Rubric breakdown */}
                  <div className="cr-rubric" id="result-rubric">
                    <div className="cr-rubric-row">
                      <span className="cr-rubric-label">Clarity</span>
                      <div className="cr-rubric-track"><div className="cr-rubric-fill" style={{ width: 0 }} data-target="96"></div></div>
                      <span className="cr-rubric-val">96</span>
                    </div>
                    <div className="cr-rubric-row">
                      <span className="cr-rubric-label">Structure</span>
                      <div className="cr-rubric-track"><div className="cr-rubric-fill" style={{ width: 0 }} data-target="91"></div></div>
                      <span className="cr-rubric-val">91</span>
                    </div>
                    <div className="cr-rubric-row">
                      <span className="cr-rubric-label">Constraints</span>
                      <div className="cr-rubric-track"><div className="cr-rubric-fill" style={{ width: 0 }} data-target="88"></div></div>
                      <span className="cr-rubric-val">88</span>
                    </div>
                    <div className="cr-rubric-row">
                      <span className="cr-rubric-label">Tone</span>
                      <div className="cr-rubric-track"><div className="cr-rubric-fill" style={{ width: 0 }} data-target="94"></div></div>
                      <span className="cr-rubric-val">94</span>
                    </div>
                  </div>
                  {/* Feedback */}
                  <div className="cr-feedback" id="result-feedback">
                    <div className="cr-fb-good">
                      <span className="cr-fb-icon">✓</span>
                      <span>Strong role definition and explicit format constraints</span>
                    </div>
                    <div className="cr-fb-fix">
                      <span className="cr-fb-icon">△</span>
                      <span>Add a success criteria section to define what a good output looks like</span>
                    </div>
                  </div>
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
            <div className="feat-scroll feat-autoscroll" id="featscroll">
              {/* Original set */}
              {DOMAINS_DATA.map(d => (
                <div key={d.num} className="fcard appeared">
                  <span className="fc-num">DOMAIN {d.num}</span>
                  <div className="fc-t">{d.title}</div>
                  <div className="fc-d">{d.desc}</div>
                  <span className={`fc-tag badge ${tierClass(d.tier)}`}>{d.tier}</span>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {DOMAINS_DATA.map(d => (
                <div key={d.num + '-dup'} className="fcard appeared" aria-hidden="true">
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

        {/* ── 7. CTA ── */}
        <section id="cta" style={{ position: 'relative', overflow: 'hidden' }}>
          <canvas id="lamp-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.55 }} />
          <div className="cta-in" style={{ position: 'relative', zIndex: 1 }}>
            <div className="cta-tag rv">Step one</div>
            <h2 className="cta-h rv d1">Find out where you <em>actually</em> stand.</h2>
            <p className="cta-sub rv d2">3 drills. 8 minutes. No account required. Your score tells you exactly where to start.</p>
            <div className="cta-btns-wrap rv d3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <a href="/diagnostic" className="btn-solid">
                Begin Diagnostic{" "}
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
            Next.js · Claude API · Vercel ·{' '}
            <a href="https://www.linkedin.com/in/daniel-brocato" target="_blank" rel="noopener noreferrer"
              style={{ color: '#00d4ff', textDecoration: 'none' }}>LinkedIn ↗</a>
          </div>
        </footer>

      </div>
    </>
  );
}
