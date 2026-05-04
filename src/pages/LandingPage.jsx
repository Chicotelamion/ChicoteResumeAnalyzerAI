import { ArrowRight, BarChart3, BrainCircuit, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: FileText, title: 'Student Profile', text: 'Capture favorite subjects, hobbies, strengths, values, work style, and course interests.' },
  { icon: BrainCircuit, title: 'AI Guidance', text: 'Generate course suggestions, decision concerns, exploration advice, and direction scoring.' },
  { icon: BarChart3, title: 'Career Paths', text: 'Discover future job families connected to the courses a student may take in college.' },
  { icon: ShieldCheck, title: 'Saved Progress', text: 'Authentication, records, document name capture, and guidance history are included.' }
];

export default function LandingPage() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-sm font-semibold text-marine">
              <CheckCircle2 size={16} />
              AI guidance for undecided students
            </span>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">
              CareerPath AI
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              A college course and career discovery assistant that helps students compare interests, strengths, subjects, and possible future paths before choosing a course.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" to="/register">
                Start Guidance
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
                  <p className="text-sm font-semibold text-slate-500">Direction Clarity</p>
                  <p className="mt-1 text-4xl font-bold text-marine">86%</p>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-coral/10 text-coral">
                  <BrainCircuit size={28} />
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {['BS Information Technology', 'BS Business Administration', 'BS Psychology', 'BS Education', 'BS Nursing'].map((role, index) => (
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
