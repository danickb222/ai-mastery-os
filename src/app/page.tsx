"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { getMasteryState, computeDomainMastery } from "@/core/storage/mastery";
import { topics, getTopicById } from "@/core/content/registry";
import { ALL_DOMAINS } from "@/core/types/topic";
import type { MasteryState, Domain } from "@/core/types/topic";

const domainColors: Record<Domain, string> = {
  "Prompt Engineering": "bg-indigo-500",
  "Evaluation & Reliability": "bg-emerald-500",
  "AI System Design": "bg-sky-500",
  "Automation & Integration": "bg-amber-500",
  "Operator Strategy": "bg-teal-500",
};

export default function Dashboard() {
  const [state, setState] = useState<MasteryState | null>(null);

  useEffect(() => {
    setState(getMasteryState());
  }, []);

  if (!state) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Loading...</div>;
  }

  const totalTopics = topics.length;
  const passedTopics = Object.values(state.topicProgress).filter((tp) => tp.status === "passed").length;
  const overallPercent = totalTopics > 0 ? Math.round((passedTopics / totalTopics) * 100) : 0;
  const domainMastery = computeDomainMastery();

  const currentTopic = state.currentTopicId ? getTopicById(state.currentTopicId) : null;
  const currentStatus = state.currentTopicId ? state.topicProgress[state.currentTopicId]?.status : null;

  const recentArtifacts = state.artifacts
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            AI Mastery OS
          </h1>
          <p className="mt-1 text-gray-400">
            {currentTopic
              ? `Current: ${currentTopic.title}`
              : "Competency certification engine for applied AI operators"}
          </p>
        </div>
        <Link href="/run">
          <Button size="lg">
            {currentTopic && currentStatus !== "passed" ? "Continue Training" : "Start Training"}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400">{passedTopics}</div>
            <div className="mt-1 text-sm text-gray-400">Certifications Passed</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-400">{overallPercent}%</div>
            <div className="mt-1 text-sm text-gray-400">Overall Progress</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400">{state.xp || 0}</div>
            <div className="mt-1 text-sm text-gray-400">XP Earned</div>
          </div>
        </Card>
      </div>

      {/* Overall progress bar */}
      <Card>
        <CardHeader>
          <CardTitle>Certification Progress</CardTitle>
        </CardHeader>
        <ProgressBar value={overallPercent} label={`${passedTopics} of ${totalTopics} topics certified`} color="bg-indigo-500" />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Domain bars */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Competency</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {ALL_DOMAINS.map((domain) => {
              const dm = domainMastery.find((d) => d.domain === domain);
              const pct = dm && dm.topicsTotal > 0 ? Math.round((dm.topicsPassed / dm.topicsTotal) * 100) : 0;
              return (
                <ProgressBar
                  key={domain}
                  value={pct}
                  label={`${domain}${dm && dm.topicsTotal > 0 ? ` (${dm.topicsPassed}/${dm.topicsTotal})` : ""}`}
                  color={domainColors[domain]}
                  size="sm"
                />
              );
            })}
          </div>
        </Card>

        {/* Current + Artifacts */}
        <div className="space-y-4">
          {currentTopic && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Current Topic</CardTitle>
                  <Badge variant={currentStatus === "passed" ? "success" : "info"}>
                    {currentStatus || "available"}
                  </Badge>
                </div>
              </CardHeader>
              <p className="text-sm font-medium text-white mb-1">{currentTopic.title}</p>
              <p className="text-xs text-gray-500 mb-3">{currentTopic.domain} — {currentTopic.drills.length} drills + certification</p>
              <Link href="/run">
                <Button variant="secondary" size="sm">Open in Run</Button>
              </Link>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Artifacts</CardTitle>
            </CardHeader>
            {recentArtifacts.length === 0 ? (
              <p className="text-sm text-gray-500">Pass certification challenges to build your portfolio.</p>
            ) : (
              <div className="space-y-2">
                {recentArtifacts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                    <span className="text-gray-300 truncate">{a.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">{a.score}%</Badge>
                      <Badge variant="info">{a.domain}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recentArtifacts.length > 0 && (
              <div className="mt-3">
                <Link href="/library">
                  <Button variant="ghost" size="sm">View Library →</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
