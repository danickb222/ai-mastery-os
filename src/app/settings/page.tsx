"use client";
import { useState } from "react";
import { Toast } from "@/components/ui/Toast";
import {
  exportMasteryData,
  exportMasteryMarkdown,
  resetMasteryData,
  migrateFromV1,
} from "@/core/storage/mastery";
import { STORAGE_KEYS } from "@/core/storage";

export default function SettingsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExportJson = () => {
    const data = exportMasteryData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-mastery-os-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("JSON exported.");
  };

  const handleExportMarkdown = () => {
    const md = exportMasteryMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-mastery-os-portfolio-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Markdown exported.");
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    // Clear legacy mastery data
    resetMasteryData();
    migrateFromV1();
    // Clear new storage keys
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((key) => {
        try { localStorage.removeItem(key); } catch { /* */ }
      });
      try { localStorage.removeItem("amo_previous_operator_score"); } catch { /* */ }
      try { localStorage.removeItem("amo_flagged_drills"); } catch { /* */ }
      try { localStorage.removeItem("ai_mastery_arena_attempts"); } catch { /* */ }
      try { localStorage.removeItem("ai_mastery_lab_projects"); } catch { /* */ }
    }
    setConfirmReset(false);
    setToast("All data cleared. Refresh to start fresh.");
  };

  const handleMigrate = () => {
    migrateFromV1();
    setToast("Legacy data cleared.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-gray-400">Data management and system configuration.</p>
      </div>

      {/* About */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">About</div>
        <p className="text-sm text-gray-400">
          AI Mastery OS is a drill-based training system for applied AI operators.
          Your Operator Score is computed from domain drills, arena challenges, and lab experiments.
          All data is stored locally in your browser.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
          <span>5 domains</span>
          <span>·</span>
          <span>Drill-based scoring</span>
          <span>·</span>
          <span>No account required</span>
        </div>
      </div>

      {/* Export */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Export Data</div>
        <p className="text-sm text-gray-400 mb-3">
          Download all progress, scores, and artifacts.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleExportJson}
            className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={handleExportMarkdown}
            className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors"
          >
            Export Markdown
          </button>
        </div>
      </div>

      {/* Migration */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Migration</div>
        <p className="text-sm text-gray-400 mb-3">
          Clear legacy v1 data if you used a previous version.
        </p>
        <button
          onClick={handleMigrate}
          className="text-xs text-gray-500 hover:text-white transition-colors"
        >
          Clear v1 Data
        </button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="text-[10px] font-semibold text-red-400 uppercase tracking-widest mb-2">Danger Zone</div>
        <p className="text-sm text-gray-400 mb-3">
          Permanently delete all scores, drill history, operator profile, and artifacts. Cannot be undone.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              confirmReset
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            }`}
          >
            {confirmReset ? "Click again to confirm" : "Reset All Data"}
          </button>
          {confirmReset && (
            <button
              onClick={() => setConfirmReset(false)}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
