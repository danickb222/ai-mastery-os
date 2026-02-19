import type { Topic, Domain } from "../types/topic";
import { week01 } from "./weeks/week01";
import { week02 } from "./weeks/week02";
import { week03 } from "./weeks/week03";
import { week04 } from "./weeks/week04";
import { week05 } from "./weeks/week05";
import { week06 } from "./weeks/week06";
import { week07 } from "./weeks/week07";
import { week08 } from "./weeks/week08";
import { week09 } from "./weeks/week09";
import { week10 } from "./weeks/week10";
import { week11 } from "./weeks/week11";
import { week12 } from "./weeks/week12";
import { week13 } from "./weeks/week13";
import { week14 } from "./weeks/week14";
import { week15 } from "./weeks/week15";
import { week16 } from "./weeks/week16";
import { week17 } from "./weeks/week17";
import { week18 } from "./weeks/week18";
import { week19 } from "./weeks/week19";
import { week20 } from "./weeks/week20";
import { week21 } from "./weeks/week21";
import { week22 } from "./weeks/week22";
import { week23 } from "./weeks/week23";
import { week24 } from "./weeks/week24";

// All topics in curriculum order
export const topics: Topic[] = [
  ...week01, ...week02, ...week03, ...week04, ...week05, ...week06,
  ...week07, ...week08, ...week09, ...week10, ...week11,
  ...week12, ...week13, ...week14, ...week15, ...week16, ...week17, ...week18,
  ...week19, ...week20, ...week21, ...week22, ...week23, ...week24,
];

// Week lookup
export const weeks: Record<number, Topic[]> = {
  1: week01, 2: week02, 3: week03, 4: week04, 5: week05, 6: week06,
  7: week07, 8: week08, 9: week09, 10: week10, 11: week11,
  12: week12, 13: week13, 14: week14, 15: week15, 16: week16, 17: week17, 18: week18,
  19: week19, 20: week20, 21: week21, 22: week22, 23: week23, 24: week24,
};

// Phase lookup
export const phases: Record<number, { title: string; weeks: number[]; description: string }> = {
  1: { title: "Control the Model", weeks: [1, 2, 3, 4, 5, 6], description: "Design structured, constrained, robust prompts" },
  2: { title: "Make It Reliable", weeks: [7, 8, 9, 10, 11], description: "Evaluate and improve model outputs systematically" },
  3: { title: "Build Systems", weeks: [12, 13, 14, 15, 16, 17, 18], description: "Design real AI-powered systems" },
  4: { title: "Think Like an Operator", weeks: [19, 20, 21, 22, 23, 24], description: "Think architecturally and strategically" },
};

// Helpers
export function getTopicById(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}

export function getTopicsByDomain(domain: Domain): Topic[] {
  return topics.filter((t) => t.domain === domain);
}

export function getTopicsByWeek(weekNumber: number): Topic[] {
  return weeks[weekNumber] || [];
}

export function getTopicsByPhase(phase: number): Topic[] {
  return topics.filter((t) => t.phase === phase);
}

export function getPhaseForWeek(weekNumber: number): number {
  if (weekNumber <= 6) return 1;
  if (weekNumber <= 11) return 2;
  if (weekNumber <= 18) return 3;
  return 4;
}

export function getNextTopic(currentTopicId: string): Topic | undefined {
  const idx = topics.findIndex((t) => t.id === currentTopicId);
  if (idx === -1 || idx === topics.length - 1) return undefined;
  return topics[idx + 1];
}

export function getPreviousTopic(currentTopicId: string): Topic | undefined {
  const idx = topics.findIndex((t) => t.id === currentTopicId);
  if (idx <= 0) return undefined;
  return topics[idx - 1];
}
