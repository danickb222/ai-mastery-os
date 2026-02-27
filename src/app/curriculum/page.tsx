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
    <div style={{ paddingTop: 48 }}>
      {/* Page header */}
      <div style={{ marginBottom: 48 }}>
        {/* Eyebrow pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 16 }}>
          <div style={{ width: 6, height: 6, background: "#4f6ef7", borderRadius: "50%" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,238,240,0.7)", letterSpacing: "0.05em", fontFamily: "var(--font-body)" }}>
            CURRICULUM
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          margin: 0,
          background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 50%, rgba(139,92,246,0.9) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Train.
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "rgba(238,238,240,0.4)", marginTop: 8 }}>
          12 domains. Master the complete operator skill set.
        </p>
      </div>

      {/* Domain grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, marginTop: 40 }}>
        {domainData.map((domain) => (
          <div
            key={domain.id}
            className="domain-card"
            style={{ borderLeft: `2px solid ${domain.color}60` }}
            onClick={() => router.push(`/run?domain=${domain.id}`)}
          >
            {/* Top-right glow orb */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: `radial-gradient(ellipse, ${domain.color}20 0%, transparent 70%)`, pointerEvents: "none" }} />

            {/* Top row: name + difficulty badge */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.0625rem", fontWeight: 600, color: "#eeeef0", lineHeight: 1.2 }}>
                {domain.name}
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 500, fontFamily: "var(--font-body)", color: "rgba(238,238,240,0.5)", letterSpacing: "0.04em", whiteSpace: "nowrap", flexShrink: 0, marginLeft: 8 }}>
                {domain.difficulty}
              </div>
            </div>

            {/* Description */}
            <p className="description-clamp" style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "rgba(238,238,240,0.4)", lineHeight: 1.6, marginBottom: 20, marginTop: 0 }}>
              {domain.description}
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "rgba(238,238,240,0.3)" }}>
                {domain.completedDrills}/{domain.totalDrills} drills
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "rgba(238,238,240,0.3)" }}>
                ~{domain.estimatedMinutes}m
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 1, width: `${domain.totalDrills > 0 ? (domain.completedDrills / domain.totalDrills) * 100 : 0}%`, background: `linear-gradient(90deg, ${domain.color} 0%, ${domain.color}80 100%)` }} />
            </div>

            {/* Bottom row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: domain.avgScore > 0 ? domain.color : "rgba(238,238,240,0.3)" }}>
                {domain.avgScore > 0 ? `${domain.avgScore}/100` : "—"}
              </span>
              <span className="domain-start-link" style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(79,110,247,0.8)", letterSpacing: "0.02em" }}>
                Start →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
