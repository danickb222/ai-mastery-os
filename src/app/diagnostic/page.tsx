'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getDrillById } from '@/core/content/drills'
import type { PromptConstructionDrill, DrillResult } from '@/core/types/drills'
import SniperDrill from '@/components/drills/SniperDrill'
import { getItem, setItem, STORAGE_KEYS } from '@/core/storage'
import {
  SCENARIO_QUESTIONS,
  SPOT_FIX_EXERCISES,
  CONFIDENCE_ITEMS,
  DOMAIN_CLUSTERS,
  computeClusterScores,
  getWeakestCluster,
  getOverallScore,
  getRecommendedPath,
  operatorLevel,
  computeIndividualDomainScores,
  getRecommendedDomainPath,
  type DomainScores,
} from '@/core/content/diagnosticQuestions'

// ─── Types & Constants ───────────────────────────────────────────────────────

type Phase =
  | 'intro'
  | 'scenarios'
  | 'transition'
  | 'spotfix'
  | 'build'
  | 'calibration'
  | 'computing'
  | 'result'

// One prompt_construction drill per cluster for adaptive Phase 3
const CLUSTER_DRILL_MAP: Record<string, string> = {
  prompt_craft: 'pe_004',
  system_design: 'sp_001',
  reasoning: 'rc_003',
  workflows: 'cm_001',
  professional: 'ae_001',
}
const FALLBACK_DRILL = 'pe_004'

const LEVEL_BADGES = [
  { label: 'Beginner', color: '#f97316' },
  { label: 'Developing', color: '#f59e0b' },
  { label: 'Proficient', color: '#22c55e' },
  { label: 'Advanced', color: '#00d4ff' },
]

const CONFIDENCE_LABELS = ['Beginner', 'Novice', 'Competent', 'Proficient', 'Expert']

// ─── Component ───────────────────────────────────────────────────────────────

export default function DiagnosticPage() {
  const router = useRouter()

  // Phase state
  const [phase, setPhase] = useState<Phase>('intro')
  const [transitionMessage, setTransitionMessage] = useState({ num: '', title: '', desc: '', next: '' as Phase })

  // Phase 1: Scenarios
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<string, string>>({})
  const [scenarioFeedback, setScenarioFeedback] = useState(false)

  // Phase 2: Spot & Fix
  const [spotFixIdx, setSpotFixIdx] = useState(0)
  const [spotFixAnswers, setSpotFixAnswers] = useState<Record<string, string>>({})
  const [spotFixFeedback, setSpotFixFeedback] = useState(false)

  // Phase 3: Build
  const [buildDrillId, setBuildDrillId] = useState('pe_004')
  const [buildScore, setBuildScore] = useState(0)

  // Phase 4: Calibration
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({
    conf_1: 3, conf_2: 3, conf_3: 3, conf_4: 3, conf_5: 3,
  })

  // Waitlist + share
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // ── Score Computation ──────────────────────────────────────────────────────

  const computeDomainScores = useCallback((): DomainScores => {
    const scores: DomainScores = {}
    const addScore = (domains: string[], correct: boolean) => {
      for (const d of domains) {
        const domain = d as keyof DomainScores
        if (!scores[domain]) scores[domain] = { correct: 0, total: 0 }
        scores[domain]!.total += 1
        if (correct) scores[domain]!.correct += 1
      }
    }
    for (const q of SCENARIO_QUESTIONS) {
      const answer = scenarioAnswers[q.id]
      if (answer !== undefined) addScore(q.domains, answer === q.correctId)
    }
    for (const ex of SPOT_FIX_EXERCISES) {
      const answer = spotFixAnswers[ex.id]
      if (answer !== undefined) addScore(ex.domains, answer === ex.correctId)
    }
    return scores
  }, [scenarioAnswers, spotFixAnswers])

  // ── Transition Helper ──────────────────────────────────────────────────────

  function transitionTo(next: Phase, num: string, title: string, desc: string) {
    setTransitionMessage({ num, title, desc, next })
    setPhase('transition')
  }

  // ── Phase 1 Handlers ──────────────────────────────────────────────────────

  function handleScenarioAnswer(questionId: string, answerId: string) {
    if (scenarioFeedback) return
    setScenarioAnswers(prev => ({ ...prev, [questionId]: answerId }))
    setScenarioFeedback(true)
  }

  function advanceScenario() {
    setScenarioFeedback(false)
    if (scenarioIdx < SCENARIO_QUESTIONS.length - 1) {
      setScenarioIdx(prev => prev + 1)
    } else {
      transitionTo('spotfix', '02', 'Spot & Fix', 'Identify flaws in real prompts and systems.')
    }
  }

  // ── Phase 2 Handlers ──────────────────────────────────────────────────────

  function handleSpotFixAnswer(exerciseId: string, answerId: string) {
    if (spotFixFeedback) return
    setSpotFixAnswers(prev => ({ ...prev, [exerciseId]: answerId }))
    setSpotFixFeedback(true)
  }

  function advanceSpotFix() {
    setSpotFixFeedback(false)
    if (spotFixIdx < SPOT_FIX_EXERCISES.length - 1) {
      setSpotFixIdx(prev => prev + 1)
    } else {
      const scores = computeDomainScores()
      const weakest = getWeakestCluster(scores)
      const drillId = CLUSTER_DRILL_MAP[weakest.id] || 'pe_004'
      setBuildDrillId(drillId)
      transitionTo('build', '03', 'Build Challenge', `Let's test your skills in ${weakest.label}. Write a real prompt — AI scores your output.`)
    }
  }

  // ── Phase 3 Handler ────────────────────────────────────────────────────────

  function handleBuildSubmit({ score = 0 }: { userInput: string; score?: number }) {
    setBuildScore(score)
  }

  function handleBuildExit() {
    transitionTo('calibration', '04', 'Self-Assessment', 'Rate your confidence across key skill areas.')
  }

  // ── Phase 4 Handler ────────────────────────────────────────────────────────

  function handleCalibrationDone() {
    setPhase('computing')
    const domainScores = computeDomainScores()
    const knowledgeScore = getOverallScore(domainScores)
    const overall = buildScore > 0
      ? Math.round(knowledgeScore * 0.6 + buildScore * 0.4)
      : knowledgeScore

    const history = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || []
    history.push({
      drillId: 'diagnostic',
      score: overall,
      timeSpent: 0,
      userInput: 'diagnostic assessment',
      submittedAt: new Date().toISOString(),
      scoringResult: {
        totalScore: overall, maxScore: 100, percentage: overall,
        criteriaResults: [], performanceLabel: overall >= 70 ? 'On Target' : 'Keep Refining', feedbackSummary: '',
      },
    })
    setItem(STORAGE_KEYS.DRILL_HISTORY, history)
    setTimeout(() => setPhase('result'), 2200)
  }

  // ── Waitlist ───────────────────────────────────────────────────────────────

  async function handleWaitlist() {
    if (!waitlistEmail.trim()) return
    setWaitlistStatus('loading')
    try {
      const res = await fetch('https://formspree.io/f/xkoqjewl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: waitlistEmail, source: 'diagnostic-v2' }),
      })
      setWaitlistStatus(res.ok ? 'success' : 'error')
    } catch {
      setWaitlistStatus('error')
    }
  }

  // ── Derived Values ─────────────────────────────────────────────────────────

  const currentScenario = SCENARIO_QUESTIONS[scenarioIdx]
  const currentSpotFix = SPOT_FIX_EXERCISES[spotFixIdx]
  const buildDrill = (getDrillById(buildDrillId) ?? getDrillById(FALLBACK_DRILL)) as PromptConstructionDrill | null

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  // ── Transition Interstitial ────────────────────────────────────────────────

  if (phase === 'transition') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}
        >
          <div style={{ fontFamily: 'var(--font-code)', fontSize: 42, color: '#00d4ff', marginBottom: 16, fontWeight: 300 }}>
            {transitionMessage.num}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: 12 }}>
            {transitionMessage.title}
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 32, fontFamily: 'var(--font-body)' }}>
            {transitionMessage.desc}
          </p>
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setPhase(transitionMessage.next)}
            style={{
              padding: '14px 32px', background: '#fff', border: 'none', borderRadius: 12,
              color: '#000', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            Continue
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // ── Phase 1: Scenarios ─────────────────────────────────────────────────────

  if (phase === 'scenarios' && currentScenario) {
    const answered = scenarioAnswers[currentScenario.id]
    const isCorrect = answered === currentScenario.correctId
    const clusterLabel = DOMAIN_CLUSTERS.find(c => c.domains.some(d => currentScenario.domains.includes(d)))?.label ?? ''

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenario.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            style={{ maxWidth: 580, width: '100%' }}
          >
            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
              {SCENARIO_QUESTIONS.map((_, i) => (
                <div key={i} style={{
                  width: i === scenarioIdx ? 20 : 6, height: 6, borderRadius: 3,
                  background: i < scenarioIdx ? '#00d4ff' : i === scenarioIdx ? '#fff' : 'rgba(255,255,255,0.12)',
                  transition: 'all 0.3s ease',
                }} />
              ))}
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
                {scenarioIdx + 1} / {SCENARIO_QUESTIONS.length}
              </span>
            </div>

            {/* Domain tag */}
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00d4ff', marginBottom: 16 }}>
              {clusterLabel}
            </div>

            {/* Question */}
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3.5vw,26px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.4, marginBottom: 28 }}>
              {currentScenario.question}
            </h2>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentScenario.options.map(opt => {
                const isSelected = answered === opt.id
                const isCorrectOpt = opt.id === currentScenario.correctId
                const showResult = scenarioFeedback

                let bg = 'rgba(255,255,255,0.04)'
                let border = '1px solid rgba(255,255,255,0.1)'
                let textColor = 'rgba(255,255,255,0.7)'

                if (showResult && isCorrectOpt) {
                  bg = 'rgba(34,197,94,0.12)'
                  border = '1px solid rgba(34,197,94,0.4)'
                  textColor = '#22c55e'
                } else if (showResult && isSelected && !isCorrect) {
                  bg = 'rgba(239,68,68,0.1)'
                  border = '1px solid rgba(239,68,68,0.3)'
                  textColor = '#ef4444'
                }

                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleScenarioAnswer(currentScenario.id, opt.id)}
                    disabled={!!answered}
                    whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
                    style={{
                      padding: '14px 18px', background: bg, border, borderRadius: 12,
                      color: textColor, fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5,
                      textAlign: 'left', cursor: answered ? 'default' : 'pointer',
                      transition: 'all 0.2s ease', display: 'flex', alignItems: 'flex-start', gap: 12,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginTop: 2 }}>
                      {opt.id.toUpperCase()}
                    </span>
                    {opt.text}
                  </motion.button>
                )
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {scenarioFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: 16, padding: '12px 16px', borderRadius: 10,
                    background: isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                    border: isCorrect ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: isCorrect ? '#22c55e' : '#ef4444', marginBottom: 6 }}>
                    {isCorrect ? '✓ Correct' : '✗ Not quite'}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                    {currentScenario.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            {scenarioFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}
              >
                <button
                  onClick={advanceScenario}
                  style={{
                    padding: '10px 22px', background: '#fff', border: 'none', borderRadius: 10,
                    color: '#000', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
                  }}
                >
                  {scenarioIdx < SCENARIO_QUESTIONS.length - 1 ? 'Next' : 'Continue'}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ── Phase 2: Spot & Fix ────────────────────────────────────────────────────

  if (phase === 'spotfix' && currentSpotFix) {
    const answered = spotFixAnswers[currentSpotFix.id]
    const isCorrect = answered === currentSpotFix.correctId

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSpotFix.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            style={{ maxWidth: 600, width: '100%' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00d4ff' }}>
                Spot &amp; Fix
              </div>
              <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
                {spotFixIdx + 1} / {SPOT_FIX_EXERCISES.length}
              </span>
            </div>

            {/* Title */}
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: '#fff', letterSpacing: '-0.01em', marginBottom: 12 }}>
              {currentSpotFix.title}
            </h2>

            {/* Setup */}
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>
              {currentSpotFix.setup}
            </p>

            {/* Artifact card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '16px 20px', marginBottom: 24,
            }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
                {currentSpotFix.artifactLabel}
              </div>
              <pre style={{ fontFamily: 'var(--font-code)', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
                {currentSpotFix.artifact}
              </pre>
            </div>

            {/* Question */}
            <p style={{ fontSize: 15, color: '#fff', fontWeight: 500, marginBottom: 16 }}>
              {currentSpotFix.question}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentSpotFix.options.map(opt => {
                const isSelected = answered === opt.id
                const isCorrectOpt = opt.id === currentSpotFix.correctId
                const showResult = spotFixFeedback

                let bg = 'rgba(255,255,255,0.04)'
                let border = '1px solid rgba(255,255,255,0.1)'
                let textColor = 'rgba(255,255,255,0.7)'

                if (showResult && isCorrectOpt) {
                  bg = 'rgba(34,197,94,0.12)'; border = '1px solid rgba(34,197,94,0.4)'; textColor = '#22c55e'
                } else if (showResult && isSelected && !isCorrect) {
                  bg = 'rgba(239,68,68,0.1)'; border = '1px solid rgba(239,68,68,0.3)'; textColor = '#ef4444'
                }

                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSpotFixAnswer(currentSpotFix.id, opt.id)}
                    disabled={!!answered}
                    whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
                    style={{
                      padding: '13px 16px', background: bg, border, borderRadius: 12,
                      color: textColor, fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5,
                      textAlign: 'left', cursor: answered ? 'default' : 'pointer',
                      transition: 'all 0.2s ease', display: 'flex', alignItems: 'flex-start', gap: 12,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginTop: 1 }}>
                      {opt.id.toUpperCase()}
                    </span>
                    {opt.text}
                  </motion.button>
                )
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {spotFixFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: 16, padding: '12px 16px', borderRadius: 10,
                    background: isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                    border: isCorrect ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: isCorrect ? '#22c55e' : '#ef4444', marginBottom: 6 }}>
                    {isCorrect ? '✓ Correct' : '✗ Not quite'}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                    {currentSpotFix.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            {spotFixFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}
              >
                <button
                  onClick={advanceSpotFix}
                  style={{
                    padding: '10px 22px', background: '#fff', border: 'none', borderRadius: 10,
                    color: '#000', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
                  }}
                >
                  {spotFixIdx < SPOT_FIX_EXERCISES.length - 1 ? 'Next' : 'Continue'}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ── Phase 3: Build (SniperDrill) ───────────────────────────────────────────

  if (phase === 'build') {
    if (!buildDrill) {
      // Fallback: skip build phase if drill not found
      transitionTo('calibration', '04', 'Self-Assessment', 'Rate your confidence across key skill areas.')
      return null
    }
    return (
      <SniperDrill
        drill={buildDrill}
        drillIndex={0}
        totalDrills={1}
        onSubmit={handleBuildSubmit}
        onExit={handleBuildExit}
      />
    )
  }

  // ── Phase 4: Calibration ───────────────────────────────────────────────────

  if (phase === 'calibration') {
    const allRated = Object.keys(confidenceScores).length === CONFIDENCE_ITEMS.length

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ maxWidth: 560, width: '100%' }}
        >
          <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00d4ff', marginBottom: 12 }}>
            Self-Assessment
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
            How confident are you?
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 32 }}>
            Rate your current ability in each area. Be honest — this helps us personalize your learning path.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {CONFIDENCE_ITEMS.map(item => {
              const current = confidenceScores[item.id] ?? 3
              return (
                <div key={item.id}>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 12, lineHeight: 1.5 }}>
                    {item.statement}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {CONFIDENCE_LABELS.map((label, i) => {
                      const level = i + 1
                      const isActive = current === level
                      return (
                        <button
                          key={level}
                          onClick={() => setConfidenceScores(prev => ({ ...prev, [item.id]: level }))}
                          style={{
                            flex: '1 1 auto', minWidth: 56, padding: '8px 4px',
                            background: isActive ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                            border: isActive ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 8,
                            color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.35)',
                            fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.06em',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            textTransform: 'uppercase',
                          }}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <motion.button
            onClick={handleCalibrationDone}
            disabled={!allRated}
            whileHover={allRated ? { scale: 1.01 } : {}}
            style={{
              width: '100%', padding: '15px 24px', marginTop: 36,
              background: allRated ? '#fff' : 'rgba(255,255,255,0.08)',
              border: 'none', borderRadius: 12,
              color: allRated ? '#000' : 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
              cursor: allRated ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            Complete Assessment
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // ── Computing ──────────────────────────────────────────────────────────────

  if (phase === 'computing') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.08)', borderTopColor: '#00d4ff', borderRadius: '50%', margin: '0 auto 24px' }}
          />
          <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Analyzing your responses...
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Result Screen ──────────────────────────────────────────────────────────

  if (phase === 'result') {
    const domainScores = computeDomainScores()
    const knowledgeScore = getOverallScore(domainScores)
    const overall = buildScore > 0
      ? Math.round(knowledgeScore * 0.6 + buildScore * 0.4)
      : knowledgeScore
    const level = operatorLevel(overall)
    const clusterScores = computeClusterScores(domainScores)
    const recommendedPath = getRecommendedPath(domainScores)
    const weakestCluster = recommendedPath[0]
    const individualDomainScores = computeIndividualDomainScores(domainScores)
    const testedDomains = individualDomainScores.filter(d => d.total > 0)
    const recommendedDomains = getRecommendedDomainPath(domainScores, overall)

    // Calibration comparison
    const calibrationInsights: { label: string; selfScore: number; actualScore: number; gap: string }[] = []
    for (const item of CONFIDENCE_ITEMS) {
      const selfRaw = confidenceScores[item.id] ?? 3
      const selfScore = Math.round((selfRaw / 5) * 100)
      const cluster = clusterScores.find(c => item.clusterIds.includes(c.clusterId))
      const actualScore = cluster?.score ?? 0
      const diff = selfScore - actualScore
      let gap = 'Well-calibrated'
      if (diff > 25) gap = 'Overconfident'
      else if (diff < -25) gap = 'Underestimating yourself'
      calibrationInsights.push({ label: cluster?.label ?? '', selfScore, actualScore, gap })
    }

    const r = 56, circ = 2 * Math.PI * r, pct = overall / 100

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', justifyContent: 'center', padding: '60px 28px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 640, width: '100%' }}
        >
          {/* Header + Score */}
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
              Diagnostic Complete
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 28 }}>
              Your Operator Score
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <svg width={140} height={140} style={{ overflow: 'visible' }}>
                <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
                <motion.circle
                  cx={70} cy={70} r={r} fill="none" stroke={level.color} strokeWidth={7}
                  strokeLinecap="round" strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ * (1 - pct) }}
                  transition={{ delay: 0.2, duration: 1.0, ease: [0, 0, 0.2, 1] }}
                  transform="rotate(-90 70 70)"
                />
                <motion.text x="70" y="66" textAnchor="middle" fontSize="34" fill="#fff"
                  fontFamily="var(--font-display)" fontWeight={400}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                >{overall}</motion.text>
                <motion.text x="70" y="85" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.3)"
                  fontFamily="var(--font-code)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                >/ 100</motion.text>
              </svg>
            </div>
            <div style={{
              display: 'inline-block', fontFamily: 'var(--font-code)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: level.color, background: `${level.color}15`, border: `1px solid ${level.color}40`,
              borderRadius: 100, padding: '4px 16px', marginBottom: 8,
            }}>{level.label}</div>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
              {overall >= 85 ? 'Professional-grade operator' : overall >= 65 ? 'Strong foundation \u2014 ready to advance' : overall >= 40 ? 'Building skills \u2014 clear growth path' : 'Starting your operator journey'}
            </div>
          </div>

          {/* Per-Domain Score Breakdown */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 26px', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
              Domain Breakdown — {testedDomains.length} domain{testedDomains.length !== 1 ? 's' : ''} tested
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {testedDomains.map((ds, i) => (
                <div key={ds.domainId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{ds.name}</span>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: ds.color }}>
                      {ds.score}%
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginLeft: 6 }}>
                        {ds.correct}/{ds.total}
                      </span>
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ds.score}%` }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.7, ease: [0, 0, 0.2, 1] }}
                      style={{ height: '100%', borderRadius: 2, background: ds.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calibration Insights */}
          {calibrationInsights.some(ci => ci.gap !== 'Well-calibrated') && (
            <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: 14, padding: '18px 22px', marginBottom: 18 }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f97316', marginBottom: 12 }}>
                Calibration Check
              </div>
              {calibrationInsights.filter(ci => ci.gap !== 'Well-calibrated').slice(0, 2).map((ci, i) => {
                const overconfidentPhrases = [
                  `You rated yourself ${ci.selfScore}% but scored ${ci.actualScore}% — there's a gap worth closing here.`,
                  `Self-rated ${ci.selfScore}%, actual ${ci.actualScore}% — this area needs more focused practice.`,
                ]
                const underPhrases = [
                  `You rated yourself ${ci.selfScore}% but scored ${ci.actualScore}% — you're stronger here than you realize.`,
                  `Self-rated ${ci.selfScore}%, actual ${ci.actualScore}% — give yourself more credit in this area.`,
                ]
                const msg = ci.gap === 'Overconfident' ? overconfidentPhrases[i % overconfidentPhrases.length] : underPhrases[i % underPhrases.length]
                return (
                  <p key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: i > 0 ? '10px 0 0' : 0 }}>
                    <strong style={{ color: '#fff' }}>{ci.label}:</strong>{' '}{msg}
                  </p>
                )
              })}
            </div>
          )}

          {/* Recommended Path */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 6 }}>
              Your Recommended Path
            </div>
            {overall < 35 && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 14, fontFamily: 'var(--font-body)' }}>
                Start with Prompt Engineering — it&apos;s the foundation every other domain builds on.
              </p>
            )}
            {overall >= 35 && overall < 65 && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 14, fontFamily: 'var(--font-body)' }}>
                Focus on your weakest domains first — closing gaps here will have the biggest impact.
              </p>
            )}
            {overall >= 65 && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 14, fontFamily: 'var(--font-body)' }}>
                Strong foundation. Sharpen the areas below to reach professional-grade.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recommendedDomains.slice(0, 4).map((domain, i) => (
                <div key={domain.domainId} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: 18, color: i === 0 ? domain.color : 'rgba(255,255,255,0.2)', fontWeight: 300, width: 28, textAlign: 'center' }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: i === 0 ? 600 : 400 }}>{domain.name}</span>
                      <span style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', color: domain.color, opacity: 0.7 }}>{domain.difficulty}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                      {domain.total > 0 ? `${domain.score}% — ${domain.score === 0 ? 'needs work' : domain.score < 40 ? 'needs work' : domain.score < 70 ? 'room to grow' : 'solid'}` : 'not yet tested'}
                    </div>
                  </div>
                  {i === 0 && (
                    <button
                      onClick={() => router.push(`/run?domain=${domain.domainId}`)}
                      style={{
                        padding: '8px 16px', background: '#fff', border: 'none', borderRadius: 10,
                        color: '#000', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      Start
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Waitlist */}
          <div style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: '22px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00d4ff', marginBottom: 10 }}>
              Full access coming soon
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 18, fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
              Get notified when System Prompts, Output Control, and more domains launch.
            </p>
            {waitlistStatus === 'success' ? (
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: '#22c55e', letterSpacing: '0.08em' }}>
                \u2713 You&apos;re on the list \u2014 we&apos;ll be in touch.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleWaitlist()}
                  placeholder="your@email.com"
                  style={{
                    flex: 1, padding: '11px 16px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10, color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none',
                  }}
                />
                <button
                  onClick={handleWaitlist}
                  disabled={waitlistStatus === 'loading'}
                  style={{
                    padding: '11px 20px', background: '#fff', border: 'none', borderRadius: 10,
                    color: '#000', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    opacity: waitlistStatus === 'loading' ? 0.6 : 1,
                  }}
                >
                  {waitlistStatus === 'loading' ? '...' : 'Join \u2192'}
                </button>
              </div>
            )}
            {waitlistStatus === 'error' && (
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: '#f97316', marginTop: 8, letterSpacing: '0.06em' }}>
                Something went wrong \u2014 try again.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Intro Screen ───────────────────────────────────────────────────────────

  const totalSteps = SCENARIO_QUESTIONS.length + SPOT_FIX_EXERCISES.length + 2 // +1 build, +1 calibration

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}
        >
          <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 6 }}>
            Diagnostic
          </div>
          <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
            Beta \u2014 free to take
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 20 }}>
            Find your operator level.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 32, fontFamily: 'var(--font-body)' }}>
            {totalSteps} challenges across 4 phases. Covers all 12 domains of AI operation.
            You&apos;ll get a personalized skill map and recommended learning path.
          </p>

          {/* Level badges */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {LEVEL_BADGES.map(b => (
              <div key={b.label} style={{
                padding: '6px 14px', borderRadius: 100,
                fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: b.color, background: `${b.color}12`, border: `1px solid ${b.color}35`,
              }}>{b.label}</div>
            ))}
          </div>

          {/* Phase preview */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }}>
            {[
              { n: '01', label: 'Quick-Fire Scenarios', desc: `${SCENARIO_QUESTIONS.length} questions across all domains`, time: '~3 min' },
              { n: '02', label: 'Spot & Fix', desc: `${SPOT_FIX_EXERCISES.length} real-world prompt reviews`, time: '~2 min' },
              { n: '03', label: 'Build Challenge', desc: 'Write a real prompt, scored by AI', time: '~3 min' },
              { n: '04', label: 'Self-Assessment', desc: 'Rate your confidence across skill areas', time: '~1 min' },
            ].map((d, i, arr) => (
              <div key={d.n} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ fontFamily: 'var(--font-code)', fontSize: 9, color: '#00d4ff', letterSpacing: '0.1em', minWidth: 24 }}>{d.n}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-body)' }}>{d.label}</div>
                  <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{d.desc}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-code)', fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{d.time}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase('scenarios')}
            style={{
              width: '100%', padding: '15px 24px',
              background: '#fff', border: 'none', borderRadius: 12,
              color: '#000', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            Start
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
