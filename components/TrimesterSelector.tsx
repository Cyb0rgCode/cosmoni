"use client";

import { useMemo, useState } from "react";
import { useActiveTrimesterId, useLatestTrimesterId, switchTrimester } from "@/lib/store";
import { currentTrimesterId, nearbyTrimesterIds, trimesterFromId, trimesterDistance } from "@/lib/trimester";

export default function TrimesterSelector() {
  const activeTrimesterId = useActiveTrimesterId();
  const latestTrimesterId = useLatestTrimesterId();
  const [switching, setSwitching] = useState(false);
  const today = currentTrimesterId();

  const options = useMemo(() => {
    if (!activeTrimesterId) return [];
    return nearbyTrimesterIds(today, 5, 1, [activeTrimesterId, latestTrimesterId]).map((id) =>
      trimesterFromId(id)
    );
  }, [activeTrimesterId, latestTrimesterId, today]);

  async function handleSwitch(nextId: string) {
    if (!nextId || nextId === activeTrimesterId) return;

    // Advancing beyond the frontier creates new data and needs confirmation.
    // Switching to an already-recorded trimester is just a view — nothing to confirm.
    if (nextId > latestTrimesterId) {
      const steps = trimesterDistance(latestTrimesterId, nextId);
      const label = trimesterFromId(nextId).label;
      const confirmed = confirm(
        steps > 1
          ? `Advance ${steps} trimesters to ${label}?\n\nAt each step, clients still unpaid carry a flat 35 DT penalty forward, stacking with anything already owed.`
          : `Start the ${label} trimester?\n\nClients still unpaid when ${trimesterFromId(latestTrimesterId).label} closes carry a flat 35 DT penalty into this new trimester, on top of anything already owed.`
      );
      if (!confirmed) return;
    }

    setSwitching(true);
    try {
      await switchTrimester(nextId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to switch trimester");
    } finally {
      setSwitching(false);
    }
  }

  if (!activeTrimesterId) return null;

  const viewingHistory = activeTrimesterId !== latestTrimesterId;
  const isBehindToday = activeTrimesterId !== today;

  return (
    <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {viewingHistory ? "Viewing history" : "Active trimester"}
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {trimesterFromId(activeTrimesterId).label}
          </p>
        </div>
        <select
          value={activeTrimesterId}
          disabled={switching}
          onChange={(e) => handleSwitch(e.target.value)}
          className="rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-white/10 dark:text-zinc-50"
        >
          {options.map((t) => (
            <option key={t.id} value={t.id} className="text-zinc-900">
              {t.label}
              {t.id > latestTrimesterId ? " (new)" : ""}
            </option>
          ))}
        </select>
      </div>

      {viewingHistory && (
        <button
          onClick={() => handleSwitch(latestTrimesterId)}
          disabled={switching}
          className="mt-3 text-xs font-medium text-indigo-600 disabled:opacity-60 dark:text-indigo-400"
        >
          → Back to {trimesterFromId(latestTrimesterId).label} (current)
        </button>
      )}

      {!viewingHistory && isBehindToday && (
        <button
          onClick={() => handleSwitch(today)}
          disabled={switching}
          className="mt-3 text-xs font-medium text-indigo-600 disabled:opacity-60 dark:text-indigo-400"
        >
          → We&rsquo;re now in {trimesterFromId(today).label} — switch to it
        </button>
      )}
    </div>
  );
}
