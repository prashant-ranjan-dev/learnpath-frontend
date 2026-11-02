import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

/**
 * Login — POST /api/auth/login {email, password} -> {token}.
 * "Forgot password" and social buttons are intentionally omitted (out of scope).
 */
export default function LoginPage() {
  const { login, busy, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (await login(email, password)) navigate('/paths');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6">
          <BrandLogo className="w-56" />
        </div>

        <h1 className="text-3xl font-extrabold text-ink">Welcome Back 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Continue your learning journey</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              className="input"
              placeholder="enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={show ? 'text' : 'password'}
                required
                className="input pr-12"
                placeholder="enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <button type="submit" disabled={busy} className="btn-dark w-full">
            {busy ? 'Logging in…' : 'Log In →'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-600">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
