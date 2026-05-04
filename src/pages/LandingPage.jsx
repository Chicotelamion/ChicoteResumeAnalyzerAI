import { ArrowRight, BarChart3, BrainCircuit, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: FileText, title: 'Resume Profile', text: 'Organize education, skills, projects, certifications, and experience in one place.' },
  { icon: BrainCircuit, title: 'AI Career Analysis', text: 'Generate employability scoring, missing skill insights, and interview readiness guidance.' },
  { icon: BarChart3, title: 'Job Recommendations', text: 'Receive five suitable IT roles and a practical growth roadmap.' },
  { icon: ShieldCheck, title: 'Firebase Powered', text: 'Authentication, Firestore records, resume upload, and analysis history are included.' }
];

export default function LandingPage() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-sm font-semibold text-marine">
              <CheckCircle2 size={16} />
              AI career guidance for IT students
            </span>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">
              CareerPath AI
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              A complete resume analyzer and job recommendation assistant that helps students understand their readiness, improve their profile, and plan a practical path into the IT industry.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" to="/register">
                Start Analysis
                <ArrowRight size={18} />
              </Link>
              <Link className="btn-secondary" to="/login">
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-cloud p-5 shadow-soft">
            <div className="rounded-lg bg-white p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Employability Score</p>
                  <p className="mt-1 text-4xl font-bold text-marine">86%</p>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-coral/10 text-coral">
                  <BrainCircuit size={28} />
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {['Frontend Developer', 'QA Automation Trainee', 'Junior Web Developer', 'IT Support Specialist', 'Systems Analyst'].map((role, index) => (
                  <div key={role}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">{index + 1}. {role}</span>
                      <span className="text-slate-500">{92 - index * 5}% match</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-mint" style={{ width: `${92 - index * 5}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="card p-5" key={title}>
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-marine/10 text-marine">
                <Icon size={23} />
              </div>
              <h2 className="text-lg font-bold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
