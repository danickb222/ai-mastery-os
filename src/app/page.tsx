"use client";
// rebuild

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

              // Phase 2: Submit moment — cursor travels to button, clicks, then scoring
              setTimeout(() => {
                if (submitBtn) {
                  submitBtn.style.display = 'inline-flex';
                  submitBtn.style.opacity = '0';
                  submitBtn.style.transform = 'scale(1)';
                  submitBtn.style.boxShadow = 'none';
                  submitBtn.style.transition = 'none';
                  requestAnimationFrame(() => {
                    submitBtn.style.transition = 'opacity 0.3s ease';
                    submitBtn.style.opacity = '1';
                    // Animate cursor toward submit button
                    setTimeout(() => {
                      if (cursorDot) {
                        const codeWindow = document.getElementById('code-window');
                        const btnRect = submitBtn.getBoundingClientRect();
                        const winRect = codeWindow ? codeWindow.getBoundingClientRect() : { left: 0, top: 0 };
                        const endX = btnRect.left - winRect.left + 40;
                        const endY = btnRect.top - winRect.top + 12;
                        cursorDot.style.left = (endX - 80) + 'px';
                        cursorDot.style.top = (endY + 30) + 'px';
                        cursorDot.style.display = 'block';
                        cursorDot.style.opacity = '0';
                        cursorDot.style.transition = 'opacity 0.2s ease';
                        requestAnimationFrame(() => {
                          cursorDot.style.opacity = '1';
                          setTimeout(() => {
                            cursorDot.style.transition = 'left 0.4s ease-in-out, top 0.4s ease-in-out';
                            cursorDot.style.left = endX + 'px';
                            cursorDot.style.top = endY + 'px';
                            setTimeout(() => {
                              // Click: scale down button briefly
                              submitBtn.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
                              submitBtn.style.transform = 'scale(0.98)';
                              submitBtn.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.3)';
                              cursorDot.style.opacity = '0';
                              setTimeout(() => {
                                submitBtn.style.transform = 'scale(1)';
                                submitBtn.style.transition = 'opacity 0.25s ease';
                                submitBtn.style.opacity = '0';
                                setTimeout(() => {
                                  submitBtn.style.display = 'none';
                                  cursorDot.style.display = 'none';
                                  runScoringSequence();
                                }, 280);
                              }, 120);
                            }, 450);
                          }, 200);
                        });
                      } else {
                        setTimeout(runScoringSequence, 700);
                      }
                    }, 300);
                  });
                } else {
                  runScoringSequence();
                }
              }, 800);
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

    // ── Scoring sequence — replaces old showResult panel ────────────────────
    function runScoringSequence() {
      const body = document.getElementById('code-body');
      if (!body) return;

      // Phase 3a: fade out terminal content
      body.style.transition = 'opacity 0.35s ease';
      body.style.opacity = '0';

      setTimeout(() => {
        body!.innerHTML = '';
        body!.style.transition = 'none';
        body!.style.opacity = '1';

        type SPart = { text: string; color: string; weight?: string; style?: string };

        // Types each segment of a line at 15ms/char, calls onDone when complete
        function addLine(parts: SPart[], onDone?: () => void) {
          const lineEl = document.createElement('div');
          lineEl.style.fontFamily = 'var(--font-code)';
          lineEl.style.fontSize = '13px';
          lineEl.style.lineHeight = '1.8';
          body!.appendChild(lineEl);

          let pi = 0, ci = 0;
          let span: HTMLSpanElement | null = null;

          function next() {
            if (pi >= parts.length) { onDone?.(); return; }
            const p = parts[pi];
            if (ci === 0) {
              span = document.createElement('span');
              span.style.color = p.color;
              if (p.weight) span.style.fontWeight = p.weight;
              if (p.style) span.style.fontStyle = p.style;
              lineEl.appendChild(span);
            }
            if (ci < p.text.length) {
              span!.textContent += p.text[ci++];
              setTimeout(next, 15);
            } else { ci = 0; pi++; setTimeout(next, 6); }
          }
          next();
        }

        const W = 'rgba(255,255,255,0.5)';
        const D = 'rgba(255,255,255,0.2)';

        // Line 1 — evaluating
        addLine([{ text: 'Evaluating submission...', color: 'rgba(255,255,255,0.4)', style: 'italic' }], () => {
          // Line 2 after 600ms
          setTimeout(() => {
            addLine([
              { text: 'Audience Definition ', color: W },
              { text: '..........', color: D },
              { text: ' 17', color: '#22c55e', weight: '600' },
              { text: ' / 20', color: W },
            ], () => setTimeout(() => {
              // Line 3
              addLine([
                { text: 'Structure Specification ', color: W },
                { text: '.......', color: D },
                { text: ' 21', color: '#22c55e', weight: '600' },
                { text: ' / 25', color: W },
              ], () => setTimeout(() => {
                // Line 4
                addLine([
                  { text: 'Tone Definition ', color: W },
                  { text: '...............', color: D },
                  { text: ' 18', color: '#22c55e', weight: '600' },
                  { text: ' / 20', color: W },
                ], () => setTimeout(() => {
                  // Line 5
                  addLine([
                    { text: 'Length Constraint ', color: W },
                    { text: '.............', color: D },
                    { text: ' 11', color: '#f59e0b', weight: '600' },
                    { text: ' / 15', color: W },
                  ], () => setTimeout(() => {
                    // Line 6
                    addLine([
                      { text: 'Format Elements ', color: W },
                      { text: '...............', color: D },
                      { text: ' 16', color: '#22c55e', weight: '600' },
                      { text: ' / 20', color: W },
                    ], () => setTimeout(() => {
                      // Line 7 — divider
                      addLine([{ text: '──────────────────────────────────', color: 'rgba(255,255,255,0.15)' }], () => {
                        setTimeout(() => {
                          // Line 8 — TOTAL SCORE with count-up
                          const totalLine = document.createElement('div');
                          totalLine.style.fontFamily = 'var(--font-code)';
                          totalLine.style.fontSize = '14px';
                          totalLine.style.lineHeight = '1.8';
                          totalLine.style.marginTop = '2px';
                          body!.appendChild(totalLine);

                          const labelSpan = document.createElement('span');
                          labelSpan.style.color = 'rgba(255,255,255,0.8)';
                          labelSpan.style.fontWeight = '600';
                          labelSpan.textContent = 'TOTAL SCORE:  ';
                          totalLine.appendChild(labelSpan);

                          const numSpan = document.createElement('span');
                          numSpan.style.color = '#22c55e';
                          numSpan.style.fontWeight = '600';
                          numSpan.textContent = '0';
                          totalLine.appendChild(numSpan);

                          const maxSpan = document.createElement('span');
                          maxSpan.style.color = 'rgba(255,255,255,0.5)';
                          maxSpan.textContent = ' / 100  ';
                          totalLine.appendChild(maxSpan);

                          const profBadge = document.createElement('span');
                          profBadge.style.cssText = [
                            'display:inline-block',
                            'padding:2px 8px',
                            'background:rgba(34,197,94,0.1)',
                            'border:1px solid rgba(34,197,94,0.3)',
                            'border-radius:4px',
                            'font-size:10px',
                            'letter-spacing:0.1em',
                            'color:rgba(34,197,94,0.9)',
                            'text-transform:uppercase',
                            'opacity:0',
                            'transition:opacity 0.3s ease',
                            'vertical-align:middle',
                            'font-family:var(--font-code)',
                          ].join(';');
                          profBadge.textContent = 'PROFICIENT';
                          totalLine.appendChild(profBadge);

                          // Count 0 → 83 over 600ms with ease-out
                          const t0 = performance.now();
                          const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
                          function countUp(now: number) {
                            const p = Math.min((now - t0) / 600, 1);
                            numSpan.textContent = String(Math.floor(easeOut3(p) * 83));
                            if (p < 1) requestAnimationFrame(countUp);
                            else {
                              numSpan.textContent = '83';
                              requestAnimationFrame(() => { profBadge.style.opacity = '1'; });
                            }
                          }
                          requestAnimationFrame(countUp);

                          // Phase 4: hold 2500ms, then Phase 5
                          setTimeout(() => {
                            body!.style.transition = 'opacity 0.4s ease';
                            body!.style.opacity = '0';
                            // Phase 5: reset and loop
                            setTimeout(() => {
                              body!.style.transition = 'none';
                              body!.style.opacity = '1';
                              runDrillAnimation();
                            }, 900);
                          }, 2500);
                        }, 200);
                      });
                    }, 400));
                  }, 400));
                }, 400));
              }, 400));
            }, 400));
          }, 600);
        });
      }, 400);
    }

    function initDriftCarousel() {
      const inner = document.getElementById('feat-drift');
      const outer = document.getElementById('feat-wrap');
      if (!inner || !outer) return;
      // Count total children to determine half (duplicate set)
      const totalCards = inner.children.length;
      const origCards = totalCards / 2;
      const duration = Math.max(24, origCards * 4);
      inner.style.animation = `drift ${duration}s linear infinite`;
      outer.addEventListener('mouseenter', () => { inner.style.animationPlayState = 'paused'; });
      outer.addEventListener('mouseleave', () => { inner.style.animationPlayState = 'running'; });
      outer.addEventListener('touchstart', () => { inner.style.animationPlayState = 'paused'; }, { passive: true });
      outer.addEventListener('touchend', () => { setTimeout(() => { inner.style.animationPlayState = 'running'; }, 1500); });
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

    // ── Multi-agent preview section canvas ──
    function initMASection(): () => void {
      const canvas = document.getElementById('ma-section-canvas') as HTMLCanvasElement | null;
      if (!canvas) return () => {};
      const ctxRaw = canvas.getContext('2d');
      if (!ctxRaw) return () => {};
      const ctx: CanvasRenderingContext2D = ctxRaw;
      let rafId = 0;

      function resize() {
        const rect = canvas!.getBoundingClientRect();
        if (!rect.width) return;
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvas!.width = rect.width * dpr;
        canvas!.height = rect.height * dpr;
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      window.addEventListener('resize', resize);

      const agents = [
        { id: 'classifier', name: 'CLASSIFIER', desc: 'routes input',       x: 0.18, y: 0.52, dotColor: 'rgba(99,102,241,0.8)',  activeColor: '#22c55e' },
        { id: 'responder',  name: 'RESPONDER',  desc: 'drafts reply',        x: 0.50, y: 0.78, dotColor: 'rgba(34,197,94,0.8)',   activeColor: '#22c55e' },
        { id: 'escalation', name: 'ESCALATION', desc: 'handles edge cases',  x: 0.82, y: 0.52, dotColor: 'rgba(239,68,68,0.8)',   activeColor: '#22c55e' },
      ];

      // State
      let activeAgent: string | null = null;
      let outputTexts: Record<string, string> = { classifier: '', responder: '', escalation: '' };
      type PacketObj = { fromX: number; fromY: number; toX: number; toY: number; progress: number; speed: number; done: boolean; onComplete: () => void; update(): void; draw(c: CanvasRenderingContext2D): void; };
      let packets: PacketObj[] = [];
      let typingIntervalId: ReturnType<typeof setInterval> | null = null;
      const timeoutIds: ReturnType<typeof setTimeout>[] = [];

      function getW() { return canvas!.getBoundingClientRect().width || 600; }
      function getH() { return canvas!.getBoundingClientRect().height || 340; }
      function getTicketCenter() { return { x: getW() * 0.50, y: getH() * 0.12 }; }
      function getAgentCenter(id: string) {
        const a = agents.find(ag => ag.id === id)!;
        return { x: getW() * a.x, y: getH() * a.y };
      }

      function makePacket(fromX: number, fromY: number, toX: number, toY: number, onComplete: () => void): PacketObj {
        return {
          fromX, fromY, toX, toY, progress: 0, speed: 0.008, done: false, onComplete,
          update() {
            this.progress += this.speed;
            if (this.progress >= 1) { this.done = true; this.onComplete(); }
          },
          draw(c: CanvasRenderingContext2D) {
            const x = this.fromX + (this.toX - this.fromX) * this.progress;
            const y = this.fromY + (this.toY - this.fromY) * this.progress;
            ([0.5, 0.3, 0.15, 0.06] as number[]).forEach((alpha, i) => {
              const tp2 = this.progress - (i + 1) * 0.03;
              if (tp2 < 0) return;
              const tx = this.fromX + (this.toX - this.fromX) * tp2;
              const ty = this.fromY + (this.toY - this.fromY) * tp2;
              c.beginPath(); c.arc(tx, ty, 5 - i * 0.8, 0, Math.PI * 2);
              c.fillStyle = `rgba(34,197,94,${alpha})`; c.fill();
            });
            c.beginPath(); c.arc(x, y, 5.5, 0, Math.PI * 2);
            c.fillStyle = 'rgba(34,197,94,0.95)'; c.fill();
            c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2);
            c.fillStyle = 'rgba(34,197,94,0.15)'; c.fill();
          },
        };
      }

      function typeText(agentId: string, text: string, speed: number, callback: () => void) {
        let i = 0;
        outputTexts[agentId] = '';
        if (typingIntervalId) clearInterval(typingIntervalId);
        typingIntervalId = setInterval(() => {
          if (i < text.length) { outputTexts[agentId] += text[i]; i++; }
          if (i >= text.length) {
            clearInterval(typingIntervalId!); typingIntervalId = null;
            callback();
          }
        }, speed);
      }

      function addTimeout(fn: () => void, ms: number) {
        const id = setTimeout(fn, ms); timeoutIds.push(id); return id;
      }

      function runSequence() {
        activeAgent = null;
        outputTexts = { classifier: '', responder: '', escalation: '' };
        packets = [];
        addTimeout(() => {
          const ticketPos = getTicketCenter();
          const classifierPos = getAgentCenter('classifier');
          packets.push(makePacket(ticketPos.x, ticketPos.y, classifierPos.x, classifierPos.y, () => {
            activeAgent = 'classifier';
            typeText('classifier', 'URGENT — billing issue', 40, () => {
              addTimeout(() => {
                const escalationPos = getAgentCenter('escalation');
                packets.push(makePacket(classifierPos.x, classifierPos.y, escalationPos.x, escalationPos.y, () => {
                  activeAgent = 'escalation';
                  typeText('escalation', 'Escalation brief: billing team review', 40, () => {
                    addTimeout(() => {
                      activeAgent = null;
                      addTimeout(runSequence, 800);
                    }, 2500);
                  });
                }));
              }, 500);
            });
          }));
        }, 600);
      }

      function rr(x: number, y: number, w: number, h: number, r: number) {
        ctx!.beginPath();
        ctx!.moveTo(x + r, y); ctx!.lineTo(x + w - r, y);
        ctx!.arcTo(x + w, y, x + w, y + r, r); ctx!.lineTo(x + w, y + h - r);
        ctx!.arcTo(x + w, y + h, x + w - r, y + h, r); ctx!.lineTo(x + r, y + h);
        ctx!.arcTo(x, y + h, x, y + h - r, r); ctx!.lineTo(x, y + r);
        ctx!.arcTo(x, y, x + r, y, r); ctx!.closePath();
      }

      function drawConnections(W: number, H: number) {
        ctx!.save();
        ctx!.setLineDash([4, 8]);
        ctx!.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx!.lineWidth = 1;
        const tick = { x: W * 0.50, y: H * 0.12 };
        const a  = { x: W * 0.18, y: H * 0.52 };
        const b  = { x: W * 0.50, y: H * 0.78 };
        const cc = { x: W * 0.82, y: H * 0.52 };
        ctx!.beginPath(); ctx!.moveTo(tick.x, tick.y); ctx!.lineTo(a.x, a.y); ctx!.stroke();
        ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
        ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(cc.x, cc.y); ctx!.stroke();
        ctx!.restore();
      }

      function drawTicket(W: number, H: number) {
        const cx = W * 0.50, cy = H * 0.12;
        rr(cx - 100, cy - 30, 200, 60, 6);
        ctx!.fillStyle = 'rgba(255,255,255,0.03)'; ctx!.fill();
        ctx!.strokeStyle = 'rgba(255,255,255,0.1)'; ctx!.lineWidth = 1; ctx!.stroke();
        ctx!.fillStyle = 'rgba(255,255,255,0.3)';
        ctx!.font = '9px system-ui,sans-serif';
        ctx!.textAlign = 'center';
        ctx!.fillText('LIVE INPUT', cx, cy - 30 + 18);
        ctx!.fillStyle = 'rgba(255,255,255,0.55)';
        ctx!.font = '11px monospace';
        ctx!.fillText('"Payment failed, charged twice."', cx, cy - 30 + 36);
      }

      function drawAgent(W: number, H: number, agent: typeof agents[0], isActive: boolean, outputText: string) {
        const ax = W * agent.x, ay = H * agent.y;
        const cw = 160, ch = 90;
        const cx = ax - cw / 2, cy = ay - ch / 2;
        if (isActive) {
          rr(cx - 8, cy - 8, cw + 16, ch + 16, 14);
          ctx!.fillStyle = 'rgba(34,197,94,0.06)'; ctx!.fill();
          ctx!.strokeStyle = 'rgba(34,197,94,0.2)'; ctx!.lineWidth = 1; ctx!.stroke();
        }
        rr(cx, cy, cw, ch, 10);
        ctx!.fillStyle = isActive ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.025)'; ctx!.fill();
        ctx!.strokeStyle = isActive ? 'rgba(34,197,94,0.45)' : 'rgba(255,255,255,0.09)';
        ctx!.lineWidth = isActive ? 1.5 : 1; ctx!.stroke();
        const dotX = cx + 14, dotY = cy + 17;
        ctx!.beginPath(); ctx!.arc(dotX, dotY, 3.5, 0, Math.PI * 2);
        ctx!.fillStyle = isActive ? '#22c55e' : agent.dotColor; ctx!.fill();
        ctx!.fillStyle = isActive ? 'rgba(34,197,94,0.9)' : 'rgba(255,255,255,0.4)';
        ctx!.font = '600 10px system-ui,sans-serif';
        ctx!.textAlign = 'left';
        ctx!.fillText(agent.name, dotX + 11, dotY + 4);
        if (outputText) {
          const maxChars = 22;
          ctx!.fillStyle = 'rgba(255,255,255,0.5)';
          ctx!.font = '10px monospace';
          ctx!.fillText(outputText.slice(0, maxChars), cx + 10, cy + 38);
          if (outputText.length > maxChars) ctx!.fillText(outputText.slice(maxChars, maxChars * 2), cx + 10, cy + 52);
        }
        ctx!.fillStyle = 'rgba(255,255,255,0.2)';
        ctx!.font = '9px system-ui,sans-serif';
        ctx!.fillText(isActive ? '● ACTIVE' : '○ READY', cx + 10, cy + ch - 10);
      }

      function loop() {
        const rect = canvas!.getBoundingClientRect();
        const W = rect.width, H = rect.height;
        if (!W || !H) { rafId = requestAnimationFrame(loop); return; }
        ctx!.clearRect(0, 0, W, H);
        drawConnections(W, H);
        drawTicket(W, H);
        agents.forEach(a => drawAgent(W, H, a, activeAgent === a.id, outputTexts[a.id] ?? ''));
        packets = packets.filter(p => !p.done);
        packets.forEach(p => { p.update(); p.draw(ctx!); });
        rafId = requestAnimationFrame(loop);
      }

      resize();
      loop();
      addTimeout(runSequence, 500);

      return () => {
        cancelAnimationFrame(rafId);
        if (typingIntervalId) clearInterval(typingIntervalId);
        timeoutIds.forEach(id => clearTimeout(id));
        window.removeEventListener('resize', resize);
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
    initDriftCarousel();

    // Init multi-agent carousel card canvases
    const maCanvasCleanups: (() => void)[] = [];
    document.querySelectorAll('.ma-canvas').forEach(cv => {
      const cleanup = initMultiAgentCanvas(cv as HTMLCanvasElement);
      maCanvasCleanups.push(cleanup);
    });

    // Init multi-agent preview section via IO
    let masCleanup: (() => void) | null = null;
    const masSection = document.getElementById('multiagent-preview');
    let masObs: IntersectionObserver | null = null;
    if (masSection) {
      masObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !masCleanup) {
            masCleanup = initMASection();
            masObs!.disconnect();
          }
        });
      }, { threshold: 0.1 });
      masObs.observe(masSection);
    }

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
      if (codeObs)    codeObs.disconnect();
      if (pillarsObs) pillarsObs.disconnect();
      if (lampObs)    lampObs.disconnect();
      if (lampRaf)    cancelAnimationFrame(lampRaf);
      if (masObs)     masObs.disconnect();
      if (masCleanup) masCleanup();
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
          <div className="sec">
            <div className="bento-head">
              <div className="tag">Platform</div>
              <h2 className="sh rv">Everything built around your <em>score.</em></h2>
            </div>
            <div className="bento-grid">

              {/* Card 1 — wide: Performance dashboard */}
              <div className="bcard wide" style={{ maxHeight: 420, overflow: 'hidden', position: 'relative' }}>
                <div className="bc-icon">📊</div>
                <div className="bc-t">Performance dashboard</div>
                <div className="bc-d">Every drill. Every score. Every gap. Your full operator profile — updated in real time.</div>
                {/* Fade gradient at bottom of card */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(10,10,10,0.95))', pointerEvents: 'none', zIndex: 2 }} />
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
              <div className="bcard">
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
              <div className="code-window" id="code-window" style={{ position: 'relative' }}>
                {/* Radial glow — sits behind all terminal content */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 500,
                  height: 300,
                  background: 'radial-gradient(ellipse, rgba(34,197,94,0.05) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }} />
                <div className="cw-bar" style={{ position: 'relative', zIndex: 1 }}>
                  <div className="cw-dot cw-d1"></div>
                  <div className="cw-dot cw-d2"></div>
                  <div className="cw-dot cw-d3"></div>
                  <span className="cw-title">drill_01_prompt_engineering.md</span>
                </div>
                <div id="code-body" style={{ padding: 24, fontFamily: 'var(--font-code)', fontSize: 12.5, lineHeight: 1.8, minHeight: 300, whiteSpace: 'pre', position: 'relative', overflow: 'hidden', flexShrink: 0, zIndex: 1 }}>
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
              {/* Duplicate — Multi-Agent card */}
              <div className="fcard appeared" aria-hidden="true" style={{
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
        <section id="multiagent-preview" style={{ padding: '96px 0 80px', position: 'relative' }}>
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
            <div style={{
              border: '1px solid rgba(245,158,11,0.13)', borderRadius: 16,
              background: 'rgba(255,255,255,0.015)', overflow: 'hidden', marginBottom: 28,
            }}>
              <canvas id="ma-section-canvas" style={{ width: '100%', height: 340, display: 'block' }} />
            </div>

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
