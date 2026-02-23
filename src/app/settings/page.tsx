"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { STORAGE_KEYS } from "@/core/storage";

export default function SettingsPage() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactLayout, setCompactLayout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReducedMotionToggle = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    if (newValue) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  };

  const handleCompactLayoutToggle = () => {
    const newValue = !compactLayout;
    setCompactLayout(newValue);
    if (newValue) {
      document.documentElement.classList.add("compact");
    } else {
      document.documentElement.classList.remove("compact");
    }
  };

  const handleExport = () => {
    const data: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([key, value]) => {
      try {
        const item = localStorage.getItem(value);
        if (item) {
          data[key] = JSON.parse(item);
        }
      } catch {
        // Skip invalid items
      }
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amo_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Silent fail
      }
    });

    // Clear additional keys
    try {
      localStorage.removeItem("amo_previous_operator_score");
      localStorage.removeItem("amo_flagged_drills");
      localStorage.removeItem("ai_mastery_arena_attempts");
      localStorage.removeItem("ai_mastery_lab_projects");
    } catch {
      // Silent fail
    }

    window.location.href = "/";
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-gray-400">Data management and system configuration.</p>
      </div>

      {/* Display Section */}
      <Card className="card-elevated">
        <div className="p-6 space-y-4">
          <h2 className="t-heading">Display</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="t-body">Reduced motion</div>
              <div className="text-xs text-[var(--text-secondary)]">Minimize animations</div>
            </div>
            <button
              onClick={handleReducedMotionToggle}
              className="relative w-[44px] h-[24px] rounded-full border border-[var(--border-default)] cursor-pointer transition-colors"
              style={{ background: reducedMotion ? "var(--accent)" : "var(--bg-elevated)" }}
            >
              <div
                className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white transition-all"
                style={{ 
                  left: reducedMotion ? "22px" : "2px",
                  transitionDuration: "var(--t-fast)"
                }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="t-body">Compact layout</div>
              <div className="text-xs text-[var(--text-secondary)]">Reduce padding</div>
            </div>
            <button
              onClick={handleCompactLayoutToggle}
              className="relative w-[44px] h-[24px] rounded-full border border-[var(--border-default)] cursor-pointer transition-colors"
              style={{ background: compactLayout ? "var(--accent)" : "var(--bg-elevated)" }}
            >
              <div
                className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white transition-all"
                style={{ 
                  left: compactLayout ? "22px" : "2px",
                  transitionDuration: "var(--t-fast)"
                }}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Data Section */}
      <Card className="card-elevated">
        <div className="p-6 space-y-4">
          <h2 className="t-heading">Data</h2>
          
          <div>
            <p className="t-body mb-3">Download your complete progress data as JSON.</p>
            <Button variant="secondary" onClick={handleExport}>
              Export Progress Data →
            </Button>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <p className="t-body mb-3">Permanently delete all progress. This cannot be undone.</p>
            {!confirmReset ? (
              <Button variant="ghost" onClick={handleReset} className="text-[var(--danger-text)]">
                Reset All Data
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleReset} className="bg-[var(--danger-bg)] text-[var(--danger-text)]">
                  Yes, Delete Everything
                </Button>
                <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* About Section */}
      <Card className="card-elevated">
        <div className="p-6 space-y-4">
          <h2 className="t-heading">About</h2>
          <p className="t-body">
            AI Mastery OS · MVP · Local-first. No account required. All data stored in your browser.
          </p>
          
          <div className="pt-4 border-t border-[var(--border-default)]">
            <div className="t-label mb-3">KEYBOARD SHORTCUTS</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="t-mono">⌘↵</span>
                <span className="t-body">Submit answer</span>
              </div>
              <div className="flex justify-between">
                <span className="t-mono">→</span>
                <span className="t-body">Next question</span>
              </div>
              <div className="flex justify-between">
                <span className="t-mono">Esc</span>
                <span className="t-body">Exit drill</span>
              </div>
              <div className="flex justify-between">
                <span className="t-mono">1-4</span>
                <span className="t-body">Select answer option</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
