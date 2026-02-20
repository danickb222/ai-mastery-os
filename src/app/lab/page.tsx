"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { safeRead, safeWrite } from "@/core/storage/local";

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

function simulateOutput(system: string, user: string, variables: LabVariable[]): string {
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

  if (lower.includes("json") || lower.includes("schema")) {
    return `{
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
  }

  if (lower.includes("bullet") || lower.includes("list") || lower.includes("steps")) {
    return `- Step 1: Parse the input and identify key entities
- Step 2: Apply the specified constraints from the system prompt
- Step 3: Generate structured output matching the required format
- Step 4: Validate output against the schema
- Step 5: Return the final response with confidence score

Note: This is a simulated output. Connect to a model API for real inference.`;
  }

  if (lower.includes("table") || lower.includes("compare")) {
    return `| Criterion       | Option A | Option B | Option C |
|-----------------|----------|----------|----------|
| Cost            | Low      | Medium   | High     |
| Accuracy        | Medium   | High     | High     |
| Setup Time      | Fast     | Medium   | Slow     |
| Maintenance     | Low      | Medium   | High     |

Note: This is a simulated output. Connect to a model API for real inference.`;
  }

  // Default: echo summary
  const preview = combined.trim().slice(0, 300);
  return `[Simulated Output]\n\nBased on your prompt configuration:\n\n${preview}${combined.length > 300 ? "…" : ""}\n\n---\nThis is a local simulation. No model was called.\nTo get real output, integrate with an LLM API endpoint.`;
}

// --- Component ---

export default function LabPage() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<LabProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [versionNote, setVersionNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    const result = simulateOutput(
      activeProject.current.system,
      activeProject.current.user,
      activeProject.current.variables
    );
    setOutput(result);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Lab</h1>
          <p className="mt-1 text-gray-400">Prompt experiments &amp; iterations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleNewProject}>
            New Project
          </Button>
          {activeProject && (
            <Button variant="secondary" size="sm" onClick={handleExportJson}>
              Export JSON
            </Button>
          )}
        </div>
      </div>

      {/* Project selector */}
      {mounted && projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Projects</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setOutput("");
                    setConfirmDeleteId(null);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    activeProjectId === p.id
                      ? "bg-indigo-600/20 text-indigo-400"
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
        </Card>
      )}

      {activeProject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Prompt Editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prompt Editor</CardTitle>
              </CardHeader>

              {/* Title */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-medium block mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={activeProject.title}
                  onChange={(e) => updateCurrent("title", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="Project name"
                />
              </div>

              {/* System */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-medium block mb-1">
                  System Message
                </label>
                <textarea
                  value={activeProject.current.system}
                  onChange={(e) => updateCurrent("system", e.target.value)}
                  placeholder="You are a helpful assistant that..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:outline-none min-h-[120px] resize-y font-mono"
                />
              </div>

              {/* User */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-medium block mb-1">
                  User Prompt
                </label>
                <textarea
                  value={activeProject.current.user}
                  onChange={(e) => updateCurrent("user", e.target.value)}
                  placeholder="Analyze the following text and..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:outline-none min-h-[120px] resize-y font-mono"
                />
              </div>

              {/* Variables */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-500 font-medium">Variables</label>
                  <Button variant="ghost" size="sm" onClick={addVariable}>
                    + Add
                  </Button>
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
                          className="w-1/3 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:outline-none font-mono"
                        />
                        <input
                          value={v.value}
                          onChange={(e) => setVariableField(i, "value", e.target.value)}
                          placeholder="value"
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:outline-none font-mono"
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

              <Button onClick={handleRunSimulation}>Run Simulation</Button>
            </Card>

            {/* Version Save */}
            <Card>
              <div className="flex items-center gap-2">
                <input
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                  placeholder="Version note (optional)"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                />
                <Button variant="secondary" onClick={handleSaveVersion}>
                  Save Version
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT: Output + Versions */}
          <div className="space-y-4">
            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Output Simulator</CardTitle>
              </CardHeader>
              {output ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-white/5 rounded-lg p-4 max-h-[400px] overflow-y-auto font-mono">
                  {output}
                </pre>
              ) : (
                <div className="text-sm text-gray-600 py-8 text-center">
                  Click &quot;Run Simulation&quot; to generate output
                </div>
              )}
            </Card>

            {/* Version History */}
            {activeProject.versions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Version History ({activeProject.versions.length})
                  </CardTitle>
                </CardHeader>
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
                          {mounted ? new Date(v.createdAt).toLocaleString() : ""}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestoreVersion(v)}
                      >
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
