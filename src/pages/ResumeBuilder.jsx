import { Save, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { saveResumeProfile } from '../services/firestoreService.js';

const initialForm = {
  fullname: '',
  gradeLevel: '',
  favoriteSubjects: '',
  challengingSubjects: '',
  hobbies: '',
  strengths: '',
  values: '',
  workStyle: '',
  courseInterest: '',
  careerInterest: '',
  goals: '',
  guardianExpectations: '',
  notes: ''
};

export default function ResumeBuilder() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const profileFieldsRequired = !resumeFile;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    const requiredFields = [
      'fullname',
      'gradeLevel',
      'favoriteSubjects',
      'hobbies',
      'strengths',
      'workStyle',
      'careerInterest'
    ];
    const hasMissingProfileFields = requiredFields.some((field) => !form[field].trim());

    if (!resumeFile && hasMissingProfileFields) {
      setError('Complete the required discovery profile fields or upload a guidance document.');
      setSaving(false);
      return;
    }

    try {
      await saveResumeProfile(currentUser.uid, {
        ...form,
        fullname: form.fullname || currentUser.displayName || '',
        resumeFileName: resumeFile?.name || '',
        resumeFileUrl: '',
        profileSource: resumeFile ? 'document_upload' : 'student_discovery_form'
      });
      setMessage('Student discovery profile saved successfully.');
      setTimeout(() => navigate('/analyze'), 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-marine">Discovery Profile</p>
        <h1 className="mt-2 text-3xl font-bold">Tell us what you enjoy and how you work</h1>
        <p className="mt-2 text-slate-600">For undecided students choosing a college course and possible future career path.</p>
      </div>

      <form className="card p-6" onSubmit={handleSubmit}>
        {message && <div className="mb-5 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
        {error && <div className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="fullname">Full name</label>
            <input className="field" id="fullname" name="fullname" value={form.fullname} onChange={updateField} required={profileFieldsRequired} />
          </div>
          <div>
            <label className="label" htmlFor="gradeLevel">Current grade level</label>
            <input className="field" id="gradeLevel" name="gradeLevel" placeholder="Grade 12, senior high graduate, first year college" value={form.gradeLevel} onChange={updateField} required={profileFieldsRequired} />
          </div>
          <div>
            <label className="label" htmlFor="courseInterest">Courses you are considering</label>
            <input className="field" id="courseInterest" name="courseInterest" placeholder="IT, Education, Nursing, Business, Criminology" value={form.courseInterest} onChange={updateField} />
          </div>
          <div>
            <label className="label" htmlFor="careerInterest">Careers you are curious about</label>
            <input className="field" id="careerInterest" name="careerInterest" placeholder="Office work, business, technology, healthcare, teaching" value={form.careerInterest} onChange={updateField} required={profileFieldsRequired} />
          </div>
        </div>

        <div className="mt-5 grid gap-5">
          <div>
            <label className="label" htmlFor="favoriteSubjects">Favorite subjects</label>
            <textarea className="field min-h-24" id="favoriteSubjects" name="favoriteSubjects" placeholder="Math, English, science, ICT, arts, business, social studies" value={form.favoriteSubjects} onChange={updateField} required={profileFieldsRequired} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="challengingSubjects">Subjects you find difficult</label>
              <textarea className="field min-h-28" id="challengingSubjects" name="challengingSubjects" placeholder="Subjects or activities you want to avoid or improve" value={form.challengingSubjects} onChange={updateField} />
            </div>
            <div>
              <label className="label" htmlFor="hobbies">Hobbies and activities</label>
              <textarea className="field min-h-28" id="hobbies" name="hobbies" placeholder="Helping people, drawing, selling, gaming, organizing, writing, building things" value={form.hobbies} onChange={updateField} required={profileFieldsRequired} />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="strengths">Personal strengths</label>
              <textarea className="field min-h-28" id="strengths" name="strengths" placeholder="Communication, creativity, patience, leadership, problem solving, attention to detail" value={form.strengths} onChange={updateField} required={profileFieldsRequired} />
            </div>
            <div>
              <label className="label" htmlFor="workStyle">Preferred work style</label>
              <textarea className="field min-h-28" id="workStyle" name="workStyle" placeholder="Team or solo, indoor or outdoor, routine or creative, people-facing or technical" value={form.workStyle} onChange={updateField} required={profileFieldsRequired} />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="values">What matters to you in a future job</label>
              <textarea className="field min-h-28" id="values" name="values" placeholder="Good salary, helping others, stability, creativity, travel, flexible schedule" value={form.values} onChange={updateField} />
            </div>
            <div>
              <label className="label" htmlFor="goals">Life or college goals</label>
              <textarea className="field min-h-28" id="goals" name="goals" placeholder="Finish college, support family, start a business, work abroad, become licensed" value={form.goals} onChange={updateField} />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="guardianExpectations">Family or guardian expectations</label>
              <textarea className="field min-h-24" id="guardianExpectations" name="guardianExpectations" placeholder="Optional: course suggestions, budget limits, school preference" value={form.guardianExpectations} onChange={updateField} />
            </div>
            <div>
              <label className="label" htmlFor="notes">Other notes</label>
              <textarea className="field min-h-24" id="notes" name="notes" placeholder="Anything else that may affect your course choice" value={form.notes} onChange={updateField} />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700" htmlFor="resumeFile">
              <UploadCloud size={19} />
              Optional student record or guidance document
            </label>
            <p className="mb-3 text-xs leading-5 text-slate-500">
              Uploading a document makes the profile fields optional. The demo stores the file name with your profile.
            </p>
            <input
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-marine file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white"
              id="resumeFile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
            />
            {resumeFile && (
              <p className="mt-3 rounded-lg bg-mint/10 px-3 py-2 text-xs font-semibold text-marine">
                Document selected. Discovery profile fields are now optional.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn-primary" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving profile...' : 'Save Discovery Profile'}
          </button>
        </div>
      </form>
    </main>
  );
}
