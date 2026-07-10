"use client";

import { ChangeEvent, useRef, useState } from "react";
import { importData } from "@/lib/store";

export default function DataBackup() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const confirmed = confirm(
      "Import will replace ALL current data — clients, payment history, and posts — with the contents of this file. This can't be undone. Continue?"
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      alert("Data imported.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to import data");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-3 pb-2 text-xs text-zinc-400 dark:text-zinc-600">
      <a href="/api/export" className="hover:text-zinc-600 dark:hover:text-zinc-400">
        Export data
      </a>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={handleImportClick}
        disabled={busy}
        className="hover:text-zinc-600 disabled:opacity-60 dark:hover:text-zinc-400"
      >
        {busy ? "Importing..." : "Import data"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
