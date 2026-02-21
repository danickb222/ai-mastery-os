"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTopicsByDomain } from "@/core/content/registry";
import { ALL_DOMAINS } from "@/core/types/topic";
import {
  getItem,
  STORAGE_KEYS,
  type DomainScore,
} from "@/core/storage";

export default function CurriculumPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    const ds = getItem<DomainScore[]>(STORAGE_KEYS.DOMAIN_SCORES) || [];
    setDomainScores(ds);
    setLoaded(true);
    // Content availability check
    const timer = setTimeout(() => setContentReady(true), 100);
    return () => clearTimeout(timer);
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

  // Build domain data
  const allDomains = ALL_DOMAINS.map((domain, idx) => {
    const domainTopics = getTopicsByDomain(domain);
    const ds = domainScores.find((d) => d.domainId === domain);
    const totalDrills = domainTopics.reduce((sum, t) => sum + t.drills.length, 0);
    const third = Math.ceil(ALL_DOMAINS.length / 3);
    const difficulty = idx < third ? "Foundational" : idx < third * 2 ? "Advanced" : "Expert";
    const estimatedMinutes = totalDrills * 2;
    return {
      domainId: domain,
      name: domain,
      difficulty,
      drillCount: totalDrills,
      estimatedMinutes,
      drillsCompleted: ds?.drillsCompleted ?? 0,
      drillsTotal: ds?.drillsTotal ?? totalDrills,
      score: ds?.score ?? 0,
      hasScore: !!ds,
    };
  });

  // Recommended path: domains with no score (prioritize) or lowest scores, pick 3-4
  const recommended = [...allDomains]
    .sort((a, b) => {
      if (!a.hasScore && b.hasScore) return -1;
      if (a.hasScore && !b.hasScore) return 1;
      return a.score - b.score;
    })
    .slice(0, 4);

  if (!contentReady && allDomains.length === 0) {
    return (
      <div className="space-y-8 animate-pulse">
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Train</h1>
        <p className="mt-1 text-gray-400">
          Select a domain. Run drills. Build your Operator Score.
        </p>
      </div>

      {/* Recommended Path Rail */}
      <div>
        <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-3">
          Recommended Path
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {recommended.map((d) => (
            <button
              key={d.domainId}
              onClick={() => router.push(`/run?domain=${encodeURIComponent(d.domainId)}`)}
              className="flex-shrink-0 w-56 rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white truncate">{d.name}</span>
              </div>
              <span
                className={`inline-block text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider mb-2 ${
                  d.difficulty === "Foundational"
                    ? "bg-green-500/15 text-green-400"
                    : d.difficulty === "Advanced"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {d.difficulty}
              </span>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors">
                  Start →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Full Domain Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allDomains.map((d) => {
          const progress = d.drillsTotal > 0 ? Math.round((d.drillsCompleted / d.drillsTotal) * 100) : 0;
          const isFinished = d.drillsCompleted > 0 && d.drillsCompleted >= d.drillsTotal;
          return (
            <div
              key={d.domainId}
              className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{d.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider ${
                      d.difficulty === "Foundational"
                        ? "bg-green-500/15 text-green-400"
                        : d.difficulty === "Advanced"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {d.difficulty}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {d.drillCount} drills · ~{d.estimatedMinutes} min
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 mb-2">
                  <div
                    className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{d.drillsCompleted}/{d.drillsTotal} drills</span>
                  {d.score > 0 && <span className="font-mono">{d.score}/100</span>}
                  {isFinished && (
                    <span className="px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 text-[10px] font-medium">
                      Finished
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push(`/run?domain=${encodeURIComponent(d.domainId)}`)}
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
                >
                  {isFinished ? "Review Drills →" : "Start Drilling →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}