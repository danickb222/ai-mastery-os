'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DEMO_PROMPT =
  'Write a weekly SaaS newsletter for B2B founders. Include: subject line under 60 chars, 3 insight sections each with a data point, direct expert tone, 300-400 words, single CTA.'

const CRITERIA = [
  { label: 'Directive clarity', score: 24, max: 25 },
  { label: 'Specific constraints', score: 23, max: 25 },
  { label: 'Audience & tone', score: 22, max: 25 },
  { label: 'Format definition', score: 18, max: 25 },
]

export default function DrillPreview() {
  const [cycle, setCycle] = useState(0)
  const [phase, setPhase] = useState(1)
  const [typedLen, setTypedLen] = useState(0)
  const [score, setScore] = useState(0)
  const [barWidths, setBarWidths] = useState([0, 0, 0, 0])
  const [submitActive, setSubmitActive] = useState(false)
  const rafRef = useRef<number | null>(null)

  // Typing interval
  useEffect(() => {
    if (phase !== 2) return
    const iv = setInterval(() => {
      setTypedLen(n => {
        if (n >= DEMO_PROMPT.length) { clearInterval(iv); return n }
        return n + 1
      })
    }, 45)
    return () => clearInterval(iv)
  }, [phase])

  // Main sequence per cycle
  useEffect(() => {
    setPhase(1)
    setTypedLen(0)
    setScore(0)
    setBarWidths([0, 0, 0, 0])
    setSubmitActive(false)

    const timers: ReturnType<typeof setTimeout>[] = []

    // Phase 2: start typing
    timers.push(setTimeout(() => setPhase(2), 1000))

    // Phase 3: submit click (after ~182 chars * 45ms = 8190ms typing + 1000ms delay)
    timers.push(setTimeout(() => {
      setPhase(3)
      setSubmitActive(true)
      timers.push(setTimeout(() => setSubmitActive(false), 300))
    }, 9300))

    // Phase 4: score animation
    timers.push(setTimeout(() => {
      setPhase(4)
      const start = performance.now()
      const dur = 1500
      const animScore = (now: number) => {
        const p = Math.min((now - start) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setScore(Math.round(eased * 87))
        if (p < 1) {
          rafRef.current = requestAnimationFrame(animScore)
        }
      }
      rafRef.current = requestAnimationFrame(animScore)

      // bars fill staggered
      CRITERIA.forEach((_, i) => {
        timers.push(setTimeout(() => {
          setBarWidths(prev => {
            const next = [...prev]
            next[i] = (CRITERIA[i].score / CRITERIA[i].max) * 100
            return next
          })
        }, 200 + i * 220))
      })
    }, 3500))

    // Phase 5: hold
    timers.push(setTimeout(() => setPhase(5), 11200))

    // Loop
    timers.push(setTimeout(() => setCycle(c => c + 1), 12000))

    return () => {
      timers.forEach(clearTimeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [cycle])

  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 16,
      overflow: 'hidden', fontFamily: 'var(--font-code)',
    }}>
      {/* Window chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
        borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
        <span style={{ marginLeft: 8, fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
          drill_01_prompt_engineering
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 20px', minHeight: 260 }}>
        <AnimatePresence mode="wait">
          {phase <= 3 ? (
            <motion.div
              key="write"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Brief */}
              <div style={{
                background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 14,
              }}>
                <div style={{ fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(239,68,68,0.65)', marginBottom: 6 }}>
                  ⚠ Broken Prompt
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>
                  &ldquo;Write a newsletter about SaaS&rdquo;
                </div>
              </div>

              {/* Textarea */}
              <div style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '12px 14px', marginBottom: 14, minHeight: 80,
                fontSize: 12, lineHeight: 1.75, color: 'rgba(255,255,255,0.85)',
              }}>
                {phase >= 2 ? (
                  <>
                    {DEMO_PROMPT.slice(0, typedLen)}
                    {typedLen < DEMO_PROMPT.length && (
                      <span style={{
                        display: 'inline-block', width: 2, height: '0.85em',
                        background: '#fff', verticalAlign: 'middle', marginLeft: 1,
                        animation: 'cblink .85s step-end infinite',
                      }} />
                    )}
                  </>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                    Fix the broken prompt above...
                  </span>
                )}
              </div>

              {/* Submit button */}
              <button
                style={{
                  padding: '8px 20px',
                  background: submitActive ? 'rgba(240,240,240,1)' : '#fff',
                  border: 'none', borderRadius: 8,
                  color: '#000', fontSize: 12, fontWeight: 700,
                  fontFamily: 'var(--font-body)', cursor: 'default',
                  transform: submitActive ? 'scale(0.97)' : 'scale(1)',
                  transition: 'all 0.12s ease',
                  boxShadow: submitActive ? '0 0 0 3px rgba(0,212,255,0.25)' : 'none',
                }}
              >
                Submit →
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Score display */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 22 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 400,
                  color: '#fff', letterSpacing: '-0.03em', lineHeight: 1,
                }}>
                  {score}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/100</span>
                <span style={{
                  marginLeft: 8, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--cyan)', background: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.18)', borderRadius: 4, padding: '2px 8px',
                }}>
                  On Target
                </span>
              </div>

              {/* Criteria bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {CRITERIA.map((c, i) => (
                  <div key={c.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{c.label}</span>
                      <span style={{ fontSize: 10, color: '#00d4ff' }}>
                        {Math.round(barWidths[i] / 100 * c.max)}
                        <span style={{ color: 'rgba(255,255,255,0.25)' }}>/{c.max}</span>
                      </span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, background: '#00d4ff',
                        width: barWidths[i] + '%',
                        transition: 'width 0.6s cubic-bezier(0,0,0.2,1)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
