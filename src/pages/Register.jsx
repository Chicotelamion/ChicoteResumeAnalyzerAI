import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-68px)] max-w-7xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="card w-full max-w-md p-6">
        <div className="mb-6">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-lg bg-marine/10 text-marine">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="mt-1 text-sm text-slate-600">Register to build your resume profile and save AI analysis history.</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="fullname">Full name</label>
            <input className="field" id="fullname" name="fullname" value={form.fullname} onChange={updateField} required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="field" id="email" name="email" type="email" value={form.email} onChange={updateField} required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input className="field" id="password" name="password" type="password" minLength="6" value={form.password} onChange={updateField} required />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account? <Link className="font-semibold text-marine" to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
