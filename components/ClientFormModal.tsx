"use client";

import { FormEvent, useState } from "react";
import { usePosts } from "@/lib/store";
import { Client, ClientInput } from "@/lib/types";
import ManagePostsModal from "./ManagePostsModal";

const emptyForm: ClientInput = { name: "", post: "", phone: "", instagram: "" };

export default function ClientFormModal({
  client,
  onClose,
  onSubmit,
  saving,
}: {
  client: Client | null;
  onClose: () => void;
  onSubmit: (input: ClientInput) => void;
  saving?: boolean;
}) {
  const posts = usePosts();
  const [form, setForm] = useState<ClientInput>(() =>
    client
      ? { name: client.name, post: client.post, phone: client.phone, instagram: client.instagram }
      : emptyForm
  );
  const [showManagePosts, setShowManagePosts] = useState(false);

  const postOptions = form.post && !posts.includes(form.post) ? [form.post, ...posts] : posts;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      name: form.name.trim(),
      post: form.post.trim(),
      phone: form.phone.trim(),
      instagram: form.instagram.trim().replace(/^@/, ""),
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {client ? "Edit client" : "Add client"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <Field label="Name">
            <input
              autoFocus
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClasses}
              placeholder="Client name"
            />
          </Field>

          <Field
            label="Post"
            action={
              <button
                type="button"
                onClick={() => setShowManagePosts(true)}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400"
              >
                Manage
              </button>
            }
          >
            <select
              value={form.post}
              onChange={(e) => setForm({ ...form, post: e.target.value })}
              className={`${inputClasses} appearance-none`}
            >
              <option value="" className="text-zinc-900">
                — No post —
              </option>
              {postOptions.map((post) => (
                <option key={post} value={post} className="text-zinc-900">
                  {post}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Phone number">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClasses}
              placeholder="+216 12 345 678"
            />
          </Field>

          <Field label="Instagram username">
            <div className="flex items-center">
              <span className="rounded-l-xl border border-r-0 border-black/10 bg-zinc-100 px-3 py-2.5 text-sm text-zinc-500 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-400">
                @
              </span>
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className={`${inputClasses} rounded-l-none`}
                placeholder="username"
              />
            </div>
          </Field>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-zinc-700 disabled:opacity-60 dark:border-white/10 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : client ? "Save changes" : "Add client"}
            </button>
          </div>
        </form>
      </div>

      {showManagePosts && <ManagePostsModal onClose={() => setShowManagePosts(false)} />}
    </div>
  );
}

const inputClasses =
  "w-full rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:text-zinc-50";

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}
