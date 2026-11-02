import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Loader2,
  Lock,
} from 'lucide-react';
import api, { apiError, quizRef } from '../lib/api';
import { fmtClock } from '../lib/strings';

/**
 * Quiz screen — one question at a time, question navigator, submit.
 * Flow (all real endpoints):
 *   1. POST /api/quizzes/modules/{moduleId} -> QuizResponse (idempotent: returns
 *      the existing quiz once generated)
 *   2. POST /api/quizzes/{quizId}/attempts/start -> {attemptId, quizId, startedAt}
 *      (starts the server-side attempt used to compute timeTakenSeconds)
 *   3. POST /api/quizzes/{quizId}/submit {answers:[{questionId, selectedIndex}]}
 *
 * Design elements NOT rendered (no backend support): countdown timer/time limit,
 * bookmarking. Answers are sent as {questionId, selectedIndex} — no positions.
 */
export default function QuizPage() {
  const { syllabusId, moduleId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [lockError, setLockError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 1. Fetch or generate the quiz for this module.
        const { data: quizData } = await api.post(`/api/quizzes/modules/${moduleId}`);
        if (cancelled) return;
        setQuiz(quizData);
        quizRef.set(moduleId, quizData.quizId);
        // 2. Start (or resume) the attempt so the backend can time it.
        try {
          await api.post(`/api/quizzes/${quizData.quizId}/attempts/start`);
          if (!cancelled) setElapsed(0);
        } catch (startErr) {
          if (!cancelled) setError(`Could not start the attempt: ${apiError(startErr)}`);
        }
      } catch (e) {
        if (cancelled) return;
        const msg = apiError(e);
        setError(msg);
        if (e.response?.status === 409) setLockError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  useEffect(() => {
    if (!quiz) return undefined;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [quiz]);

  if (lockError)
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card flex flex-col items-center gap-3 px-8 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <Lock size={26} />
          </span>
          <h2 className="text-xl font-extrabold text-ink">Quiz locked</h2>
          <p className="max-w-sm text-sm text-slate-500">{lockError}</p>
          <Link to={`/paths/${syllabusId}`} className="btn-ghost mt-2">
            <ChevronLeft size={16} /> Back to path
          </Link>
        </div>
      </div>
    );

  if (error && !quiz)
    return (
      <div className="mx-auto max-w-3xl">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      </div>
    );

  if (!quiz)
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="animate-spin text-brand-600" size={36} />
        <p className="text-sm">Preparing your quiz (AI-generated on first run)…</p>
      </div>
    );

  const question = quiz.questions[current];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === quiz.questions.length;
  const percent = Math.round((answeredCount / quiz.questions.length) * 100);
  const currentAnswer = answers[question.id];
  const isLast = current === quiz.questions.length - 1;

  const select = (idx) => setAnswers((a) => ({ ...a, [question.id]: idx }));

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      // 3. Submit keyed by questionId -> server scores and returns the full review.
      await api.post(`/api/quizzes/${quiz.quizId}/submit`, {
        answers: quiz.questions.map((q) => ({
          questionId: q.id,
          selectedIndex: answers[q.id],
        })),
      });
      navigate(`/paths/${syllabusId}/modules/${moduleId}/quiz/results`, {
        state: { justSubmitted: true },
      });
    } catch (e) {
      setError(apiError(e));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/paths" className="hover:text-ink">My Paths</Link>
        <span>›</span>
        <Link to={`/paths/${syllabusId}`} className="hover:text-ink">Path</Link>
        <span>›</span>
        <span className="text-ink">Module Quiz</span>
        <span>›</span>
        <span className="text-brand-600">In progress</span>
      </nav>

      {/* Header */}
      <div className="card p-6">
        <span className="chip bg-brand-100 text-brand-700">Assessment</span>
        <h1 className="mt-3 text-2xl font-extrabold text-ink">{quiz.title || 'Module Quiz'}</h1>
        {quiz.description && (
          <p className="mt-1 text-sm text-slate-500">{quiz.description}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
          <span>Pass mark: {quiz.passMarkPercent ?? 70}%</span>
          <span>{quiz.questions.length} questions</span>
          <span className="flex items-center gap-1.5 text-brand-600">
            <Check size={13} /> {answeredCount} answered
          </span>
          <span className="ml-auto tabular-nums text-slate-400">
            ⏱ {fmtClock(elapsed)} <span className="font-normal">(not enforced)</span>
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-brand-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="card mt-6 p-8">
        <p className="text-xs font-bold text-slate-400">
          Question {current + 1} of {quiz.questions.length}
        </p>
        <h2 className="mt-2 text-xl font-bold text-ink">{question.questionText}</h2>

        <div className="mt-6 space-y-3">
          {['optionA', 'optionB', 'optionC', 'optionD'].map((field, idx) => {
            const selected = currentAnswer === idx;
            return (
              <button
                key={field}
                onClick={() => select(idx)}
                className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition ${
                  selected
                    ? 'border-brand-600 bg-brand-100/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                    selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {['A', 'B', 'C', 'D'][idx]}
                </span>
                <span className="text-sm font-semibold text-ink">{question[field]}</span>
                {selected && <Check size={18} className="ml-auto text-brand-600" />}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="btn-ghost"
          >
            <ArrowLeft size={16} /> Previous
          </button>
          {isLast ? (
            <button onClick={submit} disabled={!allAnswered || submitting} className="btn-primary">
              {submitting ? 'Submitting…' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrent(current + 1)}
              disabled={currentAnswer === undefined}
              className="btn-dark"
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Navigator */}
      <div className="card mt-6 flex flex-wrap items-center gap-3 p-5">
        <span className="text-sm font-bold text-ink">Question Navigator</span>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((q, i) => {
            const answered = answers[q.id] !== undefined;
            return (
              <button
                key={q.id}
                onClick={() => setCurrent(i)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                  i === current
                    ? 'bg-ink text-white ring-2 ring-ink/20'
                    : answered
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <span className="ml-auto text-[11px] text-slate-400">
          <span className="font-bold text-brand-600">●</span> Answered{' '}
          <span className="font-bold text-ink">●</span> Current{' '}
          <span className="font-bold text-slate-300">●</span> Unvisited
        </span>
      </div>
    </div>
  );
}
