"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { topics, getTopicsByDomain } from "@/core/content/registry";
import { getMasteryState } from "@/core/storage/mastery";
import { ALL_DOMAINS } from "@/core/types/topic";
import type { MasteryState, Domain } from "@/core/types/topic";

const domainColors: Record<Domain, string> = {
  "Prompt Engineering": "bg-indigo-500",
  "Evaluation & Reliability": "bg-emerald-500",
  "AI System Design": "bg-sky-500",
  "Automation & Integration": "bg-amber-500",
  "Operator Strategy": "bg-teal-500",
};

export default function CurriculumPage() {
  const [state, setState] = useState<MasteryState | null>(null);

  useEffect(() => {
    setState(getMasteryState());
  }, []);

  if (!state) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Loading...</div>;
  }

  const totalPassed = Object.values(state.topicProgress).filter((tp) => tp.status === "passed").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Curriculum</h1>
          <p className="mt-1 text-gray-400">
            {totalPassed}/{topics.length} certifications passed — performance-based progression
          </p>
        </div>
        <Link href="/run">
          <Button>Open Run →</Button>
        </Link>
      </div>

      {ALL_DOMAINS.map((domain) => {
        const domainTopics = getTopicsByDomain(domain);
        if (domainTopics.length === 0) return null;
        const passed = domainTopics.filter((t) => state.topicProgress[t.id]?.status === "passed").length;

        return (
          <div key={domain}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold text-white">{domain}</h2>
              <ProgressBar
                value={domainTopics.length > 0 ? Math.round((passed / domainTopics.length) * 100) : 0}
                showPercent={false}
                size="sm"
                color={domainColors[domain]}
                className="w-32"
              />
              <span className="text-xs text-gray-500 font-mono">{passed}/{domainTopics.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {domainTopics.map((topic) => {
                const tp = state.topicProgress[topic.id];
                const status = tp?.status || "locked";
                return (
                  <Card
                    key={topic.id}
                    className={`${
                      status === "locked" ? "opacity-40" : ""
                    } ${status === "passed" ? "border-emerald-500/30" : ""}`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
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
                          {tp?.bestScore > 0 && (
                            <span className="text-xs font-mono text-gray-500">
                              {tp.bestScore}%
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-base">{topic.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <div className="text-xs text-gray-500 mb-2">
                      {topic.drills.length} drills • {topic.rubric.length} rubric dimensions • Threshold: {topic.passThreshold}%
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {topic.drills.map((d) => (
                        <span key={d.id} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">
                          {d.type}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-gray-600">
                      Artifact: {topic.artifactType.replace(/_/g, " ")} • Challenge: {topic.challenge.type.replace(/_/g, " ")}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
