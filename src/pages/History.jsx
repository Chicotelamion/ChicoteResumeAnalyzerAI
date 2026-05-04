import { CalendarClock, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getAIAnalysisHistory } from '../services/firestoreService.js';

function formatDate(timestamp) {
  if (!timestamp) return 'Recently saved';
  if (typeof timestamp === 'string') return new Date(timestamp).toLocaleString();
  if (!timestamp?.toDate) return 'Recently saved';
  return timestamp.toDate().toLocaleString();
}

export default function History() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      setError('');

      try {
        const records = await getAIAnalysisHistory(currentUser.uid);
        if (!mounted) return;
        setHistory(records);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Unable to load analysis history.');
        setHistory([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [currentUser.uid]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-marine">History</p>
        <h1 className="mt-2 text-3xl font-bold">Saved AI guidance</h1>
        <p className="mt-2 text-slate-600">Review previous direction scores, course suggestions, career paths, and roadmap advice.</p>
      </div>

      {loading ? (
        <div className="card p-6 text-slate-600">Loading history...</div>
      ) : error ? (
        <div className="card border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">{error}</div>
      ) : history.length === 0 ? (
        <div className="card p-6 text-slate-600">No AI guidance reports have been saved yet.</div>
      ) : (
        <div className="space-y-5">
          {history.map((item) => (
            <article className="card overflow-hidden" key={item.id}>
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-white p-5 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-marine/10 text-marine">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Direction Score: {item.directionScore ?? item.employabilityScore}%</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <CalendarClock size={16} />
                      {formatDate(item.analyzedAt)}
                    </p>
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 md:w-56">
                  <div className="h-3 rounded-full bg-mint" style={{ width: `${item.directionScore ?? item.employabilityScore ?? 0}%` }} />
                </div>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-3">
                <div>
                  <h3 className="mb-2 font-bold">Suggested Courses</h3>
                  <ul className="space-y-2">
                    {(item.courseSuggestions || item.recommendedJobs || []).map((course) => (
                      <li className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700" key={course}>{course}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-bold">Key Strengths</h3>
                  <ul className="space-y-2">
                    {item.strengths?.slice(0, 3).map((strength) => (
                      <li className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700" key={strength}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-bold">Decision Roadmap</h3>
                  <ul className="space-y-2">
                    {item.roadmap?.slice(0, 3).map((step) => (
                      <li className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700" key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
