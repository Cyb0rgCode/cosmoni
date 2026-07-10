const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export interface Trimester {
  id: string;
  label: string;
  start: Date;
  end: Date;
}

/** The ledger never tracks anything before this trimester — tracking starts July 2026. */
export const EPOCH_TRIMESTER_ID = "2026-07";

/** The trimester cycle anchors on July: Jul-Sep, Oct-Dec, Jan-Mar, Apr-Jun. */
function trimesterStartForDate(date: Date): Date {
  const month = date.getMonth();
  const shifted = (month - 6 + 12) % 12;
  const blockStartShifted = Math.floor(shifted / 3) * 3;
  const startMonth = (blockStartShifted + 6) % 12;
  const year = startMonth > month ? date.getFullYear() - 1 : date.getFullYear();
  return new Date(year, startMonth, 1);
}

function formatId(start: Date): string {
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
}

function parseId(id: string): Date {
  const [year, month] = id.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function trimesterFromId(id: string): Trimester {
  const start = parseId(id);
  const end = addMonths(start, 3);
  const lastMonth = addMonths(start, 2);
  const label = `${MONTH_SHORT[start.getMonth()]} – ${MONTH_SHORT[lastMonth.getMonth()]} ${start.getFullYear()}`;
  return { id, start, end, label };
}

export function currentTrimesterId(date: Date = new Date()): string {
  return formatId(trimesterStartForDate(date));
}

const VALID_START_MONTHS = new Set([1, 4, 7, 10]);

export function isValidTrimesterId(id: string): boolean {
  const match = /^(\d{4})-(\d{2})$/.exec(id);
  if (!match) return false;
  return VALID_START_MONTHS.has(Number(match[2]));
}

export function shiftTrimesterId(id: string, steps: number): string {
  return formatId(addMonths(parseId(id), steps * 3));
}

/** Number of trimester steps from `fromId` to `toId` (positive if `toId` is later). */
export function trimesterDistance(fromId: string, toId: string): number {
  const from = parseId(fromId);
  const to = parseId(toId);
  const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.round(months / 3);
}

/** All trimester ids from `fromId` to `toId` inclusive, ascending. Both must be valid trimester ids. */
export function trimesterRange(fromId: string, toId: string): string[] {
  const ids: string[] = [];
  let cursor = fromId;
  let guard = 0;
  while (cursor <= toId && guard < 400) {
    ids.push(cursor);
    if (cursor === toId) break;
    cursor = shiftTrimesterId(cursor, 1);
    guard += 1;
  }
  return ids;
}

/** Compact label for chips, e.g. "Jul '26". */
export function trimesterShortLabel(id: string): string {
  const { start } = trimesterFromId(id);
  const yy = String(start.getFullYear()).slice(-2);
  return `${MONTH_SHORT[start.getMonth()]} '${yy}`;
}
