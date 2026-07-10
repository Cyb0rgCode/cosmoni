"use client";

import { useMemo, useState } from "react";
import { useActiveTrimesterId, switchTrimester } from "@/lib/store";
import { currentTrimesterId, nearbyTrimesterIds, trimesterFromId } from "@/lib/trimester";

export default function TrimesterSelector() {
  const activeTrimesterId = useActiveTrimesterId();
  const [switching, setSwitching] = useState(false);
  const today = currentTrimesterId();

  const options = useMemo(() => {
    if (!activeTrimesterId) return [];
    return nearbyTrimesterIds(today, 3, 1, activeTrimesterId).map((id) => trimesterFromId(id));
  }, [activeTrimesterId, today]);

  async function handleSwitch(nextId: string) {
    if (!nextId || nextId === activeTrimesterId) return;
    const label = trimesterFromId(nextId).label;
    const confirmed = confirm(
      `Switch the active trimester to ${label}?\n\nEvery client still marked unpaid will carry their owed amount into the new trimester (compounding with the new period's fee). Paid clients reset to unpaid for the new period.`
    );
    if (!confirmed) return;

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

  const isBehind = activeTrimesterId !== today;

  return (
    <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Active trimester
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
            </option>
          ))}
        </select>
      </div>

      {isBehind && (
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
