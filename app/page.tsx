"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useClients, useClientsLoaded } from "@/lib/store";
import { amountDue, paymentStatus, LATE_PRICE } from "@/lib/payment";
import { formatDT } from "@/lib/format";
import StatCard from "@/components/StatCard";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import TrimesterSelector from "@/components/TrimesterSelector";
import DataBackup from "@/components/DataBackup";

export default function DashboardPage() {
  const clients = useClients();
  const loaded = useClientsLoaded();

  const stats = useMemo(() => {
    let paidCount = 0;
    let paidAmount = 0;
    let unpaidCount = 0;
    let unpaidAmount = 0;
    let lateCount = 0;

    for (const client of clients) {
      const status = paymentStatus(client);
      const due = amountDue(client);
      if (status === "paid") {
        paidCount += 1;
        paidAmount += due;
      } else {
        unpaidCount += 1;
        unpaidAmount += due;
        if (status === "late") lateCount += 1;
      }
    }

    return { paidCount, paidAmount, unpaidCount, unpaidAmount, lateCount };
  }, [clients]);

  const attention = useMemo(
    () =>
      clients.filter((c) => paymentStatus(c) === "late").sort((a, b) => a.name.localeCompare(b.name)),
    [clients]
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-8 pt-6 sm:px-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {loaded ? `${clients.length} client${clients.length === 1 ? "" : "s"} total` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <div className="mb-6">
        <TrimesterSelector />
      </div>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Paid" value={String(stats.paidCount)} tone="success" />
        <StatCard label="Unpaid" value={String(stats.unpaidCount)} tone={stats.unpaidCount > 0 ? "danger" : "default"} />
        <StatCard label="Collected" value={formatDT(stats.paidAmount)} sub="this trimester" tone="success" />
        <StatCard
          label="Outstanding"
          value={formatDT(stats.unpaidAmount)}
          sub={stats.lateCount > 0 ? `${stats.lateCount} overdue (${LATE_PRICE} DT)` : "still on time"}
          tone={stats.unpaidAmount > 0 ? "warning" : "default"}
        />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Needs attention
          </h2>
          {attention.length > 0 && (
            <Link href="/clients" className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              View all
            </Link>
          )}
        </div>

        {!loaded ? (
          <div className="rounded-2xl border border-black/10 p-6 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            Loading...
          </div>
        ) : attention.length === 0 ? (
          <div className="rounded-2xl border border-black/10 p-6 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            {clients.length === 0 ? (
              <>
                No clients yet.{" "}
                <Link href="/clients" className="font-medium text-indigo-600 dark:text-indigo-400">
                  Add your first client
                </Link>
                .
              </>
            ) : (
              "No overdue clients — nice work."
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {attention.map((client) => (
              <li key={client.id}>
                <Link
                  href="/clients"
                  className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{client.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{client.post || "—"}</p>
                  </div>
                  <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    {formatDT(amountDue(client))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DataBackup />
    </main>
  );
}
