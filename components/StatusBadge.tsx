import { PaymentStatus } from "@/lib/payment";

const config: Record<PaymentStatus, { label: string; classes: string }> = {
  paid: {
    label: "Paid",
    classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  "on-time": {
    label: "Unpaid",
    classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  late: {
    label: "Overdue",
    classes: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
};

export default function StatusBadge({ status }: { status: PaymentStatus }) {
  const { label, classes } = config[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
