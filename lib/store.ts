"use client";

import { useSyncExternalStore } from "react";
import { AppState, Client } from "./types";

let clients: Client[] = [];
let activeTrimesterId = "";
let loaded = false;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Request failed");
  }

  return res.status === 204 ? null : res.json();
}

function fetchState(): Promise<void> {
  if (!inFlight) {
    inFlight = api("/api/state")
      .then((data) => {
        const state = data as AppState;
        clients = state.clients;
        activeTrimesterId = state.activeTrimesterId;
        loaded = true;
        emit();
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) fetchState();
  return () => listeners.delete(listener);
}

function getSnapshot(): Client[] {
  return clients;
}

function getServerSnapshot(): Client[] {
  return [];
}

function getLoaded(): boolean {
  return loaded;
}

function getActiveTrimesterId(): string {
  return activeTrimesterId;
}

export function useClients(): Client[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useClientsLoaded(): boolean {
  return useSyncExternalStore(subscribe, getLoaded, () => false);
}

export function useActiveTrimesterId(): string {
  return useSyncExternalStore(subscribe, getActiveTrimesterId, () => "");
}

export async function addClient(input: {
  name: string;
  post: string;
  phone: string;
  instagram: string;
}): Promise<Client> {
  const client = (await api("/api/clients", {
    method: "POST",
    body: JSON.stringify(input),
  })) as Client;
  clients = [client, ...clients];
  emit();
  return client;
}

export async function updateClient(id: string, patch: Partial<Client>): Promise<void> {
  const updated = (await api(`/api/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })) as Client;
  clients = clients.map((c) => (c.id === id ? updated : c));
  emit();
}

export async function deleteClient(id: string): Promise<void> {
  await api(`/api/clients/${id}`, { method: "DELETE" });
  clients = clients.filter((c) => c.id !== id);
  emit();
}

export function markPaid(id: string): Promise<void> {
  return updateClient(id, { paid: true, paidAt: new Date().toISOString(), carriedOver: 0 });
}

export function markUnpaid(id: string): Promise<void> {
  return updateClient(id, { paid: false, paidAt: null });
}

/** Switches the app's active trimester. Unpaid clients carry their owed amount forward. */
export async function switchTrimester(trimesterId: string): Promise<void> {
  const state = (await api("/api/trimester", {
    method: "POST",
    body: JSON.stringify({ trimesterId }),
  })) as AppState;
  clients = state.clients;
  activeTrimesterId = state.activeTrimesterId;
  emit();
}
