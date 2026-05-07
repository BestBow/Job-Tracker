import { useState } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { useJobs }        from './hooks/useJobs';
import StatsBar           from './components/StatsBar';
import Column             from './components/Column';
import JobCard            from './components/JobCard';
import AddJobModal        from './components/AddJobModal';
import JobDetailPanel     from './components/JobDetailPanel';
import UndoToast          from './components/UndoToast';

const COLUMNS = ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'];

export default function App() {
  const { jobs, loading, moveJob, removeJob, fetchJobs, deletedJob, undoDelete, dismissUndo } = useJobs();
  const [activeJob,    setActiveJob]    = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailJobId,  setDetailJobId]  = useState(null);
  const [search,       setSearch]       = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart({ active }) {
    setActiveJob(jobs.find(j => j.id === active.id) ?? null);
  }

  function handleDragEnd({ active, over }) {
    setActiveJob(null);
    if (!over) return;
    const job = jobs.find(j => j.id === active.id);
    if (!job || job.status === over.id) return;
    moveJob(job.id, over.id);
  }

  const filtered = search
    ? jobs.filter(j =>
        j.company.toLowerCase().includes(search.toLowerCase()) ||
        j.role.toLowerCase().includes(search.toLowerCase()))
    : jobs;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'white', fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
          Loading your pipeline...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 md:px-12 md:py-14">

      {/* Header */}
      <header className="mx-auto max-w-[1400px] mb-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/40">
              ✦ Pipeline · {new Date().getFullYear()}
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-medium leading-[0.95]">
              Your next <em className="text-gradient not-italic">chapter</em>,
              <br /> tracked beautifully.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/40">
              Drag cards across stages, watch your funnel breathe, and celebrate every reply.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm">⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search company or role..."
                className="w-64 glass rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-white/20 transition"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5"
            >
              + Add Job
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="mx-auto max-w-[1400px]">
        <StatsBar jobs={jobs} />
      </div>

      {/* Board */}
      <main className="mx-auto max-w-[1400px]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {COLUMNS.map(status => (
              <Column
                key={status}
                status={status}
                jobs={filtered.filter(j => j.status === status)}
                onCardClick={job => setDetailJobId(job.id)}
                onDelete={removeJob}
              />
            ))}
          </div>

          <DragOverlay>
            {activeJob && <JobCard job={activeJob} onClick={() => {}} onDelete={() => {}} />}
          </DragOverlay>
        </DndContext>
      </main>

      <footer className="mx-auto mt-16 max-w-[1400px] flex items-center justify-between text-xs text-white/20">
        <span>© {new Date().getFullYear()} — Built for the brave.</span>
        <span className="font-display italic">Keep going.</span>
      </footer>

      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => { fetchJobs(); setShowAddModal(false); }}
        />
      )}

      {detailJobId && (
        <JobDetailPanel jobId={detailJobId} onClose={() => setDetailJobId(null)} />
      )}

      {deletedJob && (
        <UndoToast job={deletedJob} onUndo={undoDelete} onDismiss={dismissUndo} />
      )}
    </div>
  );
}