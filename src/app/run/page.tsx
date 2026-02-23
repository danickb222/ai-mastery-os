"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DrillDomain, AnyDrill, DrillResult } from "@/core/types/drills";
import { getDrillsByDomain, getDrillById, DRILLS } from "@/core/content/drills";
import { DOMAINS } from "@/core/content/domains";
import { DrillSession } from "@/components/drills/DrillSession";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getItem,
  setItem,
  STORAGE_KEYS,
} from "@/core/storage";

export default function RunPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <RunPageInner />
    </Suspense>
  );
}

function RunPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentDrill, setCurrentDrill] = useState<AnyDrill | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const drillId = searchParams.get("drill");
    const domain = searchParams.get("domain") as DrillDomain | null;

    if (drillId) {
      const drill = getDrillById(drillId);
      if (drill) {
        setCurrentDrill(drill);
      } else {
        router.push("/curriculum");
      }
    } else if (domain) {
      const drills = getDrillsByDomain(domain);
      if (drills.length > 0) {
        setCurrentDrill(drills[0]);
      } else {
        router.push("/curriculum");
      }
    } else {
      router.push("/curriculum");
    }

    setMounted(true);
  }, [searchParams, router]);

  const handleComplete = (result: DrillResult) => {
    if (!currentDrill) return;

    const drillHistory = getItem<DrillResult[]>(STORAGE_KEYS.DRILL_HISTORY) || [];
    drillHistory.push(result);
    setItem(STORAGE_KEYS.DRILL_HISTORY, drillHistory);

    const domainDrills = getDrillsByDomain(currentDrill.domain);
    const currentIndex = domainDrills.findIndex(d => d.id === currentDrill.id);
    
    if (currentIndex < domainDrills.length - 1) {
      const nextDrill = domainDrills[currentIndex + 1];
      router.push(`/run?drill=${nextDrill.id}`);
    } else {
      router.push("/curriculum");
    }
  };

  const handleExit = () => {
    router.push("/curriculum");
  };

  if (!mounted || !currentDrill) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-[var(--color-text-secondary)]">Loading drill...</div>
      </div>
    );
  }

  return <DrillSession drill={currentDrill} onComplete={handleComplete} onExit={handleExit} />;
}
