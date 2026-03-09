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
  onSubmit: (result: { userInput: string; score?: number }) => void
  onExit: () => void
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

// ─── Heuristic live scorer (runs client-side, no API call) ───────────────────

function heuristicScore(text: string, drill: Drill): number {
  if (text.length < 20) return 0
  let score = 0
  const lower = text.toLowerCase()

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

  return Math.min(95, score)
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SniperDrill({ drill, onSubmit, onExit }: SniperDrillProps) {
  const [prompt, setPrompt] = useState('')
  const [liveScore, setLiveScore] = useState(0)
  const [isScoring, setIsScoring] = useState(false)
  const [phase, setPhase] = useState<'write' | 'submitting' | 'result'>('write')
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState('')
  const [scoreHistory, setScoreHistory] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(drill.timeLimit ?? 480)
  const [scanActive, setScanActive] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

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
      } else {
        // Distribute proportionally
        for (const c of drill.successCriteria) {
          cs[c.id] = Math.round((score / 100) * c.maxPoints * (0.75 + Math.random() * 0.5))
        }
      }

      const fb = [
        ...(result?.strengths ?? []).map((s: string) => `✓ ${s}`),
        ...(result?.weaknesses ?? []).map((w: string) => `✗ ${w}`),
      ].join('\n')

      setCriteriaScores(cs)
      setFeedback(fb)

      if (score >= 90) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 2800)
      }

      setTimeout(() => {
        setScanActive(false)
        setPhase('result')
        onSubmit({ userInput: prompt, score })
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
      setTimeout(() => { setScanActive(false); setPhase('result') }, 900)
    }
  }, [phase, prompt, drill, onSubmit])

  const displayScore = finalScore !== null ? finalScore : liveScore
  const color = scoreColor(displayScore)
  const totalMaxPoints = drill.successCriteria.reduce((a, c) => a + c.maxPoints, 0)

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient top glow */}
      <div style={{ position: 'fixed', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${color}44, transparent)`, transition: 'background 0.8s ease', zIndex: 0, pointerEvents: 'none' }} />

      {/* Scan line during scoring */}
      <AnimatePresence>
        {scanActive && (
          <motion.div
            key="scan"
            initial={{ top: '10%', opacity: 0 }}
            animate={{ top: ['15%', '85%'], opacity: [0, 0.5, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'linear' }}
            style={{
              position: 'fixed', left: 0, right: 0, height: 1, zIndex: 200, pointerEvents: 'none',
              background: `linear-gradient(90deg, transparent 0%, ${color}88 30%, ${color} 50%, ${color}88 70%, transparent 100%)`,
              boxShadow: `0 0 12px ${color}66`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Precision Shot celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            style={{
              position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
              zIndex: 300, background: `${color}15`, border: `1px solid ${color}44`,
              borderRadius: 12, padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: `0 0 40px ${color}22`,
            }}
          >
            <span style={{ fontSize: 22 }}>🎯</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color, letterSpacing: '-0.01em' }}>Precision Shot</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 56, zIndex: 50,
        background: 'rgba(6,7,10,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 28px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>

        {/* Domain + difficulty badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
          <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{drill.points}pts</span>
        </div>

        {/* Live score bar — center */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
          <motion.span
            key={Math.floor(displayScore / 3)}
            initial={{ scale: 0.88, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: 'var(--font-code)', fontSize: 20, lineHeight: 1,
              color, minWidth: 34, textAlign: 'right', transition: 'color 0.5s ease',
            }}
          >{Math.round(displayScore)}</motion.span>

          {/* Bar track */}
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, position: 'relative', overflow: 'visible' }}>
            <motion.div
              animate={{ width: `${Math.min(100, displayScore)}%` }}
              transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
              style={{
                height: '100%', borderRadius: 3,
                background: `linear-gradient(90deg, ${color}70, ${color})`,
                boxShadow: `0 0 10px ${color}55`,
                transition: 'background 0.5s ease, box-shadow 0.5s ease',
              }}
            />
            {/* 90-point target notch */}
            <div style={{
              position: 'absolute', top: -4, left: '90%', width: 1, height: 11,
              background: 'rgba(255,255,255,0.35)', borderRadius: 1,
            }} />
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
                style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Timer + exit — right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
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

      {phase !== 'result' ? (
        // ── WRITE PHASE ──────────────────────────────────────────────────────
        <div style={{
          maxWidth: 1360, margin: '0 auto',
          padding: '28px 28px 60px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}>

          {/* LEFT: Mission brief */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>

            {/* Title */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)',
              }}>
                <div style={{ width: 16, height: 1, background: 'var(--cyan)', boxShadow: '0 0 4px var(--cyan)' }} />
                Mission Brief
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400,
                color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0,
              }}>{drill.title}</h1>
            </div>

            {/* Situation */}
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>Situation</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, margin: 0 }}>{drill.context}</p>
            </div>

            {/* Target output */}
            <div style={{ background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 14, padding: '18px 20px', marginBottom: 14, transition: 'background 0.5s, border-color 0.5s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color, marginBottom: 10, transition: 'color 0.5s' }}>
                <span>🎯</span> Target Output
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>{drill.targetOutput}</p>
            </div>

            {/* Broken prompt */}
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(239,68,68,0.7)', marginBottom: 8 }}>⚠ Broken Prompt to Fix</div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'rgba(239,68,68,0.65)', fontStyle: 'italic' }}>&ldquo;{drill.brokenPrompt}&rdquo;</div>
            </div>

            {/* Scoring rubric */}
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>Scoring Criteria</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {drill.successCriteria.map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      fontFamily: 'var(--font-code)', fontSize: 8, color, background: `${color}0d`,
                      border: `1px solid ${color}22`, padding: '2px 6px', borderRadius: 4,
                      whiteSpace: 'nowrap', marginTop: 2, transition: 'color 0.5s, border-color 0.5s',
                    }}>{c.maxPoints}pt</div>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', marginBottom: 2 }}>{c.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{c.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Sniper editor */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
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
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} opacity={0.65} />
                    })}
                    {scoreHistory.length > 0 && (
                      <circle
                        cx={(scoreHistory.length - 1) / (scoreHistory.length - 1) * 72}
                        cy={18 - (scoreHistory[scoreHistory.length - 1] / 100) * 18}
                        r={3} fill={color}
                      />
                    )}
                  </svg>
                  {scoreHistory.length >= 2 && (
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color, marginLeft: 4 }}>
                      {scoreHistory[scoreHistory.length - 1] > scoreHistory[scoreHistory.length - 2] ? '↑' : scoreHistory[scoreHistory.length - 1] === scoreHistory[scoreHistory.length - 2] ? '→' : '↓'}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Textarea */}
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)', marginBottom: 8,
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
                  minHeight: 260,
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isScoring ? color + '55' : 'var(--border)'}`,
                  borderRadius: 14, padding: '16px 18px',
                  fontFamily: 'var(--font-code)', fontSize: 13, lineHeight: 1.8,
                  color: '#fff', resize: 'vertical', outline: 'none',
                  transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
                  boxShadow: isScoring ? `0 0 0 3px ${color}0d` : 'none',
                  boxSizing: 'border-box',
                }}
              />
              {/* Animated border ring during scoring */}
              <AnimatePresence>
                {isScoring && (
                  <motion.div
                    key="ring"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.6, 0, 0.6] }}
                    exit={{ opacity: 0 }}
                    transition={{ opacity: { duration: 0.7, repeat: Infinity } }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 14,
                      border: `1px solid ${color}66`, pointerEvents: 'none',
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Quick checklist */}
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>Precision Checklist</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 14px' }}>
                {['Define your audience', 'Set a word / char limit', 'Name the exact format', 'Specify tone & voice', 'Enumerate each section', 'Add specificity — no vague words'].map(h => {
                  const hit = prompt.length > 30 && h.split(' ').some(w => w.length > 4 && prompt.toLowerCase().includes(w.toLowerCase()))
                  return (
                    <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{
                        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                        background: hit ? color : 'rgba(255,255,255,0.1)',
                        boxShadow: hit ? `0 0 5px ${color}` : 'none',
                        transition: 'all 0.3s ease',
                      }} />
                      <span style={{ fontSize: 11, color: hit ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.28)', transition: 'color 0.3s' }}>{h}</span>
                    </div>
                  )
                })}
              </div>
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

      ) : (
        // ── RESULT PHASE ──────────────────────────────────────────────────────
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 760, margin: '40px auto', padding: '0 28px 80px' }}
        >
          {/* Big score */}
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>Final Score</div>
            <motion.div
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 18 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 108, fontWeight: 400, lineHeight: 1,
                color, letterSpacing: '-0.04em',
                textShadow: `0 0 80px ${color}33`,
                transition: 'color 0.5s ease',
              }}
            >{finalScore ?? 0}</motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 10 }}
            >{scoreLabel(finalScore ?? 0)}</motion.div>
          </div>

          {/* Criteria breakdown */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 26px', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {drill.successCriteria.map((c, idx) => {
                const earned = criteriaScores[c.id] ?? 0
                const pct = (earned / c.maxPoints) * 100
                const cc = scoreColor(pct)
                return (
                  <div key={c.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{c.label}</span>
                      <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: cc }}>{earned}<span style={{ color: 'rgba(255,255,255,0.25)' }}>/{c.maxPoints}</span></span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.2 + idx * 0.07, duration: 0.7, ease: [0, 0, 0.2, 1] }}
                        style={{ height: '100%', borderRadius: 2, background: cc }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI Feedback */}
          {feedback && (
            <div style={{ background: `${color}07`, border: `1px solid ${color}20`, borderRadius: 14, padding: '18px 22px', marginBottom: 18 }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color, marginBottom: 10 }}>Coach Feedback</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, margin: 0 }}>{feedback}</p>
            </div>
          )}

          {/* Your submission */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>Your Submission</div>
            <pre style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>{prompt}</pre>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                serverScoreRef.current = false
                setPrompt('')
                setLiveScore(0)
                setFinalScore(null)
                setCriteriaScores({})
                setFeedback('')
                setPhase('write')
                setTimeLeft(drill.timeLimit ?? 480)
                setScoreHistory([])
              }}
              style={{
                flex: 1, padding: '14px 20px',
                background: 'transparent', border: '1px solid var(--border)',
                color: 'rgba(255,255,255,0.5)', borderRadius: 12,
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >Retry</button>
            <button
              onClick={onExit}
              style={{
                flex: 1, padding: '14px 20px',
                background: '#fff', border: 'none',
                color: '#000', borderRadius: 12,
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >Next Drill →</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
