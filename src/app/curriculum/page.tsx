"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DOMAINS } from "@/core/content/domains";
import { getMVPDrillsByDomain } from "@/core/content/drills";
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
    const drills = getMVPDrillsByDomain(domain.id);
    const completedDrills = drillHistory.filter(h => {
      const drill = drills.find(d => d.id === h.drillId);
      return drill !== undefined;
    });

    const avgScore = completedDrills.length > 0
      ? Math.round(completedDrills.reduce((sum, h) => sum + h.score, 0) / completedDrills.length)
      : 0;

    const isOpen = domain.id === 'prompt_engineering';

    return {
      ...domain,
      totalDrills: drills.length,
      completedDrills: completedDrills.length,
      avgScore,
      isOpen,
    };
  });

  return (
    <div style={{ paddingTop: 48, background: "var(--bg)", minHeight: "100vh" }}>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: 48 }}
      >
        <p className="t-tag" style={{ marginBottom: 20 }}>Curriculum</p>

        <h1 className="t-hero" style={{ marginBottom: 16 }}>
          Train.
        </h1>

        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 520 }}>
          Performance-scored drills. New domains launching monthly.
        </p>
      </motion.div>

      {/* Domain grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 12, marginTop: 48 }}>
        {domainData.map((domain, idx) => (
          <motion.div
            key={domain.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: domain.isOpen ? 1 : 0.5, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06, duration: 0.5 }}
            whileHover={domain.isOpen ? { scale: 1.01, y: -3 } : { opacity: 0.6 }}
            style={{
              position: "relative",
              overflow: "hidden",
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderLeft: `3px solid ${domain.color}`,
              borderRadius: 14,
              padding: 24,
              cursor: domain.isOpen ? "pointer" : "default",
              transition: "all 240ms cubic-bezier(0.4,0,0.2,1)",
            }}
            onClick={domain.isOpen ? () => router.push(`/run?domain=${domain.id}`) : undefined}
          >
            {/* Glow orb top-right */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: 60, background: `radial-gradient(ellipse, ${domain.color}18 0%, transparent 70%)`, pointerEvents: "none" }} />

            {/* Top row: name + badges */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, color: "var(--text-primary)", marginBottom: 10, letterSpacing: "-0.01em" }}>
                {domain.name}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                {domain.isOpen ? (
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.14em", color: "var(--cyan)", textTransform: "uppercase", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 100, padding: "2px 10px" }}>
                    OPEN BETA
                  </div>
                ) : (
                  <div style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100, padding: "2px 10px" }}>
                    COMING SOON
                  </div>
                )}
                <div style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.14em", color: "var(--text-dim)", textTransform: "uppercase", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 100, padding: "2px 10px" }}>
                  {domain.difficulty}
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
              {domain.description}
            </p>

            {/* Stats */}
            {domain.isOpen && (
              <div style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.14em", color: "var(--text-dim)", textTransform: "uppercase", display: "flex", gap: 16, marginBottom: 12 }}>
                <span>{domain.completedDrills}/{domain.totalDrills} drills</span>
                <span>~{domain.estimatedMinutes}m</span>
              </div>
            )}

            {/* Progress bar (only for open domains) */}
            {domain.isOpen && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 16 }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${domain.totalDrills > 0 ? (domain.completedDrills / domain.totalDrills) * 100 : 0}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 + 0.1, duration: 1.0, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: "rgba(255,255,255,0.45)",
                    boxShadow: "0 0 6px rgba(255,255,255,0.25)",
                  }}
                />
              </div>
            )}

            {/* Bottom row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "var(--font-code)", fontSize: 9, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase" }}>
                {domain.isOpen ? (domain.avgScore > 0 ? `AVG ${domain.avgScore}/100` : "NOT STARTED") : domain.difficulty}
              </span>
              {domain.isOpen ? (
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--cyan)", cursor: "pointer", background: "none", border: "none", display: "flex", alignItems: "center", gap: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--cyan)")}
                >
                  Start →
                </span>
              ) : (
                <span style={{ fontFamily: "var(--font-code)", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)" }}>
                  Launching soon
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
