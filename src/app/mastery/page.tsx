"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getMasteryState,
  computeDomainMastery,
} from "@/core/storage/mastery";
import { topics } from "@/core/content/registry";
import { ALL_DOMAINS } from "@/core/types/topic";
import type { MasteryState, DomainMastery, Domain } from "@/core/types/topic";

const domainColors: Record<Domain, string> = {
  "Prompt Engineering": "bg-indigo-500",
  "Evaluation & Reliability": "bg-emerald-500",
  "AI System Design": "bg-sky-500",
  "Automation & Integration": "bg-amber-500",
  "Operator Strategy": "bg-teal-500",
};

export default function MasteryPage() {
  const [state, setState] = useState<MasteryState | null>(null);
  const [domainMastery, setDomainMastery] = useState<DomainMastery[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  useEffect(() => {
    const s = getMasteryState();
    setState(s);
    setDomainMastery(computeDomainMastery());
  }, []);

  if (!state) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  const totalTopics = topics.length;
  const passedTopics = Object.values(state.topicProgress).filter(
    (tp) => tp.status === "passed"
  ).length;
  const overallPercent =
    totalTopics > 0 ? Math.round((passedTopics / totalTopics) * 100) : 0;

  const filteredTopics = selectedDomain
    ? topics.filter((t) => t.domain === selectedDomain)
    : topics;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Mastery Map</h1>
        <p className="mt-1 text-gray-400">
          Track competency across all domains
        </p>
      </div>

      {/* Overall progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Overall Progress</CardTitle>
          <span className="text-sm font-mono text-gray-400">
            {passedTopics}/{totalTopics} certifications
          </span>
        </div>
        <ProgressBar
          value={overallPercent}
          color="bg-indigo-500"
        />
      </Card>

      {/* Domain Radar (simplified as bars) */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Competency</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {domainMastery.map((dm) => {
            const percent =
              dm.topicsTotal > 0
                ? Math.round((dm.topicsPassed / dm.topicsTotal) * 100)
                : 0;
            const hasTopics = dm.topicsTotal > 0;

            return (
              <button
                key={dm.domain}
                onClick={() =>
                  setSelectedDomain(
                    selectedDomain === dm.domain ? null : dm.domain
                  )
                }
                className={`rounded-xl p-4 text-left transition-all border ${
                  selectedDomain === dm.domain
                    ? "border-indigo-500/50 bg-indigo-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                } ${!hasTopics ? "opacity-40" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">
                    {dm.domain}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {dm.topicsPassed}/{dm.topicsTotal}
                  </span>
                </div>
                <ProgressBar
                  value={percent}
                  showPercent={false}
                  size="sm"
                  color={domainColors[dm.domain]}
                />
                {dm.averageScore > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Avg score: {dm.averageScore}%
                  </div>
                )}
                {dm.weakestDimensions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dm.weakestDimensions.map((w) => (
                      <span
                        key={w}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Domain Radar Visualization (SVG) */}
      <Card>
        <CardHeader>
          <CardTitle>Radar View</CardTitle>
        </CardHeader>
        <div className="flex justify-center py-4">
          <svg viewBox="0 0 300 300" className="w-64 h-64">
            {/* Grid rings */}
            {[20, 40, 60, 80, 100].map((pct) => (
              <polygon
                key={pct}
                points={ALL_DOMAINS.map((_, i) => {
                  const angle =
                    (Math.PI * 2 * i) / ALL_DOMAINS.length - Math.PI / 2;
                  const r = (pct / 100) * 120;
                  return `${150 + r * Math.cos(angle)},${
                    150 + r * Math.sin(angle)
                  }`;
                }).join(" ")}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            ))}
            {/* Axis lines */}
            {ALL_DOMAINS.map((_, i) => {
              const angle =
                (Math.PI * 2 * i) / ALL_DOMAINS.length - Math.PI / 2;
              return (
                <line
                  key={i}
                  x1="150"
                  y1="150"
                  x2={150 + 120 * Math.cos(angle)}
                  y2={150 + 120 * Math.sin(angle)}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              );
            })}
            {/* Data polygon */}
            <polygon
              points={ALL_DOMAINS.map((domain, i) => {
                const dm = domainMastery.find((d) => d.domain === domain);
                const pct =
                  dm && dm.topicsTotal > 0
                    ? (dm.topicsPassed / dm.topicsTotal) * 100
                    : 0;
                const angle =
                  (Math.PI * 2 * i) / ALL_DOMAINS.length - Math.PI / 2;
                const r = (Math.max(pct, 3) / 100) * 120;
                return `${150 + r * Math.cos(angle)},${
                  150 + r * Math.sin(angle)
                }`;
              }).join(" ")}
              fill="rgba(99,102,241,0.2)"
              stroke="rgba(99,102,241,0.8)"
              strokeWidth="2"
            />
            {/* Data points */}
            {ALL_DOMAINS.map((domain, i) => {
              const dm = domainMastery.find((d) => d.domain === domain);
              const pct =
                dm && dm.topicsTotal > 0
                  ? (dm.topicsPassed / dm.topicsTotal) * 100
                  : 0;
              const angle =
                (Math.PI * 2 * i) / ALL_DOMAINS.length - Math.PI / 2;
              const r = (Math.max(pct, 3) / 100) * 120;
              return (
                <circle
                  key={domain}
                  cx={150 + r * Math.cos(angle)}
                  cy={150 + r * Math.sin(angle)}
                  r="4"
                  fill="rgb(99,102,241)"
                />
              );
            })}
            {/* Labels */}
            {ALL_DOMAINS.map((domain, i) => {
              const angle =
                (Math.PI * 2 * i) / ALL_DOMAINS.length - Math.PI / 2;
              const r = 140;
              return (
                <text
                  key={domain}
                  x={150 + r * Math.cos(angle)}
                  y={150 + r * Math.sin(angle)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-400 text-[10px]"
                >
                  {domain}
                </text>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* Topic list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">
            {selectedDomain ? `${selectedDomain} Topics` : "All Topics"}
          </h2>
          {selectedDomain && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDomain(null)}
            >
              Show all
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {filteredTopics.map((t) => {
            const tp = state.topicProgress[t.id];
            const status = tp?.status || "locked";
            return (
              <div
                key={t.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  status === "locked"
                    ? "border-white/5 bg-white/[0.02] opacity-40"
                    : status === "passed"
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : status === "in_progress"
                    ? "border-indigo-500/20 bg-indigo-500/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {t.title}
                    </span>
                    <Badge variant="default">{t.domain}</Badge>
                  </div>
                  {tp?.bestScore > 0 && (
                    <span className="text-xs text-gray-500">
                      Best: {tp.bestScore}%
                    </span>
                  )}
                  {tp?.challengeAttempts && tp.challengeAttempts.length > 0 && (
                    <span className="text-xs text-gray-600 ml-2">
                      ({tp.challengeAttempts.length} attempt
                      {tp.challengeAttempts.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {status === "locked" && (
                    <span className="text-xs text-gray-600">🔒</span>
                  )}
                  <Badge
                    variant={
                      status === "passed"
                        ? "success"
                        : status === "in_progress"
                        ? "info"
                        : status === "available"
                        ? "warning"
                        : "default"
                    }
                  >
                    {status === "passed"
                      ? "Certified"
                      : status === "in_progress"
                      ? "In Progress"
                      : status === "available"
                      ? "Available"
                      : "Locked"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
