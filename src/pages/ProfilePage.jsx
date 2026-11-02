import { useState } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Profile — GET /api/user/profile {name, email}, PUT /api/user/profile {name}.
 *
 * Design elements NOT rendered (no backend fields — verified in UserController):
 * username, headline, bio, avatar upload, join date, Verified badge, stats
 * tiles, password change, account deletion, Export Learning Data.
 */
export default function ProfilePage() {
  const { user, updateProfile, busy, error, setError } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaved(false);
    if (await updateProfile(name)) setSaved(true);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold text-ink">Profile &amp; Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage your personal details and account identity.
      </p>

      {/* Identity card */}
      <div className="card mt-6 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-brand-600 to-brand-400" />
        <div className="-mt-10 px-8 pb-8">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-brand-100 text-2xl font-extrabold text-brand-700 shadow-card">
            {(user?.name || 'L').charAt(0).toUpperCase()}
          </span>
          <h2 className="mt-3 text-xl font-extrabold text-ink">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={submit} className="card mt-6 p-8">
        <h3 className="text-lg font-extrabold text-ink">Update Profile Details</h3>

        <div className="mt-6 space-y-5">
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
                setSaved(false);
              }}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="pemail">Email address</label>
            <input id="pemail" className="input" value={user?.email || ''} disabled />
            <p className="mt-1.5 text-xs text-slate-400">
              Email changes are not supported in this version.
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        {saved && !error && (
          <p className="mt-5 flex items-center gap-2 rounded-xl bg-brand-100/60 px-4 py-3 text-sm font-semibold text-brand-700">
            <GraduationCap size={15} /> Profile saved.
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
          <button type="button" onClick={() => setName(user?.name || '')} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={busy || !name.trim()} className="btn-primary">
            {busy ? <Loader2 size={16} className="animate-spin" /> : '✓'} Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
