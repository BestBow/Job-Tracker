import { useState, useEffect } from 'react';
import { getJob, addNote, addContact } from '../api/jobs';

export default function JobDetailPanel({ jobId, onClose }) {
  const [job,     setJob]     = useState(null);
  const [note,    setNote]    = useState('');
  const [contact, setContact] = useState({ name: '', email: '', role: '' });
  const [tab,     setTab]     = useState('notes');

  useEffect(() => {
    if (jobId) getJob(jobId).then(setJob);
  }, [jobId]);

  async function handleAddNote(e) {
    e.preventDefault();
    if (!note.trim()) return;
    const newNote = await addNote(jobId, note);
    setJob(j => ({ ...j, notes: [newNote, ...j.notes] }));
    setNote('');
  }

  async function handleAddContact(e) {
    e.preventDefault();
    if (!contact.name.trim()) return;
    const newContact = await addContact(jobId, contact);
    setJob(j => ({ ...j, contacts: [...j.contacts, newContact] }));
    setContact({ name: '', email: '', role: '' });
  }

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm">
      <div className="glass-panel h-full w-full max-w-md overflow-y-auto border-l border-white/10 p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-white">{job.company}</h2>
            <p className="text-slate-400">{job.role}</p>
            {job.job_url && (
              <a href={job.job_url} target="_blank" rel="noreferrer"
                className="mt-1 block text-sm text-orange-400 hover:underline"
              >
                View job posting ↗
              </a>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          {job.salary_min && (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-slate-500 text-xs">Salary</p>
              <p className="text-white">${job.salary_min.toLocaleString()} – ${job.salary_max?.toLocaleString()}</p>
            </div>
          )}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-slate-500 text-xs">Location</p>
            <p className="text-white">{job.location ?? (job.is_remote ? 'Remote' : '—')}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-slate-500 text-xs">Applied</p>
            <p className="text-white">{new Date(job.applied_at).toLocaleDateString()}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-slate-500 text-xs">Status</p>
            <p className="text-white capitalize">{job.status}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
          {['notes', 'contacts'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-1.5 text-sm capitalize transition-colors
                ${tab === t ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              {t} ({t === 'notes' ? job.notes.length : job.contacts.length})
            </button>
          ))}
        </div>

        {tab === 'notes' && (
          <div>
            <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400/35"
              />
              <button type="submit" className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2 text-sm font-medium text-white hover:brightness-110">
                Add
              </button>
            </form>
            <div className="flex flex-col gap-2">
              {job.notes.length === 0 && <p className="text-slate-600 text-sm">No notes yet.</p>}
              {job.notes.map(n => (
                <div key={n.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-white text-sm">{n.content}</p>
                  <p className="text-slate-600 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'contacts' && (
          <div>
            <form onSubmit={handleAddContact} className="flex flex-col gap-2 mb-4">
              {[
                { name: 'name',  placeholder: 'Name *' },
                { name: 'role',  placeholder: 'Title / Role' },
                { name: 'email', placeholder: 'Email' },
              ].map(({ name, placeholder }) => (
                <input key={name} value={contact[name]} onChange={e => setContact(c => ({ ...c, [name]: e.target.value }))}
                  placeholder={placeholder}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400/35"
                />
              ))}
              <button type="submit" className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm font-medium text-white hover:brightness-110">
                Add Contact
              </button>
            </form>
            <div className="flex flex-col gap-2">
              {job.contacts.length === 0 && <p className="text-slate-600 text-sm">No contacts yet.</p>}
              {job.contacts.map(c => (
                <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-white text-sm font-medium">{c.name}</p>
                  {c.role  && <p className="text-slate-400 text-xs">{c.role}</p>}
                  {c.email && <p className="text-orange-300 text-xs">{c.email}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}