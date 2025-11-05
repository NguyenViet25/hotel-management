// helpers/account.ts

/**
 * Checks if an account is currently locked
 * @param lockedUntil - ISO date string of when the account unlocks
 * @returns true if the current time is before lockedUntil, false otherwise
 */
export function isLocked(lockedUntil?: string | null): boolean {
  if (!lockedUntil) return false; // no lock
  const lockedDate = new Date(lockedUntil);
  const now = new Date();
  return lockedDate > now;
}
