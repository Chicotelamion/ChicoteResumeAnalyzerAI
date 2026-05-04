import { ArrowRight, BrainCircuit, Clock3, FileText, Sparkles, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getAIAnalysisHistory, getLatestResumeProfile } from '../services/firestoreService.js';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setError('');

      try {
        const [latestProfile, analyses] = await Promise.all([
          getLatestResumeProfile(currentUser.uid),
          getAIAnalysisHistory(currentUser.uid)
        ]);

        if (!mounted) return;
        setProfile(latestProfile);
        setHistory(analyses);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Unable to load dashboard data.');
        setProfile(null);
        setHistory([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [currentUser.uid]);

  const latest = history[0];
  const score = latest?.employabilityScore || 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-marine">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Hello, {currentUser.displayName || 'future IT professional'}</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Track your resume profile, AI score, job matches, and previous recommendations.</p>
        </div>
        <Link className="btn-primary" to="/resume">
          Update Resume
          <ArrowRight size={18} />
        </Link>
      </div>

      {loading ? (
        <div className="card p-6 text-slate-600">Loading dashboard...</div>
      ) : (
        <>
          {error && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Employability</span>
                <Sparkles className="text-marine" size={22} />
              </div>
              <p className="text-4xl font-bold text-ink">{score}%</p>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-mint" style={{ width: `${score}%` }} />
              </div>
            </div>
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Resume Profiles</span>
                <FileText className="text-coral" size={22} />
              </div>
              <p className="text-4xl font-bold text-ink">{profile ? 1 : 0}</p>
              <p className="mt-2 text-sm text-slate-600">{profile ? profile.degree || profile.course || 'Profile saved' : 'No profile yet'}</p>
            </div>
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Analyses</span>
                <Clock3 className="text-marine" size={22} />
              </div>
              <p className="text-4xl font-bold text-ink">{history.length}</p>
              <p className="mt-2 text-sm text-slate-600">Saved AI reports</p>
            </div>
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Top Match</span>
                <Target className="text-mint" size={22} />
              </div>
              <p className="text-xl font-bold text-ink">{latest?.recommendedJobs?.[0] || 'Analyze first'}</p>
              <p className="mt-2 text-sm text-slate-600">Recommended IT role</p>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="card p-6">
              <h2 className="text-xl font-bold">Next best actions</h2>
              <div className="mt-5 grid gap-3">
                <Link className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50" to="/resume">
                  <span className="font-semibold">Complete or update resume profile</span>
                  <ArrowRight size={18} />
                </Link>
                <Link className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50" to="/analyze">
                  <span className="font-semibold">Run AI career analysis</span>
                  <ArrowRight size={18} />
                </Link>
                <Link className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50" to="/history">
                  <span className="font-semibold">Review saved analysis history</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-bold">Latest recommendations</h2>
              {latest ? (
                <ul className="mt-5 space-y-3">
                  {latest.recommendedJobs?.map((job) => (
                    <li className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700" key={job}>{job}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  Your job recommendations will appear here after your first AI analysis.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
