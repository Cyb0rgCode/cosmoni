"use client";

import { useMemo, useState } from "react";
import {
  useClients,
  useClientsLoaded,
  addClient,
  updateClient,
  deleteClient,
  markPaid,
  markUnpaid,
} from "@/lib/store";
import { paymentStatus, PaymentStatus } from "@/lib/payment";
import { Client, ClientInput } from "@/lib/types";
import ClientCard from "@/components/ClientCard";
import ClientListRow from "@/components/ClientListRow";
import ClientFormModal from "@/components/ClientFormModal";
import ThemeToggle from "@/components/ThemeToggle";

type ViewMode = "card" | "list";
type Filter = "all" | "unpaid" | "paid";

function reportError(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  alert(message);
}

export default function ClientsPage() {
  const clients = useClients();
  const loaded = useClientsLoaded();
  const [view, setView] = useState<ViewMode>("card");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (q && !`${c.name} ${c.post} ${c.instagram} ${c.phone}`.toLowerCase().includes(q)) {
        return false;
      }
      if (filter === "all") return true;
      const status: PaymentStatus = paymentStatus(c);
      return filter === "paid" ? status === "paid" : status !== "paid";
    });
  }, [clients, query, filter]);

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setShowForm(true);
  }

  async function handleSubmit(input: ClientInput) {
    setSaving(true);
    try {
      if (editing) {
        await updateClient(editing.id, input);
      } else {
        await addClient(input);
      }
      setShowForm(false);
      setEditing(null);
    } catch (error) {
      reportError(error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(client: Client) {
    if (!confirm(`Delete ${client.name}? This can't be undone.`)) return;
    try {
      await deleteClient(client.id);
    } catch (error) {
      reportError(error);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-8 pt-6 sm:px-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Clients</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white"
          >
            <PlusIcon /> Add
          </button>
        </div>
      </header>

      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:text-zinc-50"
          />
        </div>
        <div className="flex shrink-0 rounded-xl border border-black/10 p-0.5 dark:border-white/10">
          <ViewButton active={view === "card"} onClick={() => setView("card")} label="Card view">
            <GridIcon />
          </ViewButton>
          <ViewButton active={view === "list"} onClick={() => setView("list")} label="List view">
            <ListIcon />
          </ViewButton>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(["all", "unpaid", "paid"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-black/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {!loaded ? (
        <div className="rounded-2xl border border-black/10 p-8 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          Loading clients...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-black/10 p-8 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          {clients.length === 0 ? "No clients yet — tap Add to create one." : "No clients match your search."}
        </div>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => openEdit(client)}
              onDelete={() => handleDelete(client)}
              onTogglePaid={() => markPaid(client.id).catch(reportError)}
              onMarkUnpaid={() => markUnpaid(client.id).catch(reportError)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((client) => (
            <ClientListRow
              key={client.id}
              client={client}
              onEdit={() => openEdit(client)}
              onDelete={() => handleDelete(client)}
              onTogglePaid={() => markPaid(client.id).catch(reportError)}
              onMarkUnpaid={() => markUnpaid(client.id).catch(reportError)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ClientFormModal
          key={editing?.id ?? "new"}
          client={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
          saving={saving}
        />
      )}
    </main>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
        active ? "bg-indigo-600 text-white" : "text-zinc-500 dark:text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
