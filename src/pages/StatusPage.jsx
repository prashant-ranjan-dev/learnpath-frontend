import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react';
import api, { API_BASE_URL, store } from '../lib/api';
import { probe } from '../lib/strings';

/**
 * Setup Status — a live checklist that pings every backend endpoint the UI
 * depends on (backend_improvements branch) and reports pass/fail. Use it while
 * developing to see exactly which feature is not implemented yet.
 *
 * AI-backed calls (syllabus generation, quiz generation, weakness analysis) are
 * NOT probed automatically — they cost tokens/latency; test them from the UI.
 */
export default function StatusPage() {
  const [checks, setChecks] = useState(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(async () => {
    setRunning(true);
    const token = store.getToken();
    const auth = { Authorization: `Bearer ${token}` };

    const results = [];

    // 1. Public: POST /api/auth/login with a bogus user.
    const login = await probe(() =>
      api.post(
        '/api/auth/login',
        { email: 'probe@learnpath.test', password: 'wrong-password-1' },
        { skipAuth: true, skipAuthRedirect: true }
      )
    );
    results.push({
      group: 'Auth',
      endpoint: 'POST /api/auth/login',
      feature: 'Login (rejects bad credentials)',
      ...classify(login, [401, 400]), // 401/400 = reachable & handled correctly
    });

    // 2. Public: POST /api/auth/signup with a probe address (400 = reachable).
    const signup = await probe(() =>
      api.post('/api/auth/signup', { email: 'probe@learnpath.test', password: 'x'.repeat(8), name: 'Probe' })
    );
    results.push({
      group: 'Auth',
      endpoint: 'POST /api/auth/signup',
      feature: 'Signup',
      ...classify(signup, [400, 409]),
    });

    // 3. Protected: GET /api/user/profile (also validates the JWT filter).
    const profile = await probe(() => api.get('/api/user/profile'));
    results.push({
      group: 'User',
      endpoint: 'GET /api/user/profile',
      feature: 'Profile data (name, email)',
      ...classify(profile, [200]),
    });

    // 4. Protected: GET /api/user/dashboard
    const dash = await probe(() => api.get('/api/user/dashboard'));
    results.push({
      group: 'User',
      endpoint: 'GET /api/user/dashboard',
      feature: 'Dashboard aggregates',
      ...classify(dash, [200]),
      note: dash.ok ? `${dash.body?.recentLearningPaths?.length ?? 0} paths returned` : '',
    });

    // 5. Protected: GET /api/syllabus/my
    const my = await probe(() => api.get('/api/syllabus/my'));
    results.push({
      group: 'Syllabus',
      endpoint: 'GET /api/syllabus/my',
      feature: 'My learning paths list',
      ...classify(my, [200]),
      note: my.ok ? `${my.body?.length ?? 0} paths returned` : '',
    });

    // 6. Protected: POST /api/syllabus with a blank body — expects 400 (validation),
    // NOT 401/404. Proves the endpoint exists without invoking the AI.
    const gen = await probe(() => api.post('/api/syllabus', {}));
    results.push({
      group: 'Syllabus',
      endpoint: 'POST /api/syllabus',
      feature: 'AI path generation (validation probe only)',
      ...classify(gen, [400]),
      note: gen.ok ? 'Validation responding (AI not invoked)' : '',
    });

    // 7. Protected: GET /api/topics/999999/content — expects 404 (ownership/resource check).
    const content = await probe(() => api.get('/api/topics/999999/content'));
    results.push({
      group: 'Content',
      endpoint: 'GET /api/topics/{id}/content',
      feature: 'Lesson content (lazy AI)',
      ...classify(content, [404]),
    });

    // 8. Protected: POST /api/topics/999999/complete — expects 404.
    const complete = await probe(() => api.post('/api/topics/999999/complete'));
    results.push({
      group: 'Content',
      endpoint: 'POST /api/topics/{id}/complete',
      feature: 'Mark topic completed',
      ...classify(complete, [404]),
    });

    // 9. Protected: POST /api/quizzes/modules/999999 — expects 404.
    const quiz = await probe(() => api.post('/api/quizzes/modules/999999'));
    results.push({
      group: 'Quiz',
      endpoint: 'POST /api/quizzes/modules/{moduleId}',
      feature: 'Quiz fetch/generate',
      ...classify(quiz, [404]),
    });

    // 10. Protected: GET /api/quizzes/999999/result — expects 404.
    const qres = await probe(() => api.get('/api/quizzes/999999/result'));
    results.push({
      group: 'Quiz',
      endpoint: 'GET /api/quizzes/{quizId}/result',
      feature: 'Quiz result review',
      ...classify(qres, [404]),
    });

    // 11. Protected: POST /api/quizzes/999999/analyze — expects 404.
    const ana = await probe(() => api.post('/api/quizzes/999999/analyze'));
    results.push({
      group: 'Quiz',
      endpoint: 'POST /api/quizzes/{quizId}/analyze',
      feature: 'AI weakness analysis',
      ...classify(ana, [404]),
    });

    // 12. Protected: GET /api/quizzes/999999 — expects 404.
    const qget = await probe(() => api.get('/api/quizzes/999999'));
    results.push({
      group: 'Quiz',
      endpoint: 'GET /api/quizzes/{quizId}',
      feature: 'Fetch quiz by id',
      ...classify(qget, [404]),
    });

    // 13. Protected: POST /api/quizzes/999999/attempts/start — expects 404.
    const qstart = await probe(() => api.post('/api/quizzes/999999/attempts/start'));
    results.push({
      group: 'Quiz',
      endpoint: 'POST /api/quizzes/{quizId}/attempts/start',
      feature: 'Start attempt (attempt lifecycle)',
      ...classify(qstart, [404]),
    });

    setChecks(results);
    setRunning(false);
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const groups = [...new Set((checks || []).map((c) => c.group))];
  const passed = (checks || []).filter((c) => c.ok).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Setup Status</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live check of every backend endpoint this frontend depends on
            (<code className="rounded bg-slate-100 px-1">backend_improvements</code> @{' '}
            {API_BASE_URL}). AI-backed flows are tested from the UI, not here.
          </p>
        </div>
        <button onClick={run} disabled={running} className="btn-dark">
          {running ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Re-run checks
        </button>
      </div>

      {!checks && running && (
        <div className="card mt-6 flex items-center gap-3 p-6 text-sm text-slate-500">
          <Loader2 className="animate-spin text-brand-600" size={20} /> Pinging endpoints…
        </div>
      )}

      {checks && (
        <>
          <div className="card mt-6 flex items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-xl font-extrabold text-brand-700">
              {passed}/{checks.length}
            </div>
            <div>
              <p className="font-extrabold text-ink">Endpoint reachability</p>
              <p className="text-xs text-slate-500">
                “Reachable” = the endpoint exists and returns the expected status
                (including handled 400/401/404 errors — that proves the route is
                implemented). Network failures mean the backend is down or CORS is off.
              </p>
            </div>
          </div>

          {groups.map((g) => (
            <div key={g} className="card mt-4 overflow-hidden">
              <p className="border-b border-slate-100 bg-slate-50 px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                {g}
              </p>
              <ul className="divide-y divide-slate-100">
                {checks
                  .filter((c) => c.group === g)
                  .map((c) => (
                    <li key={c.endpoint} className="flex items-center gap-3 px-6 py-4">
                      {c.ok ? (
                        <CheckCircle2 size={18} className="shrink-0 text-brand-600" />
                      ) : (
                        <XCircle size={18} className="shrink-0 text-red-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink">{c.feature}</p>
                        <p className="font-mono text-xs text-slate-500">{c.endpoint}</p>
                      </div>
                      <span
                        className={`chip ${
                          c.ok ? 'bg-brand-100 text-brand-700' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {c.network ? 'backend unreachable' : `HTTP ${c.status}`}
                      </span>
                      {c.note && (
                        <span className="hidden text-xs text-slate-400 md:inline">{c.note}</span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          <div className="card mt-6 p-6">
            <h2 className="text-sm font-extrabold text-ink">
              Not implemented in the backend yet (no endpoint to call)
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
              <li>Streak, XP, activity log, time-spent tracking (dashboard tiles show 0s)</li>
              <li>Timeframe filters / study-hours chart on the Progress page (nothing time-stamped)</li>
              <li>Username, headline, bio, avatar, join date, password change, account deletion</li>
              <li>Weakness report persistence + severity/mastery fields (AI re-runs on every view)</li>
              <li>Path title/description/skills, topic subtitles & durations, About/Resources tabs</li>
              <li>Quiz countdown timer enforcement (attempt is timed server-side, no limit)</li>
              <li>Search, notifications, Explore, Notes, Settings pages (scoped out of v1)</li>
            </ul>
            <p className="mt-3 text-xs text-slate-400">
              Details: “LearnPath Backend Gap Analysis and Feature Checklist.md”.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/** A probe "passes" when the HTTP status proves the endpoint exists and is handled. */
function classify(result, acceptableStatuses) {
  if (result.network) return { ok: false, status: 0, network: true };
  const ok = acceptableStatuses.includes(result.status);
  return { ok, status: result.status };
}
