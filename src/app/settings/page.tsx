"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import {
  exportMasteryData,
  exportMasteryMarkdown,
  resetMasteryData,
  migrateFromV1,
} from "@/core/storage/mastery";

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
    setToast("JSON exported!");
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
    setToast("Markdown exported!");
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetMasteryData();
    migrateFromV1();
    setConfirmReset(false);
    setToast("All data has been reset. Refresh the page.");
  };

  const handleMigrate = () => {
    migrateFromV1();
    setToast("Migration complete. Old v1 data cleared.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-gray-400">Manage your data and configuration</p>
      </div>

      <Card>
        <CardHeader><CardTitle>About</CardTitle></CardHeader>
        <p className="text-sm text-gray-400">
          AI Mastery OS is a competency certification engine for applied AI operators.
          Progress is based on demonstrated capability through performance-based challenges.
          Every certification produces a portfolio-grade artifact.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
          <span>Pass threshold: 80% default</span>
          <span>•</span>
          <span>No MCQs</span>
          <span>•</span>
          <span>Labs &gt; Theory</span>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Export Data</CardTitle></CardHeader>
        <p className="text-sm text-gray-400 mb-3">
          Download all progress, certifications, and artifacts.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportJson}>Export JSON</Button>
          <Button variant="secondary" onClick={handleExportMarkdown}>Export Markdown</Button>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Migration</CardTitle></CardHeader>
        <p className="text-sm text-gray-400 mb-3">
          If you had data from the v1 system, clear it here.
        </p>
        <Button variant="ghost" size="sm" onClick={handleMigrate}>
          Clear v1 Data
        </Button>
      </Card>

      <Card className="border-red-500/20">
        <CardHeader><CardTitle className="text-red-400">Danger Zone</CardTitle></CardHeader>
        <p className="text-sm text-gray-400 mb-3">
          This will permanently delete all certifications, artifacts, and progress.
          This action cannot be undone.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="danger" onClick={handleReset}>
            {confirmReset ? "Click again to confirm reset" : "Reset All Data"}
          </Button>
          {confirmReset && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
          )}
        </div>
      </Card>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
