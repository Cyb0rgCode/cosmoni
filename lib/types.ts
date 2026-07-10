export interface Client {
  id: string;
  name: string;
  post: string;
  phone: string;
  instagram: string;
  /** ISO date string — start of the active trimester billing cycle */
  trimesterStart: string;
  paid: boolean;
  /** ISO date string of when the current trimester was paid, if paid */
  paidAt: string | null;
  /** DT owed from previous unpaid trimesters, stacked on top of the current trimester's fee */
  carriedOver: number;
  createdAt: string;
  updatedAt: string;
}

export type ClientInput = Pick<Client, "name" | "post" | "phone" | "instagram">;

export interface AppState {
  activeTrimesterId: string;
  /** The most recently opened trimester — the frontier. `activeTrimesterId` may be behind it (viewing history). */
  latestTrimesterId: string;
  /** Clients merged with their payment record for `activeTrimesterId`. */
  clients: Client[];
  posts: string[];
}
