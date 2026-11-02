
import { useEffect, useState } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function getProfileForm(user) {
  return {
    name: user?.name || '',
    username: user?.username || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
  };
}

function formatJoinDate(value) {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ProfilePage() {
  const { user, updateProfile, busy, error, setError } = useAuth();
  const [form, setForm] = useState(() => getProfileForm(user));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(getProfileForm(user));
  }, [user]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
    setSaved(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaved(false);

    if (await updateProfile(form)) {
      setSaved(true);
    }
  };

  const cancel = () => {
    setForm(getProfileForm(user));
    setError('');
    setSaved(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold text-ink">
        Profile &amp; Settings
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage your personal details and account identity.
      </p>

      {/* Profile summary */}
      <section
        className="card mt-6 overflow-hidden"
        aria-label="Profile summary"
      >
        <div className="h-28 bg-gradient-to-r from-brand-600 to-brand-400" />

        <div className="-mt-10 px-8 pb-8">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-brand-100 text-2xl font-extrabold text-brand-700 shadow-card">
            {(user?.name || 'L').charAt(0).toUpperCase()}
          </span>

          <h2 className="mt-3 text-xl font-extrabold text-ink">
            {user?.name || 'Learner'}
          </h2>

          {user?.headline && (
            <p className="mt-1 text-sm text-slate-600">
              {user.headline}
            </p>
          )}

          <p className="text-sm text-slate-500">{user?.email}</p>

          {user?.username && (
            <p className="mt-1 text-sm text-slate-500">
              @{user.username}
            </p>
          )}

          {user?.bio && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
              {user.bio}
            </p>
          )}

          <p className="mt-3 text-xs text-slate-400">
            Member since {formatJoinDate(user?.createdAt)}
          </p>
        </div>
      </section>

      {/* Learning statistics */}
      <section
        className="card mt-6 p-8"
        aria-label="Learning statistics"
      >
        <h3 className="text-lg font-extrabold text-ink">
          Learning Statistics
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Topics completed</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {Number(user?.stats?.topicsCompleted) || 0}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Average quiz score</p>
            <p className="mt-1 text-2xl font-extrabold text-ink">
              {user?.stats?.quizAvgScore != null &&
              Number.isFinite(Number(user.stats.quizAvgScore))
                ? `${Math.round(Number(user.stats.quizAvgScore))}%`
                : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Edit profile */}
      <form onSubmit={submit} className="card mt-6 p-8">
        <h3 className="text-lg font-extrabold text-ink">
          Update Profile Details
        </h3>

        <div className="mt-6 space-y-5">
          <div>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(event) =>
                updateField('name', event.target.value)
              }
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="input"
              value={form.username}
              onChange={(event) =>
                updateField('username', event.target.value)
              }
              maxLength={50}
              pattern="[A-Za-z0-9_]*"
              autoComplete="username"
              aria-describedby="username-help"
            />
            <p
              id="username-help"
              className="mt-1.5 text-xs text-slate-400"
            >
              Optional. Use letters, numbers, and underscores only.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="headline">
              Headline
            </label>
            <input
              id="headline"
              className="input"
              value={form.headline}
              onChange={(event) =>
                updateField('headline', event.target.value)
              }
              maxLength={100}
              placeholder="A short introduction"
            />
          </div>

          <div>
            <label className="label" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              className="input min-h-28 resize-y"
              value={form.bio}
              onChange={(event) =>
                updateField('bio', event.target.value)
              }
              maxLength={500}
              rows={4}
              placeholder="Tell us a little about yourself"
            />
            <p className="mt-1.5 text-right text-xs text-slate-400">
              {form.bio.length}/500
            </p>
          </div>

          <div>
            <label className="label" htmlFor="pemail">
              Email address
            </label>
            <input
              id="pemail"
              className="input"
              value={user?.email || ''}
              disabled
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Email changes are not supported in this version.
            </p>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {saved && !error && (
          <p
            role="status"
            className="mt-5 flex items-center gap-2 rounded-xl bg-brand-100/60 px-4 py-3 text-sm font-semibold text-brand-700"
          >
            <GraduationCap size={15} />
            Profile saved.
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={cancel}
            className="btn-ghost"
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={busy || !form.name.trim()}
            className="btn-primary"
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              '✓'
            )}{' '}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
