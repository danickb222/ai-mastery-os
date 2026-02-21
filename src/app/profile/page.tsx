"use client";

import { useEffect, useState } from "react";
import {
  getOperatorProfile,
  getItem,
  getAchievements,
  STORAGE_KEYS,
  type OperatorProfile,
  type DomainScore,
  type Achievement,
} from "@/core/storage";
import { ALL_DOMAINS } from "@/core/types/topic";

export default function ProfilePage() {
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = getOperatorProfile();
    setProfile(p);
    const ds = getItem<DomainScore[]>(STORAGE_KEYS.DOMAIN_SCORES) || [];
    setDomainScores(ds);
    setAchievements(getAchievements());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/10" />
        <div className="h-32 rounded-xl bg-white/10" />
        <div className="h-32 rounded-xl bg-white/10" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h1 className="text-3xl font-bold text-white">Operator Profile</h1>
        <p className="text-gray-400">Complete the diagnostic to create your profile.</p>
        <a
          href="/run?mode=diagnostic"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Start Your Diagnostic →
        </a>
      </div>
    );
  }

  const handleCopy = async () => {
    const text = `My AI Mastery OS Operator Score: ${profile.operatorScore}/100 | Rank: ${profile.rankLabel} | Top ${profile.rankPercentile}% globally`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        window.prompt("Copy this text:", text);
      }
    }
  };

  const lastActiveDate = profile.lastActive
    ? new Date(profile.lastActive).toLocaleDateString()
    : "—";

  // Map domainId back to domain name
  const getDomainName = (domainId: string) => {
    return ALL_DOMAINS.find((d) => d === domainId) || domainId;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white">Operator Profile</h1>

      {/* Score Card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-6xl font-bold text-white mb-2">
          {profile.operatorScore}
        </div>
        <div className="text-sm text-gray-400 mb-1">Operator Score</div>
        <div className="text-lg font-semibold text-blue-400 mb-1">
          {profile.rankLabel}
        </div>
        <div className="text-sm text-gray-500">
          Top {profile.rankPercentile}% globally
        </div>
      </div>

      {/* Streak Card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-4xl font-bold text-amber-400 mb-1">
          {profile.streakDays}
        </div>
        <div className="text-sm text-gray-400">Day Streak</div>
        <div className="text-xs text-gray-500 mt-1">
          Last active: {lastActiveDate}
        </div>
      </div>

      {/* Domain Scores */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Domain Scores</h2>
        {domainScores.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-gray-500">
            No domain scores recorded yet. Complete drills to build your domain profile.
          </div>
        ) : (
          <div className="space-y-3">
            {domainScores.map((ds) => (
              <div
                key={ds.domainId}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">
                    {getDomainName(ds.domainId)}
                  </span>
                  <span className="text-sm font-mono text-gray-400">
                    {ds.score}/100
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ds.score)}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {ds.drillsCompleted}/{ds.drillsTotal} drills
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Achievements
          {achievements.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">({achievements.length})</span>
          )}
        </h2>
        {achievements.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-gray-500">
            No achievements unlocked yet. Complete drills, arena challenges, or lab experiments.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 hover-lift"
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 flex-shrink-0">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="text-sm font-semibold text-white">{a.title}</span>
                </div>
                <p className="text-xs text-gray-400">{a.description}</p>
                <p className="text-[10px] text-gray-600 mt-1">
                  {new Date(a.unlockedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certification */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Certification</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400 mb-4">
            Certification window opens quarterly. Complete all core domains to become eligible.
          </p>
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
          >
            Not Yet Eligible
          </button>
        </div>
      </div>

      {/* Share */}
      <div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors"
        >
          {copied ? "Copied!" : "Copy Score to Clipboard"}
        </button>
      </div>
    </div>
  );
}
