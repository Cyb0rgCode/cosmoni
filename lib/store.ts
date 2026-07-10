"use client";

import { useSyncExternalStore } from "react";
import { Client, ClientInput } from "./types";

const STORAGE_KEY = "cosmoni.clients.v1";

let clients: Client[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function load() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    clients = raw ? (JSON.parse(raw) as Client[]) : [];
  } catch {
    clients = [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Client[] {
  load();
  return clients;
}

function getServerSnapshot(): Client[] {
  return [];
}

function uid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function addClient(input: ClientInput): Client {
  load();
  const now = new Date().toISOString();
  const client: Client = {
    id: uid(),
    ...input,
    trimesterStart: now,
    paid: false,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };
  clients = [client, ...clients];
  persist();
  return client;
}

export function updateClient(id: string, patch: Partial<ClientInput>) {
  load();
  clients = clients.map((c) =>
    c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
  );
  persist();
}

export function deleteClient(id: string) {
  load();
  clients = clients.filter((c) => c.id !== id);
  persist();
}

export function markPaid(id: string) {
  load();
  const now = new Date().toISOString();
  clients = clients.map((c) =>
    c.id === id ? { ...c, paid: true, paidAt: now, updatedAt: now } : c
  );
  persist();
}

export function markUnpaid(id: string) {
  load();
  const now = new Date().toISOString();
  clients = clients.map((c) =>
    c.id === id ? { ...c, paid: false, paidAt: null, updatedAt: now } : c
  );
  persist();
}

/** Starts a fresh trimester cycle for the client (e.g. after renewal). */
export function renewTrimester(id: string) {
  load();
  const now = new Date().toISOString();
  clients = clients.map((c) =>
    c.id === id
      ? { ...c, trimesterStart: now, paid: false, paidAt: null, updatedAt: now }
      : c
  );
  persist();
}

export function useClients(): Client[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
