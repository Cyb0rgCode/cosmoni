export default function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const toneClasses: Record<string, string> = {
    default: "border-black/10 dark:border-white/10",
    success: "border-emerald-500/30 bg-emerald-500/5",
    danger: "border-rose-500/30 bg-rose-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
  };

  const valueTone: Record<string, string> = {
    default: "text-zinc-900 dark:text-zinc-50",
    success: "text-emerald-600 dark:text-emerald-400",
    danger: "text-rose-600 dark:text-rose-400",
    warning: "text-amber-600 dark:text-amber-400",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${valueTone[tone]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}
