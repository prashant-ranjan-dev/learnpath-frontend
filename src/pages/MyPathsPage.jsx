
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  CirclePlay,
  Clock3,
  Loader2,
  Plus,
} from 'lucide-react';
import api, { apiError } from '../lib/api';
import EmptyState from '../components/EmptyState';
import { fmtHours, pct } from '../lib/strings';

export default function MyPathsPage() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    api
      .get('/api/syllabus/my')
      .then(({ data }) => {
        if (!cancelled) {
          setPaths(Array.isArray(data) ? data : []);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(apiError(e));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getPathStats = (path) => {
    const modules = Array.isArray(path.modules) ? path.modules : [];

    const totalTopics = modules.reduce(
      (sum, module) => sum + (module.topics?.length || 0),
      0
    );

    const completedTopics = modules.reduce(
      (sum, module) =>
        sum + (module.topics || []).filter((topic) => topic.completed).length,
      0
    );

    const estimatedHours = Number.isFinite(Number(path.totalEstimatedHours))
      ? Number(path.totalEstimatedHours)
      : modules.reduce(
          (sum, module) => sum + (Number(module.estimatedHours) || 0),
          0
        );

    const progress = pct(
      totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0
    );

    const status =
      totalTopics > 0 && completedTopics === totalTopics
        ? {
            label: 'Completed',
            className: 'bg-brand-100 text-brand-700',
          }
        : completedTopics > 0
          ? {
              label: 'In Progress',
              className: 'bg-indigo-50 text-indigo-600',
            }
          : {
              label: 'Ready to Start',
              className: 'bg-amber-50 text-amber-700',
            };

    return {
      modules,
      totalTopics,
      completedTopics,
      estimatedHours,
      progress,
      status,
    };
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">
            My Learning Paths
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Structured curricula crafted by LearnPath AI
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/create')}
          className="btn-dark"
        >
          <Plus size={16} /> Create Path
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {!paths && !error && (
        <div className="mt-10 flex justify-center">
          <Loader2
            className="animate-spin text-brand-600"
            size={36}
            aria-label="Loading learning paths"
          />
        </div>
      )}

      {paths && paths.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={<BookOpen size={26} />}
            title="No learning paths yet"
            hint="Describe what you want to learn and our AI will structure a full path with modules, topics and quizzes."
            action={
              <button
                type="button"
                onClick={() => navigate('/create')}
                className="btn-primary mt-2"
              >
                Create your first path
              </button>
            }
          />
        </div>
      )}

      {paths && paths.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paths.map((path) => {
            const stats = getPathStats(path);

            return (
              <Link
                key={path.syllabusId}
                to={`/paths/${path.syllabusId}`}
                className="card block p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <BookOpen size={20} />
                  </span>

                  <span className={`chip ${stats.status.className}`}>
                    {stats.status.label}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-extrabold text-ink">
                  {path.topic || 'Untitled Learning Path'}
                </h2>

                {path.description && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {path.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span>
                    {stats.modules.length}{' '}
                    {stats.modules.length === 1 ? 'module' : 'modules'}
                  </span>
                  <span>
                    {stats.totalTopics}{' '}
                    {stats.totalTopics === 1 ? 'topic' : 'topics'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={13} />
                    {fmtHours(stats.estimatedHours)} estimated
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Progress</span>
                  <span className="text-brand-600">{stats.progress}%</span>
                </div>

                <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-brand-500 transition-all"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>

                <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  {stats.progress === 100 && stats.totalTopics > 0 ? (
                    <>
                      <CheckCircle2
                        size={14}
                        className="text-brand-500"
                      />
                      Path completed
                    </>
                  ) : (
                    <>
                      <CirclePlay size={14} />
                      {stats.completedTopics} of {stats.totalTopics} topics completed
                    </>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
