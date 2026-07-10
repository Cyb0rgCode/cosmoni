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
  clients: Client[];
}
