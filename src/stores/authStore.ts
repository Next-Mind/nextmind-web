import { useSyncExternalStore } from "react";
import { getAuthState, getInitialAuthState, subscribeAuthState } from "./authStoreBase";
import type { AuthState } from "./authStoreBase";

export {
  clearAuthState,
  getAuthState,
  getInitialAuthState,
  isAuthenticated,
  setAuthState,
} from "./authStoreBase";
export type { AuthState } from "./authStoreBase";

export function useAuthState(): AuthState {
  return useSyncExternalStore(subscribeAuthState, getAuthState, getInitialAuthState);
}
