"use client";

import { Client } from "@/lib/types";
import { amountDue, paymentStatus, daysUntilLate } from "@/lib/payment";
import { formatDT } from "@/lib/format";
import StatusBadge from "./StatusBadge";

export default function ClientCard({
  client,
  onEdit,
  onDelete,
  onTogglePaid,
  onRenew,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePaid: () => void;
  onRenew: () => void;
}) {
  const status = paymentStatus(client);
  const due = amountDue(client);
  const initial = client.name.trim().charAt(0).toUpperCase() || "?";
  const remaining = daysUntilLate(client);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600/10 text-base font-semibold text-indigo-600 dark:text-indigo-400">
            {initial}
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">{client.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{client.post || "—"}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
        {client.phone && (
          <a href={`tel:${client.phone}`} className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400">
            <PhoneIcon /> {client.phone}
          </a>
        )}
        {client.instagram && (
          <a
            href={`https://instagram.com/${client.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <InstaIcon /> @{client.instagram}
          </a>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/10">
        <div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{formatDT(due)}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {status === "paid"
              ? "paid this trimester"
              : status === "late"
              ? "overdue — late rate applied"
              : `due in ${remaining} day${remaining === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex gap-2">
          <IconButton label="Edit" onClick={onEdit}>
            <EditIcon />
          </IconButton>
          <IconButton label="Delete" onClick={onDelete} danger>
            <DeleteIcon />
          </IconButton>
        </div>
      </div>

      {status === "paid" ? (
        <button
          onClick={onRenew}
          className="rounded-xl border border-black/10 py-2 text-sm font-medium text-zinc-700 dark:border-white/10 dark:text-zinc-300"
        >
          Start new trimester
        </button>
      ) : (
        <button
          onClick={onTogglePaid}
          className="rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white"
        >
          Mark as paid
        </button>
      )}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 ${
        danger ? "text-rose-600 dark:text-rose-400" : "text-zinc-500 dark:text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function InstaIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
