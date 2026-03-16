"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getMVPDrillsByDomain } from "@/core/content/drills";
import type { DrillResult } from "@/core/types/drills";
import { getItem, STORAGE_KEYS } from "@/core/storage";

const DOMAIN_CARDS = [
  {
    id: 'prompt_engineering',
    name: 'Prompt Engineering',
    description: 'Write prompts that produce exactly the output you need, every time. Specificity, constraints, and few-shot patterns.',
    color: '#4f6ef7',
    isOpen: true,
  },
  {
    id: 'output_control',
    name: 'Output Control',
    description: 'Specify exactly what you want and receive it consistently. Format contracts, schema design, structured output.',
    color: '#f59e0b',
    isOpen: false,
  },
  {
    id: 'system_prompts',
    name: 'System Prompts',
    description: 'Design instruction sets that define AI behavior across entire conversations — the foundation of any production AI system.',
    color: '#8b5cf6',
    isOpen: false,
  },
  {
    id: 'role_prompting',
    name: 'Role Prompting',
    description: 'Deploy expert personas and multi-perspective panels. The difference between a toy and a specialist.',
    color: '#ec4899',
    isOpen: false,
  },
  {
    id: 'reasoning_chains',
    name: 'Reasoning Chains',
    description: 'Force AI to reason step by step before answering. Dramatically more accurate outputs on complex problems.',
    color: '#10b981',
    isOpen: false,
  },
] as const;

export default function CurriculumPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    const peDrills = getMVPDrillsByDomain('prompt_engineering');
    const history = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
    const completed = history.filter(h => peDrills.find(d => d.id === h.drillId));
    setCompletedCount(completed.length);
    if (completed.length > 0) {
      setAvgScore(Math.round(completed.reduce((s, h) => s + h.score, 0) / completed.length));
    }
    setLoaded(true);
  }, []);

  const peTotalDrills = getMVPDrillsByDomain('prompt_engineering').length;

  const sec = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  });

  if (!loaded) {
    return (
      <div style={{ paddingTop: 48, background: 'var(--bg)', minHeight: '100vh' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 12 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ height: 160, borderRadius: 14, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 48, background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Page header */}
      <motion.div {...sec(0)} style={{ marginBottom: 48 }}>
        <p className="t-tag" style={{ marginBottom: 20 }}>Curriculum</p>
        <h1 className="t-hero" style={{ marginBottom: 16 }}>Train.</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: 520 }}>
          Performance-scored drills. New domains launching monthly.
        </p>
      </motion.div>

      {/* Domain grid */}
      <motion.div {...sec(0.05)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 12, marginTop: 0 }}>
        {DOMAIN_CARDS.map((domain, idx) => (
          <motion.div
            key={domain.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: domain.isOpen ? 1 : 0.55, y: 0 }}
            transition={{ delay: 0.05 + idx * 0.06, duration: 0.4 }}
            whileHover={domain.isOpen ? { scale: 1.01, y: -3 } : { opacity: 0.65 }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderLeft: `3px solid ${domain.color}`,
              borderRadius: 14,
              padding: 24,
              cursor: domain.isOpen ? 'pointer' : 'default',
              transition: 'all 240ms cubic-bezier(0.4,0,0.2,1)',
            }}
            onClick={domain.isOpen ? () => router.push(`/run?domain=${domain.id}`) : undefined}
          >
            {/* Glow orb */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 60, background: `radial-gradient(ellipse, ${domain.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 0, letterSpacing: '-0.01em' }}>
                {domain.name}
              </h3>
              {domain.isOpen ? (
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.14em', color: '#22c55e', textTransform: 'uppercase', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '2px 10px', flexShrink: 0, marginLeft: 12 }}>
                  OPEN BETA
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '2px 10px', flexShrink: 0, marginLeft: 12 }}>
                  COMING SOON
                </div>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>
              {domain.description}
            </p>

            {/* Stats row (open only) */}
            {domain.isOpen && (
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'flex', gap: 16, marginBottom: 12 }}>
                <span>{completedCount}/{peTotalDrills} drills</span>
              </div>
            )}

            {/* Progress bar (open only) */}
            {domain.isOpen && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 16 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${peTotalDrills > 0 ? (completedCount / peTotalDrills) * 100 : 0}%` }}
                  transition={{ delay: 0.4, duration: 1.0, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'rgba(255,255,255,0.45)', boxShadow: '0 0 6px rgba(255,255,255,0.25)' }}
                />
              </div>
            )}

            {/* Bottom row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                {domain.isOpen
                  ? (avgScore > 0 ? `AVG ${avgScore}/100` : 'NOT STARTED')
                  : 'Launching soon'}
              </span>
              {domain.isOpen ? (
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--cyan)', cursor: 'pointer' }}>
                  Start →
                </span>
              ) : (
                <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>
                  —
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Waitlist */}
      <motion.div {...sec(0.35)} style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          New domains launch monthly. Join the waitlist to be notified.
        </p>
        {emailSubmitted ? (
          <p style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: '#22c55e', letterSpacing: '0.05em' }}>
            You&apos;re on the list.
          </p>
        ) : (
          <form
            onSubmit={e => { e.preventDefault(); if (email.trim()) setEmailSubmitted(true); }}
            style={{ display: 'flex', gap: 8, maxWidth: 400 }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 13,
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
              }}
            >
              Notify me
            </button>
          </form>
        )}
      </motion.div>

    </div>
  );
}
