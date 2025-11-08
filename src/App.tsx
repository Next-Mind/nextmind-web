import {
  type ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { clearAuthState, isAuthenticated, useAuthState } from "./stores/authStore";
import { getInitialRoutePath, resolveRoute } from "./routes/router";
import type { DashboardProps } from "./pages/Dasboard/Dashboard";

function getInitialPathname() {
  if (typeof window === "undefined") {
    return getInitialRoutePath("/");
  }

  return getInitialRoutePath(window.location.pathname);
}

export default function App() {
  const authState = useAuthState();
  const usuarioLogado = isAuthenticated(authState);
  const [currentPath, setCurrentPath] = useState(getInitialPathname);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      setCurrentPath(getInitialRoutePath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = useCallback(
    (to: string, { replace = false }: { replace?: boolean } = {}) => {
      const normalizedPath = getInitialRoutePath(to);
      setCurrentPath((previousPath) =>
        previousPath === normalizedPath ? previousPath : normalizedPath
      );

      if (typeof window === "undefined") {
        return;
      }

      if (replace) {
        window.history.replaceState({}, "", normalizedPath);
      } else if (window.location.pathname !== normalizedPath) {
        window.history.pushState({}, "", normalizedPath);
      }
    },
    []
  );

  const { route, redirectPath } = useMemo(
    () =>
      resolveRoute(currentPath, {
        isAuthenticated: usuarioLogado,
      }),
    [currentPath, usuarioLogado]
  );

  useEffect(() => {
    if (redirectPath && redirectPath !== currentPath) {
      navigate(redirectPath, { replace: true });
      return;
    }

    if (typeof window !== "undefined" && window.location.pathname !== currentPath) {
      navigate(currentPath, { replace: true });
    }
  }, [redirectPath, currentPath, navigate]);

  const handleLogout = () => {
    clearAuthState();
    navigate("/login", { replace: true });
  };

  const RouteComponent = route.component;

  if (route.path === "/dashboard") {
    const DashboardComponent = RouteComponent as ComponentType<DashboardProps>;
    return <DashboardComponent onLogout={handleLogout} />;
  }

  const GenericComponent = RouteComponent as ComponentType<Record<string, never>>;
  return <GenericComponent />;
}
