import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Loader2, Plus } from 'lucide-react';
import api, { apiError } from '../lib/api';
import { pct } from '../lib/strings';

/**
 * Progress & Analytics — GET /api/user/dashboard -> DashboardResponse:
 * {totalLearningPaths, totalModules, completedModules, totalTopics,
 *  completedTopics, progressPercent, totalQuizAttempts, passedQuizAttempts,
 *  recentLearningPaths: [{syllabusId, topic, totalModules, completedModules,
 *                         totalTopics, completedTopics, progressPercent}]}.
 *
 * Design elements NOT rendered (no backend source): timeframe filters
 * (nothing time-stamped is stored), "Currently on: Module X", "Last active",
 * study-hours chart, milestones, Download Report.
 */
export default function ProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/user/dashboard')
      .then(({ data }) => setData(data))
      .catch((e) => setError(apiError(e)));
  }, []);

  const lifetimePercent = useMemo(() => pct(data?.progressPercent), [data]);

  if (error)
    return (
      <div className="mx-auto max-w-3xl">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex min-h-[50vh] justify-center">
        <Loader2 className="mt-20 animate-spin text-brand-600" size={36} />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Learning Progress &amp; Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your progress and completion across all generated learning paths.
          </p>
        </div>
        <button onClick={() => navigate('/create')} className="btn-dark">
          <Plus size={16} /> Generate New Path
        </button>
      </div>

      {/* Lifetime summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Overall Progress"
          value={`${lifetimePercent}%`}
          hint="across all paths"
        />
        <SummaryTile
          label="Topics Completed"
          value={`${data.completedTopics}/${data.totalTopics}`}
          hint="all time"
        />
        <SummaryTile
          label="Modules Completed"
          value={`${data.completedModules}/${data.totalModules}`}
          hint="all time"
        />
        <SummaryTile
          label="Quizzes Passed"
          value={`${data.passedQuizAttempts}/${data.totalQuizAttempts}`}
          hint="attempts passed"
        />
      </div>

      {/* Paths list */}
      <div className="card mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-ink">All Generated Learning Paths</h2>
            <p className="text-xs text-slate-400">
              Track progress, resume active curriculums, and manage your journeys.
            </p>
          </div>
          <span className="chip bg-slate-100 text-slate-600">
            {data.totalLearningPaths} paths generated
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {data.recentLearningPaths.length === 0 && (
            <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No learning paths yet — create your first one.
            </p>
          )}
          {data.recentLearningPaths.map((p) => {
            const percent = pct(p.progressPercent);
            const status =
              p.completedModules === 0
                ? { label: 'Ready to Start', cls: 'bg-amber-50 text-amber-700' }
                : p.completedModules === p.totalModules
                  ? { label: 'Completed', cls: 'bg-brand-100 text-brand-700' }
                  : { label: 'In Progress', cls: 'bg-indigo-50 text-indigo-600' };
            return (
              <div key={p.syllabusId} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <BarChart3 size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/paths/${p.syllabusId}`}
                        className="truncate text-base font-extrabold text-ink hover:text-brand-600"
                      >
                        {p.topic}
                      </Link>
                      <span className={`chip ${status.cls}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {p.totalModules} modules • {p.totalTopics} topics •{' '}
                      {p.completedTopics} completed
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/paths/${p.syllabusId}`)}
                    className="btn-dark px-5 py-2 text-xs"
                  >
                    Resume Path <ArrowRight size={14} />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-brand-500 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-24 text-right text-xs font-bold text-brand-600">
                    {percent}% completed
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, hint }) {
  return (
    <div className="card p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-ink">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
