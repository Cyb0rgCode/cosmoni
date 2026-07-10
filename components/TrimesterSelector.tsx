"use client";

import { useMemo, useState } from "react";
import { useActiveTrimesterId, useLatestTrimesterId, switchTrimester } from "@/lib/store";
import {
  currentTrimesterId,
  trimesterDistance,
  trimesterFromId,
  trimesterRange,
  trimesterShortLabel,
  EPOCH_TRIMESTER_ID,
} from "@/lib/trimester";

const VISIBLE_COUNT = 4;

export default function TrimesterSelector() {
  const activeTrimesterId = useActiveTrimesterId();
  const latestTrimesterId = useLatestTrimesterId();
  const [switching, setSwitching] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const today = currentTrimesterId();

  const history = useMemo(() => {
    if (!latestTrimesterId) return [];
    return trimesterRange(EPOCH_TRIMESTER_ID, latestTrimesterId);
  }, [latestTrimesterId]);

  const hasMore = history.length > VISIBLE_COUNT;
  const visible = showAll ? history : history.slice(-VISIBLE_COUNT);

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
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {viewingHistory ? "Viewing history" : "Active trimester"}
      </p>
      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {trimesterFromId(activeTrimesterId).label}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400"
          >
            {showAll ? "Less" : "More"}
          </button>
        )}
        {visible.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSwitch(id)}
            disabled={switching}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
              id === activeTrimesterId
                ? "bg-indigo-600 text-white"
                : "bg-black/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            }`}
          >
            {trimesterShortLabel(id)}
          </button>
        ))}
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
