import { useState } from 'react';
import { createJob } from '../api/jobs';

function FormField({ name, label, type = 'text', placeholder = '', form, errors, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white/[0.04] px-3 py-2.5 text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400/35
          ${errors[name] ? 'border-red-500' : 'border-white/10'}`}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name]}</p>}
    </div>
  );
}

export default function AddJobModal({ onClose, onAdded }) {
  const [form,   setForm]   = useState({
    company: '', role: '', job_url: '',
    salary_min: '', salary_max: '', location: '', is_remote: false
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors(e => ({ ...e, [name]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.company.trim()) errs.company = 'Required';
    if (!form.role.trim())    errs.role    = 'Required';
    if (form.job_url && !form.job_url.startsWith('http')) errs.job_url = 'Must start with http';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const job = await createJob({
        company:    form.company,
        role:       form.role,
        job_url:    form.job_url    || undefined,
        location:   form.location   || undefined,
        salary_min: form.salary_min ? parseInt(form.salary_min) : undefined,
        salary_max: form.salary_max ? parseInt(form.salary_max) : undefined,
        is_remote:  form.is_remote,
      });
      onAdded(job);
    } catch (err) {
      setErrors({ submit: err.response?.data?.errors?.[0]?.msg ?? 'Failed to add job' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-xl font-semibold text-white">New Application</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField name="company" label="Company *" placeholder="Google" form={form} errors={errors} onChange={handleChange} />
            <FormField name="role" label="Role *" placeholder="SWE Intern" form={form} errors={errors} onChange={handleChange} />
          </div>
          <FormField name="job_url" label="Job URL" type="url" placeholder="https://..." form={form} errors={errors} onChange={handleChange} />
          <FormField name="location" label="Location" placeholder="Remote / NYC" form={form} errors={errors} onChange={handleChange} />
          <div className="grid grid-cols-2 gap-3">
            <FormField name="salary_min" label="Min Salary" type="number" placeholder="80000" form={form} errors={errors} onChange={handleChange} />
            <FormField name="salary_max" label="Max Salary" type="number" placeholder="120000" form={form} errors={errors} onChange={handleChange} />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`relative h-6 w-10 rounded-full transition-colors ${form.is_remote ? 'bg-orange-500' : 'bg-white/10'}`}
              onClick={() => setForm(f => ({ ...f, is_remote: !f.is_remote }))}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.is_remote ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-slate-400 text-sm">Remote position</span>
          </label>

          {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110 disabled:opacity-50">
              {saving ? 'Adding...' : '+ Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}