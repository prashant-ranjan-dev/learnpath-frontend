import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import api, { apiError, quizRef } from '../lib/api';

/**
 * AI Weakness Analysis — POST /api/quizzes/{quizId}/analyze
 *   -> {weakTopics: [{topicName, reason, suggestion}]}.
 * POST (not GET): the first call asks the AI, and the response is NOT persisted
 * by the backend yet — every visit re-runs the AI (cost + latency). When the
 * result is empty the backend judged the attempt perfect (no AI call).
 *
 * Design elements NOT rendered (no backend fields — verified in WeakTopic.java):
 * priority tags, mastery %, wrong-vs-correct snippets, key rule, downstream
 * impact, hero stats, generated-at/model-version line, Download Summary PDF.
 */
export default function WeaknessPage() {
  const { syllabusId, moduleId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const quizId = quizRef.get(moduleId);
    if (!quizId) {
      setError('Open the quiz results once so the analysis can be linked to the attempt.');
      setLoading(false);
      return;
    }
    api
      .post(`/api/quizzes/${quizId}/analyze`)
      .then(({ data }) => setAnalysis(data))
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="animate-spin text-brand-600" size={36} />
        <p className="text-sm">Our AI is diagnosing your weak areas…</p>
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-3xl">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      </div>
    );

  const weak = analysis?.weakTopics || [];

  return (
    <div className="mx-auto max-w-5xl">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to={`/paths/${syllabusId}/modules/${moduleId}/quiz/results`} className="flex items-center gap-1 hover:text-ink">
          <ChevronLeft size={14} /> Back to Quiz Results
        </Link>
        <span>›</span>
        <span className="text-brand-600">AI Analysis</span>
      </nav>

      {/* Hero */}
      <div className="card p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-indigo-50 text-indigo-600">
            <Sparkles size={13} /> LearnPath AI Diagnostic
          </span>
          <span className="chip bg-red-50 text-red-600">
            <AlertTriangle size={13} /> {weak.length} focus {weak.length === 1 ? 'area' : 'areas'}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-ink">
          {weak.length === 0 ? 'No Weak Areas Detected 🎉' : 'AI Analysis: Areas to Improve'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          {weak.length === 0
            ? 'The analysis found no conceptual gaps in this attempt — every question was answered correctly. Nothing to reinforce right now.'
            : 'Based on your incorrect answers, our engine identified the conceptual gaps below. Review each one before moving on.'}
        </p>
      </div>

      {/* Diagnosis cards */}
      {weak.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-extrabold text-ink">Diagnosed Topics</h2>
          <p className="text-xs text-slate-400">Sorted by conceptual priority (AI ordering)</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {weak.map((w, i) => (
              <div key={i} className="card flex flex-col border-l-4 border-l-amber-400 p-6">
                <span className="chip w-fit bg-amber-50 text-amber-700">Needs Review</span>
                <h3 className="mt-3 text-base font-extrabold text-ink">{w.topicName}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  <span className="font-bold text-slate-700">What went wrong: </span>
                  {w.reason}
                </p>
                <div className="mt-4 rounded-xl bg-brand-100/50 px-4 py-3 text-sm text-slate-700">
                  <p className="font-bold text-brand-700">How to fix it</p>
                  <p className="mt-1">{w.suggestion}</p>
                </div>
                <Link
                  to={`/paths/${syllabusId}`}
                  className="mt-4 text-xs font-bold text-brand-600 hover:underline"
                >
                  Review the related lesson →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
