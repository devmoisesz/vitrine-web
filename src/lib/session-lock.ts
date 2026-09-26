// Serialize cookie rotation across tabs, and wait for pending refreshes before logout.
export async function withSessionLock<T>(action: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("vitrine-session", action);
  }
  return action();
}
