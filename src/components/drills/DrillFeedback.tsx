"use client";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { AnyDrill, DrillResult, AutopsyResult } from '@/core/types/drills';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScoreCounter } from '@/components/ui/ScoreCounter';

interface DrillFeedbackProps {
  drill: AnyDrill;
  result: DrillResult;
  onContinue: () => void;
  onExit: () => void;
  onRetry?: () => void;
}

// ── Color helpers ────────────────────────────────────────────────────────────

function criterionBarColor(pct: number): string {
  if (pct >= 70) return '#22c55e';
  if (pct >= 40) return '#f59e0b';
  return '#ef4444';
}

function scoreColor(n: number): string {
  if (n >= 65) return '#22c55e';
  if (n >= 40) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(n: number): string {
  if (n >= 80) return 'Top tier attempt';
  if (n >= 65) return 'Above threshold';
  if (n >= 40) return 'Developing';
  return 'Needs rework';
}

// ── Injected CSS ─────────────────────────────────────────────────────────────

const COMPONENT_STYLES = `
  @keyframes dof-fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dof-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .dof-section {
    opacity: 0;
    animation: dof-fadeUp 0.35s ease forwards;
  }
  @media (prefers-reduced-motion: reduce) {
    .dof-section {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
  .dof-coach-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  @media (min-width: 641px) {
    .dof-coach-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  .dof-outline-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
  .dof-outline-body.open {
    max-height: 800px;
  }
  @media (prefers-reduced-motion: reduce) {
    .dof-outline-body {
      transition: none;
    }
  }
  .dof-spin-arc {
    animation: dof-spin 1s linear infinite;
    transform-origin: 16px 16px;
  }
`;

// ── Segment style map ─────────────────────────────────────────────────────────

const SEGMENT_STYLES: Record<AutopsyResult['segments'][number]['type'], React.CSSProperties> = {
  critical: {
    background: 'rgba(34,197,94,0.18)',
    color: '#4ade80',
    borderBottom: '2px solid rgba(34,197,94,0.5)',
    borderRadius: 2,
    padding: '1px 2px',
  },
  good: {
    background: 'rgba(34,197,94,0.08)',
    color: 'rgba(255,255,255,0.85)',
    borderBottom: '1px solid rgba(34,197,94,0.25)',
    padding: '1px 2px',
  },
  neutral: {
    color: 'rgba(255,255,255,0.5)',
  },
  weak: {
    background: 'rgba(245,158,11,0.08)',
    color: 'rgba(255,200,100,0.85)',
    borderBottom: '1px solid rgba(245,158,11,0.25)',
    padding: '1px 2px',
  },
  bad: {
    background: 'rgba(239,68,68,0.1)',
    color: 'rgba(255,120,120,0.9)',
    borderBottom: '2px solid rgba(239,68,68,0.4)',
    padding: '1px 2px',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function DrillFeedback({ drill, result, onContinue, onExit, onRetry }: DrillFeedbackProps) {
  const sc = result.score;

  const [outlineOpen, setOutlineOpen] = useState(sc < 65);
  const [copied, setCopied] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  // Autopsy tab state
  const [activeTab, setActiveTab] = useState<'breakdown' | 'autopsy'>('breakdown');
  const [autopsyData, setAutopsyData] = useState<AutopsyResult | null>(null);
  const [autopsyLoading, setAutopsyLoading] = useState(false);
  const [autopsyError, setAutopsyError] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const reducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const { evalData } = result;

  // Persist last drill result to localStorage for profile/dashboard reads
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lastDrillScore', sc.toString());
    localStorage.setItem('lastDrillName', drill.title);
    localStorage.setItem('lastDrillDate', new Date().toISOString());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Animate score counter (only for evalData branch)
  useEffect(() => {
    if (!evalData) return;
    if (reducedMotion.current) {
      setDisplayScore(sc);
      return;
    }
    const duration = 900;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplayScore(Math.round(eased * sc));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sc, evalData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mobile viewport detection
  useEffect(() => {
    const check = () => setIsMobileViewport(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Autopsy fetch (lazy, cached)
  const fetchAutopsy = async () => {
    if (autopsyData) return;
    const submission =
      typeof result.userInput === 'string'
        ? result.userInput
        : JSON.stringify(result.userInput);
    setAutopsyLoading(true);
    setAutopsyError(null);
    try {
      const res = await fetch('/api/autopsy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission,
          drillTitle: drill.title,
          rubricCriteria: result.scoringResult.criteriaResults.map(c => ({
            name: c.label,
            maxPoints: c.maxPoints,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? 'Failed to load autopsy');
      }
      const data = await res.json() as AutopsyResult;
      setAutopsyData(data);
    } catch (e: unknown) {
      setAutopsyError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setAutopsyLoading(false);
    }
  };

  const handleTabClick = (tab: 'breakdown' | 'autopsy') => {
    setActiveTab(tab);
    if (tab === 'autopsy' && !autopsyData && !autopsyLoading) {
      fetchAutopsy();
    }
  };

  // ── evalData branch: redesigned prompt_engineering result ─────────────────
  if (evalData) {
    const ringR = 54;
    const circ = 2 * Math.PI * ringR;
    const col = scoreColor(sc);

    const allWeaknesses = [
      ...(evalData.weaknesses ?? []),
      ...(evalData.missedConstraints ?? []),
    ];
    const revisionTip = evalData.revisionInstructions?.[0] ?? '';
    const hasCoachSection =
      evalData.strengths.length > 0 || allWeaknesses.length > 0 || !!revisionTip;

    const allFeedbacks = result.scoringResult.criteriaResults
      .map(c => c.feedback)
      .filter(Boolean);
    const allIdentical =
      allFeedbacks.length > 1 && allFeedbacks.every(f => f === allFeedbacks[0]);
    const showCopyBanner = allIdentical;
    const copyBannerText = allIdentical ? allFeedbacks[0] : '';

    const mins = Math.floor(result.timeSpent / 60);
    const secs = result.timeSpent % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    return (
      <>
        <style>{COMPONENT_STYLES}</style>
        <div style={{ minHeight: '100vh', background: '#0d0d0d', padding: '48px 20px 80px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>

            {/* ── Score hero ── */}
            <div
              className="dof-section"
              style={{ textAlign: 'center', marginBottom: 28, animationDelay: '0ms' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <svg width={148} height={148} style={{ overflow: 'visible' }}>
                  <circle
                    cx={74} cy={74} r={ringR}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={6}
                  />
                  <motion.circle
                    cx={74} cy={74} r={ringR}
                    fill="none"
                    stroke={col}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ * (1 - sc / 100) }}
                    transition={
                      reducedMotion.current
                        ? { duration: 0 }
                        : { delay: 0.05, duration: 0.9, ease: [0.4, 0, 0.2, 1] }
                    }
                    transform="rotate(-90 74 74)"
                  />
                  <text
                    x="74" y="80"
                    textAnchor="middle"
                    fontSize="46"
                    fill="#fff"
                    fontFamily="var(--font-display)"
                    fontWeight={600}
                  >
                    {displayScore}
                  </text>
                  <text
                    x="74" y="97"
                    textAnchor="middle"
                    fontSize="11"
                    fill="rgba(255,255,255,0.28)"
                    fontFamily="var(--font-code)"
                  >
                    / 100
                  </text>
                </svg>
              </div>

              {/* Level badge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <span style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: 11,
                  color: col,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  background: col + '1a',
                  borderRadius: 100,
                  padding: '5px 14px',
                  border: `1px solid ${col}33`,
                }}>
                  {scoreLabel(sc)}
                </span>
              </div>

              {/* Drill title */}
              <div style={{
                fontSize: 21,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.88)',
                fontFamily: 'var(--font-body)',
                marginBottom: 10,
              }}>
                {drill.title}
              </div>

              {/* Session persistence signal */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                fontSize: 12,
                color: 'rgba(255,255,255,0.28)',
                fontFamily: 'var(--font-code)',
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'inline-block',
                  flexShrink: 0,
                }} />
                Result saved to your session · {timeStr}
              </div>
            </div>

            {/* ── Tab toggle ── */}
            <div
              className="dof-section"
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, animationDelay: '40ms' }}
            >
              <div style={{
                display: 'inline-flex',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9999,
                padding: 3,
                gap: 0,
              }}>
                {/* Tab 1 — Score Breakdown */}
                <button
                  onClick={() => handleTabClick('breakdown')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 500, padding: '7px 20px',
                    cursor: 'pointer', border: 'none', borderRadius: 9999,
                    background: activeTab === 'breakdown' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: activeTab === 'breakdown' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.15s',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <rect x="0" y="0" width="5" height="5" rx="1" />
                    <rect x="7" y="0" width="5" height="5" rx="1" />
                    <rect x="0" y="7" width="5" height="5" rx="1" />
                    <rect x="7" y="7" width="5" height="5" rx="1" />
                  </svg>
                  Score Breakdown
                </button>

                {/* Tab 2 — Prompt Autopsy */}
                <button
                  onClick={() => handleTabClick('autopsy')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 500, padding: '7px 20px',
                    cursor: 'pointer', border: 'none', borderRadius: 9999,
                    background: activeTab === 'autopsy' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: activeTab === 'autopsy' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.15s',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  Prompt Autopsy
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 1 — Score Breakdown                                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'breakdown' && (
              <>
                {/* ── Score breakdown ── */}
                <div
                  className="dof-section"
                  style={{ marginBottom: 32, animationDelay: '80ms' }}
                >
                  <div style={{
                    fontFamily: 'var(--font-code)',
                    fontSize: 9,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.22)',
                    marginBottom: 14,
                  }}>
                    Score Breakdown
                  </div>

                  {showCopyBanner && (
                    <div style={{
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.22)',
                      borderRadius: 10,
                      padding: '11px 16px',
                      marginBottom: 14,
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                    }}>
                      <span style={{ color: '#f59e0b', fontSize: 14, flexShrink: 0 }}>⚠</span>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                          Copy detection triggered — scores capped.
                        </span>
                        {' '}{copyBannerText}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.scoringResult.criteriaResults.map((criterion, idx) => {
                      const pct = criterion.maxPoints > 0
                        ? (criterion.score / criterion.maxPoints) * 100
                        : 0;
                      const barColor = criterionBarColor(pct);
                      const rubric = evalData.rubricScores.find(
                        r => r.rubricItemId === criterion.criterionId
                      );
                      const showJustification = !showCopyBanner && !!criterion.feedback;
                      const quote = rubric?.evidenceQuotes?.[0];

                      return (
                        <div
                          key={criterion.criterionId}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderLeft: `2px solid ${barColor}33`,
                            borderRadius: 12,
                            padding: '18px 20px',
                          }}
                        >
                          {/* Label + score */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: 10,
                            gap: 12,
                          }}>
                            <span style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: 'rgba(255,255,255,0.82)',
                              lineHeight: 1.4,
                            }}>
                              {criterion.label}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-code)',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              lineHeight: 1,
                            }}>
                              <span style={{ fontSize: 19, fontWeight: 700, color: barColor }}>
                                {criterion.score}
                              </span>
                              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.22)', marginLeft: 2 }}>
                                / {criterion.maxPoints}
                              </span>
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div style={{
                            height: 5,
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 100,
                            overflow: 'hidden',
                            marginBottom: showJustification || quote ? 12 : 0,
                          }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={
                                reducedMotion.current
                                  ? { duration: 0 }
                                  : { delay: 0.1 + idx * 0.06, duration: 0.7, ease: [0.4, 0, 0.2, 1] }
                              }
                              style={{ height: '100%', borderRadius: 100, background: barColor }}
                            />
                          </div>

                          {/* Justification */}
                          {showJustification && (
                            <p style={{
                              fontSize: 13,
                              color: 'rgba(255,255,255,0.5)',
                              lineHeight: 1.7,
                              margin: quote ? '0 0 10px' : '0',
                            }}>
                              {criterion.feedback}
                            </p>
                          )}

                          {/* Evidence quote */}
                          {quote && (
                            <blockquote style={{
                              borderLeft: '2px solid rgba(255,255,255,0.08)',
                              margin: 0,
                              paddingLeft: 12,
                              fontSize: 12,
                              fontFamily: 'var(--font-code)',
                              color: 'rgba(255,255,255,0.25)',
                              lineHeight: 1.6,
                            }}>
                              <span style={{ color: 'rgba(255,255,255,0.35)' }}>
                                Your submission contained:{' '}
                              </span>
                              &ldquo;{quote.length > 120 ? quote.slice(0, 120) + '…' : quote}&rdquo;
                            </blockquote>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Coach analysis ── */}
                {hasCoachSection && (
                  <div
                    className="dof-section"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 12,
                      padding: '20px 24px',
                      marginBottom: 32,
                      animationDelay: '160ms',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: 9,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.22)',
                      marginBottom: 18,
                    }}>
                      Coach Analysis
                    </div>

                    <div className="dof-coach-grid">
                      {/* What worked */}
                      {evalData.strengths.length > 0 && (
                        <div>
                          <div style={{
                            fontFamily: 'var(--font-code)',
                            fontSize: 11,
                            letterSpacing: '0.11em',
                            textTransform: 'uppercase',
                            color: '#22c55e',
                            marginBottom: 12,
                          }}>
                            What worked
                          </div>
                          {evalData.strengths.map((s, i) => (
                            <div
                              key={i}
                              style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 8 }}
                            >
                              <span style={{
                                color: '#22c55e',
                                fontSize: 8,
                                marginTop: 5,
                                flexShrink: 0,
                              }}>●</span>
                              <span style={{
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.6)',
                                lineHeight: 1.65,
                              }}>
                                {s}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* What missed */}
                      {allWeaknesses.length > 0 && (
                        <div>
                          <div style={{
                            fontFamily: 'var(--font-code)',
                            fontSize: 11,
                            letterSpacing: '0.11em',
                            textTransform: 'uppercase',
                            color: '#f59e0b',
                            marginBottom: 12,
                          }}>
                            What missed
                          </div>
                          {allWeaknesses.map((w, i) => (
                            <div
                              key={i}
                              style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 8 }}
                            >
                              <span style={{
                                color: '#f59e0b',
                                fontSize: 8,
                                marginTop: 5,
                                flexShrink: 0,
                              }}>●</span>
                              <span style={{
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.5)',
                                lineHeight: 1.65,
                              }}>
                                {w}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Revision callout */}
                    {revisionTip && (
                      <div style={{
                        background: '#2a1f0a',
                        border: '1px solid rgba(245,158,11,0.25)',
                        borderRadius: 10,
                        padding: '13px 16px',
                        marginTop: 20,
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-code)',
                          fontSize: 9,
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          color: '#f59e0b',
                          display: 'block',
                          marginBottom: 7,
                        }}>
                          To score higher next time
                        </span>
                        <p style={{
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.7)',
                          lineHeight: 1.65,
                          margin: 0,
                        }}>
                          {revisionTip}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Collapsible exemplar ── */}
                {evalData.improvedVersionOutline && (
                  <div
                    className="dof-section"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 12,
                      padding: '16px 22px',
                      marginBottom: 32,
                      animationDelay: '200ms',
                    }}
                  >
                    <button
                      onClick={() => setOutlineOpen(o => !o)}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 0,
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-code)',
                        fontSize: 9,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.38)',
                      }}>
                        See what a stronger answer looks like
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>
                        {outlineOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    <div className={`dof-outline-body${outlineOpen ? ' open' : ''}`}>
                      <pre style={{
                        fontFamily: 'var(--font-code)',
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.42)',
                        lineHeight: 1.75,
                        whiteSpace: 'pre-wrap',
                        margin: '14px 0 2px',
                      }}>
                        {evalData.improvedVersionOutline}
                      </pre>
                    </div>
                  </div>
                )}

                {/* ── Key insight ── */}
                {'explanation' in drill && drill.explanation && (
                  <div
                    className="dof-section"
                    style={{
                      background: 'rgba(0,212,255,0.04)',
                      border: '1px solid rgba(0,212,255,0.1)',
                      borderLeft: '3px solid #00d4ff',
                      borderRadius: 12,
                      padding: '18px 22px',
                      marginBottom: 32,
                      animationDelay: '240ms',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: 9,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#00d4ff',
                      marginBottom: 9,
                    }}>
                      Key Insight
                    </div>
                    <p style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.55)',
                      lineHeight: 1.7,
                      margin: 0,
                    }}>
                      {drill.explanation}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 2 — Prompt Autopsy                                         */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'autopsy' && (
              <>
                {/* Loading state */}
                {autopsyLoading && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 12, padding: '64px 0',
                  }}>
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                      <circle
                        cx="16" cy="16" r="12" fill="none" stroke="#22c55e"
                        strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray="54 22"
                        className="dof-spin-arc"
                      />
                    </svg>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Performing autopsy...</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>Analyzing your prompt token by token</div>
                  </div>
                )}

                {/* Error state */}
                {autopsyError && !autopsyLoading && (
                  <div style={{
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 12, padding: '20px 24px',
                    display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,150,150,0.8)' }}>{autopsyError}</div>
                    <button
                      onClick={() => { setAutopsyError(null); fetchAutopsy(); }}
                      style={{
                        padding: '8px 20px', background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8,
                        color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Autopsy results */}
                {autopsyData && !autopsyLoading && (
                  <>
                    {/* Section 2 — Forensic Breakdown */}
                    <div
                      className="dof-section"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 16, padding: '28px 32px',
                        marginBottom: 20, animationDelay: '100ms',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-code)', fontSize: 10,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.2)', marginBottom: 16,
                      }}>
                        Forensic Breakdown
                      </div>

                      {/* Legend */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                        {[
                          { label: 'Critical signal', bg: 'rgba(34,197,94,0.5)' },
                          { label: 'Useful', bg: 'rgba(34,197,94,0.2)' },
                          { label: 'Neutral', bg: 'rgba(255,255,255,0.15)' },
                          { label: 'Weak/vague', bg: 'rgba(245,158,11,0.4)' },
                          { label: 'Hurts score', bg: 'rgba(239,68,68,0.4)' },
                        ].map(item => (
                          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: 2,
                              background: item.bg, flexShrink: 0,
                            }} />
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Annotated text */}
                      <div style={{ fontSize: 15, lineHeight: 2, whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-word', width: '100%' }}>
                        {autopsyData.segments.map((seg, idx) => {
                          const isNeutral = seg.type === 'neutral';
                          const isHovered = hoveredSegment === idx;
                          const tooltipAbove = !isMobileViewport;
                          return (
                            <span
                              key={idx}
                              style={{
                                ...SEGMENT_STYLES[seg.type],
                                position: 'relative',
                                display: 'inline',
                                cursor: isNeutral ? 'default' : 'default',
                              }}
                              onMouseEnter={() => !isNeutral && setHoveredSegment(idx)}
                              onMouseLeave={() => setHoveredSegment(null)}
                            >
                              {seg.text}
                              {/* Tooltip */}
                              {!isNeutral && isHovered && (
                                <span style={{
                                  position: 'absolute',
                                  [tooltipAbove ? 'bottom' : 'top']: tooltipAbove ? 'calc(100% + 8px)' : 'calc(100% + 8px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  background: '#0d0d0d',
                                  border: '1px solid rgba(255,255,255,0.12)',
                                  borderRadius: 8,
                                  padding: '8px 12px',
                                  fontSize: 12,
                                  color: 'rgba(255,255,255,0.7)',
                                  whiteSpace: 'normal',
                                  maxWidth: 220,
                                  wordWrap: 'break-word',
                                  zIndex: 100,
                                  pointerEvents: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 4,
                                }}>
                                  {seg.criterion && (
                                    <span style={{
                                      fontSize: 10, color: 'rgba(255,255,255,0.4)',
                                      background: 'rgba(255,255,255,0.06)',
                                      padding: '2px 8px', borderRadius: 20,
                                      display: 'inline-block', alignSelf: 'flex-start',
                                      marginBottom: 2,
                                    }}>
                                      {seg.criterion}
                                    </span>
                                  )}
                                  <span>{seg.explanation}</span>
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 3 — Fatal Issues */}
                    {autopsyData.fatalIssues.length > 0 && (
                      <div
                        className="dof-section"
                        style={{
                          background: 'rgba(239,68,68,0.04)',
                          border: '1px solid rgba(239,68,68,0.15)',
                          borderRadius: 12, padding: '16px 20px',
                          marginBottom: 20, animationDelay: '200ms',
                          display: 'flex', gap: 14, alignItems: 'flex-start',
                        }}
                      >
                        {/* Warning icon */}
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'rgba(239,68,68,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 2,
                        }}>
                          <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, lineHeight: 1 }}>!</span>
                        </div>
                        <div>
                          <div style={{
                            fontFamily: 'var(--font-code)', fontSize: 10,
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                            color: 'rgba(239,68,68,0.6)', marginBottom: 6,
                          }}>
                            Fatal Issues
                          </div>
                          {autopsyData.fatalIssues.map((issue, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ color: 'rgba(239,68,68,0.5)', fontSize: 12, marginTop: 2, flexShrink: 0 }}>•</span>
                              <span style={{ fontSize: 13, color: 'rgba(255,150,150,0.8)', lineHeight: 1.6 }}>
                                {issue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 4 — Top Insight */}
                    <div
                      className="dof-section"
                      style={{
                        borderLeft: '2px solid rgba(99,102,241,0.4)',
                        padding: '16px 20px',
                        background: 'rgba(99,102,241,0.04)',
                        borderRadius: '0 8px 8px 0',
                        marginBottom: 20, animationDelay: '300ms',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-code)', fontSize: 10,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        color: 'rgba(99,102,241,0.7)', marginBottom: 8,
                      }}>
                        Key Insight
                      </div>
                      <p style={{
                        fontSize: 14, color: 'rgba(255,255,255,0.65)',
                        lineHeight: 1.7, margin: 0,
                      }}>
                        {autopsyData.topInsight}
                      </p>
                    </div>

                    {/* Section 5 — Exemplar Prompt */}
                    <div
                      className="dof-section"
                      style={{
                        background: 'rgba(34,197,94,0.04)',
                        border: '1px solid rgba(34,197,94,0.15)',
                        borderRadius: 12, padding: '20px 24px',
                        marginBottom: 32, animationDelay: '400ms',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-code)', fontSize: 10,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        color: 'rgba(34,197,94,0.6)', marginBottom: 10,
                      }}>
                        What a High-Scoring Prompt Looks Like
                      </div>
                      <p style={{
                        fontSize: 13, color: 'rgba(255,255,255,0.45)',
                        marginBottom: 12, lineHeight: 1.5,
                      }}>
                        A prompt addressing all criteria would look like this:
                      </p>
                      <pre style={{
                        fontSize: 13,
                        fontFamily: 'var(--font-code)',
                        color: 'rgba(34,197,94,0.8)',
                        lineHeight: 1.75,
                        padding: '14px 16px',
                        background: 'rgba(34,197,94,0.05)',
                        borderRadius: 8,
                        borderLeft: '2px solid rgba(34,197,94,0.3)',
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                      }}>
                        {autopsyData.exemplarPrompt}
                      </pre>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── CTA row: Try Again (primary) / Next Drill (secondary) / Copy Result (ghost) ── */}
            <div
              className="dof-section"
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                animationDelay: '320ms',
              }}
            >
              {/* Primary: Try Again */}
              <button
                onClick={onRetry ?? onExit}
                style={{
                  flex: 1,
                  padding: '13px 16px',
                  background: '#fff',
                  border: 'none',
                  color: '#000',
                  borderRadius: 10,
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Try Again
              </button>

              {/* Secondary: Next Drill */}
              <button
                onClick={onContinue}
                style={{
                  flex: 1,
                  padding: '13px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.16)',
                  color: 'rgba(255,255,255,0.5)',
                  borderRadius: 10,
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Next Drill →
              </button>

              {/* Ghost: Copy Result */}
              <button
                onClick={() => {
                  const text = `I scored ${sc}/100 on ${drill.title} — AI Dojo Prompt Engineering | ai-mastery-os-six.vercel.app`;
                  navigator.clipboard.writeText(text).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }).catch(() => {});
                }}
                style={{
                  flex: 1,
                  padding: '13px 10px',
                  background: 'none',
                  border: 'none',
                  color: copied ? '#22c55e' : 'rgba(255,255,255,0.28)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color 0.18s ease',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}
              >
                {copied ? 'Copied ✓' : 'Copy Result'}
              </button>
            </div>

          </div>
        </div>
      </>
    );
  }

  // ── Original layout for all other drill types ────────────────────────────
  const percentage = result.scoringResult.percentage;
  const isPassing = percentage >= 65;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[var(--color-surface)] border-4 border-[var(--color-border)]">
            <div className="text-5xl font-bold t-score">
              <ScoreCounter target={percentage} />%
            </div>
          </div>

          <h1 className="text-3xl font-bold">{drill.title}</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            {result.scoringResult.performanceLabel}
          </p>

          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-[var(--color-text-secondary)]">
              Score: {result.scoringResult.totalScore} / {result.scoringResult.maxScore}
            </span>
            <span className="text-[var(--color-text-secondary)]">•</span>
            <span className="text-[var(--color-text-secondary)]">
              Time: {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
            </span>
          </div>
        </div>

        <Card>
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Performance Breakdown</h2>
              <div className="space-y-4">
                {result.scoringResult.criteriaResults.map((criterion) => (
                  <div key={criterion.criterionId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{criterion.label}</span>
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {criterion.score} / {criterion.maxPoints}
                      </span>
                    </div>
                    <ProgressBar
                      value={(criterion.score / criterion.maxPoints) * 100}
                      size="sm"
                      color={criterion.score / criterion.maxPoints >= 0.7 ? 'green' : criterion.score / criterion.maxPoints >= 0.5 ? 'yellow' : 'red'}
                    />
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {criterion.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <h3 className="font-semibold mb-2">Key Insight</h3>
              <p className="text-[var(--color-text-secondary)]">{drill.explanation}</p>
            </div>

            {!isPassing && (
              <div className="p-4 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-lg">
                <p className="text-sm">
                  <strong>Recommendation:</strong> Review the reference solution and retry this drill before advancing. Mastery requires consistent performance above 65%.
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button variant="ghost" onClick={onExit}>
            Exit to Curriculum
          </Button>
          <Button variant="primary" onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
