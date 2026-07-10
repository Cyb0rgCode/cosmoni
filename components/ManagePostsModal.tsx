"use client";

import { FormEvent, useState } from "react";
import { usePosts, addPost, deletePost } from "@/lib/store";

export default function ManagePostsModal({ onClose }: { onClose: () => void }) {
  const posts = usePosts();
  const [newPost, setNewPost] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const name = newPost.trim();
    if (!name) return;
    setBusy(true);
    try {
      await addPost(name);
      setNewPost("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add post");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Remove "${name}" from the list of posts?`)) return;
    setBusy(true);
    try {
      await deletePost(name);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to remove post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Manage posts</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <input
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="New post name"
            className="flex-1 rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={busy || !newPost.trim()}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add
          </button>
        </form>

        <ul className="mt-4 flex-1 overflow-y-auto">
          {posts.length === 0 ? (
            <li className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No posts yet.</li>
          ) : (
            posts.map((post) => (
              <li
                key={post}
                className="flex items-center justify-between gap-2 border-b border-black/5 py-2.5 last:border-b-0 dark:border-white/10"
              >
                <span className="text-sm text-zinc-900 dark:text-zinc-50">{post}</span>
                <button
                  onClick={() => handleDelete(post)}
                  disabled={busy}
                  aria-label={`Delete ${post}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-600 disabled:opacity-60 dark:text-rose-400"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
