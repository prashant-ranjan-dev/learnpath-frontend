import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Lock,
} from 'lucide-react';
import api, { apiError } from '../lib/api';

/**
 * Lesson reader for one topic.
 * Data: GET /api/topics/{topicId}/content -> {topicId, topicName, content}
 * (AI markdown, generated lazily on first view, cached by the backend)
 * and GET /api/syllabus/{syllabusId} for the sidebar.
 *
 * Design elements NOT rendered (no backend source): estimated time, tech tag,
 * difficulty pill, Notes/Discussion tabs. "Mark as Complete" ->
 * POST /api/topics/{topicId}/complete (204). The backend refuses with 409 if
 * the module is locked or the content was never loaded.
 */
export default function LessonPage() {
  const { syllabusId, moduleId, topicId } = useParams();
  const [content, setContent] = useState(null);
  const [contentError, setContentError] = useState('');
  const [lockedMsg, setLockedMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);
  const [syllabus, setSyllabus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setContent(null);
    setContentError('');
    setLockedMsg('');
    setJustCompleted(false);
    api
      .get(`/api/topics/${topicId}/content`)
      .then(({ data }) => !cancelled && setContent(data))
      .catch((e) => {
        if (cancelled) return;
        const msg = apiError(e);
        setContentError(msg);
        if (e.response?.status === 409) setLockedMsg(msg);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  useEffect(() => {
    api
      .get(`/api/syllabus/${syllabusId}`)
      .then(({ data }) => setSyllabus(data))
      .catch(() => {});
  }, [syllabusId, justCompleted]);

  const moduleData = syllabus?.modules.find((m) => String(m.id) === String(moduleId));
  const topicIndex = moduleData?.topics.findIndex((t) => String(t.id) === String(topicId)) ?? -1;
  const topic = topicIndex >= 0 ? moduleData.topics[topicIndex] : null;
  const prevTopic = topicIndex > 0 ? moduleData.topics[topicIndex - 1] : null;
  const nextTopic =
    topicIndex >= 0 && topicIndex < moduleData.topics.length - 1
      ? moduleData.topics[topicIndex + 1]
      : null;

  const markComplete = async () => {
    setCompleting(true);
    setCompleteError('');
    try {
      // POST /api/topics/{topicId}/complete -> 204 No Content
      await api.post(`/api/topics/${topicId}/complete`);
      setJustCompleted(true);
    } catch (e) {
      setCompleteError(apiError(e));
    } finally {
      setCompleting(false);
    }
  };

  const lessonLink = (t) =>
    `/paths/${syllabusId}/modules/${moduleId}/topics/${t.id}`;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/paths" className="hover:text-ink">My Paths</Link>
        <span>›</span>
        <Link to={`/paths/${syllabusId}`} className="hover:text-ink">
          {syllabus?.topic || 'Path'}
        </Link>
        <span>›</span>
        <span className="text-ink">{moduleData?.title || 'Module'}</span>
        <span>›</span>
        <span className="text-brand-600">{content?.topicName || 'Lesson'}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar: module outline */}
        {moduleData && (
          <aside className="card h-fit p-5 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-ink">{moduleData.title}</h3>
              <span className="chip bg-slate-100 text-slate-600">
                {moduleData.topics.filter((t) => t.completed).length}/{moduleData.topics.length} Done
              </span>
            </div>
            <ul className="mt-4 space-y-1">
              {moduleData.topics.map((t, i) => {
                const current = String(t.id) === String(topicId);
                return (
                  <li key={t.id}>
                    <Link
                      to={lessonLink(t)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        current
                          ? 'bg-ink text-white'
                          : t.completed
                            ? 'text-slate-600 hover:bg-slate-50'
                            : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                          t.completed
                            ? 'bg-brand-600 text-white'
                            : current
                              ? 'bg-white text-ink'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {t.completed ? <Check size={12} /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{t.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Module progress</span>
                <span>{moduleData.topics.filter((t) => t.completed).length}/{moduleData.topics.length}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-brand-500"
                  style={{
                    width: `${(moduleData.topics.filter((t) => t.completed).length / moduleData.topics.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </aside>
        )}

        {/* Reader */}
        <article className="card min-h-[60vh] p-8">
          {loading && (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="animate-spin text-brand-600" size={36} />
              <p className="text-sm">
                {content === null ? 'Preparing your lesson (AI-generated on first view)…' : 'Loading…'}
              </p>
            </div>
          )}

          {!loading && lockedMsg && (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <Lock size={26} />
              </span>
              <h2 className="text-xl font-extrabold text-ink">Module locked</h2>
              <p className="max-w-sm text-sm text-slate-500">{lockedMsg}</p>
              <Link to={`/paths/${syllabusId}`} className="btn-ghost mt-2">
                <ChevronLeft size={16} /> Back to path
              </Link>
            </div>
          )}

          {!loading && contentError && !lockedMsg && (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{contentError}</p>
            </div>
          )}

          {!loading && content && (
            <>
              <header className="border-b border-slate-100 pb-5">
                <h1 className="text-3xl font-extrabold text-ink">{content.topicName}</h1>
                {topic?.completed && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                    <CheckCircle2 size={14} /> Completed
                  </p>
                )}
              </header>

              <div className="lesson mt-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.content}</ReactMarkdown>
              </div>

              {completeError && (
                <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {completeError}
                </p>
              )}

              <footer className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                {prevTopic ? (
                  <Link to={lessonLink(prevTopic)} className="btn-ghost">
                    <ArrowLeft size={16} /> Previous
                  </Link>
                ) : (
                  <span />
                )}
                {topic && !topic.completed && !justCompleted ? (
                  <button onClick={markComplete} disabled={completing} className="btn-primary">
                    {completing ? (
                      'Saving…'
                    ) : (
                      <>
                        Mark as Complete <Check size={16} />
                      </>
                    )}
                  </button>
                ) : nextTopic ? (
                  <Link to={lessonLink(nextTopic)} className="btn-dark">
                    Next Lesson <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link to={`/paths/${syllabusId}`} className="btn-dark">
                    Back to path <ArrowRight size={16} />
                  </Link>
                )}
              </footer>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
