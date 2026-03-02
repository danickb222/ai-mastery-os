"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOperatorProfile,
  setOperatorProfile,
  getItem,
  setItem,
  updateStreak,
  computeOperatorScore,
  getRankLabel,
  STORAGE_KEYS,
  type OperatorProfile,
  type DomainScore,
  type ArenaState,
  type LabSession,
  type LastDrillSession,
} from "@/core/storage";
import { DOMAINS, getDomainDrillCount } from "@/core/content/domains";
import { getDrillsByDomain, DRILLS } from "@/core/content/drills";
import type { DrillResult } from "@/core/types/drills";
import { ScoreCounter } from "@/components/ui/ScoreCounter";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function Dashboard() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [arenaState, setArenaState] = useState<ArenaState | null>(null);
  const [lastSession, setLastSession] = useState<LastDrillSession | null>(null);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [daysSinceActive, setDaysSinceActive] = useState(0);

  useEffect(() => {
    let p = getOperatorProfile();
    if (p) {
      p = updateStreak(p);

      const drillHistory = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
      const as = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
      const ls = getItem<LabSession[]>(STORAGE_KEYS.LAB_SESSIONS) || [];
      const lastDrill = getItem<LastDrillSession>(STORAGE_KEYS.LAST_DRILL_SESSION);

      const ds: DomainScore[] = DOMAINS.map(domain => {
        const domainDrills = getDrillsByDomain(domain.id);
        const completedDrills = drillHistory.filter(h =>
          domainDrills.some(d => d.id === h.drillId)
        );
        const avgScore = completedDrills.length > 0
          ? Math.round(completedDrills.reduce((sum, h) => sum + h.score, 0) / completedDrills.length)
          : 0;

        return {
          domainId: domain.id,
          score: avgScore,
          drillsCompleted: completedDrills.length,
          drillsTotal: domainDrills.length,
          lastAttempted: completedDrills.length > 0 ? completedDrills[completedDrills.length - 1].submittedAt : ""
        };
      });

      const newScore = computeOperatorScore(ds, as, ls);
      const newPercentile = Math.max(1, Math.round(100 - newScore));

      const oldScore = p.operatorScore;
      const delta = newScore - oldScore;

      p = {
        ...p,
        operatorScore: newScore,
        rankPercentile: newPercentile,
        rankLabel: getRankLabel(newPercentile),
        lastActive: new Date().toISOString(),
      };
      setOperatorProfile(p);

      const lastActive = getItem<string>(STORAGE_KEYS.LAST_ACTIVE);
      if (lastActive) {
        const diff = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000);
        setDaysSinceActive(diff);
      }

      setItem(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());

      setDomainScores(ds);
      setArenaState(as);
      setLastSession(lastDrill);
      setScoreDelta(delta);
    }
    setProfile(p);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/10" />
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="h-48 rounded-xl bg-white/10" />
      </div>
    );
  }

  if (!profile) {
    return <FirstRunDashboard onStart={() => router.push("/run?mode=diagnostic")} />;
  }

  return (
    <ReturningDashboard
      profile={profile}
      domainScores={domainScores}
      arenaState={arenaState}
      lastSession={lastSession}
      scoreDelta={scoreDelta}
      daysSinceActive={daysSinceActive}
    />
  );
}

// ─── Animated canvas background ───────────────────────────────────────────────

interface CanvasParticle { x: number; y: number; size: number; speed: number; opacity: number; }
interface CanvasRing { x: number; y: number; radius: number; maxRadius: number; speed: number; baseIndex: number; }

function runHeroCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): () => void {
  let frameId: number;
  let yOffset = 0;
  let particles: CanvasParticle[] = [];
  let rings: CanvasRing[] = [];

  function init(w: number, h: number) {
    particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 0.4 + Math.random() * 1.2,
      speed: 0.08 + Math.random() * 0.25,
      opacity: 0.08 + Math.random() * 0.35,
    }));

    rings = Array.from({ length: 3 }, (_, i) => ({
      x: w / 2,
      y: h * 0.42,
      radius: 60 + i * 80,
      maxRadius: 320 + i * 80,
      speed: 0.35,
      baseIndex: i,
    }));
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(canvas.width, canvas.height);
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Layer 1 — Perspective grid
    const vx = w / 2;
    const vy = h * 0.45;
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;

    const numLines = 24;
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const ex = vx + Math.cos(angle) * w * 1.5;
      const ey = vy + Math.sin(angle) * h * 1.5;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    const numHLines = 12;
    const spacing = (h - vy) / numHLines;
    for (let i = 0; i < numHLines; i++) {
      const yPos = vy + (i + 1) * spacing * (1 + i * 0.15) + (yOffset % spacing);
      if (yPos > h) continue;
      const spread = ((yPos - vy) / (h - vy)) * w * 0.8;
      ctx.beginPath();
      ctx.ellipse(vx, yPos, spread, spread * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    yOffset += 0.4;
    if (yOffset >= spacing) yOffset = 0;

    // Layer 2 — Particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.fill();
      p.y -= p.speed;
      if (p.y < 0) {
        p.y = canvas.height;
        p.x = Math.random() * canvas.width;
      }
    }

    // Layer 3 — Pulse rings
    for (const ring of rings) {
      ring.radius += ring.speed;
      const t = ring.radius / ring.maxRadius;
      const opacity = Math.sin(t * Math.PI) * 0.12;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
      ctx.lineWidth = 0.75;
      ctx.stroke();
      if (ring.radius > ring.maxRadius) {
        ring.radius = 60 + ring.baseIndex * 80;
      }
    }

    frameId = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
  };
}

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    return runHeroCanvas(canvas, ctx);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.6,
      }}
    />
  );
}

// ─── First-run dashboard ───────────────────────────────────────────────────────

function FirstRunDashboard({ onStart }: { onStart: () => void }) {
  const fullText = "The training platform for operators who take AI seriously.";
  const [displayText, setDisplayText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(false);

  // Stat card hover state
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  // CTA hover state
  const [ctaHovered, setCtaHovered] = useState(false);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayText(fullText.slice(0, idx));
      if (idx >= fullText.length) {
        clearInterval(interval);
        setShowSubtitle(true);
        setTimeout(() => setCursorVisible(false), 800);
      }
    }, 32);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { number: "12,847", label: "DRILLS THIS WEEK" },
    { number: "71/100", label: "AVG SCORE" },
    { number: "2,341", label: "OPERATORS" },
  ];

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#080808",
      }}
    >
      <HeroCanvas />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 24px",
          maxWidth: 860,
          width: "100%",
        }}
      >
        {/* Status pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 100,
            padding: "5px 14px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              background: "#ffffff",
              opacity: 0.6,
              animation: "ring-expand 2.5s ease-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            EARLY ACCESS
          </span>
        </div>

        {/* Typewriter headline */}
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "clamp(2.6rem, 6.5vw, 5rem)",
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            color: "#ffffff",
            maxWidth: 780,
            marginBottom: 0,
          }}
        >
          {displayText}
          <span
            style={{
              opacity: cursorVisible ? 1 : 0,
              animation: cursorVisible ? "blink 0.9s step-end infinite" : "none",
              transition: "opacity 0.3s ease",
            }}
          >
            ▋
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "1rem",
            color: "rgba(255,255,255,0.38)",
            maxWidth: 540,
            lineHeight: 1.8,
            marginBottom: 44,
            marginTop: 20,
            transition: "opacity 0.8s ease",
            opacity: showSubtitle ? 1 : 0,
          }}
        >
          12 domains. 3 competency tiers. Performance-scored drills built for the operators who will define how AI is used professionally.
        </p>

        {/* CTA button */}
        <button
          onClick={onStart}
          onMouseEnter={() => setCtaHovered(true)}
          onMouseLeave={() => setCtaHovered(false)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "#ffffff",
            color: "#080808",
            border: "none",
            borderRadius: 8,
            padding: "13px 34px",
            fontSize: "0.9375rem",
            fontWeight: 700,
            fontFamily: "Inter, system-ui, sans-serif",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            transition: "all 180ms ease",
            marginBottom: 14,
            boxShadow: ctaHovered ? "0 0 40px rgba(255,255,255,0.2), 0 0 80px rgba(255,255,255,0.08)" : "none",
            transform: ctaHovered ? "translateY(-2px)" : "none",
          }}
        >
          Start Your Diagnostic →
        </button>

        {/* Subtext */}
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.07em",
            fontFamily: "Inter, system-ui, sans-serif",
            marginBottom: 72,
            textTransform: "uppercase",
          }}
        >
          5 drills · No account required · ~8 minutes
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 620 }}>
          {stats.map((s, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredStat(i)}
              onMouseLeave={() => setHoveredStat(null)}
              style={{
                flex: 1,
                background: hoveredStat === i ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)",
                border: `1px solid ${hoveredStat === i ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 12,
                padding: "18px 20px",
                textAlign: "center",
                backdropFilter: "blur(20px)",
                transition: "all 200ms ease",
                cursor: "default",
                transform: hoveredStat === i ? "translateY(-2px)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "1.625rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.04em",
                  display: "block",
                }}
              >
                {s.number}
              </span>
              <span
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.22)",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  marginTop: 5,
                  display: "block",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          color: "rgba(255,255,255,0.1)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "Inter, system-ui, sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        THIS IS NOT A COURSE. THERE IS NO CERTIFICATE FOR WATCHING.
      </div>
    </div>
  );
}

interface ReturningDashboardProps {
  profile: OperatorProfile;
  domainScores: DomainScore[];
  arenaState: ArenaState | null;
  lastSession: LastDrillSession | null;
  scoreDelta: number;
  daysSinceActive: number;
}

function ReturningDashboard({
  profile,
  domainScores,
  arenaState,
  lastSession,
  scoreDelta,
  daysSinceActive,
}: ReturningDashboardProps) {
  const router = useRouter();

  const weakestDomain = domainScores.length > 0
    ? domainScores.reduce((min, ds) => (ds.score < min.score ? ds : min), domainScores[0])
    : null;
  const weakestDomainId = weakestDomain?.domainId || DOMAINS[0].id;

  const totalParticipants = 12847;

  const arena = arenaState ?? {
    seasonNumber: 1,
    seasonEndDate: "2025-03-31",
    totalParticipants,
    userRank: 0,
    sessionsCompleted: 0,
    bestScore: 0,
    lastSessionScore: null,
  };

  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(arena.seasonEndDate).getTime() - Date.now()) / 86400000)
  );

  const seasonProgress = ((Date.now() - new Date("2025-01-01").getTime()) / (new Date(arena.seasonEndDate).getTime() - new Date("2025-01-01").getTime())) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Inactivity Alert */}
      {daysSinceActive > 3 && (
        <div className="card animate-fade-up" style={{ borderLeft: "3px solid var(--warning)", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <p className="t-body" style={{ margin: 0 }}>
              You haven&apos;t trained in {daysSinceActive} days. Your relative rank has dropped.
            </p>
            <button
              onClick={() => router.push(`/run?domain=${weakestDomainId}`)}
              className="btn btn-primary"
            >
              Resume Now →
            </button>
          </div>
        </div>
      )}

      {/* Operator Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 0, background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }} className="animate-fade-up">
        {/* Score Block */}
        <div style={{ padding: "32px 24px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div className="t-score score-glow">
              <ScoreCounter target={profile.operatorScore} />
            </div>
            {scoreDelta !== 0 && (
              <div className={`text-sm font-semibold ${scoreDelta > 0 ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
                {scoreDelta > 0 ? `↑${scoreDelta}` : `↓${Math.abs(scoreDelta)}`}
              </div>
            )}
          </div>
          <div className="t-label" style={{ marginTop: 8 }}>OPERATOR SCORE</div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: "var(--border)" }} />

        {/* Rank Block */}
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <div className="t-title" style={{ marginBottom: 8 }}>Top {profile.rankPercentile}%</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "4px 10px" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {profile.rankLabel}
            </span>
          </div>
          <div className="t-label" style={{ marginTop: 8 }}>of {totalParticipants.toLocaleString()} operators</div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: "var(--border)" }} />

        {/* Streak Block */}
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <div className="t-title" style={{ marginBottom: 8 }}>{profile.streakDays}</div>
          <div className="t-label">DAY STREAK</div>
          {profile.streakDays > 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
              <span className="t-label" style={{ color: "var(--success-text)" }}>Active</span>
            </div>
          ) : (
            <div className="t-label" style={{ color: "var(--text-muted)", marginTop: 8 }}>No active streak</div>
          )}
        </div>
      </div>

      {/* Continue Block */}
      {lastSession && (
        <div className="card-elevated animate-fade-up" style={{ animationDelay: "50ms", borderLeft: "3px solid rgba(255,255,255,0.2)", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div>
              <div className="t-label">CONTINUE TRAINING</div>
              <h3 className="t-heading" style={{ marginTop: 8 }}>{lastSession.domainName}</h3>
              <p className="t-body" style={{ marginTop: 4 }}>{lastSession.topicName}</p>
              <p className="t-label" style={{ color: "var(--text-muted)", marginTop: 8 }}>
                {new Date(lastSession.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => router.push(`/run?domain=${lastSession.domainId}&index=${lastSession.drillIndex}`)}
              className="btn btn-primary"
            >
              Resume →
            </button>
          </div>
        </div>
      )}

      {/* Two-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {/* Recommended Drill Card */}
        <div
          className="card-elevated card-hover animate-fade-up"
          style={{
            animationDelay: "100ms",
            borderLeft: `3px solid ${DOMAINS.find(d => d.id === weakestDomainId)?.color || "rgba(255,255,255,0.2)"}`,
            padding: "24px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div className="t-label">RECOMMENDED</div>
            <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 4, padding: "2px 8px" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Priority</span>
            </div>
          </div>
          <h3 className="t-heading">{DOMAINS.find(d => d.id === weakestDomainId)?.name}</h3>
          <div style={{ display: "inline-flex", alignItems: "center", background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", borderRadius: 4, padding: "3px 8px", marginTop: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {DOMAINS.find(d => d.id === weakestDomainId)?.difficulty}
            </span>
          </div>
          <p className="t-body" style={{ marginTop: 12 }}>Your weakest domain. Close the gap.</p>
          <button
            onClick={() => router.push(`/run?domain=${weakestDomainId}`)}
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            Start Drill →
          </button>
        </div>

        {/* Weakest Domain Stats Card */}
        <div
          className="card-elevated card-hover animate-fade-up"
          style={{
            animationDelay: "150ms",
            padding: "24px"
          }}
        >
          <div className="t-label" style={{ marginBottom: 12 }}>WEAKEST DOMAIN</div>
          <h3 className="t-heading">{DOMAINS.find(d => d.id === weakestDomainId)?.name}</h3>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="t-label">PROGRESS</span>
              <span className="t-label">{weakestDomain?.drillsCompleted || 0}/{weakestDomain?.drillsTotal || 0}</span>
            </div>
            <ProgressBar
              value={weakestDomain ? (weakestDomain.drillsCompleted / weakestDomain.drillsTotal) * 100 : 0}
              size="sm"
              color="red"
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <span className="t-label">AVERAGE SCORE</span>
            <div className="t-title" style={{ marginTop: 4, color: weakestDomain && weakestDomain.score > 0 ? "var(--danger-text)" : "var(--text-muted)" }}>
              {weakestDomain && weakestDomain.score > 0 ? `${weakestDomain.score}/100` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Domain Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {DOMAINS.map((domain, idx) => {
          const ds = domainScores.find(d => d.domainId === domain.id);
          const completed = ds?.drillsCompleted || 0;
          const total = domain.id ? getDomainDrillCount(domain.id) : 0;
          const progress = total > 0 ? (completed / total) * 100 : 0;
          const score = ds?.score || 0;

          return (
            <div
              key={domain.id}
              className="card card-hover animate-fade-up"
              style={{
                animationDelay: `${200 + idx * 40}ms`,
                borderLeft: `3px solid ${domain.color}`,
                padding: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 className="t-heading" style={{ fontSize: "0.875rem", lineHeight: 1.3 }}>{domain.name}</h3>
                <div style={{ display: "inline-flex", alignItems: "center", background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", borderRadius: 4, padding: "2px 6px", flexShrink: 0, marginLeft: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {domain.difficulty}
                  </span>
                </div>
              </div>

              <div className="t-label" style={{ color: "var(--text-muted)", marginBottom: 8 }}>
                {completed}/{total}
              </div>

              <ProgressBar
                value={progress}
                size="sm"
                animated={true}
                color={score >= 80 ? "green" : score >= 60 ? "yellow" : "red"}
              />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                {score > 0 ? (
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: score >= 80 ? "var(--success-bg)" : score >= 60 ? "var(--warning-bg)" : "var(--bg-elevated)",
                    border: `1px solid ${score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--border-mid)"}`,
                    borderRadius: 4,
                    padding: "3px 8px"
                  }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: score >= 80 ? "var(--success-text)" : score >= 60 ? "var(--warning-text)" : "var(--text-muted)",
                      letterSpacing: "0.02em"
                    }}>
                      {score}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "inline-flex", alignItems: "center", background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", borderRadius: 4, padding: "3px 8px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>—</span>
                  </div>
                )}
                <button
                  onClick={() => router.push(`/run?domain=${domain.id}`)}
                  className="t-label"
                  style={{ color: "rgba(255,255,255,0.5)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                >
                  Start →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arena Widget */}
      <div className="card-elevated animate-fade-up" style={{ animationDelay: "500ms", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div className="t-label" style={{ marginBottom: 8 }}>ARENA · SEASON 1</div>
            <div className="t-body" style={{ marginBottom: 12 }}>{daysRemaining} days remaining</div>
            <div style={{ width: "100%", maxWidth: 240 }}>
              <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "rgba(255,255,255,0.5)",
                    width: `${seasonProgress}%`,
                    transition: "width 0.5s ease",
                    boxShadow: "0 0 6px rgba(255,255,255,0.3)",
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "0 24px" }}>
            <div className="t-title">
              {arena.userRank > 0 ? `Rank ${arena.userRank}` : "Unranked"}
            </div>
          </div>
          <button
            onClick={() => router.push("/arena")}
            className="btn btn-secondary"
          >
            Compete →
          </button>
        </div>
      </div>
    </div>
  );
}
