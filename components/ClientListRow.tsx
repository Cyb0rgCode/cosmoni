"use client";

import { Client } from "@/lib/types";
import { amountDue, paymentStatus } from "@/lib/payment";
import { formatDT } from "@/lib/format";
import StatusBadge from "./StatusBadge";

export default function ClientListRow({
  client,
  onEdit,
  onDelete,
  onTogglePaid,
  onMarkUnpaid,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePaid: () => void;
  onMarkUnpaid: () => void;
}) {
  const status = paymentStatus(client);
  const due = amountDue(client);
  const initial = client.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/10 px-3 py-2.5 dark:border-white/10">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/10 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
        {initial}
      </div>

      <button onClick={onEdit} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{client.name}</p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {client.post || "—"}
          {client.phone ? ` · ${client.phone}` : ""}
        </p>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <div className="text-right">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {formatDT(due)}
            {client.carriedOver > 0 && (
              <span
                className="ml-1 text-rose-600 dark:text-rose-400"
                title={`Includes ${formatDT(client.carriedOver)} carried over`}
              >
                *
              </span>
            )}
          </p>
          <StatusBadge status={status} />
        </div>
        {status === "paid" ? (
          <button
            onClick={onMarkUnpaid}
            className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:border-white/10 dark:text-zinc-300"
          >
            Undo
          </button>
        ) : (
          <button
            onClick={onTogglePaid}
            className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white"
          >
            Paid
          </button>
        )}
        <button
          onClick={onDelete}
          aria-label="Delete"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-600 dark:text-rose-400"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
