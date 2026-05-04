import { Save, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { saveResumeProfile } from '../services/firestoreService.js';

const initialForm = {
  fullname: '',
  degree: '',
  course: '',
  education: '',
  technicalSkills: '',
  programmingLanguages: '',
  certifications: '',
  experience: '',
  projects: '',
  careerInterest: ''
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
      'degree',
      'education',
      'technicalSkills',
      'programmingLanguages',
      'projects',
      'careerInterest'
    ];
    const hasMissingProfileFields = requiredFields.some((field) => !form[field].trim());

    if (!resumeFile && hasMissingProfileFields) {
      setError('Complete the required career profile fields or upload a resume document.');
      setSaving(false);
      return;
    }

    try {
      await saveResumeProfile(currentUser.uid, {
        ...form,
        fullname: form.fullname || currentUser.displayName || '',
        resumeFileName: resumeFile?.name || '',
        resumeFileUrl: '',
        profileSource: resumeFile ? 'resume_upload' : 'manual_form'
      });
      setMessage('Resume profile saved successfully.');
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
        <p className="text-sm font-semibold uppercase tracking-wide text-marine">Resume Builder</p>
        <h1 className="mt-2 text-3xl font-bold">Create your career profile</h1>
        <p className="mt-2 text-slate-600">Enter academic, technical, and career information for AI analysis.</p>
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
            <label className="label" htmlFor="degree">Degree</label>
            <input className="field" id="degree" name="degree" placeholder="BS Information Technology" value={form.degree} onChange={updateField} required={profileFieldsRequired} />
          </div>
          <div>
            <label className="label" htmlFor="course">Course or specialization</label>
            <input className="field" id="course" name="course" placeholder="Web Development, Networking, Data Analytics" value={form.course} onChange={updateField} />
          </div>
          <div>
            <label className="label" htmlFor="careerInterest">Career interests</label>
            <input className="field" id="careerInterest" name="careerInterest" placeholder="Software development, cybersecurity, support" value={form.careerInterest} onChange={updateField} required={profileFieldsRequired} />
          </div>
        </div>

        <div className="mt-5 grid gap-5">
          <div>
            <label className="label" htmlFor="education">Education details</label>
            <textarea className="field min-h-24" id="education" name="education" value={form.education} onChange={updateField} required={profileFieldsRequired} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="technicalSkills">Technical skills</label>
              <textarea className="field min-h-28" id="technicalSkills" name="technicalSkills" placeholder="React, Firebase, database design, UI design" value={form.technicalSkills} onChange={updateField} required={profileFieldsRequired} />
            </div>
            <div>
              <label className="label" htmlFor="programmingLanguages">Programming languages</label>
              <textarea className="field min-h-28" id="programmingLanguages" name="programmingLanguages" placeholder="JavaScript, Python, Java, SQL" value={form.programmingLanguages} onChange={updateField} required={profileFieldsRequired} />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="certifications">Certifications</label>
              <textarea className="field min-h-28" id="certifications" name="certifications" placeholder="Google IT Support, AWS Cloud Practitioner" value={form.certifications} onChange={updateField} />
            </div>
            <div>
              <label className="label" htmlFor="experience">Internship or work experience</label>
              <textarea className="field min-h-28" id="experience" name="experience" value={form.experience} onChange={updateField} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="projects">Personal or academic projects</label>
            <textarea className="field min-h-28" id="projects" name="projects" placeholder="Capstone apps, websites, mobile apps, network labs" value={form.projects} onChange={updateField} required={profileFieldsRequired} />
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700" htmlFor="resumeFile">
              <UploadCloud size={19} />
              Optional resume document
            </label>
            <p className="mb-3 text-xs leading-5 text-slate-500">
              Uploading a resume makes the career profile fields optional. The demo stores the file name with your profile.
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
                Resume selected. Career profile fields are now optional.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn-primary" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving profile...' : 'Save Resume Profile'}
          </button>
        </div>
      </form>
    </main>
  );
}
