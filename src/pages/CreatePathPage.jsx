import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Lightbulb, Loader2 } from 'lucide-react';
import api, { apiError } from '../lib/api';

const POPULAR_TOPICS = ['Java', 'Python', 'Web Development', 'Spring Boot', 'Data Science', 'DSA', 'System Design'];
const LEVELS = ['Beginner', 'Intermediate', 'Pro'];
const GOAL_SUGGESTIONS = ['Career switch', 'Build a project', 'Exam preparation', 'General knowledge'];
const DEPTHS = [
  { label: 'Foundations', hint: 'Crash course' },
  { label: 'Proficient', hint: 'Solid working knowledge' },
  { label: 'Mastery', hint: 'Deep mastery' },
];
const STEPS = ['Topic', 'Your Level', 'Learning Goal', 'Depth Level', 'Review'];

/**
 * 5-step wizard -> POST /api/syllabus {topic, currentUnderstanding, depthLevel, goal}.
 * Values are sent as the UI labels ("Beginner", "Foundations", …) — the backend
 * maps them (mapCurrentUnderstanding / mapDepthLevel).
 */
export default function CreatePathPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [depth, setDepth] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const canNext =
    (step === 0 && topic.trim()) ||
    (step === 1 && level) ||
    (step === 2 && goal.trim()) ||
    (step === 3 && depth) ||
    step === 4;

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await api.post('/api/syllabus', {
        topic: topic.trim(),
        currentUnderstanding: level,
        depthLevel: depth,
        goal: goal.trim(),
      });
      navigate(`/paths/${data.syllabusId}`);
    } catch (e) {
      setError(apiError(e));
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 size={48} className="animate-spin text-brand-600" />
        <h2 className="text-2xl font-extrabold text-ink">Building your learning path…</h2>
        <p className="max-w-sm text-sm text-slate-500">
          Our AI is structuring modules, topics and quizzes for “{topic}”.
          This usually takes under a minute.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="card p-8">
        <span className="chip bg-brand-100 text-brand-700">
          ✨ AI-Powered Curriculum
        </span>
        <h1 className="mt-4 text-4xl font-extrabold text-ink">
          Let&apos;s create your personalized{' '}
          <span className="text-accent">learning path</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          Tell us a few details and our AI will generate a structured curriculum,
          milestone roadmap, and curated exercises just for you.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Step sidebar */}
        <div className="card h-fit p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Configuration Steps</h2>
            <span className="chip bg-slate-100 text-slate-600">
              {Math.min(step + 1, 5)} of 5
            </span>
          </div>
          <ol className="mt-4 space-y-2">
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={label}>
                  <button
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active ? 'bg-brand-100/60' : done ? 'hover:bg-slate-50' : ''
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? 'bg-brand-600 text-white'
                          : active
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {done ? <Check size={14} /> : i + 1}
                    </span>
                    <span>
                      <span className={`block text-sm font-bold ${active ? 'text-ink' : 'text-slate-600'}`}>
                        {label}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {i === 1 && 'Beginner, Intermediate, Pro'}
                        {i === 3 && 'Crash course vs Deep mastery'}
                        {i === 4 && 'Syllabus overview & generation'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 rounded-xl bg-brand-100/60 p-4 text-xs text-slate-600">
            <p className="flex items-center gap-1 font-bold text-brand-700">
              <Lightbulb size={13} /> Pro tip
            </p>
            Specific topics like “Spring Boot 3 REST APIs” yield significantly more
            actionable exercises than broad terms.
          </div>
        </div>

        {/* Step panel */}
        <div className="card p-8">
          {step === 0 && (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Step 1 of 5</p>
              <h2 className="mt-1 text-2xl font-extrabold text-ink">What do you want to learn?</h2>
              <p className="mt-1 text-sm text-slate-500">Enter a topic, technology or skill to get started.</p>
              <label className="label mt-6" htmlFor="topic">Topic or keyword</label>
              <input
                id="topic"
                className="input"
                placeholder="e.g. Spring Boot"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Popular topics</span>
                <span className="text-xs text-slate-400">Click to apply</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className={`chip border px-4 py-2 text-sm transition ${
                      topic === t
                        ? 'border-ink bg-ink text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t} {topic === t && '✓'}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Step 2 of 5</p>
              <h2 className="mt-1 text-2xl font-extrabold text-ink">What&apos;s your current level?</h2>
              <p className="mt-1 text-sm text-slate-500">Be honest — the AI adapts the explanations to this.</p>
              <div className="mt-6 grid gap-3">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`rounded-xl border px-5 py-4 text-left text-sm font-bold transition ${
                      level === l
                        ? 'border-brand-600 bg-brand-100/50 text-ink ring-2 ring-brand-500/30'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Step 3 of 5</p>
              <h2 className="mt-1 text-2xl font-extrabold text-ink">What&apos;s your learning goal?</h2>
              <p className="mt-1 text-sm text-slate-500">A sentence is enough.</p>
              <label className="label mt-6" htmlFor="goal">Learning goal</label>
              <textarea
                id="goal"
                rows={4}
                className="input"
                placeholder="e.g. Build REST APIs with Spring Boot for my next job"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {GOAL_SUGGESTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className="chip border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Step 4 of 5</p>
              <h2 className="mt-1 text-2xl font-extrabold text-ink">How deep do you want to go?</h2>
              <p className="mt-1 text-sm text-slate-500">Crash course vs deep mastery.</p>
              <div className="mt-6 grid gap-3">
                {DEPTHS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setDepth(d.label)}
                    className={`rounded-xl border px-5 py-4 text-left transition ${
                      depth === d.label
                        ? 'border-brand-600 bg-brand-100/50 ring-2 ring-brand-500/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm font-bold text-ink">{d.label}</span>
                    <span className="block text-xs text-slate-400">{d.hint}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Step 5 of 5</p>
              <h2 className="mt-1 text-2xl font-extrabold text-ink">Review &amp; generate</h2>
              <dl className="mt-6 space-y-3 text-sm">
                {[
                  ['Topic', topic],
                  ['Your level', level],
                  ['Learning goal', goal],
                  ['Depth level', depth],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <dt className="w-32 shrink-0 font-bold text-slate-500">{k}</dt>
                    <dd className="font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              {error && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
              )}
            </>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="btn-ghost"
            >
              <ArrowLeft size={16} /> Back
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext}
                className="btn-dark"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={generate} className="btn-primary">
                Generate My Path <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
