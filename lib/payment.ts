import { Client } from "./types";

export const BASE_PRICE = 25;
export const LATE_PRICE = 35;
export const GRACE_DAYS = 15;
export const TRIMESTER_MONTHS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBetween(fromIso: string, toIso: string = new Date().toISOString()): number {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const fromUTC = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUTC = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((toUTC - fromUTC) / DAY_MS);
}

export function trimesterEnd(trimesterStart: string): Date {
  const start = new Date(trimesterStart);
  const end = new Date(start);
  end.setMonth(end.getMonth() + TRIMESTER_MONTHS);
  return end;
}

/** Amount owed for the client's current trimester, based on whether/when they paid. */
export function amountDue(client: Pick<Client, "trimesterStart" | "paid" | "paidAt">): number {
  const referenceDate = client.paid && client.paidAt ? client.paidAt : new Date().toISOString();
  const elapsed = daysBetween(client.trimesterStart, referenceDate);
  return elapsed <= GRACE_DAYS ? BASE_PRICE : LATE_PRICE;
}

/** True once an unpaid client has passed the 15-day grace window (now owes the late price). */
export function isLate(client: Pick<Client, "trimesterStart" | "paid">): boolean {
  if (client.paid) return false;
  return daysBetween(client.trimesterStart) > GRACE_DAYS;
}

export type PaymentStatus = "paid" | "on-time" | "late";

export function paymentStatus(client: Pick<Client, "trimesterStart" | "paid">): PaymentStatus {
  if (client.paid) return "paid";
  return isLate(client) ? "late" : "on-time";
}

export function daysUntilLate(client: Pick<Client, "trimesterStart" | "paid">): number {
  return GRACE_DAYS - daysBetween(client.trimesterStart);
}
