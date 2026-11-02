export default function EmptyState({ icon, title, hint, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-8 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {hint && <p className="max-w-sm text-sm text-slate-500">{hint}</p>}
      {action}
    </div>
  );
}
