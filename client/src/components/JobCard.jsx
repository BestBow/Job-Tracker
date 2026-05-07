import { useSortable } from '@dnd-kit/sortable';
import { CSS }         from '@dnd-kit/utilities';

const LOGO_COLORS = [
  'from-violet-400 to-fuchsia-500',
  'from-amber-300 to-orange-500',
  'from-emerald-300 to-teal-500',
  'from-rose-400 to-pink-600',
  'from-indigo-400 to-blue-600',
  'from-sky-300 to-cyan-500',
  'from-fuchsia-400 to-purple-600',
  'from-red-400 to-rose-600',
];

function logoColor(name) {
  return LOGO_COLORS[name.charCodeAt(0) % LOGO_COLORS.length];
}

export default function JobCard({ job, onClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.5 : 1,
  };

  const salary = job.salary_min
    ? `$${Math.round(job.salary_min / 1000)}k – $${Math.round((job.salary_max ?? 0) / 1000)}k`
    : null;

  const appliedDate = new Date(job.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card-base group relative cursor-grab active:cursor-grabbing rounded-2xl p-4 transition hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${logoColor(job.company)} text-sm font-bold text-black/80 shadow-md`}>
          {job.company[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-white">{job.company}</h3>
            <span className="text-white/20 opacity-0 transition group-hover:opacity-100 text-xs">⠿</span>
          </div>
          <p className="mt-0.5 truncate text-[13px] text-white/50">{job.role}</p>
        </div>
      </div>

      <dl className="space-y-1.5 text-[12px] text-white/40">
        {job.location && (
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{job.location}{job.is_remote ? ' · Remote' : ''}</span>
          </div>
        )}
        {salary && (
          <div className="flex items-center gap-2">
            <span>💵</span>
            <span className="text-white/70">{salary}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>Applied {appliedDate}</span>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(job); }}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-white/50 transition hover:text-white"
        >
          ↗ View
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(job.id); }}
          className="rounded-full p-1 text-white/30 opacity-0 transition hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </article>
  );
}