'use client'

/**
 * SniperDrill — Domain 01: Prompt Engineering
 *
 * Drop-in replacement for PromptConstructionDrill.
 * Receives the exact same props: { drill, onSubmit, onExit }
 *
 * INSTALLATION:
 *   1. Save as: src/components/drills/SniperDrill.tsx
 *   2. In the file that renders PromptConstructionDrill
 *      (likely src/components/DrillSession.tsx or src/app/run/page.tsx),
 *      add:
 *
 *        import SniperDrill from '@/components/drills/SniperDrill'
 *
 *      Then replace:
 *        <PromptConstructionDrill drill={drill} onSubmit={onSubmit} onExit={onExit} />
 *      with:
 *        <SniperDrill drill={drill} onSubmit={onSubmit} onExit={onExit} />
 *
 *   3. DO NOT touch evaluateDrill.ts, callOpenAI.ts, or any core/* files.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { evaluateDrill } from '@/app/actions/evaluateDrill'

// ─── Types (mirrors existing drill shape) ────────────────────────────────────

interface SuccessCriterion {
  id: string
  label: string
  description: string
  maxPoints: number
}

interface Drill {
  id: string
  type: string
  domain: string
  difficulty: string
  title: string
  timeLimit: number
  points: number
  context: string
  targetOutput: string
  brokenPrompt: string
  referencePrompt?: string
  successCriteria: SuccessCriterion[]
  explanation?: string
  skills?: string[]
}

interface SniperDrillProps {
  drill: Drill
  onSubmit: (result: { userInput: string; score?: number; evalResult?: any }) => void
  onExit: () => void
  drillIndex?: number
  totalDrills?: number
}

interface RubricDataItem {
  rubricItemId: string
  score: number
  justification: string
  evidenceQuotes: string[]
}

// ─── Criteria config ──────────────────────────────────────────────────────────

const CRITERIA_CONFIG = [
  { name: 'Audience', pts: 20, keywords: ['founder','operator','b2b','saas','audience','subscriber','marketing manager','target'] },
  { name: 'Structure', pts: 25, keywords: ['section','header','structure','format','bullet','numbered','outline','paragraph'] },
  { name: 'Tone', pts: 20, keywords: ['tone','voice','direct','expert','authoritative','professional','avoid','style'] },
  { name: 'Length', pts: 15, keywords: ['word','character','length','300','400','500','brief','concise','limit'] },
  { name: 'Format', pts: 20, keywords: ['subject','cta','call to action','newsletter','email','template','opening','closing'] },
]

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS_STYLES = `
  @keyframes snprScanLine {
    0%   { top: 0%;   opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes snprBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  @keyframes snprSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .snpr-fade-up {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 350ms ease-out, transform 350ms ease-out;
  }
  .snpr-fade-up.snpr-in {
    opacity: 1;
    transform: translateY(0);
  }
  .snpr-slide-left {
    opacity: 0;
    transform: translateX(-12px);
    transition: opacity 350ms ease-out, transform 350ms ease-out;
  }
  .snpr-slide-right {
    opacity: 0;
    transform: translateX(12px);
    transition: opacity 350ms ease-out, transform 350ms ease-out;
  }
  .snpr-slide-left.snpr-in,
  .snpr-slide-right.snpr-in {
    opacity: 1;
    transform: translateX(0);
  }
  .snpr-submit-btn .snpr-arrow {
    display: inline-block;
    transition: transform 200ms ease;
  }
  .snpr-submit-btn:not(:disabled):hover .snpr-arrow {
    transform: translateX(3px);
  }
  .snpr-submit-btn:not(:disabled):hover {
    background: rgba(34,197,94,0.18) !important;
    border-color: rgba(34,197,94,0.55) !important;
    transform: translateY(-1px);
  }
  .snpr-submit-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .snpr-exit-btn:hover {
    border-color: rgba(255,255,255,0.18) !important;
    color: rgba(255,255,255,0.4) !important;
  }
  .snpr-textarea::placeholder {
    color: rgba(255,255,255,0.15);
  }
  @media (max-width: 768px) {
    .snpr-brief-cards {
      grid-template-columns: 1fr !important;
    }
    .snpr-brief-zone {
      padding: 20px !important;
    }
    .snpr-title {
      font-size: 26px !important;
    }
    .snpr-write-zone {
      padding: 16px 20px !important;
    }
    .snpr-bottom-bar {
      height: auto !important;
      flex-direction: column !important;
      gap: 12px !important;
      padding: 12px 20px !important;
    }
    .snpr-criteria-row {
      flex-wrap: wrap !important;
    }
    .snpr-submit-btn {
      width: 100% !important;
    }
    .snpr-textarea {
      min-height: 180px !important;
    }
    .snpr-topbar {
      padding: 0 16px !important;
    }
  }
`

// ─── Score colour helper ──────────────────────────────────────────────────────

function scoreColor(n: number): string {
  if (n >= 90) return '#00d4ff'
  if (n >= 70) return '#22c55e'
  if (n >= 50) return '#f59e0b'
  if (n >= 25) return '#f97316'
  return '#ef4444'
}

function scoreLabel(n: number): string {
  if (n >= 90) return '🎯 Precision Shot'
  if (n >= 70) return '✓ On Target'
  if (n >= 50) return '~ Getting Closer'
  if (n >= 25) return '↗ Keep Refining'
  return '✗ Missed'
}

function criterionBarColor(pct: number): string {
  if (pct >= 70) return '#22c55e'
  if (pct >= 40) return '#f59e0b'
  return '#ef4444'
}

// ─── Heuristic live scorer (runs client-side, no API call) ───────────────────

function heuristicScore(text: string, drill: Drill): number {
  if (text.length < 20) return 0
  let score = 0
  const lower = text.toLowerCase()

  // Directive language check — must contain an imperative verb to score above 20
  const hasDirective = /\b(write|generate|create|produce|draft|summarise|summarize|list|analyse|analyze|you are|your task|act as)\b/i.test(text)

  // Verbatim overlap penalty — if 6+ letter words in submission match context/target at ratio > 0.4
  const briefText = (drill.context + ' ' + drill.targetOutput).toLowerCase()
  const subWords6 = lower.match(/\b[a-z]{6,}\b/g) ?? []
  const briefWords6 = new Set(briefText.match(/\b[a-z]{6,}\b/g) ?? [])
  const overlapRatio = subWords6.length > 0 ? subWords6.filter(w => briefWords6.has(w)).length / subWords6.length : 0

  // Length — more text = more specificity
  if (text.length > 80) score += 10
  if (text.length > 180) score += 8
  if (text.length > 320) score += 7

  // Numbers signal constraints
  if (/\d+/.test(text)) score += 10

  // Structural language
  const structural = ['format', 'structure', 'section', 'length', 'word', 'character', 'tone', 'voice', 'style', 'audience', 'reader', 'include', 'must', 'exactly', 'specific', 'only', 'never', 'always']
  score += structural.filter(w => lower.includes(w)).length * 4

  // Criteria coverage — reward prompts that address criteria labels
  for (const c of drill.successCriteria) {
    const words = c.label.toLowerCase().split(/\s+/)
    if (words.some(w => lower.includes(w))) score += 6
  }

  // Context echo — mentions key nouns from context
  const ctxWords = drill.context.toLowerCase().match(/\b[a-z]{6,}\b/g) ?? []
  const unique = [...new Set(ctxWords)]
  score += Math.min(12, unique.filter(w => lower.includes(w)).length * 2)

  let finalScore = Math.min(95, score)

  // Apply caps
  if (!hasDirective) finalScore = Math.min(finalScore, 20)
  if (overlapRatio > 0.4) finalScore = Math.min(finalScore, 18)

  return finalScore
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SniperDrill({ drill, onSubmit, onExit, drillIndex, totalDrills }: SniperDrillProps) {
  const [prompt, setPrompt] = useState('')
  const [liveScore, setLiveScore] = useState(0)
  const [isScoring, setIsScoring] = useState(false)
  const [phase, setPhase] = useState<'write' | 'submitting'>('write')
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({})
  const [rubricData, setRubricData] = useState<RubricDataItem[]>([])
  const [strengths, setStrengths] = useState<string[]>([])
  const [weaknesses, setWeaknesses] = useState<string[]>([])
  const [missedConstraints, setMissedConstraints] = useState<string[]>([])
  const [revisionTip, setRevisionTip] = useState('')
  const [improvedOutline, setImprovedOutline] = useState('')
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [scoreHistory, setScoreHistory] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(drill.timeLimit || 480)
  const [scanActive, setScanActive] = useState(false)

  // ── Visual-only state ──────────────────────────────────────────────────────
  const [criteriaLit, setCriteriaLit] = useState([false, false, false, false, false])
  const [animIn, setAnimIn] = useState({
    difficulty: false,
    title: false,
    cards: false,
    situation: false,
    writeZone: false,
    bottomBar: false,
  })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scoreRef = useRef(0)
  scoreRef.current = liveScore
  const serverScoreRef = useRef(false)

  // ── Staggered entrance animations ─────────────────────────────────────────

  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimIn(p => ({ ...p, difficulty: true })), 200),
      setTimeout(() => setAnimIn(p => ({ ...p, title: true })), 350),
      setTimeout(() => setAnimIn(p => ({ ...p, cards: true })), 500),
      setTimeout(() => setAnimIn(p => ({ ...p, situation: true })), 650),
      setTimeout(() => setAnimIn(p => ({ ...p, writeZone: true })), 800),
      setTimeout(() => setAnimIn(p => ({ ...p, bottomBar: true })), 900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // ── Live criteria detection ────────────────────────────────────────────────

  useEffect(() => {
    const lower = prompt.toLowerCase()
    setCriteriaLit(CRITERIA_CONFIG.map(c => c.keywords.some(k => lower.includes(k))))
  }, [prompt])

  // ── Timer ──────────────────────────────────────────────────────────────────

  // Reset timer if the drill changes (guards against prop-update without remount)
  useEffect(() => {
    setTimeLeft(drill.timeLimit || 480)
  }, [drill.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'write') return
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { clearInterval(t); handleSubmit(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ── Live score (debounced heuristic only — no API) ─────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (phase !== 'write') return
    debounceRef.current = setTimeout(() => {
      if (prompt.length < 15) { setLiveScore(0); setScoreHistory([]); return }
      setIsScoring(true)
      setScanActive(true)
      const s = heuristicScore(prompt, drill)
      setLiveScore(s)
      setScoreHistory(prev => [...prev.slice(-9), s])
      setTimeout(() => { setIsScoring(false); setScanActive(false) }, 400)
    }, 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [prompt, phase, drill])

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (phase !== 'write' || prompt.trim().length < 10) return
    setPhase('submitting')
    setScanActive(true)

    try {
      const result = await evaluateDrill({
        drillId: drill.id,
        submission: prompt,
      })

      console.log('[SNIPER-RESULT] received from server:', JSON.stringify({ overallScore: result?.overallScore, masteryDecision: result?.masteryDecision }))
      const score: number = result?.overallScore ?? heuristicScore(prompt, drill)
      serverScoreRef.current = true
      setFinalScore(score)

      const cs: Record<string, number> = {}

      if (result?.rubricScores?.length) {
        const rubricMap: Record<string, number> = {}
        for (const r of result.rubricScores) {
          rubricMap[r.rubricItemId] = r.score
        }
        for (const c of drill.successCriteria) {
          cs[c.id] = rubricMap[c.id] ?? Math.round((score / 100) * c.maxPoints)
        }
        setRubricData(result.rubricScores as RubricDataItem[])
      } else {
        for (const c of drill.successCriteria) {
          cs[c.id] = Math.round((score / 100) * c.maxPoints * (0.75 + Math.random() * 0.5))
        }
        setRubricData([])
      }

      setCriteriaScores(cs)
      setStrengths(result?.strengths ?? [])
      setWeaknesses(result?.weaknesses ?? [])
      setMissedConstraints(result?.missedConstraints ?? [])
      setRevisionTip(result?.revisionInstructions?.[0] ?? '')
      setImprovedOutline(result?.improvedVersionOutline ?? '')

      setTimeout(() => {
        setScanActive(false)
        console.log('SniperDrill onSubmit called', { score, hasEvalResult: !!result })
        onSubmit({ userInput: prompt, score, evalResult: result })
      }, 900)
    } catch (err: unknown) {
      console.error('[SNIPER-CATCH] evaluateDrill threw — falling back to heuristic. Error:', err)
      const score = heuristicScore(prompt, drill)
      if (!serverScoreRef.current) setFinalScore(score)
      const cs: Record<string, number> = {}
      for (const c of drill.successCriteria) {
        cs[c.id] = Math.round((score / 100) * c.maxPoints)
      }
      setCriteriaScores(cs)
      setRubricData([])
      setStrengths([])
      setWeaknesses([])
      setMissedConstraints([])
      setRevisionTip('')
      setImprovedOutline('')
      setTimeout(() => {
        setScanActive(false)
        onSubmit({ userInput: prompt, score })
      }, 900)
    }
  }, [phase, prompt, drill, onSubmit])

  const isSubmitting = phase === 'submitting'
  const canSubmit = prompt.length >= 20 && !isSubmitting
  const domainLabel = drill.domain.replace(/_/g, ' ').toUpperCase()
  const difficultyLabel = drill.difficulty.toUpperCase()
  const charCountLit = prompt.length > 30

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{CSS_STYLES}</style>

      {/* ROOT */}
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#07070a',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
        position: 'relative',
        color: '#fff',
      }}>

        {/* ── 1. TOPBAR ──────────────────────────────────────────────────── */}
        <div className="snpr-topbar" style={{
          height: 44,
          flexShrink: 0,
          background: 'transparent',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {drillIndex != null && totalDrills != null && (
              <span style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.02em',
              }}>
                Drill {drillIndex + 1} of {totalDrills}
              </span>
            )}
            {drillIndex != null && totalDrills != null && (
              <div style={{
                width: 1,
                height: 12,
                background: 'rgba(255,255,255,0.1)',
                flexShrink: 0,
              }} />
            )}
            <span style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'rgba(160,163,255,0.85)',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.2)',
              padding: '3px 10px',
              borderRadius: 100,
            }}>
              {domainLabel}
            </span>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {/* Blinking green dot */}
              <div style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#22c55e',
                animation: 'snprBlink 1s ease-in-out infinite',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.4)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.04em',
              }}>
                {fmt(timeLeft)}
              </span>
            </div>
            <button
              className="snpr-exit-btn"
              onClick={onExit}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'border-color 200ms ease, color 200ms ease',
              }}
            >
              Exit
            </button>
          </div>
        </div>

        {/* ── 2. BRIEF ZONE ──────────────────────────────────────────────── */}
        <div className="snpr-brief-zone" style={{
          flexShrink: 0,
          padding: '36px 48px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Scanning line */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.2), transparent)',
            animation: 'snprScanLine 4s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* Radial glow */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 20,
            transform: 'translateX(-50%)',
            width: 400,
            height: 200,
            background: 'radial-gradient(ellipse, rgba(34,197,94,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {/* Difficulty + points */}
          <div
            className={`snpr-fade-up${animIn.difficulty ? ' snpr-in' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <span style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'rgba(34,197,94,0.85)',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              padding: '3px 10px',
              borderRadius: 100,
            }}>
              {difficultyLabel}
            </span>
            <span style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.25)',
            }}>
              {drill.points} points
            </span>
          </div>

          {/* Drill title */}
          <h1
            className={`snpr-title snpr-fade-up${animIn.title ? ' snpr-in' : ''}`}
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 36,
              fontWeight: 500,
              color: '#f5f5f5',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              margin: '0 0 22px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {drill.title}
          </h1>

          {/* Brief cards */}
          <div
            className="snpr-brief-cards"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Broken prompt */}
            <div
              className={`snpr-slide-left${animIn.cards ? ' snpr-in' : ''}`}
              style={{
                background: 'rgba(239,68,68,0.04)',
                border: '1px solid rgba(239,68,68,0.12)',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                marginBottom: 8,
              }}>
                <div style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'rgba(239,68,68,0.7)',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(239,68,68,0.6)',
                }}>
                  Broken Prompt
                </span>
              </div>
              <div style={{
                fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", monospace',
                fontSize: 13,
                color: 'rgba(255,120,120,0.85)',
                lineHeight: 1.65,
              }}>
                {drill.brokenPrompt}
              </div>
            </div>

            {/* Target output */}
            <div
              className={`snpr-slide-right${animIn.cards ? ' snpr-in' : ''}`}
              style={{
                background: 'rgba(34,197,94,0.03)',
                border: '1px solid rgba(34,197,94,0.1)',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                marginBottom: 8,
              }}>
                <div style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'rgba(34,197,94,0.7)',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(34,197,94,0.6)',
                }}>
                  Target Output
                </span>
              </div>
              <div style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.65,
              }}>
                {drill.targetOutput}
              </div>
            </div>
          </div>

          {/* Situation strip */}
          <div
            className={`snpr-fade-up${animIn.situation ? ' snpr-in' : ''}`}
            style={{
              marginTop: 12,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 8,
              padding: '12px 16px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
              marginBottom: 6,
            }}>
              Situation
            </div>
            <div style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.6,
            }}>
              {drill.context}
            </div>
          </div>
        </div>

        {/* ── 3. WRITE ZONE ──────────────────────────────────────────────── */}
        <div
          className={`snpr-write-zone snpr-fade-up${animIn.writeZone ? ' snpr-in' : ''}`}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 48px 16px',
            overflow: 'hidden',
          }}
        >
          {isSubmitting ? (
            /* Loading state */
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}>
              <div style={{ animation: 'snprSpin 1s linear infinite', transformOrigin: 'center' }}>
                <svg width={48} height={48} viewBox="0 0 48 48" fill="none">
                  <circle cx={24} cy={24} r={20} stroke="rgba(34,197,94,0.15)" strokeWidth={2} />
                  <circle
                    cx={24} cy={24} r={20}
                    stroke="#22c55e"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeDasharray={`${Math.PI * 2 * 20 * 0.25} ${Math.PI * 2 * 20 * 0.75}`}
                    fill="none"
                  />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: 6,
                }}>
                  Scoring your prompt...
                </div>
                <div style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.3)',
                }}>
                  Evaluating against 5 criteria
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Write zone header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 0,
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                }}>
                  Your Improved Prompt
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Criteria indicator dots */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {criteriaLit.map((lit, i) => (
                      <div
                        key={i}
                        title={CRITERIA_CONFIG[i].name}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: lit ? 'rgba(34,197,94,0.7)' : 'rgba(255,255,255,0.1)',
                          transition: 'background 300ms ease',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                  {/* Char count */}
                  <span style={{
                    fontSize: 11,
                    color: charCountLit ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.18)',
                    fontVariantNumeric: 'tabular-nums',
                    transition: 'color 300ms ease',
                  }}>
                    {prompt.length} chars
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                className="snpr-textarea"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                disabled={phase !== 'write'}
                placeholder="Rewrite the broken prompt above. Define the audience precisely, specify the exact output format and structure, set hard constraints on length and tone..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  padding: '18px 0',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.8,
                  resize: 'none',
                  outline: 'none',
                  caretColor: '#22c55e',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </>
          )}
        </div>

        {/* ── 4. BOTTOM BAR ──────────────────────────────────────────────── */}
        <div
          className={`snpr-bottom-bar snpr-fade-up${animIn.bottomBar ? ' snpr-in' : ''}`}
          style={{
            height: 64,
            flexShrink: 0,
            padding: '0 48px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: criteria row */}
          <div
            className="snpr-criteria-row"
            style={{ display: 'flex', alignItems: 'center', gap: 14 }}
          >
            {CRITERIA_CONFIG.map((c, i) => {
              const lit = criteriaLit[i]
              return (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: lit ? 'rgba(34,197,94,0.7)' : 'rgba(255,255,255,0.1)',
                    transition: 'background 300ms ease',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 11,
                    color: lit ? 'rgba(34,197,94,0.65)' : 'rgba(255,255,255,0.2)',
                    transition: 'color 300ms ease',
                  }}>
                    {c.name}
                  </span>
                  <span style={{
                    fontSize: 10,
                    color: lit ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)',
                    transition: 'color 300ms ease',
                  }}>
                    {c.pts}pts
                  </span>
                </div>
              )
            })}
          </div>

          {/* Right: submit or loading text */}
          {isSubmitting ? (
            <span style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.02em',
            }}>
              Scoring...
            </span>
          ) : (
            <button
              className="snpr-submit-btn"
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.28)',
                color: '#4ade80',
                padding: '11px 28px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease',
                flexShrink: 0,
              }}
            >
              Submit for Scoring <span className="snpr-arrow">→</span>
            </button>
          )}
        </div>

      </div>
    </>
  )
}
