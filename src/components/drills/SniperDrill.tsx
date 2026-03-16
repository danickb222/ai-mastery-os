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
import { motion, AnimatePresence } from 'framer-motion'
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
  const [timeLeft, setTimeLeft] = useState(drill.timeLimit ?? 480)
  const [scanActive, setScanActive] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scoreRef = useRef(0)
  scoreRef.current = liveScore
  const serverScoreRef = useRef(false)

  // ── Timer ──────────────────────────────────────────────────────────────────

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

      // Map criterion scores from rubricScores if available
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

  const displayScore = finalScore !== null ? finalScore : liveScore
  const color = '#00d4ff'
  const totalMaxPoints = drill.successCriteria.reduce((a, c) => a + c.maxPoints, 0)

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="sniper-root">

      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <div className="sniper-header">

        {/* Domain + difficulty badges */}
        <div className="sniper-badges">
          {totalDrills != null && drillIndex != null && (
            <span style={{
              fontFamily: 'var(--font-code)', fontSize: 11, letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.55)', marginRight: 2,
            }}>Drill {drillIndex + 1} of {totalDrills}</span>
          )}
          <span style={{
            fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--cyan)', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
            padding: '3px 8px', borderRadius: 4,
          }}>Prompt Engineering</span>
          <span style={{
            fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            padding: '3px 8px', borderRadius: 4,
          }}>{drill.difficulty}</span>
          <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{drill.points}pts</span>
        </div>

        {/* Live score bar — center */}
        <div className="sniper-score-bar">
          <span style={{ fontFamily: 'var(--font-code)', fontSize: 20, lineHeight: 1, color: '#00d4ff', minWidth: 34, textAlign: 'right' }}>
            {Math.round(displayScore)}
          </span>

          {/* Bar track */}
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, position: 'relative', overflow: 'visible' }}>
            <motion.div
              animate={{ width: `${Math.min(100, displayScore)}%` }}
              transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
              style={{ height: '100%', borderRadius: 4, background: '#00d4ff', boxShadow: '0 0 8px rgba(0,212,255,0.4)' }}
            />
            {/* 90-point target notch */}
            <div style={{ position: 'absolute', top: -4, left: '90%', width: 1, height: 12, background: 'rgba(255,255,255,0.35)', borderRadius: 1 }} />
          </div>

          <span style={{ fontFamily: 'var(--font-code)', fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>/ 100</span>

          {/* Scoring pulse dot */}
          <AnimatePresence>
            {isScoring && (
              <motion.div
                key="dot"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [1, 0.3, 1], scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ opacity: { duration: 0.5, repeat: Infinity }, scale: { duration: 0.15 } }}
                style={{ width: 5, height: 5, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 6px rgba(0,212,255,0.7)' }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Timer + exit — right */}
        <div className="sniper-timer">
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--font-code)', fontSize: 18, letterSpacing: '-0.03em', lineHeight: 1,
              color: timeLeft < 60 ? '#ef4444' : 'rgba(255,255,255,0.75)',
              transition: 'color 0.3s ease',
            }}>{fmt(timeLeft)}</div>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>remain</div>
          </div>
          <button
            onClick={onExit}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'rgba(255,255,255,0.4)', borderRadius: 8,
              padding: '6px 14px', fontFamily: 'var(--font-code)', fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >Exit</button>
        </div>
      </div>

      {/* ─── MAIN ──────────────────────────────────────────────────────────── */}

      {(
        // ── WRITE / SUBMITTING PHASE ─────────────────────────────────────────
        <>
        <div className="sniper-title">
          <h1>{drill.title}</h1>
        </div>
        <div className="sniper-main-grid">

          {/* LEFT: Mission brief */}
          <motion.div className="sniper-left-col" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>

            {/* Broken prompt */}
            <div className="sniper-box" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(239,68,68,0.7)', marginBottom: 8 }}>⚠ Broken Prompt to Fix</div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 13, color: 'rgba(239,68,68,0.65)', fontStyle: 'italic', lineHeight: 1.75 }}>&ldquo;{drill.brokenPrompt}&rdquo;</div>
            </div>

            {/* Situation */}
            <div className="sniper-box" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>Situation</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, margin: 0 }}>{drill.context}</p>
            </div>

            {/* Target output */}
            <div className="sniper-box" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00d4ff', marginBottom: 10 }}>
                <span>🎯</span> Target Output
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>{drill.targetOutput}</p>
            </div>
          </motion.div>

          {/* RIGHT: Sniper editor */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="sniper-right-col"
          >

            {/* Sparkline trend */}
            <AnimatePresence>
              {scoreHistory.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.14em', whiteSpace: 'nowrap' }}>Score trend</span>
                  <svg width={72} height={18} overflow="visible">
                    {scoreHistory.map((s, i) => {
                      if (i === 0) return null
                      const x1 = ((i - 1) / (scoreHistory.length - 1)) * 72
                      const x2 = (i / (scoreHistory.length - 1)) * 72
                      const y1 = 18 - (scoreHistory[i - 1] / 100) * 18
                      const y2 = 18 - (s / 100) * 18
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00d4ff" strokeWidth={1.5} opacity={0.65} />
                    })}
                    {scoreHistory.length > 0 && (
                      <circle
                        cx={(scoreHistory.length - 1) / (scoreHistory.length - 1) * 72}
                        cy={18 - (scoreHistory[scoreHistory.length - 1] / 100) * 18}
                        r={3} fill="#00d4ff"
                      />
                    )}
                  </svg>
                  {scoreHistory.length >= 2 && (
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: '#00d4ff', marginLeft: 4 }}>
                      {scoreHistory[scoreHistory.length - 1] > scoreHistory[scoreHistory.length - 2] ? '↑' : scoreHistory[scoreHistory.length - 1] === scoreHistory[scoreHistory.length - 2] ? '→' : '↓'}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Textarea */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)', marginBottom: 8, flexShrink: 0,
              }}>
                <span>Your Improved Prompt</span>
                <span>{prompt.length} chars</span>
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                disabled={phase !== 'write'}
                placeholder="Fix the broken prompt above. Define the audience, specify the format, set constraints on length and tone, name exact sections..."
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: 0,
                  background: 'rgba(255,255,255,0.025)',
                  border: isScoring ? '1px solid rgba(0,212,255,0.3)' : '1px solid var(--border)',
                  borderRadius: 14, padding: '16px 20px',
                  fontFamily: 'var(--font-code)', fontSize: 13, lineHeight: 1.8,
                  color: '#fff', resize: 'none', outline: 'none',
                  transition: 'border-color 0.35s ease',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={phase !== 'write' || prompt.trim().length < 10}
              whileHover={phase === 'write' && prompt.trim().length >= 10 ? { scale: 1.015 } : {}}
              whileTap={phase === 'write' && prompt.trim().length >= 10 ? { scale: 0.985 } : {}}
              style={{
                width: '100%', padding: '15px 24px',
                background: phase === 'submitting' ? 'rgba(255,255,255,0.06)' : '#fff',
                border: 'none', borderRadius: 12,
                color: phase === 'submitting' ? 'rgba(255,255,255,0.3)' : '#000',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
                cursor: phase === 'write' && prompt.trim().length >= 10 ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.2s ease',
              }}
            >
              {phase === 'submitting' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.6)', borderRadius: '50%' }}
                  />
                  Analyzing...
                </>
              ) : '🎯 Fire'}
            </motion.button>
          </motion.div>
        </div>
        </>
      )}
    </div>
  )
}
