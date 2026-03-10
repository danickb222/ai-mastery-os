'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getDrillById } from '@/core/content/drills'
import type { PromptConstructionDrill } from '@/core/types/drills'
import SniperDrill from '@/components/drills/SniperDrill'

// All drills are now within the prompt_engineering domain
const DRILL_1_ID  = 'pe_001'
const DRILL_2_LOW = 'pe_003'   // score < 50
const DRILL_2_MID = 'pe_004'   // score 50–75
const DRILL_2_HIGH = 'pe_006'  // score > 75
const DRILL_3_ID  = 'pe_007'

type Phase = 'intro' | 'drill1' | 'drill2' | 'drill3' | 'result'

function operatorLevel(score: number) {
  if (score >= 85) return { label: 'Advanced',    color: '#00d4ff' }
  if (score >= 65) return { label: 'Proficient',  color: '#22c55e' }
  if (score >= 40) return { label: 'Developing',  color: '#f59e0b' }
  return             { label: 'Beginner',          color: '#f97316' }
}

function percentileFromScore(score: number): number {
  // Approximate: score 85 → top 15%, score 65 → top 40%, score 40 → top 65%
  if (score >= 95) return 2
  if (score >= 85) return 12
  if (score >= 75) return 28
  if (score >= 65) return 42
  if (score >= 50) return 58
  if (score >= 40) return 68
  return 80
}

const SKILL_LABELS = ['Specificity', 'Structure', 'Constraints', 'Clarity']

function deriveSkillScores(scores: number[]): number[] {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const noise = () => (Math.random() - 0.5) * 18
  return SKILL_LABELS.map(() => Math.min(100, Math.max(0, Math.round(avg + noise()))))
}

function weakestSkillDomain(skillScores: number[]): { domain: string; href: string } {
  const idx = skillScores.indexOf(Math.min(...skillScores))
  const map = [
    { domain: 'Prompt Engineering', href: '/run?domain=prompt_engineering' },
    { domain: 'System Prompts',     href: '/run?domain=system_prompts'     },
    { domain: 'Output Control',     href: '/run?domain=output_control'     },
    { domain: 'Prompt Engineering', href: '/run?domain=prompt_engineering' },
  ]
  return map[idx]
}

const LEVEL_BADGES = [
  { label: 'Beginner',   color: '#f97316', desc: 'New to AI prompting' },
  { label: 'Developing', color: '#f59e0b', desc: 'Building foundational skills' },
  { label: 'Proficient', color: '#22c55e', desc: 'Consistent outputs' },
  { label: 'Advanced',   color: '#00d4ff', desc: 'Professional operator' },
]

export default function DiagnosticPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('intro')
  const [scores, setScores] = useState<number[]>([])
  const [drill2Id, setDrill2Id] = useState(DRILL_2_MID)
  const [skillScores, setSkillScores] = useState<number[]>([])
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const drill1 = getDrillById(DRILL_1_ID) as PromptConstructionDrill | null
  const drill2 = getDrillById(drill2Id)   as PromptConstructionDrill | null
  const drill3 = getDrillById(DRILL_3_ID) as PromptConstructionDrill | null

  function handleDrill1Complete({ score = 0 }: { userInput: string; score?: number }) {
    const nextScores = [score]
    setScores(nextScores)
    const d2id = score < 50 ? DRILL_2_LOW : score <= 75 ? DRILL_2_MID : DRILL_2_HIGH
    setDrill2Id(d2id)
    setPhase('drill2')
  }

  function handleDrill2Complete({ score = 0 }: { userInput: string; score?: number }) {
    setScores(prev => [...prev, score])
    setPhase('drill3')
  }

  function handleDrill3Complete({ score = 0 }: { userInput: string; score?: number }) {
    const finalScores = [...scores, score]
    setScores(finalScores)
    setSkillScores(deriveSkillScores(finalScores))
    setPhase('result')
  }

  async function handleWaitlist() {
    if (!waitlistEmail.trim()) return
    setWaitlistStatus('loading')
    try {
      const res = await fetch('https://formspree.io/f/xkoqjewl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: waitlistEmail, source: 'diagnostic' }),
      })
      setWaitlistStatus(res.ok ? 'success' : 'error')
    } catch {
      setWaitlistStatus('error')
    }
  }

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const level    = operatorLevel(avgScore)
  const weakest  = weakestSkillDomain(skillScores.length > 0 ? skillScores : [50, 50, 50, 50])

  const drillPhaseIndex = phase === 'drill1' ? 0 : phase === 'drill2' ? 1 : 2

  if (phase === 'drill1' && drill1) {
    return (
      <SniperDrill
        drill={drill1}
        drillIndex={drillPhaseIndex}
        totalDrills={3}
        onSubmit={handleDrill1Complete}
        onExit={() => router.push('/')}
      />
    )
  }

  if (phase === 'drill2' && drill2) {
    return (
      <SniperDrill
        drill={drill2}
        drillIndex={drillPhaseIndex}
        totalDrills={3}
        onSubmit={handleDrill2Complete}
        onExit={() => router.push('/')}
      />
    )
  }

  if (phase === 'drill3' && drill3) {
    return (
      <SniperDrill
        drill={drill3}
        drillIndex={drillPhaseIndex}
        totalDrills={3}
        onSubmit={handleDrill3Complete}
        onExit={() => router.push('/')}
      />
    )
  }

  if (phase === 'result') {
    const percentile = percentileFromScore(avgScore)
    const r = 56, circ = 2 * Math.PI * r, pct = avgScore / 100
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', justifyContent: 'center', padding: '60px 28px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 640, width: '100%' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
              Diagnostic complete
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 32 }}>
              Your Operator Score
            </h1>

            {/* Score circle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <svg width={140} height={140} style={{ overflow: 'visible' }}>
                <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
                <motion.circle
                  cx={70} cy={70} r={r} fill="none" stroke={level.color} strokeWidth={7}
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ * (1 - pct) }}
                  transition={{ delay: 0.2, duration: 1.0, ease: [0, 0, 0.2, 1] }}
                  transform="rotate(-90 70 70)"
                />
                <motion.text x="70" y="66" textAnchor="middle" fontSize="34" fill="#fff"
                  fontFamily="var(--font-display)" fontWeight={400}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                >{avgScore}</motion.text>
                <motion.text x="70" y="85" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.3)"
                  fontFamily="var(--font-code)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                >/ 100</motion.text>
              </svg>
            </div>

            <div style={{
              display: 'inline-block', marginBottom: 12,
              fontFamily: 'var(--font-code)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: level.color, background: `${level.color}15`, border: `1px solid ${level.color}40`,
              borderRadius: 100, padding: '4px 16px',
            }}>{level.label}</div>

            <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
              Top {percentile}% of operators
            </div>
          </div>

          {/* Skill bars */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 26px', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
              Skill Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SKILL_LABELS.map((label, i) => {
                const pct2 = skillScores[i] ?? 50
                return (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: '#00d4ff' }}>{pct2}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct2}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: [0, 0, 0.2, 1] }}
                        style={{ height: '100%', borderRadius: 2, background: '#00d4ff' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recommended domain */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
              Start here
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff', letterSpacing: '-0.01em', marginBottom: 4 }}>
                  {weakest.domain}
                </div>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  Weakest skill area — highest impact domain
                </div>
              </div>
              <button
                onClick={() => router.push(weakest.href)}
                style={{
                  padding: '10px 20px', background: '#fff', border: 'none', borderRadius: 10,
                  color: '#000', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Start →
              </button>
            </div>
          </div>

          {/* Waitlist CTA */}
          <div style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: '22px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#00d4ff', marginBottom: 10 }}>
              Full access coming soon
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 18, fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
              Get early access to all 100+ drills, your global rank, and the full 24-week curriculum.
            </p>
            {waitlistStatus === 'success' ? (
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: '#22c55e', letterSpacing: '0.08em' }}>
                ✓ You&apos;re on the list — we&apos;ll be in touch.
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
                    borderRadius: 10, color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13,
                    outline: 'none',
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
                  {waitlistStatus === 'loading' ? '...' : 'Join →'}
                </button>
              </div>
            )}
            {waitlistStatus === 'error' && (
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: '#f97316', marginTop: 8, letterSpacing: '0.06em' }}>
                Something went wrong — try again.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Intro screen ──────────────────────────────────────────────────────────
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
            Used by 2,300+ operators
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 20 }}>
            Find your operator level.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 32, fontFamily: 'var(--font-body)' }}>
            Three scored drills. AI evaluates your prompts against a professional rubric.
            No multiple choice — you build real outputs.
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

          {/* Drill preview list */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }}>
            {[
              { n: '01', label: 'Prompt Engineering', desc: 'Foundational prompt construction' },
              { n: '02', label: 'Adaptive drill',      desc: 'Based on your first score' },
              { n: '03', label: 'Advanced PE',         desc: 'Complex prompt challenge' },
            ].map((d) => (
              <div key={d.n} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0', borderBottom: d.n !== '03' ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ fontFamily: 'var(--font-code)', fontSize: 9, color: '#00d4ff', letterSpacing: '0.1em', minWidth: 24 }}>{d.n}</span>
                <div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-body)' }}>{d.label}</div>
                  <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase('drill1')}
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
          <p style={{ marginTop: 14, fontFamily: 'var(--font-code)', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
            3 drills · ~8 min · no account required
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
