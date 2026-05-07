import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import JobCard from './JobCard';

const STYLES = {
  applied:   { text: 'text-applied',   dot: 'bg-applied',   ring: 'ring-applied/30',   glow: 'from-applied/10' },
  screening: { text: 'text-screening', dot: 'bg-screening', ring: 'ring-screening/30', glow: 'from-screening/10' },
  interview: { text: 'text-interview', dot: 'bg-interview', ring: 'ring-interview/30', glow: 'from-interview/10' },
  offer:     { text: 'text-offer',     dot: 'bg-offer',     ring: 'ring-offer/30',     glow: 'from-offer/10' },
  rejected:  { text: 'text-rejected',  dot: 'bg-rejected',  ring: 'ring-rejected/30',  glow: 'from-rejected/10' },
  withdrawn: { text: 'text-withdrawn', dot: 'bg-withdrawn', ring: 'ring-withdrawn/30', glow: 'from-withdrawn/10' },
};

export default function Column({ status, jobs, onCardClick, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const s = STYLES[status];

  return (
    <div
      ref={setNodeRef}
      className={`relative flex flex-col glass rounded-3xl p-4 min-h-[480px] transition
        ${isOver ? `ring-2 ${s.ring} scale-[1.01]` : ''}`}
    >
      {/* column tint gradient */}
      <div className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b ${s.glow} to-transparent opacity-60`} />

      <div className="relative flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
          <h3 className={`text-xs font-semibold uppercase tracking-[0.18em] ${s.text}`}>
            {status}
          </h3>
        </div>
        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/40">
          {jobs.length}
        </span>
      </div>

      <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
        <div className="relative flex flex-col gap-3 flex-1">
          {jobs.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-white/20">
              Drop here
            </div>
          )}
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onClick={onCardClick} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}