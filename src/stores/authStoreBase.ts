export interface AuthState {
  data: unknown | null;
  token: string | null;
}

const STORAGE_KEY = "authState";

const initialState: AuthState = (() => {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthState;
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          (parsed.token === null || typeof parsed.token === "string")
        ) {
          return {
            data: "data" in parsed ? parsed.data : null,
            token: parsed.token ?? null,
          } satisfies AuthState;
        }
      } catch (error) {
        console.warn("Failed to parse auth state from storage", error);
      }
    }
  }

  return { data: null, token: null };
})();

let state: AuthState = initialState;

const listeners = new Set<(next: AuthState) => void>();

function persist(next: AuthState) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("Failed to persist auth state", error);
    }
  }
}

function notify() {
  listeners.forEach((listener) => listener(state));
}

export function getAuthState(): AuthState {
  return state;
}

export function setAuthState(partial: Partial<AuthState>) {
  state = { ...state, ...partial };
  persist(state);
  notify();
}

export function clearAuthState() {
  state = { data: null, token: null };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear auth state", error);
    }
  }
  notify();
}

export function subscribeAuthState(listener: (next: AuthState) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInitialAuthState() {
  return initialState;
}

function hasValidToken(token: string | null): boolean {
  return typeof token === "string" && token.trim().length > 0;
}

export function isAuthenticated(nextState: AuthState): boolean {
  if (hasValidToken(nextState.token)) {
    return true;
  }

  return nextState.data !== null && nextState.data !== undefined;
}
