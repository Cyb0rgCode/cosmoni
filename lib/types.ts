export interface Client {
  id: string;
  name: string;
  post: string;
  phone: string;
  instagram: string;
  /** ISO date string — start of the client's current trimester billing cycle */
  trimesterStart: string;
  paid: boolean;
  /** ISO date string of when the current trimester was paid, if paid */
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ClientInput = Pick<Client, "name" | "post" | "phone" | "instagram">;
