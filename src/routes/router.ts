import type { ComponentType } from "react";
import Dashboard from "../pages/Dasboard/Dashboard";
import Login from "../pages/Login/Login";
import RegisterPsychologist from "../pages/RegisterPsychologist/RegisterPsychologist";

export type NavigationContext = {
  isAuthenticated: boolean;
};

export type Guard = (context: NavigationContext) => string | null;

export interface RouteDefinition {
  path: string;
  component: ComponentType;
  guard?: Guard;
}

export const mustBeAuthenticated: Guard = ({ isAuthenticated }) =>
  isAuthenticated ? null : "/login";

export const mustBeGuest: Guard = ({ isAuthenticated }) =>
  isAuthenticated ? "/dashboard" : null;

export const routes: RouteDefinition[] = [
  { path: "/login", component: Login, guard: mustBeGuest },
  {
    path: "/register/psychologist",
    component: RegisterPsychologist,
    guard: mustBeGuest,
  },
  { path: "/dashboard", component: Dashboard, guard: mustBeAuthenticated },
];

const defaultRoute = routes[0];

function resolveGuardRedirect(
  route: RouteDefinition,
  context: NavigationContext,
  currentPath: string
): { route: RouteDefinition; redirectPath: string } | null {
  if (!route.guard) {
    return null;
  }

  const redirectPath = route.guard(context);
  if (!redirectPath || redirectPath === currentPath) {
    return null;
  }

  const redirectRoute =
    routes.find((candidate) => candidate.path === redirectPath) ?? defaultRoute;

  return {
    route: redirectRoute,
    redirectPath,
  };
}

export function resolveRoute(
  path: string,
  context: NavigationContext
): { route: RouteDefinition; redirectPath: string | null } {
  const matchedRoute = routes.find((candidate) => candidate.path === path);
  const baseRoute = matchedRoute ?? defaultRoute;

  const guardResult = resolveGuardRedirect(baseRoute, context, path);
  if (guardResult) {
    return guardResult;
  }

  if (!matchedRoute) {
    return {
      route: baseRoute,
      redirectPath: baseRoute.path,
    };
  }

  return {
    route: baseRoute,
    redirectPath: null,
  };
}

export function getInitialRoutePath(pathname: string | undefined) {
  if (!pathname || pathname === "/") {
    return defaultRoute.path;
  }

  return pathname;
}
