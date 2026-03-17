'use client';

import { useEffect, useRef, useState } from 'react';

const ANSWER_TEXT =
  'Write a newsletter for SaaS founders and operators. Cover the biggest trend this week. Include 3 sections with some data. Keep it around 500 words.';

const INSIGHT_TEXT =
  '"3 sections with some data" loses maximum points. The model has no idea what format, what data type, or what structure. Always specify: "3 bold-headed sections, each with one named company as evidence."';

const CRITERIA = [
  { name: 'Audience Definition',     score: 6,  max: 20 },
  { name: 'Structure Specification', score: 5,  max: 25 },
  { name: 'Tone Definition',         score: 4,  max: 20 },
  { name: 'Length Constraint',       score: 4,  max: 15 },
  { name: 'Format Elements',         score: 5,  max: 20 },
];

const TOTAL_SCORE = CRITERIA.reduce((s, c) => s + c.score, 0); // 24

function scoreColor(s: number, m: number): string {
  const r = s / m;
  return r >= 0.7 ? '#22c55e' : r >= 0.4 ? '#f59e0b' : '#ef4444';
}

const TOK_GOOD: React.CSSProperties = {
  background: 'rgba(34,197,94,0.1)',
  borderBottom: '2px solid rgba(34,197,94,0.45)',
  color: 'rgba(100,225,140,0.9)',
  padding: '2px 4px',
  borderRadius: 3,
};
const TOK_WEAK: React.CSSProperties = {
  background: 'rgba(245,158,11,0.1)',
  borderBottom: '1px solid rgba(245,158,11,0.35)',
  color: 'rgba(255,200,100,0.85)',
  padding: '2px 4px',
  borderRadius: 3,
};
const TOK_BAD: React.CSSProperties = {
  background: 'rgba(239,68,68,0.12)',
  borderBottom: '2px solid rgba(239,68,68,0.5)',
  color: 'rgba(255,120,120,0.9)',
  padding: '2px 4px',
  borderRadius: 3,
};

export function DiagnosticTerminal() {
  const [phase, setPhase]                 = useState<1 | 2 | 3 | 4>(1);
  const [progressW, setProgressW]         = useState(0);
  const [typedAnswer, setTypedAnswer]     = useState('');
  const [showSubmit, setShowSubmit]       = useState(false);
  const [scoreRowsShown, setScoreRowsShown] = useState(0);
  const [showTotal, setShowTotal]         = useState(false);
  const [displayScore, setDisplayScore]   = useState(0);
  const [activeTab, setActiveTab]         = useState<'score' | 'autopsy'>('score');
  const [showTooltip, setShowTooltip]     = useState(false);
  const [showInsight, setShowInsight]     = useState(false);
  const [insightTyped, setInsightTyped]   = useState('');
  const [hoverBtn, setHoverBtn]           = useState<'start' | 'submit' | 'autopsy' | null>(null);
  const [clickingBtn, setClickingBtn]     = useState<'start' | 'submit' | 'autopsy' | null>(null);

  const termRef       = useRef<HTMLDivElement>(null);
  const cursorRef     = useRef<HTMLDivElement>(null);
  const startBtnRef   = useRef<HTMLButtonElement>(null);
  const submitBtnRef  = useRef<HTMLButtonElement>(null);
  const autopsyTabRef = useRef<HTMLButtonElement>(null);
  const redTokenRef   = useRef<HTMLSpanElement>(null);
  const timers        = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ivals         = useRef<ReturnType<typeof setInterval>[]>([]);
  const alive         = useRef(true);

  // Inject cursor blink keyframe once
  useEffect(() => {
    alive.current = true;
    const s = document.createElement('style');
    s.id = 'dt-cblink';
    if (!document.getElementById('dt-cblink')) {
      s.textContent = '@keyframes dt-cblink{0%,100%{opacity:1}50%{opacity:0}}';
      document.head.appendChild(s);
    }
    return () => {
      alive.current = false;
      timers.current.forEach(clearTimeout);
      ivals.current.forEach(clearInterval);
    };
  }, []);

  useEffect(() => {
    // Clear previous phase timers
    timers.current.forEach(clearTimeout);
    ivals.current.forEach(clearInterval);
    timers.current = [];
    ivals.current = [];

    function T(fn: () => void, ms: number) {
      const t = setTimeout(() => { if (alive.current) fn(); }, ms);
      timers.current.push(t);
    }

    // Interval that stops when fn returns true
    function IV(fn: () => boolean, ms: number) {
      const iv = setInterval(() => {
        if (!alive.current) { clearInterval(iv); return; }
        if (fn()) clearInterval(iv);
      }, ms);
      ivals.current.push(iv);
    }

    function getRelPos(el: HTMLElement) {
      const term = termRef.current;
      if (!term) return { x: 0, y: 0 };
      const tb = term.getBoundingClientRect();
      const eb = el.getBoundingClientRect();
      return { x: eb.left + eb.width / 2 - tb.left, y: eb.top + eb.height / 2 - tb.top };
    }

    function placeTopRight() {
      const el = cursorRef.current;
      const term = termRef.current;
      if (!el || !term) return;
      const tw = term.getBoundingClientRect().width;
      el.style.transition = 'none';
      el.style.left = `${tw - 20}px`;
      el.style.top = '8px';
      el.style.display = 'block';
      void el.getBoundingClientRect(); // force reflow
    }

    function moveTo(x: number, y: number, dur: number, cb: () => void) {
      const el = cursorRef.current;
      if (!el) return;
      T(() => {
        el.style.transition = `left ${dur}ms cubic-bezier(0.4,0,0.2,1), top ${dur}ms cubic-bezier(0.4,0,0.2,1)`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        T(cb, dur);
      }, 50);
    }

    function cursorToEl(el: HTMLElement | null, dur: number, cb: () => void) {
      if (!el) return;
      placeTopRight();
      const { x, y } = getRelPos(el);
      moveTo(x, y, dur, cb);
    }

    function hideCursor() {
      const el = cursorRef.current;
      if (el) el.style.display = 'none';
    }

    function doClick(btn: 'start' | 'submit' | 'autopsy', cb: () => void) {
      setHoverBtn(btn);
      T(() => {
        setClickingBtn(btn);
        T(() => {
          setClickingBtn(null);
          setHoverBtn(null);
          hideCursor();
          cb();
        }, 160);
      }, 220);
    }

    // ── PHASE 1: Drill Intro ──
    if (phase === 1) {
      setProgressW(0);
      setTypedAnswer('');
      setShowSubmit(false);
      setScoreRowsShown(0);
      setShowTotal(false);
      setDisplayScore(0);
      setActiveTab('score');
      setShowTooltip(false);
      setShowInsight(false);
      setInsightTyped('');
      setHoverBtn(null);
      setClickingBtn(null);
      hideCursor();

      T(() => setProgressW(12), 300);
      T(() => cursorToEl(startBtnRef.current, 800, () =>
        doClick('start', () => setPhase(2))
      ), 1000);
    }

    // ── PHASE 2: Answer Typing ──
    if (phase === 2) {
      let i = 0;
      T(() => {
        IV(() => {
          i++;
          setTypedAnswer(ANSWER_TEXT.slice(0, i));
          if (i >= ANSWER_TEXT.length) {
            setShowSubmit(true);
            T(() => cursorToEl(submitBtnRef.current, 500, () =>
              doClick('submit', () => setPhase(3))
            ), 0);
            return true;
          }
          return false;
        }, 28);
      }, 400);
    }

    // ── PHASE 3: Score Breakdown ──
    if (phase === 3) {
      setActiveTab('score');
      setScoreRowsShown(0);
      setShowTotal(false);
      setDisplayScore(0);

      CRITERIA.forEach((_, idx) => T(() => setScoreRowsShown(idx + 1), 380 * (idx + 1)));

      const afterRows = 380 * CRITERIA.length + 300;
      T(() => {
        setShowTotal(true);
        let count = 0;
        const steps = 30;
        IV(() => {
          count++;
          setDisplayScore(Math.round((count / steps) * TOTAL_SCORE));
          if (count >= steps) {
            setDisplayScore(TOTAL_SCORE);
            T(() => cursorToEl(autopsyTabRef.current, 480, () =>
              doClick('autopsy', () => {
                setActiveTab('autopsy');
                setPhase(4);
              })
            ), 800);
            return true;
          }
          return false;
        }, Math.floor(1000 / steps));
      }, afterRows);
    }

    // ── PHASE 4: Prompt Autopsy ──
    if (phase === 4) {
      setShowTooltip(false);
      setShowInsight(false);
      setInsightTyped('');

      T(() => {
        const token = redTokenRef.current;
        const term  = termRef.current;
        const el    = cursorRef.current;
        if (!token || !term || !el) return;

        const { y }  = getRelPos(token);
        const { x: tx } = getRelPos(token);

        // Place cursor at LEFT edge at token's vertical center
        el.style.transition = 'none';
        el.style.left = '-16px';
        el.style.top  = `${y}px`;
        el.style.display = 'block';
        void el.getBoundingClientRect();

        T(() => {
          el.style.transition = 'left 700ms cubic-bezier(0.4,0,0.2,1), top 700ms cubic-bezier(0.4,0,0.2,1)';
          el.style.left = `${tx}px`;
          el.style.top  = `${y}px`;

          T(() => {
            setShowTooltip(true);
            T(() => {
              setShowTooltip(false);
              hideCursor();
              T(() => {
                setShowInsight(true);
                let j = 0;
                IV(() => {
                  j++;
                  setInsightTyped(INSIGHT_TEXT.slice(0, j));
                  if (j >= INSIGHT_TEXT.length) {
                    T(() => setPhase(1), 3500);
                    return true;
                  }
                  return false;
                }, 20);
              }, 300);
            }, 2500);
          }, 700);
        }, 100);
      }, 500);
    }

    return () => {
      timers.current.forEach(clearTimeout);
      ivals.current.forEach(clearInterval);
      timers.current = [];
      ivals.current = [];
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ──
  const blinkStyle: React.CSSProperties = {
    display: 'inline-block',
    width: 7,
    height: 13,
    background: 'rgba(255,255,255,0.65)',
    verticalAlign: 'middle',
    marginLeft: 1,
    animation: 'dt-cblink 1s step-end infinite',
  };

  return (
    <div
      ref={termRef}
      style={{
        background: '#0d0d0f',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Top bar — dots only */}
      <div style={{
        height: 38,
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        gap: 7,
        borderRadius: '14px 14px 0 0',
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
      </div>

      {/* Body — clips content */}
      <div style={{
        padding: 24,
        minHeight: 320,
        fontFamily: 'monospace',
        fontSize: 12,
        lineHeight: 1.9,
        overflow: 'hidden',
      }}>

        {/* ── PHASE 1: Drill Intro ── */}
        {phase === 1 && (
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(99,162,255,0.7)', fontFamily: 'system-ui', marginBottom: 8 }}>
              Prompt Engineering · Foundational
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', color: '#f0f0f0', marginBottom: 10 }}>
              The Vague Request Problem
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontFamily: 'system-ui', marginBottom: 18 }}>
              Fix a broken prompt. Be specific about audience, format, constraints, and tone. Scored against a professional rubric — no partial credit.
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              {([{ num: '100', label: 'Points' }, { num: '5', label: 'Criteria' }, { num: '8m', label: 'Allowed' }] as const).map((s, i) => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)', margin: '0 20px' }} />}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f0', lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3, fontFamily: 'system-ui' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tier pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: 'rgba(34,197,94,0.85)', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '2px 10px', borderRadius: 100, fontFamily: 'system-ui' }}>Foundational</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 10px', borderRadius: 100, fontFamily: 'system-ui' }}>AI-scored · No partial credit</span>
            </div>

            {/* Progress row */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'system-ui' }}>DOMAIN PROGRESS</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'system-ui' }}>1 / 8 drills</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 100 }}>
                <div style={{ height: '100%', background: 'rgba(34,197,94,0.5)', borderRadius: 100, width: `${progressW}%`, transition: 'width 0.6s ease' }} />
              </div>
            </div>

            {/* Start button */}
            <button
              ref={startBtnRef}
              style={{
                background: hoverBtn === 'start' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.75)',
                padding: '9px 22px',
                borderRadius: 9,
                fontSize: 12,
                fontFamily: 'system-ui',
                cursor: 'default',
                transform: clickingBtn === 'start' ? 'scale(0.96)' : 'scale(1)',
                transition: 'transform 0.1s ease, background 0.15s ease',
                marginTop: 16,
                display: 'block',
              }}
            >
              Start Drill →
            </button>
          </div>
        )}

        {/* ── PHASE 2: Answer Typing ── */}
        {phase === 2 && (
          <div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', fontFamily: 'system-ui', marginBottom: 14 }}>
              THE VAGUE REQUEST PROBLEM
            </div>

            {/* Broken prompt */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: 'rgba(239,68,68,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui', marginBottom: 6 }}>● BROKEN PROMPT</div>
              <div style={{ borderLeft: '2px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.04)', padding: '8px 12px', borderRadius: '0 6px 6px 0' }}>
                <span style={{ color: 'rgba(255,120,120,0.85)' }}>&ldquo;Write a newsletter about SaaS&rdquo;</span>
              </div>
            </div>

            {/* Answer textarea */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui', marginBottom: 6 }}>YOUR IMPROVED PROMPT</div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', minHeight: 80 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{typedAnswer}</span>
                <span style={blinkStyle} />
              </div>
            </div>

            {/* Submit button — appears after typing */}
            {showSubmit && (
              <button
                ref={submitBtnRef}
                style={{
                  background: hoverBtn === 'submit' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.35)',
                  color: '#4ade80',
                  padding: '9px 22px',
                  borderRadius: 9,
                  fontSize: 12,
                  fontFamily: 'system-ui',
                  cursor: 'default',
                  transform: clickingBtn === 'submit' ? 'scale(0.96)' : 'scale(1)',
                  transition: 'transform 0.1s ease, background 0.15s ease',
                  display: 'block',
                }}
              >
                Submit for Scoring →
              </button>
            )}
          </div>
        )}

        {/* ── PHASE 3 & 4: Tabs + content ── */}
        {(phase === 3 || phase === 4) && (
          <div>
            {/* Tab toggle */}
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9999, padding: 3, marginBottom: 16 }}>
              <button style={{
                padding: '5px 12px',
                borderRadius: 9999,
                border: 'none',
                cursor: 'default',
                fontSize: 11,
                fontFamily: 'system-ui',
                fontWeight: 500,
                background: activeTab === 'score' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'score' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.2s',
              }}>
                ⊞ Score Breakdown
              </button>
              <button
                ref={autopsyTabRef}
                style={{
                  padding: '5px 12px',
                  borderRadius: 9999,
                  border: 'none',
                  cursor: 'default',
                  fontSize: 11,
                  fontFamily: 'system-ui',
                  fontWeight: 500,
                  background: activeTab === 'autopsy'
                    ? 'rgba(255,255,255,0.1)'
                    : hoverBtn === 'autopsy'
                      ? 'rgba(255,255,255,0.07)'
                      : 'transparent',
                  color: activeTab === 'autopsy' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                  transform: clickingBtn === 'autopsy' ? 'scale(0.97)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                }}
              >
                ⌕ Prompt Autopsy
              </button>
            </div>

            {/* Score content */}
            {activeTab === 'score' && (
              <div>
                {CRITERIA.slice(0, scoreRowsShown).map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'system-ui', marginBottom: 7 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', minWidth: 150 }}>{c.name}</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    <span style={{ color: scoreColor(c.score, c.max), fontFamily: 'monospace', fontSize: 11, minWidth: 36, textAlign: 'right' }}>
                      {c.score}/{c.max}
                    </span>
                  </div>
                ))}
                {showTotal && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'system-ui' }}>Score:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>{displayScore}/100</span>
                      <span style={{ fontSize: 10, color: 'rgba(245,158,11,0.8)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: 100, fontFamily: 'system-ui', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DEVELOPING</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Autopsy content */}
            {activeTab === 'autopsy' && (
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 2.1, marginBottom: 14 }}>
                  <span style={TOK_GOOD}>&ldquo;Write a newsletter&rdquo;</span>
                  {' about '}
                  <span style={TOK_WEAK}>SaaS</span>
                  {' for '}
                  <span style={TOK_GOOD}>founders and operators</span>
                  <br />
                  {'. Cover the '}
                  <span style={TOK_WEAK}>biggest trend</span>
                  {'. Include '}
                  {/* Tooltip wrapper — position:relative so tooltip can escape via overflow:visible on terminal */}
                  <span style={{ position: 'relative', display: 'inline-block' }}>
                    <span ref={redTokenRef} style={TOK_BAD}>3 sections with some data</span>
                    <div style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 10px)',
                      right: 0,
                      left: 'auto',
                      background: '#0d0d0f',
                      border: '1px solid rgba(239,68,68,0.45)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      minWidth: 220,
                      fontFamily: 'system-ui',
                      zIndex: 500,
                      pointerEvents: 'none',
                      opacity: showTooltip ? 1 : 0,
                      transition: 'opacity 0.3s',
                      whiteSpace: 'normal',
                      lineHeight: 1.5,
                    }}>
                      <div style={{ fontSize: 9, color: 'rgba(239,68,68,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>⚠ NEEDS WORK</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                        Try: &ldquo;3 bold-headed sections, each with one named company as evidence&rdquo;
                      </div>
                    </div>
                  </span>
                  {'. Keep it '}
                  <span style={TOK_BAD}>around 500 words</span>
                  {'.'}
                </div>

                {/* Insight box */}
                {showInsight && (
                  <div style={{
                    background: 'rgba(239,68,68,0.04)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: 9,
                    padding: '12px 14px',
                  }}>
                    <div style={{ fontSize: 9, color: 'rgba(239,68,68,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui', marginBottom: 6 }}>WHAT COST YOU POINTS</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                      {insightTyped}
                      {insightTyped.length < INSIGHT_TEXT.length && <span style={blinkStyle} />}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cursor — absolute on terminal container, escapes via overflow:visible */}
      <div
        ref={cursorRef}
        style={{
          position: 'absolute',
          display: 'none',
          pointerEvents: 'none',
          zIndex: 300,
          transform: 'translate(-2px, -2px)',
          filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 2L3 13L6.5 10L8.5 15L10.2 14.4L8.2 9.2L12 9.2Z"
            fill="white"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth="0.8"
          />
        </svg>
      </div>
    </div>
  );
}
