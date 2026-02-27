// src/lib/contracts/guards.ts

import type { DrillSpec } from '@/lib/contracts/drill';

export function detectPromptInjection(submission: string): { flagged: boolean; reasons: string[] } {
  const s = submission.toLowerCase();
  const reasons: string[] = [];

  const patterns: Array<[RegExp, string]> = [
    [/ignore (all|any) (previous|above) instructions/i, 'Attempts to override prior instructions'],
    [/system prompt/i, 'Mentions system prompt / attempts role escalation'],
    [/you are now the grading system/i, 'Attempts to impersonate evaluator'],
    [/give me (a )?100/i, 'Requests perfect score'],
    [/return json/i, 'Tries to control output format of evaluator'],
    [/do not follow the rubric/i, 'Attempts to bypass rubric'],
  ];

  for (const [re, reason] of patterns) {
    if (re.test(submission)) reasons.push(reason);
  }

  // also catch “developer message”, “jailbreak”, etc.
  if (s.includes('developer message') || s.includes('jailbreak')) {
    reasons.push('Mentions jailbreak/developer message');
  }

  return { flagged: reasons.length > 0, reasons };
}

/**
 * Robust evidence quote verification:
 * - Prefer exact substring match.
 * - If not found, attempt to validate by finding a sufficiently long chunk (>= 20 chars) inside the quote
 *   that DOES appear in the submission.
 *
 * This keeps evidence-based grading while avoiding brittle failures from minor truncation.
 */
export function assertEvidenceQuotesAreSubstrings(submission: string, evidenceQuotes: string[]): void {
  const haystack = submission;

  for (const quoteRaw of evidenceQuotes) {
    const quote = (quoteRaw ?? '').trim();
    if (!quote) throw new Error('Empty evidence quote');

    // 1) Exact match (ideal)
    if (haystack.includes(quote)) continue;

    // 2) If model truncated or slightly altered punctuation, try to find a long-enough chunk
    // Strategy: sliding window over the quote for a chunk that exists in submission.
    const minChunk = 20; // keeps it meaningful
    const normalizedQuote = quote.replace(/\s+/g, ' ').trim();

    let found = false;

    // Try longest-first chunks: start near full length, shrink down
    const maxLen = normalizedQuote.length;
    const minLen = Math.min(minChunk, maxLen);

    for (let len = maxLen; len >= minLen; len--) {
      // sample a few windows to keep it fast
      const step = Math.max(1, Math.floor(len / 5));
      for (let start = 0; start + len <= maxLen; start += step) {
        const chunk = normalizedQuote.slice(start, start + len).trim();
        if (chunk.length < minChunk) continue;
        if (haystack.includes(chunk)) {
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      throw new Error(`Evidence quotes not found in submission: "${quoteRaw}"`);
    }
  }
}

export function computeOverallScoreFromRubric(
  drill: DrillSpec,
  rubricScores: Array<{ rubricItemId: string; score: number }>
): number {
  // Sum scores; clamp 0..100
  const sum = rubricScores.reduce((acc, r) => acc + (Number.isFinite(r.score) ? r.score : 0), 0);
  return Math.max(0, Math.min(100, Math.round(sum)));
}