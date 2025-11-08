import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dasboard/Dashboard";
import { clearAuthState, useAuthState } from "./stores/authStore";

export default function App() {
  const { token } = useAuthState();
  const usuarioLogado = Boolean(token);

  const handleLogout = () => {
    clearAuthState();
  };

  return usuarioLogado ? <Dashboard onLogout={handleLogout} /> : <Login />;
}
