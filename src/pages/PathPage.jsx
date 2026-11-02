import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Loader2,
  Lock,
  Sparkles,
} from 'lucide-react';
import api, { apiError, quizRef } from '../lib/api';
import { fmtHours, pct } from '../lib/strings';

/**
 * Path curriculum screen (accordion modules over a progress hero).
 * Data: GET /api/syllabus/{id} -> {syllabusId, topic, modules:[{id, title,
 * estimatedHours, completed, unlocked, topics:[{id, name, completed}]}]}.
 *
 * Design elements rendered with derived data: module counts, "n of N topics
 * completed", continue-here highlighting. Design elements NOT rendered because
 * the backend has no source for them (per the gap analysis): path title /
 * description / skills, topic subtitles & durations, About/Resources tabs,
 * study-streak tip, overall percentage in the header.
 */
export default function PathPage() {
  const { syllabusId } = useParams();
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState(null);
  const [openModules, setOpenModules] = useState({});
  const [error, setError] = useState('');

  const loadSyllabus = useCallback(() => {
    api
      .get(`/api/syllabus/${syllabusId}`)
      .then(({ data }) => {
        setSyllabus(data);
        const firstOpen = {};
        const firstUnfinished =
          data.modules.find((m) => !(m.completed || m.unlocked === false)) || data.modules[0];
        if (firstUnfinished) firstOpen[firstUnfinished.id] = true;
        setOpenModules(firstOpen);
      })
      .catch((e) => setError(apiError(e)));
  }, [syllabusId]);

  useEffect(loadSyllabus, [loadSyllabus]);

  if (error)
    return (
      <div className="mx-auto max-w-3xl">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      </div>
    );
  if (!syllabus)
    return (
      <div className="flex min-h-[50vh] justify-center">
        <Loader2 className="mt-20 animate-spin text-brand-600" size={36} />
      </div>
    );

  const totalTopics = syllabus.modules.reduce((s, m) => s + m.topics.length, 0);
  const doneTopics = syllabus.modules.reduce(
    (s, m) => s + m.topics.filter((t) => t.completed).length,
    0
  );
  const percent = pct(totalTopics ? (doneTopics / totalTopics) * 100 : 0);

  /** First module that still has unfinished topics; null when everything is done. */
  const findContinue = () => {
    for (const m of syllabus.modules) {
      if (!m.completed) {
        const nextTopic = m.topics.find((t) => !t.completed);
        if (nextTopic) return { module: m, topic: nextTopic };
      }
    }
    return null;
  };

  const findQuizModule = () => {
    if (findContinue()) return null;
    return syllabus.modules.find((m) => !m.completed) || null;
  };

  const quizModule = findQuizModule();
  const continueTarget = findContinue();

  const toggle = (id) => setOpenModules((o) => ({ ...o, [id]: !o[id] }));

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero */}
      <div className="card overflow-hidden p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-brand-100 text-brand-700">
            <Sparkles size={13} /> AI-Generated Curriculum
          </span>
          <span className="chip bg-slate-100 text-slate-600">
            {percent}% completed
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-extrabold text-ink">{syllabus.topic}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {syllabus.modules.length} modules • {totalTopics} topics •{' '}
          {fmtHours(syllabus.modules.reduce((s, m) => s + (m.estimatedHours || 0), 0))} estimated
        </p>
        <p className="mt-1 text-sm font-semibold text-brand-600">
          {doneTopics} of {totalTopics} topics completed
        </p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {continueTarget && (
            <button
              onClick={() =>
                navigate(
                  `/paths/${syllabusId}/modules/${continueTarget.module.id}/topics/${continueTarget.topic.id}`
                )
              }
              className="btn-dark"
            >
              Continue Learning <ArrowRight size={16} />
            </button>
          )}
          {quizModule && (
            <button
              onClick={() => navigate(`/paths/${syllabusId}/modules/${quizModule.id}/quiz`)}
              className="btn-primary"
            >
              Take module quiz <ClipboardList size={16} />
            </button>
          )}
          <Link to="/progress" className="btn-ghost">
            <BarChart3 size={16} /> View Progress
          </Link>
        </div>
      </div>

      {/* Curriculum accordions */}
      <div className="mt-6 flex items-center gap-3">
        <h2 className="text-xl font-extrabold text-ink">Curriculum</h2>
        <span className="chip bg-slate-100 text-slate-600">{syllabus.modules.length}</span>
      </div>

      <div className="mt-4 space-y-4">
        {syllabus.modules.map((m, idx) => {
          const moduleTopics = m.topics.length;
          const moduleDone = m.topics.filter((t) => t.completed).length;
          const open = !!openModules[m.id];
          const nextTopic = m.topics.find((t) => !t.completed);

          return (
            <div key={m.id} className="card overflow-hidden">
              <button
                onClick={() => toggle(m.id)}
                className="flex w-full items-center gap-4 px-6 py-5 text-left"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                    m.completed
                      ? 'bg-brand-600 text-white'
                      : m.unlocked
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {m.completed ? <Check size={18} /> : String(idx + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-extrabold text-ink">
                    {m.title}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {moduleTopics} topics • {fmtHours(m.estimatedHours)}
                  </span>
                </span>
                {m.completed ? (
                  <span className="chip bg-brand-100 text-brand-700">Completed</span>
                ) : m.unlocked ? (
                  <span className="chip bg-indigo-50 text-indigo-600">In Progress</span>
                ) : (
                  <span className="chip flex items-center gap-1 bg-slate-100 text-slate-500">
                    <Lock size={12} /> Locked
                  </span>
                )}
                {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {open && (
                <div className="border-t border-slate-100 px-6 py-3">
                  {m.topics.map((t, tIdx) => {
                    const active = !t.completed && tIdx === 0;
                    return (
                      <div
                        key={t.id}
                        className={`flex items-center gap-4 rounded-xl px-3 py-3 ${
                          active ? 'bg-brand-100/40' : ''
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            t.completed
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {t.completed ? <Check size={14} /> : tIdx + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                          {t.name}
                        </span>
                        {!t.completed && tIdx === 0 && (
                          <span className="chip hidden bg-ink text-white sm:inline-flex">
                            Continue here
                          </span>
                        )}
                        {t.completed ? (
                          <Link
                            to={`/paths/${syllabusId}/modules/${m.id}/topics/${t.id}`}
                            className="btn-ghost px-4 py-1.5 text-xs"
                          >
                            Review
                          </Link>
                        ) : m.unlocked ? (
                          <Link
                            to={`/paths/${syllabusId}/modules/${m.id}/topics/${t.id}`}
                            className="btn-dark px-4 py-1.5 text-xs"
                          >
                            Start ›
                          </Link>
                        ) : (
                          <span className="flex h-5 w-5 rounded-full border-2 border-slate-200" />
                        )}
                      </div>
                    );
                  })}

                  {/* Quiz entry — backend gates it until all topics are completed */}
                  <div className="mt-2 flex items-center gap-4 rounded-xl bg-slate-50 px-3 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                      <ClipboardList size={14} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                      Module Quiz
                    </span>
                    {m.completed ? (
                      <button
                        onClick={async () => {
                          try {
                            const { data } = await api.post(`/api/quizzes/modules/${m.id}`);
                            quizRef.set(m.id, data.quizId);
                            navigate(`/paths/${syllabusId}/modules/${m.id}/quiz`);
                          } catch (e) {
                            setError(apiError(e));
                          }
                        }}
                        className="btn-dark px-4 py-1.5 text-xs"
                      >
                        Open quiz
                      </button>
                    ) : (
                      <span className="chip bg-slate-100 text-slate-500">
                        Complete all topics first
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
