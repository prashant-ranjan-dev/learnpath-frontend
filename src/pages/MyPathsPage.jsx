import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, CirclePlay, Loader2, Plus } from 'lucide-react';
import api, { apiError } from '../lib/api';
import EmptyState from '../components/EmptyState';
import { pct } from '../lib/strings';

/** Left sidebar nav intentionally excludes Explore / Notes (out of scope for v1). */
export default function MyPathsPage() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // GET /api/syllabus/my -> SyllabusResponse[]
    api
      .get('/api/syllabus/my')
      .then(({ data }) => setPaths(data || []))
      .catch((e) => setError(apiError(e)));
  }, []);

  const statusOf = (p) => {
    const done = p.modules.filter((m) => m.completed).length;
    if (done === 0) return { label: 'Ready to Start', cls: 'bg-amber-50 text-amber-700' };
    if (done === p.modules.length) return { label: 'Completed', cls: 'bg-brand-100 text-brand-700' };
    return { label: 'In Progress', cls: 'bg-indigo-50 text-indigo-600' };
  };

  const percentOf = (p) => {
    const totalTopics = p.modules.reduce((s, m) => s + m.topics.length, 0);
    const doneTopics = p.modules.reduce(
      (s, m) => s + m.topics.filter((t) => t.completed).length,
      0
    );
    return pct(totalTopics ? (doneTopics / totalTopics) * 100 : 0);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">My Learning Paths</h1>
          <p className="mt-1 text-sm text-slate-500">
            Structured curricula crafted by LearnPath AI
          </p>
        </div>
        <button onClick={() => navigate('/create')} className="btn-dark">
          <Plus size={16} /> Create Path
        </button>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {!paths && !error && (
        <div className="mt-10 flex justify-center">
          <Loader2 className="animate-spin text-brand-600" size={36} />
        </div>
      )}

      {paths && paths.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={<BookOpen size={26} />}
            title="No learning paths yet"
            hint="Describe what you want to learn and our AI will structure a full path with modules, topics and quizzes."
            action={
              <button onClick={() => navigate('/create')} className="btn-primary mt-2">
                Create your first path
              </button>
            }
          />
        </div>
      )}

      {paths && paths.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paths.map((p) => {
            const st = statusOf(p);
            const percent = percentOf(p);
            return (
              <Link
                key={p.syllabusId}
                to={`/paths/${p.syllabusId}`}
                className="card block p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <BookOpen size={20} />
                  </span>
                  <span className={`chip ${st.cls}`}>{st.label}</span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-ink">{p.topic}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {p.modules.length} modules •{' '}
                  {p.modules.reduce((s, m) => s + m.topics.length, 0)} topics
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Progress</span>
                  <span className="text-brand-600">{percent}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-brand-500 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  {percent === 100 ? (
                    <>
                      <CheckCircle2 size={14} className="text-brand-500" /> Path completed
                    </>
                  ) : (
                    <>
                      <CirclePlay size={14} /> Open path
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
