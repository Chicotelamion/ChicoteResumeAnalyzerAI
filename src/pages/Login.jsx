import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function getFriendlyAuthError(error) {
  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Register a new account or reset your password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment, then try again or reset your password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    default:
      return error.message || 'Unable to login. Please try again.';
  }
}

export default function Login() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getFriendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setMessage('');

    if (!form.email) {
      setError('Enter your email first, then click reset password.');
      return;
    }

    setResetting(true);

    try {
      await resetPassword(form.email);
      setMessage('Password reset email sent. Check your inbox or spam folder.');
    } catch (err) {
      setError(getFriendlyAuthError(err));
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-68px)] max-w-7xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="card w-full max-w-md p-6">
        <div className="mb-6">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-lg bg-marine/10 text-marine">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">Login to continue your college course and career discovery workflow.</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="field" id="email" name="email" type="email" value={form.email} onChange={updateField} required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input className="field" id="password" name="password" type="password" value={form.password} onChange={updateField} required />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <button
          className="mt-3 w-full text-center text-sm font-semibold text-marine hover:text-marine/80 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={handlePasswordReset}
          disabled={resetting}
        >
          {resetting ? 'Sending reset email...' : 'Forgot password?'}
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          No account yet? <Link className="font-semibold text-marine" to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}
