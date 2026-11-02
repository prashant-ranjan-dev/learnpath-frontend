import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Code2,
  ListChecks,
  Sparkles,
  Target,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const HIGHLIGHTS = [
  {
    icon: Target,
    title: 'A path built around your goal',
    description:
      'Turn what you want to learn into a focused journey, instead of guessing what to study next.',
  },
  {
    icon: BookOpen,
    title: 'Lessons that build on each other',
    description:
      'Follow structured topics and put your knowledge to work with quizzes along the way.',
  },
  {
    icon: ListChecks,
    title: 'Progress you can actually see',
    description:
      'Keep track of completed lessons, quiz results, and how far you have come.',
  },
];

const LEARNER_INITIALS = [
  { initials: 'JD', color: 'bg-blue-100 text-blue-700' },
  { initials: 'SK', color: 'bg-rose-100 text-rose-700' },
  { initials: 'AM', color: 'bg-emerald-100 text-emerald-700' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-ink">
      <header className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-5 px-5 lg:px-8">
        <Link to="/" aria-label="LearnPath AI home" className="shrink-0">
          <BrandLogo className="w-36 sm:w-40" />
        </Link>

        <Link
          to="/signup"
          className="btn-dark shrink-0 px-5 py-2.5 text-xs sm:text-sm"
        >
          Get Started <ArrowRight size={16} />
        </Link>
      </header>

      <main>
        <section
          id="hero"
          className="landing-dots mx-auto grid min-h-[calc(100svh-72px)] max-w-[1440px] items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-12"
        >
          <div className="relative z-10 max-w-[590px]">
            <span className="inline-flex max-w-[220px] items-start gap-2 rounded-full border border-amber-200/80 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase leading-[1.35] tracking-wide text-amber-800/70">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-amber-500" />
              No more random tutorials
            </span>

            <h1 className="mt-6 text-[clamp(2.65rem,5.1vw,3.55rem)] font-extrabold leading-[1.13] tracking-[-0.045em] text-slate-950">
              Turn Your
              <br />
              Learning Goals
              <br />
              into a{' '}
              <span className="inline-block rounded-xl bg-gradient-to-r from-yellow-300 to-amber-400 px-3 py-1 shadow-[0_8px_18px_rgba(234,179,8,0.2)]">
                Clear Path
              </span>
            </h1>

            <p className="mt-5 max-w-[540px] text-base leading-[1.65] text-slate-600 sm:text-[17px]">
              LearnPath AI creates a personalized learning journey with
              structured lessons, quizzes and real progress so you can actually
              master what you learn.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="btn-dark px-7 py-3.5 text-sm shadow-[0_8px_18px_rgba(15,23,42,0.16)]"
              >
                Create My Learning Path <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-500 transition hover:text-ink"
              >
                Log in
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2" aria-label="Learners">
                {LEARNER_INITIALS.map(({ initials, color }) => (
                  <span
                    key={initials}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold ${color}`}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <p className="text-xs font-medium text-slate-500 sm:text-[13px]">
                Join learners building their future with LearnPath AI
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px] lg:mr-6 lg:translate-y-2">
            <div className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.13)]">
              <img
                src="/learning-journey.jpg"
                alt="A young learner exploring new ideas on a laptop"
                className="aspect-square w-full object-cover"
              />
            </div>

            <div className="absolute -top-3 right-2 flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-extrabold uppercase leading-tight text-slate-800 shadow-card sm:right-4">
              Your
              <br />
              Goal
              <Target size={15} className="text-rose-500" />
            </div>
            <span className="absolute right-0 top-[12%] rounded-lg bg-amber-400 px-3 py-1.5 text-[10px] font-extrabold uppercase text-slate-950 shadow-card sm:-right-2">
              Job ready
            </span>
            <span className="absolute -right-2 top-[25%] hidden max-w-16 text-center text-[10px] font-extrabold uppercase leading-[1.25] text-emerald-700 sm:block">
              Learn
              <br />
              Practice
              <br />
              Improve
              <br />
              Grow
            </span>
            <span className="absolute right-[13%] top-[36%] rounded-md border border-amber-300 bg-amber-100/95 px-3 py-1.5 text-[9px] font-extrabold uppercase leading-tight text-amber-950 shadow-card">
              Practice &amp;
              <br />
              quizzes
            </span>
            <span className="absolute -right-3 top-[48%] flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-card">
              <Code2 size={16} />
            </span>
            <span className="absolute bottom-[18%] right-[8%] rounded-md border border-amber-300 bg-amber-300/95 px-3 py-1.5 text-[9px] font-extrabold uppercase leading-tight text-amber-950 shadow-card">
              Structured
              <br />
              lessons
            </span>
            <span className="absolute bottom-[10%] left-[5%] rounded-full border border-rose-200 bg-rose-50/95 px-4 py-2 text-[9px] font-extrabold uppercase leading-tight text-rose-700 shadow-card">
              Personalized
              <br />
              curriculum
            </span>
            <span className="absolute -bottom-3 right-2 rounded-xl bg-amber-400 px-3 py-2 text-center text-[9px] font-extrabold uppercase leading-tight text-slate-950 shadow-card sm:-right-3">
              Same you
              <br />
              but more skilled
            </span>
          </div>
        </section>

        <section
          id="highlights"
          className="scroll-mt-8 bg-canvas px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="chip bg-brand-100 text-brand-700">Feature highlights</span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
                Everything you need to keep moving forward
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                A simple, connected way to turn your ambition into steady progress.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                <article key={title} className="card p-6 sm:p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <Icon size={21} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold leading-7 text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs text-slate-400">
        © 2026 LearnPath AI
      </footer>
    </div>
  );
}
