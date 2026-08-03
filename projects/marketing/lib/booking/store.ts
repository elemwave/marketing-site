export interface CodeEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

/** Port for persisting pending confirmation codes, keyed by email. */
export interface CodeStore {
  get(email: string): CodeEntry | undefined;
  set(email: string, entry: CodeEntry): void;
  delete(email: string): void;
}

/**
 * In-memory store for the mocked flow. Held on `globalThis` so dev HMR does
 * not wipe pending codes between the request and verify calls. Does not
 * survive server restarts or scale past one instance — a real deployment
 * swaps this for a shared store behind the same port (see ADR-0001).
 */
export class InMemoryCodeStore implements CodeStore {
  private readonly entries: Map<string, CodeEntry>;

  constructor() {
    const holder = globalThis as { __bookingCodes?: Map<string, CodeEntry> };
    holder.__bookingCodes ??= new Map();
    this.entries = holder.__bookingCodes;
  }

  get(email: string) {
    return this.entries.get(email);
  }

  set(email: string, entry: CodeEntry) {
    this.entries.set(email, entry);
  }

  delete(email: string) {
    this.entries.delete(email);
  }
}
