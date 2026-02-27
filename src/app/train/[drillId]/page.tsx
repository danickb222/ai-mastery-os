'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getDrillById, drillsDatabase } from '@/lib/drills/seed';
import type { EvaluationResult } from '@/lib/contracts/evaluation';
import { evaluateDrill } from '@/app/actions/evaluateDrill';

export default function TrainDrillPage() {
  const params = useParams<{ drillId: string }>();
  const drillId = params?.drillId;

  const drill = useMemo(() => getDrillById(drillId), [drillId]);

  const [submission, setSubmission] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!drill) {
    return (
      <div style={{ padding: 24, color: 'red' }}>
        <h2>Drill not found: {String(drillId)}</h2>
        <pre>Available drills: {Object.keys(drillsDatabase).join(', ')}</pre>
      </div>
    );
  }

  async function handleEvaluate() {
    if (!submission.trim() || !drill) return;

    setLoading(true);
    setError(null);

    try {
      const result = await evaluateDrill({
        drillId: drill.id,
        submission,
      });

      setEvaluation(result);
    } catch (e: any) {
      setError(e?.message ?? 'Evaluation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 30, fontWeight: 700 }}>{drill.title}</h1>

      <p style={{ marginTop: 12, opacity: 0.85 }}>{drill.scenario}</p>

      <h2 style={{ marginTop: 24 }}>Task</h2>
      <p>{drill.task}</p>

      <h2 style={{ marginTop: 24 }}>Deliverable</h2>
      <p>{drill.deliverableFormat}</p>

      <h2 style={{ marginTop: 24 }}>Constraints</h2>
      <ul>
        {drill.constraints.map((c) => (
          <li key={c} style={{ marginTop: 6 }}>
            {c}
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: 32 }}>Your Submission</h2>

      <textarea
        value={submission}
        onChange={(e) => setSubmission(e.target.value)}
        rows={14}
        placeholder="Write your system prompt here..."
        style={{
          width: '100%',
          marginTop: 12,
          padding: 14,
          borderRadius: 8,
          background: '#111',
          color: 'white',
          border: '1px solid #333',
          fontSize: 14,
        }}
      />

      <button
        onClick={handleEvaluate}
        disabled={loading}
        style={{
          marginTop: 16,
          padding: '10px 18px',
          borderRadius: 8,
          background: '#2563eb',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Evaluating...' : 'Evaluate Submission'}
      </button>

      {error && (
        <div style={{ marginTop: 16, color: 'red' }}>
          {error}
        </div>
      )}

      {evaluation && (
        <div style={{ marginTop: 32 }}>
          <h2>
            Score: <span style={{ fontWeight: 700 }}>{evaluation.overallScore}/100</span>
          </h2>

          <h3 style={{ marginTop: 24 }}>Rubric Breakdown</h3>
          {evaluation.rubricScores.map((r) => (
            <div key={r.rubricItemId} style={{ marginTop: 12 }}>
              <strong>{r.rubricItemId}</strong>: {r.score}
              <div style={{ opacity: 0.8 }}>{r.justification}</div>
            </div>
          ))}

          <h3 style={{ marginTop: 24 }}>Strengths</h3>
          <ul>
            {evaluation.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <h3 style={{ marginTop: 24 }}>Weaknesses</h3>
          <ul>
            {evaluation.weaknesses.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>

          <h3 style={{ marginTop: 24 }}>Missed Constraints</h3>
          <ul>
            {evaluation.missedConstraints.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>

          {evaluation.riskFlags.length > 0 && (
            <>
              <h3 style={{ marginTop: 24 }}>Risk Flags</h3>
              <ul>
                {evaluation.riskFlags.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </>
          )}

          <h3 style={{ marginTop: 24 }}>Revision Checklist</h3>
          <ol>
            {evaluation.revisionInstructions.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}