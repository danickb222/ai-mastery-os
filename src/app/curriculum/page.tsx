'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getItem, STORAGE_KEYS } from '@/core/storage'
import type { DrillResult } from '@/core/types/drills'

// ── CSS ───────────────────────────────────────────────────────────────────────
const PAGE_STYLES = `
  @keyframes aura {
    0%   { opacity: 0.9; transform: scale(1); }
    100% { opacity: 0;   transform: scale(1.65); }
  }
  @keyframes curr-fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .curr-sec {
    opacity: 0;
    animation: curr-fadeUp 0.4s ease forwards;
  }
  @media (prefers-reduced-motion: reduce) {
    .curr-sec { animation: none !important; opacity: 1 !important; }
    .curr-live-node::before, .curr-live-node::after { display: none !important; }
  }
  .curr-live-node {
    position: relative;
    width: 56px; height: 56px; flex-shrink: 0;
    border-radius: 50%;
    background: rgba(34,197,94,0.08);
    border: 1.5px solid rgba(34,197,94,0.6);
    display: flex; align-items: center; justify-content: center;
  }
  .curr-live-node::before {
    content: '';
    position: absolute; inset: -8px;
    border-radius: 50%;
    border: 1px solid rgba(34,197,94,0.2);
    animation: aura 2.5s ease-out infinite;
  }
  .curr-live-node::after {
    content: '';
    position: absolute; inset: -16px;
    border-radius: 50%;
    border: 1px solid rgba(34,197,94,0.07);
    animation: aura 2.5s ease-out infinite 0.4s;
  }
  .curr-live-card {
    position: relative;
    cursor: pointer;
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(34,197,94,0.28);
    border-radius: 16px;
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .curr-live-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent);
    border-radius: 16px 16px 0 0;
    pointer-events: none;
  }
  .curr-live-card:hover {
    border-color: rgba(34,197,94,0.55) !important;
    background: rgba(255,255,255,0.05) !important;
  }
  .curr-locked-card {
    position: relative;
    overflow: hidden;
    background: rgba(255,255,255,0.015);
    border: 1px solid rgba(255,255,255,0.055);
    border-radius: 16px;
  }
  .curr-locked-overlay {
    position: absolute; inset: 0;
    background: rgba(6,6,8,0.8);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.2s ease;
    display: flex; align-items: center; justify-content: center;
    border-radius: 15px;
    pointer-events: none;
  }
  .curr-locked-card:hover .curr-locked-overlay {
    opacity: 1;
    pointer-events: auto;
  }
  .curr-drills-panel {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1);
  }
  .curr-drills-panel.open { max-height: 280px; }
  .curr-start-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 20px;
    background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(74,222,128,0.1));
    border: 1px solid rgba(34,197,94,0.45);
    border-radius: 100px;
    color: #22c55e; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit; white-space: nowrap;
    transition: background 0.2s ease, border-color 0.2s ease;
  }
  .curr-start-btn:hover {
    background: linear-gradient(135deg, rgba(34,197,94,0.25), rgba(74,222,128,0.18));
    border-color: rgba(34,197,94,0.7);
  }
  .curr-start-btn .arr { transition: transform 0.2s ease; display: inline-block; }
  .curr-start-btn:hover .arr { transform: translateX(3px); }
`

// ── Domain data ───────────────────────────────────────────────────────────────
type DomainTier = 'foundational' | 'advanced' | 'expert'
const TIER_COLORS = { Foundational: '#22c55e', Advanced: '#f59e0b', Expert: '#ef4444' } as const
const TIER_LABELS: Record<DomainTier, string> = { foundational: 'Foundational', advanced: 'Advanced', expert: 'Expert' }

interface DomainDef {
  id: string; name: string; tier: DomainTier; live: boolean
  description: string; drillCount: number; unlocksAfter: string | null
  drills: { name: string; tier: keyof typeof TIER_COLORS }[]
}

const DOMAINS: DomainDef[] = [
  {
    id: 'prompt_engineering', name: 'Prompt Engineering', tier: 'foundational', live: true,
    description: 'Craft prompts that produce consistent, high-quality outputs across any model. The foundation every other domain builds on.',
    drillCount: 8, unlocksAfter: null,
    drills: [
      { name: 'The Vague Request Problem', tier: 'Foundational' },
      { name: 'The Ambiguity Eliminator', tier: 'Foundational' },
      { name: 'Constraint Cascade', tier: 'Advanced' },
      { name: 'The Sniper Brief', tier: 'Advanced' },
      { name: 'Zero-Shot Mastery', tier: 'Expert' },
    ],
  },
  {
    id: 'output_control', name: 'Output Control', tier: 'foundational', live: false,
    description: 'Specify exactly what you want and receive it consistently. Format contracts, schema design, structured output.',
    drillCount: 0, unlocksAfter: 'Prompt Engineering', drills: [],
  },
  {
    id: 'system_prompts', name: 'System Prompts', tier: 'advanced', live: false,
    description: 'Design instruction sets that define AI behavior across entire conversations — the foundation of any production AI system.',
    drillCount: 0, unlocksAfter: 'Output Control', drills: [],
  },
  {
    id: 'role_prompting', name: 'Role Prompting', tier: 'advanced', live: false,
    description: 'Deploy expert personas and multi-perspective panels. The difference between a toy and a specialist.',
    drillCount: 0, unlocksAfter: 'System Prompts', drills: [],
  },
  {
    id: 'reasoning_chains', name: 'Reasoning Chains', tier: 'expert', live: false,
    description: 'Force AI to reason step by step before answering. Dramatically more accurate outputs on complex problems.',
    drillCount: 0, unlocksAfter: 'Role Prompting', drills: [],
  },
]

// ── Particle canvas ───────────────────────────────────────────────────────────
interface Particle { x: number; y: number; vx: number; vy: number; r: number; isGreen: boolean; alpha: number }

function ParticleCanvas({ isMobile }: { isMobile: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const makeParticles = (width: number, height: number): Particle[] => {
      const base = Math.floor(width * height / 6000)
      const count = isMobile ? Math.floor(base * 0.5) : base
      return Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: 1.2 + Math.random() * 1.3,
        isGreen: Math.random() < 0.7,
        alpha: 0.35 + Math.random() * 0.35,
      }))
    }

    let particles = makeParticles(w, h)
    let rafId: number

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const p of particles) {
        if (!isMobile) {
          const dx = p.x - mx, dy = p.y - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 140 && dist > 0) {
            const force = (140 - dist) / 140 * 2.5
            p.vx += (dx / dist) * force * 0.01
            p.vy += (dy / dist) * force * 0.01
          }
        }
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (spd > 0.4) { p.vx = p.vx / spd * 0.4; p.vy = p.vy / spd * 0.4 }
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) }
        if (p.x > w) { p.x = w; p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) }
        if (p.y > h) { p.y = h; p.vy = -Math.abs(p.vy) }
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            const la = (1 - dist / 130) * 0.25
            ctx.beginPath()
            ctx.lineWidth = 0.8
            ctx.strokeStyle = a.isGreen ? `rgba(34,197,94,${la})` : `rgba(255,255,255,${la})`
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.isGreen ? `rgba(34,197,94,${p.alpha})` : `rgba(255,255,255,${p.alpha})`
        ctx.fill()
      }
      rafId = requestAnimationFrame(tick)
    }

    tick()

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w; canvas.height = h
      particles = makeParticles(w, h)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('mousemove', onMove); window.removeEventListener('resize', onResize) }
  }, [isMobile])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.75, pointerEvents: 'none' }} />
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CurriculumPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null)
  const [drillsOpen, setDrillsOpen] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const waitlistRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    const history = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || []
    const diag = history.find(h => h.drillId === 'diagnostic')
    if (diag) setDiagnosticScore(diag.score)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function handleWaitlist() {
    if (!waitlistEmail.trim()) return
    setWaitlistStatus('loading')
    try {
      const res = await fetch('https://formspree.io/f/xkoqjewl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: waitlistEmail }),
      })
      setWaitlistStatus(res.ok ? 'success' : 'error')
    } catch { setWaitlistStatus('error') }
  }

  const r28 = 11, circ28 = 2 * Math.PI * r28
  const tiersSeen = new Set<DomainTier>()

  return (
    <div style={{ minHeight: '100vh', background: '#060608', position: 'relative' }}>
      <style>{PAGE_STYLES}</style>
      <ParticleCanvas isMobile={isMobile} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, margin: '0 auto', padding: isMobile ? '24px 24px 80px' : '24px 40px 80px' }}>

        {/* ── Header ── */}
        <div className="curr-sec" style={{ animationDelay: '0ms', marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Curriculum</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(34px,5vw,48px)', fontWeight: 300, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Train like a{' '}
            <em style={{ fontStyle: 'italic', background: 'linear-gradient(135deg,#22c55e,#4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              professional.
            </em>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: 480 }}>
            Five domains. Scored against an unforgiving standard. No certificates. Just proof.
          </p>
          {diagnosticScore !== null && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 20, padding: '8px 16px 8px 10px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 100 }}>
              <svg width={28} height={28} style={{ flexShrink: 0, overflow: 'visible' }}>
                <circle cx={14} cy={14} r={r28} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={2.5} />
                <circle cx={14} cy={14} r={r28} fill="none" stroke="#22c55e" strokeWidth={2.5}
                  strokeDasharray={circ28} strokeDashoffset={circ28 * (1 - diagnosticScore / 100)}
                  strokeLinecap="round" transform="rotate(-90 14 14)" />
                <text x={14} y={18} textAnchor="middle" fontSize={8} fill="#22c55e" fontWeight={700}>{diagnosticScore}</text>
              </svg>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                Your diagnostic score:{' '}<span style={{ color: '#22c55e', fontWeight: 600 }}>{diagnosticScore}/100</span>{' '}— start with Prompt Engineering
              </span>
            </div>
          )}
        </div>

        {/* ── Timeline ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {DOMAINS.map((domain, idx) => {
            const isNewTier = !tiersSeen.has(domain.tier)
            if (isNewTier) tiersSeen.add(domain.tier)
            const isLast = idx === DOMAINS.length - 1
            const connectorLit = domain.live
            const delay = 100 + idx * 80

            return (
              <div key={domain.id}>
                {isNewTier && (
                  <div className="curr-sec" style={{ animationDelay: `${delay - 40}ms`, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, marginTop: idx === 0 ? 0 : 8 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)' }}>
                      {TIER_LABELS[domain.tier]}
                    </span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                )}

                <div className="curr-sec" style={{ animationDelay: `${delay}ms`, display: 'flex', gap: 24, alignItems: 'stretch', marginBottom: isLast ? 0 : 24 }}>
                  {/* Left: node + connector */}
                  <div style={{ width: 56, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ paddingTop: 20, display: 'flex', justifyContent: 'center' }}>
                      {domain.live ? (
                        <div className="curr-live-node">
                          <svg width={20} height={20} viewBox="0 0 24 24">
                            <circle cx={12} cy={12} r={6} fill="none" stroke="rgba(34,197,94,0.25)" strokeWidth={1} />
                            <circle cx={12} cy={12} r={3} fill="#22c55e" />
                          </svg>
                        </div>
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <LockIcon />
                        </div>
                      )}
                    </div>
                    {!isLast && (
                      <div style={{ width: 1, flex: 1, minHeight: 24, marginTop: 8, background: connectorLit ? 'repeating-linear-gradient(to bottom,rgba(34,197,94,0.3) 0px,rgba(34,197,94,0.3) 4px,transparent 4px,transparent 9px)' : 'repeating-linear-gradient(to bottom,rgba(255,255,255,0.07) 0px,rgba(255,255,255,0.07) 4px,transparent 4px,transparent 9px)' }} />
                    )}
                  </div>

                  {/* Right: card */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {domain.live ? (
                      <div className="curr-live-card" style={{ padding: '20px 24px' }} onClick={() => setDrillsOpen(o => !o)}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#f0f0f0', margin: 0 }}>{domain.name}</h3>
                            <span style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '2px 10px' }}>Open Beta</span>
                          </div>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginLeft: 8, flexShrink: 0, display: 'inline-block', transition: 'transform 0.2s', transform: drillsOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                        </div>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 18 }}>{domain.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 10 }}>
                          <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
                            {domain.drillCount} drills · Foundational → Expert
                          </span>
                          <button className="curr-start-btn" onClick={e => { e.stopPropagation(); router.push('/run?domain=prompt_engineering') }}>
                            Start training <span className="arr">→</span>
                          </button>
                        </div>
                        <div className={`curr-drills-panel${drillsOpen ? ' open' : ''}`}>
                          <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {domain.drills.map(drill => (
                              <div key={drill.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{drill.name}</span>
                                <span style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: TIER_COLORS[drill.tier], background: `${TIER_COLORS[drill.tier]}18`, border: `1px solid ${TIER_COLORS[drill.tier]}35`, borderRadius: 100, padding: '2px 8px', flexShrink: 0, marginLeft: 8 }}>
                                  {drill.tier}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="curr-locked-card" style={{ padding: '18px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.28)', margin: 0 }}>{domain.name}</h3>
                          <span style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '2px 10px', flexShrink: 0, marginLeft: 10 }}>Coming Soon</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.22)', lineHeight: 1.65, marginBottom: 12 }}>{domain.description}</p>
                        <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          Unlocks after {domain.unlocksAfter}
                        </div>
                        <div className="curr-locked-overlay">
                          <button onClick={() => waitlistRef.current?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '8px 20px', color: 'rgba(255,255,255,0.65)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Launching Q2 2026 — join waitlist ↓
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Waitlist ── */}
        <div ref={waitlistRef} className="curr-sec" style={{ animationDelay: `${100 + DOMAINS.length * 80 + 80}ms`, marginTop: 72, paddingTop: 56, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Stay Ahead</span>
            <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.25)' }} />
          </div>
          <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 22, fontWeight: 300, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
            New domains launching monthly.
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', marginBottom: 24 }}>
            Be first to access Output Control, System Prompts, and Reasoning Chains.
          </p>
          {waitlistStatus === 'success' ? (
            <p style={{ fontFamily: 'var(--font-code)', fontSize: 14, color: '#22c55e', letterSpacing: '0.05em' }}>You&apos;re on the list.</p>
          ) : (
            <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
              <input
                type="email" placeholder="your@email.com" value={waitlistEmail}
                onChange={e => setWaitlistEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleWaitlist()}
                style={{ flex: 1, padding: '11px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none' }}
              />
              <button onClick={handleWaitlist} disabled={waitlistStatus === 'loading'}
                style={{ padding: '11px 20px', background: '#fff', border: 'none', borderRadius: 10, color: '#000', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, cursor: waitlistStatus === 'loading' ? 'wait' : 'pointer', whiteSpace: 'nowrap', opacity: waitlistStatus === 'loading' ? 0.7 : 1 }}>
                {waitlistStatus === 'loading' ? '...' : 'Notify me'}
              </button>
            </div>
          )}
          {waitlistStatus === 'error' && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>Something went wrong. Try again.</p>}
        </div>

      </div>
    </div>
  )
}
