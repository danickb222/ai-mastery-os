"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DOMAINS } from "@/core/content/domains";
import { getDrillsByDomain } from "@/core/content/drills";
import type { DrillResult } from "@/core/types/drills";
import {
  getItem,
  STORAGE_KEYS,
} from "@/core/storage";

export default function CurriculumPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [drillHistory, setDrillHistory] = useState<DrillResult[]>([]);

  useEffect(() => {
    const history = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
    setDrillHistory(history);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 rounded bg-white/10" />
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  const domainData = DOMAINS.map((domain) => {
    const drills = getDrillsByDomain(domain.id);
    const completedDrills = drillHistory.filter(h => {
      const drill = drills.find(d => d.id === h.drillId);
      return drill !== undefined;
    });

    const avgScore = completedDrills.length > 0
      ? Math.round(completedDrills.reduce((sum, h) => sum + h.score, 0) / completedDrills.length)
      : 0;

    return {
      ...domain,
      totalDrills: drills.length,
      completedDrills: completedDrills.length,
      avgScore,
    };
  });

  return (
    <div style={{ paddingTop: 48, maxWidth: 1280, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "Inter, system-ui, sans-serif", marginBottom: 12 }}>
          CURRICULUM
        </div>
        <h1 style={{ color: "#ffffff", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: "clamp(2.2rem, 4vw, 3.5rem)", letterSpacing: "-0.04em", marginBottom: 12, lineHeight: 1.0 }}>
          Train.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.9375rem", lineHeight: 1.7, maxWidth: 600 }}>
          12 professional domains. Performance-scored drills. Master the complete operator skill set through active construction.
        </p>
      </div>

      {/* Domain grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
        {domainData.map((domain, idx) => (
          <div
            key={domain.id}
            className="card card-hover animate-fade-up"
            style={{
              borderLeft: `3px solid ${domain.color}`,
              padding: "24px",
              position: "relative",
              cursor: "pointer",
              animationDelay: `${idx * 50}ms`
            }}
            onClick={() => router.push(`/run?domain=${domain.id}`)}
          >
            {/* Subtle glow orb using domain color */}
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(ellipse, ${domain.color}15 0%, transparent 70%)`, pointerEvents: "none" }} />

            {/* Top row: name + difficulty badge */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, position: "relative" }}>
              <h3 className="t-heading" style={{ margin: 0, flex: 1 }}>
                {domain.name}
              </h3>
              <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", flexShrink: 0, marginLeft: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.28)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {domain.difficulty}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="description-clamp t-body" style={{ marginBottom: 20, marginTop: 8 }}>
              {domain.description}
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="t-label" style={{ color: "var(--text-muted)" }}>DRILLS</span>
                <span className="t-body" style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  {domain.completedDrills}/{domain.totalDrills}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="t-label" style={{ color: "var(--text-muted)" }}>TIME</span>
                <span className="t-body" style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  ~{domain.estimatedMinutes}m
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden", marginBottom: 16 }}>
              <div style={{
                height: "100%",
                borderRadius: 1,
                width: `${domain.totalDrills > 0 ? (domain.completedDrills / domain.totalDrills) * 100 : 0}%`,
                background: "rgba(255,255,255,0.5)",
                boxShadow: "0 0 6px rgba(255,255,255,0.25)",
                transition: "width 0.5s ease"
              }} />
            </div>

            {/* Bottom row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <span className="t-label" style={{ color: "var(--text-muted)", marginRight: 8 }}>AVG SCORE</span>
                <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.875rem", fontWeight: 600, color: domain.avgScore > 0 ? domain.color : "var(--text-muted)" }}>
                  {domain.avgScore > 0 ? `${domain.avgScore}/100` : "—"}
                </span>
              </div>
              <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em", transition: "color 120ms ease" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                Start →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
