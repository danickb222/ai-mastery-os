"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import {
  getMasteryState,
  exportMasteryData,
  exportMasteryMarkdown,
} from "@/core/storage/mastery";
import type { MasteryState, Artifact } from "@/core/types/topic";

const artifactTypeLabels: Record<string, string> = {
  prompt_template: "Prompt Template",
  evaluation_harness: "Evaluation Harness",
  system_design: "System Design",
  workflow_blueprint: "Workflow Blueprint",
  security_framework: "Security Framework",
  strategy_brief: "Strategy Brief",
  capstone_proposal: "Capstone Proposal",
};

export default function LibraryPage() {
  const [state, setState] = useState<MasteryState | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setState(getMasteryState());
  }, []);

  if (!state) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Loading...</div>;
  }

  const artifacts = state.artifacts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast("Copied to clipboard!");
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setToast(`Downloaded ${filename}`);
  };

  const handleExportJson = () => {
    downloadFile(
      exportMasteryData(),
      `ai-mastery-library-${new Date().toISOString().split("T")[0]}.json`,
      "application/json"
    );
  };

  const handleExportMarkdown = () => {
    downloadFile(
      exportMasteryMarkdown(),
      `ai-mastery-library-${new Date().toISOString().split("T")[0]}.md`,
      "text/markdown"
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Library</h1>
          <p className="mt-1 text-gray-400">Your best challenge submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportJson}>Export JSON</Button>
          <Button variant="secondary" size="sm" onClick={handleExportMarkdown}>Export MD</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-400">{artifacts.length}</div>
            <div className="text-xs text-gray-500 mt-1">Artifacts</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{state.totalPassed}</div>
            <div className="text-xs text-gray-500 mt-1">Certifications</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{state.xp || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Total XP</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{state.streak || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Day Streak</div>
          </div>
        </Card>
      </div>

      {/* Badges */}
      {state.badges && state.badges.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
          <div className="flex flex-wrap gap-3">
            {state.badges.map((b) => (
              <div key={b.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-center">
                <div className="text-sm font-semibold text-amber-300">{b.title}</div>
                <div className="text-[10px] text-gray-500">{b.description}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Artifact List */}
      {artifacts.length === 0 ? (
        <Card className="py-12">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">No artifacts yet</p>
            <p className="text-sm">Pass certification challenges in Run to build your library.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {artifacts.map((artifact: Artifact) => {
            const isExpanded = expandedId === artifact.id;
            return (
              <Card key={artifact.id}>
                <div className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : artifact.id)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{artifact.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="info">{artifact.domain}</Badge>
                        <Badge variant="default">{artifactTypeLabels[artifact.type] || artifact.type}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-emerald-400">{artifact.score}%</span>
                      <div className="text-[10px] text-gray-600">{new Date(artifact.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{isExpanded ? "Click to collapse" : "Click to expand"}</div>
                </div>
                {isExpanded && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-white/5 rounded-lg p-4 max-h-[400px] overflow-y-auto font-mono">
                      {artifact.content}
                    </pre>
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard(artifact.content); }}>Copy</Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); downloadFile(artifact.content, `${artifact.topicId}-artifact.md`, "text/markdown"); }}>Download</Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
