"use client";
import { useEffect, useState, useCallback } from "react";
import { Toast } from "@/components/ui/Toast";
import { safeRead, safeWrite } from "@/core/storage/local";
import {
  getItem,
  setItem,
  getOperatorProfile,
  setOperatorProfile,
  computeOperatorScore,
  getRankLabel,
  updateStreak,
  checkAchievements,
  STORAGE_KEYS,
  type LabSession,
  type DomainScore,
  type ArenaState,
  type Achievement,
} from "@/core/storage";
import { AchievementToast } from "@/components/AchievementToast";

// --- Types ---

interface LabVariable {
  key: string;
  value: string;
}

interface LabVersion {
  id: string;
  createdAt: string;
  system: string;
  user: string;
  variables: LabVariable[];
  note?: string;
}

interface LabProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  current: {
    system: string;
    user: string;
    variables: LabVariable[];
  };
  versions: LabVersion[];
}

const STORAGE_KEY = "ai_mastery_lab_projects";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function createEmptyProject(title: string): LabProject {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    createdAt: now,
    updatedAt: now,
    current: { system: "", user: "", variables: [] },
    versions: [],
  };
}

// --- Simulator ---

function simulateOutput(system: string, user: string, variables: LabVariable[]): { output: string; qualityScore: number } {
  let combined = "";
  if (system.trim()) combined += `[System]\n${system}\n\n`;
  if (user.trim()) combined += `[User]\n${user}\n\n`;
  if (variables.length > 0) {
    combined += `[Variables]\n`;
    for (const v of variables) {
      combined += `{{${v.key}}} = ${v.value}\n`;
    }
    combined += "\n";
  }

  const lower = combined.toLowerCase();

  // Score the prompt quality
  let qualityScore = 0;
  if (system.trim().length > 50) qualityScore += 20;
  else if (system.trim().length > 10) qualityScore += 10;
  if (user.trim().length > 30) qualityScore += 20;
  else if (user.trim().length > 10) qualityScore += 10;
  if (variables.length > 0) qualityScore += 15;
  const constraintWords = ["must", "avoid", "require", "constraint", "format", "schema", "json"];
  const constraintHits = constraintWords.filter((w) => lower.includes(w)).length;
  qualityScore += Math.min(25, constraintHits * 8);
  const structureWords = ["step", "role", "output", "input", "boundary", "limit"];
  const structureHits = structureWords.filter((w) => lower.includes(w)).length;
  qualityScore += Math.min(20, structureHits * 7);
  qualityScore = Math.min(100, qualityScore);

  let output: string;

  if (lower.includes("json") || lower.includes("schema")) {
    output = `{
  "result": "simulated_output",
  "status": "success",
  "data": {
    "extracted_field_1": "<value based on input>",
    "extracted_field_2": "<value based on input>",
    "confidence": 0.92
  },
  "metadata": {
    "model": "simulation",
    "tokens_used": 0,
    "latency_ms": 0
  }
}`;
  } else if (lower.includes("bullet") || lower.includes("list") || lower.includes("steps")) {
    output = `- Step 1: Parse the input and identify key entities
- Step 2: Apply the specified constraints from the system prompt
- Step 3: Generate structured output matching the required format
- Step 4: Validate output against the schema
- Step 5: Return the final response with confidence score

Note: This is a simulated output. Connect to a model API for real inference.`;
  } else if (lower.includes("table") || lower.includes("compare")) {
    output = `| Criterion       | Option A | Option B | Option C |
|-----------------|----------|----------|----------|
| Cost            | Low      | Medium   | High     |
| Accuracy        | Medium   | High     | High     |
| Setup Time      | Fast     | Medium   | Slow     |
| Maintenance     | Low      | Medium   | High     |

Note: This is a simulated output. Connect to a model API for real inference.`;
  } else {
    const preview = combined.trim().slice(0, 300);
    output = `[Simulated Output]\n\nBased on your prompt configuration:\n\n${preview}${combined.length > 300 ? "…" : ""}\n\n---\nThis is a local simulation. No model was called.\nTo get real output, integrate with an LLM API endpoint.`;
  }

  return { output, qualityScore };
}

// --- Component ---

export default function LabPage() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<LabProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [versionNote, setVersionNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [totalSessions, setTotalSessions] = useState(0);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = safeRead<LabProject[]>(STORAGE_KEY, []);
    if (saved.length === 0) {
      const starter = createEmptyProject("Untitled Project");
      setProjects([starter]);
      setActiveProjectId(starter.id);
      safeWrite(STORAGE_KEY, [starter]);
    } else {
      setProjects(saved);
      setActiveProjectId(saved[0].id);
    }
    const sessions = getItem<LabSession[]>(STORAGE_KEYS.LAB_SESSIONS) || [];
    setTotalSessions(sessions.length);
    setMounted(true);
  }, []);

  const persist = useCallback(
    (updated: LabProject[]) => {
      setProjects(updated);
      safeWrite(STORAGE_KEY, updated);
    },
    []
  );

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  const updateCurrent = useCallback(
    (field: "system" | "user" | "title", value: string) => {
      if (!activeProject) return;
      const updated = projects.map((p) => {
        if (p.id !== activeProject.id) return p;
        if (field === "title") return { ...p, title: value, updatedAt: new Date().toISOString() };
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          current: { ...p.current, [field]: value },
        };
      });
      persist(updated);
    },
    [activeProject, projects, persist]
  );

  const updateVariables = useCallback(
    (variables: LabVariable[]) => {
      if (!activeProject) return;
      const updated = projects.map((p) =>
        p.id === activeProject.id
          ? { ...p, updatedAt: new Date().toISOString(), current: { ...p.current, variables } }
          : p
      );
      persist(updated);
    },
    [activeProject, projects, persist]
  );

  const addVariable = useCallback(() => {
    if (!activeProject) return;
    updateVariables([...activeProject.current.variables, { key: "", value: "" }]);
  }, [activeProject, updateVariables]);

  const removeVariable = useCallback(
    (idx: number) => {
      if (!activeProject) return;
      updateVariables(activeProject.current.variables.filter((_, i) => i !== idx));
    },
    [activeProject, updateVariables]
  );

  const setVariableField = useCallback(
    (idx: number, field: "key" | "value", val: string) => {
      if (!activeProject) return;
      const vars = [...activeProject.current.variables];
      vars[idx] = { ...vars[idx], [field]: val };
      updateVariables(vars);
    },
    [activeProject, updateVariables]
  );

  const handleRunSimulation = useCallback(() => {
    if (!activeProject) return;
    const { output: simOutput, qualityScore } = simulateOutput(
      activeProject.current.system,
      activeProject.current.user,
      activeProject.current.variables
    );
    setOutput(simOutput);
    setLastScore(qualityScore);

    // Save as LabSession
    const sessions = getItem<LabSession[]>(STORAGE_KEYS.LAB_SESSIONS) || [];
    const session: LabSession = {
      id: generateId(),
      prompt: `${activeProject.current.system}\n---\n${activeProject.current.user}`,
      output: simOutput,
      qualityScore,
      feedback: qualityScore >= 70 ? "Strong prompt design" : qualityScore >= 40 ? "Decent — add more constraints" : "Weak — needs structure, constraints, and specificity",
      domainTag: activeProject.title,
      savedAt: new Date().toISOString(),
      flagged: false,
    };
    sessions.push(session);
    setItem(STORAGE_KEYS.LAB_SESSIONS, sessions);
    setTotalSessions(sessions.length);

    // Recompute operator score + streak
    let profile = getOperatorProfile();
    if (profile) {
      const ds = getItem<DomainScore[]>(STORAGE_KEYS.DOMAIN_SCORES) || [];
      const as = getItem<ArenaState>(STORAGE_KEYS.ARENA_STATE);
      const newOpScore = computeOperatorScore(ds, as, sessions);
      const newPercentile = Math.max(1, Math.round(100 - newOpScore));
      profile = updateStreak({
        ...profile,
        operatorScore: newOpScore,
        rankPercentile: newPercentile,
        rankLabel: getRankLabel(newPercentile),
        lastActive: new Date().toISOString(),
      });
      setOperatorProfile(profile);
    }

    // Check achievements
    const unlocked = checkAchievements();
    if (unlocked.length > 0) setNewAchievements(unlocked);
  }, [activeProject]);

  const handleSaveVersion = useCallback(() => {
    if (!activeProject) return;
    const version: LabVersion = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      system: activeProject.current.system,
      user: activeProject.current.user,
      variables: [...activeProject.current.variables],
      note: versionNote.trim() || undefined,
    };
    const updated = projects.map((p) =>
      p.id === activeProject.id
        ? { ...p, updatedAt: new Date().toISOString(), versions: [...p.versions, version] }
        : p
    );
    persist(updated);
    setVersionNote("");
    setToast(`Version ${activeProject.versions.length + 1} saved`);
  }, [activeProject, projects, persist, versionNote]);

  const handleNewProject = useCallback(() => {
    const p = createEmptyProject("Untitled Project");
    const updated = [p, ...projects];
    persist(updated);
    setActiveProjectId(p.id);
    setOutput("");
    setLastScore(null);
  }, [projects, persist]);

  const handleDeleteProject = useCallback(
    (id: string) => {
      if (confirmDeleteId !== id) {
        setConfirmDeleteId(id);
        return;
      }
      const updated = projects.filter((p) => p.id !== id);
      persist(updated);
      setConfirmDeleteId(null);
      if (activeProjectId === id) {
        setActiveProjectId(updated[0]?.id ?? null);
        setOutput("");
        setLastScore(null);
      }
    },
    [projects, activeProjectId, confirmDeleteId, persist]
  );

  const handleExportJson = useCallback(() => {
    if (!activeProject) return;
    const blob = new Blob([JSON.stringify(activeProject, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeProject.title.replace(/\s+/g, "-").toLowerCase()}-lab-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Project exported");
  }, [activeProject]);

  const handleRestoreVersion = useCallback(
    (version: LabVersion) => {
      if (!activeProject) return;
      const updated = projects.map((p) =>
        p.id === activeProject.id
          ? {
              ...p,
              updatedAt: new Date().toISOString(),
              current: {
                system: version.system,
                user: version.user,
                variables: [...version.variables],
              },
            }
          : p
      );
      persist(updated);
      setToast("Version restored");
    },
    [activeProject, projects, persist]
  );

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 rounded bg-white/10" />
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="h-64 rounded-xl bg-white/10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Lab</h1>
          <p className="mt-1 text-gray-400">
            Prompt experimentation. AI-scored. Output history saved.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNewProject}
            className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors"
          >
            New Project
          </button>
          {activeProject && (
            <button
              onClick={handleExportJson}
              className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors"
            >
              Export
            </button>
          )}
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-white">{projects.length}</div>
          <div className="text-xs text-gray-400 mt-1">Projects</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{totalSessions}</div>
          <div className="text-xs text-gray-400 mt-1">Simulations Run</div>
        </div>
        {lastScore !== null && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <div className={`text-2xl font-bold ${lastScore >= 70 ? "text-green-400" : lastScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
              {lastScore}/100
            </div>
            <div className="text-xs text-gray-400 mt-1">Last Quality Score</div>
          </div>
        )}
      </div>

      {/* Project selector */}
      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveProjectId(p.id);
                  setOutput("");
                  setLastScore(null);
                  setConfirmDeleteId(null);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  activeProjectId === p.id
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {p.title || "Untitled"}
                <span className="ml-1.5 text-[10px] text-gray-600">
                  ({p.versions.length}v)
                </span>
              </button>
              {projects.length > 1 && (
                <button
                  onClick={() => handleDeleteProject(p.id)}
                  className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                    confirmDeleteId === p.id
                      ? "bg-red-500/20 text-red-400"
                      : "text-gray-600 hover:text-red-400"
                  }`}
                  title={confirmDeleteId === p.id ? "Click again to confirm" : "Delete project"}
                >
                  {confirmDeleteId === p.id ? "confirm?" : "×"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeProject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Prompt Editor */}
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={activeProject.title}
                  onChange={(e) => updateCurrent("title", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Project name"
                />
              </div>

              {/* System */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-1">
                  System Message
                </label>
                <textarea
                  value={activeProject.current.system}
                  onChange={(e) => updateCurrent("system", e.target.value)}
                  placeholder="You are a helpful assistant that..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none min-h-[120px] resize-y font-mono"
                />
              </div>

              {/* User */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-1">
                  User Prompt
                </label>
                <textarea
                  value={activeProject.current.user}
                  onChange={(e) => updateCurrent("user", e.target.value)}
                  placeholder="Analyze the following text and..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none min-h-[120px] resize-y font-mono"
                />
              </div>

              {/* Variables */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Variables</label>
                  <button
                    onClick={addVariable}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    + Add
                  </button>
                </div>
                {activeProject.current.variables.length === 0 ? (
                  <p className="text-xs text-gray-600">No variables. Click + Add to create one.</p>
                ) : (
                  <div className="space-y-2">
                    {activeProject.current.variables.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          value={v.key}
                          onChange={(e) => setVariableField(i, "key", e.target.value)}
                          placeholder="key"
                          className="w-1/3 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                        />
                        <input
                          value={v.value}
                          onChange={(e) => setVariableField(i, "value", e.target.value)}
                          placeholder="value"
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                        />
                        <button
                          onClick={() => removeVariable(i)}
                          className="text-xs text-gray-600 hover:text-red-400 px-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleRunSimulation}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                Run Simulation
              </button>
            </div>

            {/* Version Save */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-2">
              <input
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="Version note (optional)"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleSaveVersion}
                className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors whitespace-nowrap"
              >
                Save Version
              </button>
            </div>
          </div>

          {/* RIGHT: Output + Versions */}
          <div className="space-y-4">
            {/* Output */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                  Output
                </div>
                {lastScore !== null && (
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    lastScore >= 70 ? "bg-green-500/15 text-green-400" : lastScore >= 40 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"
                  }`}>
                    Quality: {lastScore}/100
                  </span>
                )}
              </div>
              {output ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-black/20 rounded-lg p-4 max-h-[400px] overflow-y-auto font-mono">
                  {output}
                </pre>
              ) : (
                <div className="text-sm text-gray-600 py-8 text-center">
                  Click &quot;Run Simulation&quot; to generate output
                </div>
              )}
            </div>

            {/* Version History */}
            {activeProject.versions.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  Version History ({activeProject.versions.length})
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {[...activeProject.versions].reverse().map((v, i) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <div>
                        <span className="text-xs font-mono text-gray-400">
                          v{activeProject.versions.length - i}
                        </span>
                        {v.note && (
                          <span className="ml-2 text-xs text-gray-500">{v.note}</span>
                        )}
                        <div className="text-[10px] text-gray-600">
                          {new Date(v.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestoreVersion(v)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {newAchievements.length > 0 && (
        <AchievementToast achievements={newAchievements} onDone={() => setNewAchievements([])} />
      )}
    </div>
  );
}
