"use client";

import { useMemo, useState } from "react";
import { useActiveTrimesterId, useLatestTrimesterId, useTodayTrimesterId, switchTrimester } from "@/lib/store";
import {
  shiftTrimesterId,
  trimesterDistance,
  trimesterFromId,
  trimesterRange,
  trimesterShortLabel,
  EPOCH_TRIMESTER_ID,
} from "@/lib/trimester";

const VISIBLE_COUNT = 4;
const FUTURE_COUNT = 3;

export default function TrimesterSelector() {
  const activeTrimesterId = useActiveTrimesterId();
  const latestTrimesterId = useLatestTrimesterId();
  const today = useTodayTrimesterId();
  const [switching, setSwitching] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const history = useMemo(() => {
    if (!latestTrimesterId) return [];
    return trimesterRange(EPOCH_TRIMESTER_ID, latestTrimesterId);
  }, [latestTrimesterId]);

  const future = useMemo(() => {
    if (!latestTrimesterId) return [];
    return trimesterRange(shiftTrimesterId(latestTrimesterId, 1), shiftTrimesterId(latestTrimesterId, FUTURE_COUNT));
  }, [latestTrimesterId]);

  const hasMore = history.length > VISIBLE_COUNT;
  const visibleHistory = showAll ? history : history.slice(-VISIBLE_COUNT);

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
  const todayBeyondShown = future.length > 0 ? today > future[future.length - 1] : today > latestTrimesterId;

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
        {visibleHistory.map((id) => (
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
        {future.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSwitch(id)}
            disabled={switching}
            className="rounded-full border border-dashed border-black/15 px-3.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors disabled:opacity-60 dark:border-white/15 dark:text-zinc-500"
          >
            + {trimesterShortLabel(id)}
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

      {!viewingHistory && todayBeyondShown && (
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
