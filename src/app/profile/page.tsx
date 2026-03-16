"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItem, STORAGE_KEYS } from "@/core/storage";
import { getMVPDrillsByDomain } from "@/core/content/drills";
import type { DrillResult } from "@/core/types/drills";

const DOMAIN_META = [
  { id: "prompt_engineering", name: "Prompt Engineering", color: "#4f6ef7" },
  { id: "output_control",     name: "Output Control",     color: "#f59e0b" },
  { id: "system_prompts",     name: "System Prompts",     color: "#8b5cf6" },
  { id: "role_prompting",     name: "Role Prompting",     color: "#ec4899" },
  { id: "reasoning_chains",   name: "Reasoning Chains",   color: "#10b981" },
] as const;

// Sample data shown blurred when no diagnostic taken
const SAMPLE_DOMAIN_SCORES = [72, 45, 58, 40, 65];
const SAMPLE_SCORE = 56;

function levelFromScore(n: number) {
  if (n >= 85) return { label: "Advanced",    color: "#00d4ff" };
  if (n >= 65) return { label: "Proficient",  color: "#22c55e" };
  if (n >= 40) return { label: "Developing",  color: "#f59e0b" };
  return           { label: "Beginner",     color: "#f97316" };
}

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);
  const [diagnosticLevel, setDiagnosticLevel] = useState("Developing");
  const [domainProgress, setDomainProgress] = useState<
    { id: string; name: string; color: string; completed: number; total: number }[]
  >([]);

  useEffect(() => {
    // Primary: direct localStorage key set by Fix 3
    const raw = localStorage.getItem("diagnosticScore");
    if (raw) {
      const parsed = parseInt(raw, 10);
      setDiagnosticScore(parsed);
      setDiagnosticLevel(localStorage.getItem("diagnosticLevel") || levelFromScore(parsed).label);
    } else {
      // Fallback: DRILL_HISTORY entry
      const history = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
      const diag = history.find(h => h.drillId === "diagnostic");
      if (diag) {
        setDiagnosticScore(diag.score);
        setDiagnosticLevel(levelFromScore(diag.score).label);
      }
    }

    // Domain progress from completed drills
    const history = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
    const progress = DOMAIN_META.map(d => {
      const allDrills = getMVPDrillsByDomain(d.id as Parameters<typeof getMVPDrillsByDomain>[0]);
      const completed = history.filter(h => allDrills.some(dr => dr.id === h.drillId)).length;
      return { ...d, completed, total: allDrills.length };
    });
    setDomainProgress(progress);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div style={{ padding: "40px 0" }}>
        <div style={{ height: 32, width: 160, borderRadius: 8, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />
        <div style={{ height: 200, borderRadius: 16, background: "rgba(255,255,255,0.04)" }} />
      </div>
    );
  }

  const hasScore = diagnosticScore !== null;
  const displayScore = hasScore ? diagnosticScore : SAMPLE_SCORE;
  const level = levelFromScore(displayScore);
  const levelLabel = hasScore ? diagnosticLevel : "Developing";
  const levelColor = levelFromScore(displayScore).color;

  const r = 54, circ = 2 * Math.PI * r;
  const activeDomains = domainProgress.filter(d => d.completed > 0).length;

  // Domain bars: real data if score exists, sample if blurred
  const displayDomains = DOMAIN_META.map((d, i) => ({
    ...d,
    score: hasScore
      ? (domainProgress.find(dp => dp.id === d.id)?.completed ?? 0) > 0
        ? Math.round((domainProgress.find(dp => dp.id === d.id)!.completed / Math.max(domainProgress.find(dp => dp.id === d.id)!.total, 1)) * 100)
        : (i === 0 ? displayScore : 0)
      : SAMPLE_DOMAIN_SCORES[i],
  }));

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 0 60px" }}>

      <div style={{ position: "relative" }}>

        {/* ── Profile content (blurred+dimmed when no score) ── */}
        <div style={{ opacity: hasScore ? 1 : 0.35, pointerEvents: hasScore ? "auto" : "none" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, padding: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${levelColor}20`, border: `2px solid ${levelColor}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: levelColor }}>DB</span>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#f0f0f0", marginBottom: 4 }}>Daniel Brocato</div>
              <div style={{ fontFamily: "var(--font-code)", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>
                AI Operator · {levelLabel}
              </div>
              <div style={{ fontFamily: "var(--font-code)", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em", marginTop: 6 }}>
                5 domains assessed · {activeDomains} active · Last active today
              </div>
            </div>
          </div>

          {/* Score ring */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "32px 24px", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>Operator Score</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <svg width={148} height={148} style={{ overflow: "visible" }}>
                <circle cx={74} cy={74} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
                <circle cx={74} cy={74} r={r} fill="none" stroke={levelColor} strokeWidth={6}
                  strokeLinecap="round" strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - displayScore / 100)}
                  transform="rotate(-90 74 74)" />
                <text x="74" y="82" textAnchor="middle" fontSize="48" fill="#fff" fontFamily="var(--font-display)" fontWeight={600}>{displayScore}</text>
                <text x="74" y="99" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.3)" fontFamily="var(--font-code)">/ 100</text>
              </svg>
            </div>
            <div style={{ display: "inline-block", fontFamily: "var(--font-code)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: levelColor, background: `${levelColor}18`, border: `1px solid ${levelColor}40`, borderRadius: 100, padding: "4px 16px" }}>
              {levelLabel}
            </div>
          </div>

          {/* Domain bars */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px" }}>
            <div style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>Domain Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {displayDomains.map(d => (
                <div key={d.id}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{d.name}</span>
                    <span style={{ fontFamily: "var(--font-code)", fontSize: 10, color: d.color }}>{d.score}%</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${d.score}%`, background: d.color, borderRadius: 2, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Locked overlay (only shown when no diagnostic score) ── */}
        {!hasScore && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
            <div style={{
              background: "rgba(13,13,13,0.92)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "36px 32px",
              textAlign: "center",
              maxWidth: 380,
              width: "100%",
              backdropFilter: "blur(12px)",
            }}>
              <div style={{ marginBottom: 16 }}>
                <LockIcon />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: "#f0f0f0", marginBottom: 10, lineHeight: 1.4 }}>
                Complete the diagnostic to unlock your profile.
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 24 }}>
                Your operator score, domain breakdown, and skill map will appear here.
              </p>
              <button
                onClick={() => router.push("/diagnostic")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "11px 24px",
                  background: "#fff", border: "none", borderRadius: 10,
                  color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Start Diagnostic →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
