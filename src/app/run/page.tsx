"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { DrillDomain, AnyDrill, DrillResult } from "@/core/types/drills";
import { getDrillsByDomain, getDrillById } from "@/core/content/drills";
import { DOMAINS } from "@/core/content/domains";
import { DrillSession } from "@/components/drills/DrillSession";
import {
  getItem,
  setItem,
  STORAGE_KEYS,
} from "@/core/storage";

export default function RunPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <RunPageInner />
    </Suspense>
  );
}

function DomainCompleteScreen({ avgScore, domainLabel, onBack }: { avgScore: number; domainLabel: string; onBack: () => void }) {
  const label = avgScore >= 85 ? 'Mastered' : avgScore >= 65 ? 'Proficient' : avgScore >= 40 ? 'Developing' : 'Beginner';
  const color = avgScore >= 85 ? '#00d4ff' : avgScore >= 65 ? '#22c55e' : avgScore >= 40 ? '#f59e0b' : '#f97316';
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = avgScore / 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'var(--font-code)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>
          Domain Complete
        </div>

        {/* Score circle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <svg width={130} height={130} style={{ overflow: 'visible' }}>
            <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
            <motion.circle
              cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ * (1 - pct) }}
              transition={{ delay: 0.2, duration: 1.0, ease: [0, 0, 0.2, 1] }}
              transform="rotate(-90 65 65)"
            />
            <text x="65" y="61" textAnchor="middle" fontSize="30" fill="#fff" fontFamily="var(--font-display)" fontWeight={400}>{avgScore}</text>
            <text x="65" y="80" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.35)" fontFamily="var(--font-code)">avg score</text>
          </svg>
        </div>

        <div style={{
          display: 'inline-block', marginBottom: 28,
          fontFamily: 'var(--font-code)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          color, background: `${color}15`, border: `1px solid ${color}40`,
          borderRadius: 100, padding: '4px 16px',
        }}>{label}</div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 12 }}>
          {domainLabel}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 40, fontFamily: 'var(--font-body)' }}>
          You&apos;ve completed all drills in this domain. Your scores have been saved to your profile.
        </p>

        <button
          onClick={onBack}
          style={{
            width: '100%', padding: '15px 24px',
            background: '#fff', border: 'none', borderRadius: 12,
            color: '#000', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          Back to Curriculum
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
}

function RunPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentDrill, setCurrentDrill] = useState<AnyDrill | null>(null);
  const [mounted, setMounted] = useState(false);
  const [drillIndex, setDrillIndex] = useState(0);
  const [totalDrills, setTotalDrills] = useState(0);
  const [domainComplete, setDomainComplete] = useState<{ avgScore: number; domainLabel: string } | null>(null);
  const completedScoresRef = useRef<number[]>([]);

  useEffect(() => {
    const drillId = searchParams.get("drill");
    const domain = searchParams.get("domain") as DrillDomain | null;

    setDomainComplete(null);

    if (drillId) {
      const drill = getDrillById(drillId);
      if (drill) {
        setCurrentDrill(drill);
        const domainDrills = getDrillsByDomain(drill.domain);
        const idx = domainDrills.findIndex(d => d.id === drillId);
        setDrillIndex(idx >= 0 ? idx : 0);
        setTotalDrills(domainDrills.length);
      } else {
        router.push("/curriculum");
      }
    } else if (domain) {
      const drills = getDrillsByDomain(domain);
      if (drills.length > 0) {
        setCurrentDrill(drills[0]);
        setDrillIndex(0);
        setTotalDrills(drills.length);
        completedScoresRef.current = [];
      } else {
        router.push("/curriculum");
      }
    } else {
      router.push("/curriculum");
    }

    setMounted(true);
  }, [searchParams, router]);

  const handleComplete = (result: DrillResult) => {
    if (!currentDrill) return;

    const drillHistory = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
    drillHistory.push(result);
    setItem(STORAGE_KEYS.DRILL_HISTORY, drillHistory);

    completedScoresRef.current = [...completedScoresRef.current, result.score];

    const domainDrills = getDrillsByDomain(currentDrill.domain);
    const currentIndex = domainDrills.findIndex(d => d.id === currentDrill.id);

    if (currentIndex < domainDrills.length - 1) {
      const nextDrill = domainDrills[currentIndex + 1];
      router.push(`/run?drill=${nextDrill.id}`);
    } else {
      const scores = completedScoresRef.current;
      const avg = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : result.score;
      const domain = DOMAINS.find(d => d.id === currentDrill.domain);
      setDomainComplete({ avgScore: avg, domainLabel: domain?.name ?? currentDrill.domain });
    }
  };

  const handleExit = () => {
    router.push("/curriculum");
  };

  if (!mounted || !currentDrill) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-[var(--color-text-secondary)]">Loading drill...</div>
      </div>
    );
  }

  if (domainComplete) {
    return (
      <DomainCompleteScreen
        avgScore={domainComplete.avgScore}
        domainLabel={domainComplete.domainLabel}
        onBack={() => router.push("/curriculum")}
      />
    );
  }

  return (
    <DrillSession
      key={currentDrill.id}
      drill={currentDrill}
      drillIndex={drillIndex}
      totalDrills={totalDrills}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}
