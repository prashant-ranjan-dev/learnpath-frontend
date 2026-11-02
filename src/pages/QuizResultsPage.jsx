import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles, XCircle } from 'lucide-react';
import api, { apiError, quizRef } from '../lib/api';
import { fmtDuration } from '../lib/strings';

/**
 * Quiz results — GET /api/quizzes/{quizId}/result -> QuizResultResponse:
 * {score, totalQuestions, passed, correctAnswers, passMarkPercent,
 *  timeTakenSeconds, review:[{questionId, questionText, options, selectedAnswerIndex,
 *  correctAnswerIndex, correct, explanation}]}.
 * Also works when reopening the page later (no state needed).
 *
 * Design elements NOT rendered (no backend source): XP earned, "Up Next" module
 * card. The AI Tutor Insight teaser links to the real weakness analysis.
 */
export default function QuizResultsPage() {
  const { syllabusId, moduleId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [wrongByTopicCount, setWrongByTopicCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        // quizId was stored by the quiz screen; look it up via the module -> quiz
        // relationship using the stored ref (no GET-by-module endpoint exists).
        let quizId = quizRef.get(moduleId);
        if (!quizId) {
          setError('Open the quiz once after submitting so the result can be linked.');
          return;
        }
        const { data } = await api.get(`/api/quizzes/${quizId}/result`);
        setResult(data);
        // "N weak areas" teaser — computed client-side from the review,
        // no extra AI call.
        setWrongByTopicCount(data.review.filter((r) => !r.correct).length);
      } catch (e) {
        setError(apiError(e));
      }
    };
    load();
  }, [moduleId]);

  if (error && !result)
    return (
      <div className="mx-auto max-w-3xl">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      </div>
    );

  if (!result)
    return (
      <div className="flex min-h-[50vh] justify-center">
        <Loader2 className="mt-20 animate-spin text-brand-600" size={36} />
      </div>
    );

  const scorePercent = Math.round((result.score / result.totalQuestions) * 100);
  const incorrect = result.totalQuestions - result.score;

  return (
    <div className="mx-auto max-w-4xl">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/paths" className="hover:text-ink">My Paths</Link>
        <span>›</span>
        <Link to={`/paths/${syllabusId}`} className="hover:text-ink">Path</Link>
        <span>›</span>
        <span className="text-ink">Module Quiz</span>
        <span>›</span>
        <span className="text-brand-600">Results</span>
      </nav>

      {/* Score hero */}
      <div className="card p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <span
              className={`chip ${result.passed ? 'bg-brand-100 text-brand-700' : 'bg-amber-50 text-amber-700'}`}
            >
              🎉 Quiz Completed
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-ink">
              You scored {result.score} out of {result.totalQuestions}
            </h1>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              {result.passed
                ? 'Great job! You have a solid conceptual understanding of this module. A quick review will make you exam-ready.'
                : 'Close, but below the pass mark. Review the explanations below, then retry the quiz from the module page.'}
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Pass mark: {result.passMarkPercent ?? 70}% • Time taken:{' '}
              {fmtDuration(result.timeTakenSeconds ?? 0)}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <ProgressRing percent={scorePercent} passed={result.passed} />
            <span
              className={`chip mt-3 ${result.passed ? 'bg-brand-100 text-brand-700' : 'bg-amber-50 text-amber-700'}`}
            >
              {result.passed ? 'Passed' : 'Not passed'}
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Total Questions" value={result.totalQuestions} tone="slate" />
          <StatTile label="Correct Answers" value={result.score} tone="green" />
          <StatTile label="Incorrect" value={incorrect} tone="red" />
          <StatTile label="Time Taken" value={fmtDuration(result.timeTakenSeconds ?? 0)} tone="slate" small />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-6">
          <Link to={`/paths/${syllabusId}`} className="btn-ghost">
            <ArrowLeft size={16} /> Back to Module
          </Link>
          {incorrect > 0 && (
            <button
              onClick={() => navigate(`/paths/${syllabusId}/modules/${moduleId}/quiz/analysis`)}
              className="btn-dark"
            >
              <Sparkles size={16} /> Get AI Analysis <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Question breakdown */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-extrabold text-ink">Question Breakdown</h2>
          <p className="text-xs font-semibold text-slate-500">
            <span className="text-brand-600">● {result.score} Correct</span>{' '}
            <span className="text-red-500">● {incorrect} Missed</span>
          </p>
        </div>

        <div className="mt-4 space-y-4">
          {result.review.map((r, i) => (
            <div
              key={r.questionId}
              className={`card border-l-4 p-6 ${
                r.correct ? 'border-l-brand-500' : 'border-l-red-400 bg-red-50/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    r.correct ? 'bg-brand-600 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold text-ink">{r.questionText}</h3>
                    <span
                      className={`chip ml-auto ${
                        r.correct ? 'bg-brand-100 text-brand-700' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {r.correct ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {r.correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <p className="flex items-start gap-1.5 text-red-600">
                      <XCircle size={13} className="mt-0.5 shrink-0" />
                      <span>
                        <span className="font-bold">Your answer:</span>{' '}
                        <span className="rounded bg-red-50 px-1 font-mono font-semibold">
                          {optionLabel(r.selectedAnswerIndex)}
                        </span>{' '}
                        {r.options[r.selectedAnswerIndex]}
                      </span>
                    </p>
                    {!r.correct && (
                      <p className="flex items-start gap-1.5 text-brand-700">
                        <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                        <span>
                          <span className="font-bold">Correct answer:</span>{' '}
                          <span className="rounded bg-brand-100 px-1 font-mono font-semibold">
                            {optionLabel(r.correctAnswerIndex)}
                          </span>{' '}
                          {r.options[r.correctAnswerIndex]}
                        </span>
                      </p>
                    )}
                    {r.explanation && (
                      <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
                        <span className="font-bold">Why:</span> {r.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function optionLabel(i) {
  return ['A', 'B', 'C', 'D'][i] ?? '?';
}

function StatTile({ label, value, tone, small }) {
  const tones = {
    slate: 'bg-slate-50 text-ink',
    green: 'bg-brand-100/60 text-brand-700',
    red: 'bg-red-50 text-red-500',
  };
  return (
    <div className={`rounded-2xl px-4 py-5 text-center ${tones[tone]}`}>
      <p className={`font-extrabold ${small ? 'text-base' : 'text-2xl'}`}>{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide opacity-70">{label}</p>
    </div>
  );
}

function ProgressRing({ percent, passed }) {
  const stroke = 10;
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 128 128" className="h-36 w-36 -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={passed ? '#10B981' : '#F59E0B'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-ink">{percent}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Score</span>
      </div>
    </div>
  );
}
