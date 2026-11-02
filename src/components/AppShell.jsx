import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plus,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const NAV_ITEMS = [
  { to: '/paths', label: 'My Learning Paths', icon: BookOpen },
  { to: '/create', label: 'Create Path', icon: LayoutDashboard },
  { to: '/progress', label: 'Progress', icon: ListChecks },
  { to: '/profile', label: 'Profile', icon: UserIcon },
  { to: '/status', label: 'Setup Status', icon: GraduationCap },
];

/**
 * Shared logged-in shell: left sidebar + top bar, per the dashboard designs.
 * (Search, notifications, streak pill, XP and Explore/Notes/Settings are
 * intentionally NOT here — they were scoped out of v1.)
 */
export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6">
        <div className="px-2">
          <BrandLogo className="w-48" />
        </div>

        <button
          onClick={() => navigate('/create')}
          className="btn-dark mt-6 w-full rounded-xl py-2.5"
        >
          <Plus size={16} /> New Goal
        </button>

        <nav className="mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-ink text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div />
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/create')}
              className="btn-dark rounded-full px-4 py-2 text-xs"
            >
              <Plus size={14} /> Create Path
            </button>
            <span className="text-right leading-tight">
              <span className="block text-sm font-bold text-ink">
                {user?.name || 'Learner'}
              </span>
              <span className="block text-xs text-slate-400">{user?.email}</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {(user?.name || 'L').charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
