import { Client } from "./types";
import { amountDue, paymentStatus } from "./payment";

export type SortKey =
  | "name-asc"
  | "name-desc"
  | "amount-desc"
  | "amount-asc"
  | "status"
  | "newest"
  | "oldest";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "amount-desc", label: "Amount due (high–low)" },
  { value: "amount-asc", label: "Amount due (low–high)" },
  { value: "status", label: "Status (overdue first)" },
  { value: "newest", label: "Newest added" },
  { value: "oldest", label: "Oldest added" },
];

function statusRank(client: Client): number {
  const status = paymentStatus(client);
  return status === "late" ? 0 : status === "on-time" ? 1 : 2;
}

export function sortClients(clients: Client[], key: SortKey): Client[] {
  const sorted = [...clients];
  switch (key) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "amount-desc":
      return sorted.sort((a, b) => amountDue(b) - amountDue(a) || a.name.localeCompare(b.name));
    case "amount-asc":
      return sorted.sort((a, b) => amountDue(a) - amountDue(b) || a.name.localeCompare(b.name));
    case "status":
      return sorted.sort((a, b) => statusRank(a) - statusRank(b) || a.name.localeCompare(b.name));
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "oldest":
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    default:
      return sorted;
  }
}
