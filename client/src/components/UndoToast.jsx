import { useEffect } from 'react';

export default function UndoToast({ job, onUndo, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="glass-panel fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl px-5 py-3 shadow-2xl"
    >
      <p className="text-sm text-slate-400">
        <span className="font-medium text-white">{job.company}</span> removed
      </p>
      <button
        type="button"
        onClick={onUndo}
        className="text-sm font-semibold text-orange-400 transition-colors hover:text-orange-300"
      >
        Undo
      </button>
      <button onClick={onDismiss} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>
    </div>
  );
}