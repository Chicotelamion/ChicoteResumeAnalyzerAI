import { BrainCircuit, CheckCircle2, Lightbulb, RefreshCw, Route, Sparkles, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { analyzeCareerProfile } from '../services/aiService.js';
import { getLatestResumeProfile, saveAIAnalysis } from '../services/firestoreService.js';

function ListCard({ title, items, icon: Icon }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="text-marine" size={20} />
        <h2 className="font-bold">{title}</h2>
      </div>
      <ul className="space-y-2">
        {(items || []).map((item) => (
          <li className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700" key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default function AnalyzeCareer() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setError('');

      try {
        const latest = await getLatestResumeProfile(currentUser.uid);
        if (!mounted) return;
        setProfile(latest);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Unable to load your latest discovery profile.');
        setProfile(null);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [currentUser.uid]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');

    try {
      const result = await analyzeCareerProfile(profile);
      const normalized = {
        directionScore: Number(result.directionScore ?? result.employabilityScore) || 0,
        strengths: result.strengths || [],
        concerns: result.concerns || result.weaknesses || [],
        courseSuggestions: result.courseSuggestions || result.suggestions || [],
        explorationAdvice: result.explorationAdvice || result.interviewAdvice || [],
        recommendedJobs: result.recommendedJobs || [],
        roadmap: result.roadmap || []
      };
      await saveAIAnalysis(currentUser.uid, normalized);
      setAnalysis(normalized);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-marine">AI Guidance</p>
          <h1 className="mt-2 text-3xl font-bold">Find course and career direction</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Generate college course suggestions, possible career paths, strengths, concerns, and an exploration roadmap.</p>
        </div>
        <button className="btn-primary" onClick={handleAnalyze} disabled={!profile || analyzing || loadingProfile}>
          {analyzing ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {analyzing ? 'Analyzing...' : 'Guide My Path'}
        </button>
      </div>

      {loadingProfile && <div className="card p-6 text-slate-600">Loading latest discovery profile...</div>}

      {!loadingProfile && !profile && (
        <div className="card p-6">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-1 text-coral" size={22} />
            <div>
              <h2 className="text-lg font-bold">No discovery profile found</h2>
              <p className="mt-1 text-slate-600">Create a student discovery profile before running AI guidance.</p>
              <Link className="btn-primary mt-4" to="/resume">Create Discovery Profile</Link>
            </div>
          </div>
        </div>
      )}

      {error && <div className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {profile && (
        <section className="mb-6 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="card p-5">
              <h2 className="text-lg font-bold">Current profile</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p><span className="font-semibold">Name:</span> {profile.fullname || 'Not provided'}</p>
              <p><span className="font-semibold">Grade level:</span> {profile.gradeLevel || 'Not provided'}</p>
              <p><span className="font-semibold">Course ideas:</span> {profile.courseInterest || 'Not provided'}</p>
              <p><span className="font-semibold">Career curiosity:</span> {profile.careerInterest || 'Not provided'}</p>
              {profile.resumeFileName && (
                <p><span className="font-semibold">Uploaded document:</span> {profile.resumeFileName}</p>
              )}
              {profile.resumeFileUrl && (
                <a className="font-semibold text-marine" href={profile.resumeFileUrl} target="_blank" rel="noreferrer">
                  View uploaded document
                </a>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-bold">Interest snapshot</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Favorite subjects</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{profile.favoriteSubjects || 'Not provided'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Strengths and work style</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{profile.strengths || profile.workStyle || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {analysis && (
        <section className="space-y-5">
          <div className="card p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Direction Clarity Score</p>
                <p className="mt-1 text-5xl font-bold text-marine">{analysis.directionScore}%</p>
              </div>
              <div className="w-full max-w-xl">
                <div className="mb-2 flex justify-between text-sm font-semibold text-slate-600">
                  <span>Course and career direction</span>
                  <span>{analysis.directionScore}/100</span>
                </div>
                <div className="h-4 rounded-full bg-slate-100">
                  <div className="h-4 rounded-full bg-mint" style={{ width: `${analysis.directionScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ListCard title="Strengths" items={analysis.strengths} icon={CheckCircle2} />
            <ListCard title="Concerns and Decision Conflicts" items={analysis.concerns} icon={TriangleAlert} />
            <ListCard title="Recommended College Courses" items={analysis.courseSuggestions} icon={Lightbulb} />
            <ListCard title="Exploration Advice" items={analysis.explorationAdvice} icon={BrainCircuit} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <ListCard title="Possible Future Career Paths" items={analysis.recommendedJobs} icon={Sparkles} />
            <ListCard title="College Decision Roadmap" items={analysis.roadmap} icon={Route} />
          </div>
        </section>
      )}
    </main>
  );
}
