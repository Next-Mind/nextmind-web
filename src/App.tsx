import { useState, useEffect } from "react";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dasboard/Dashboard";


export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) setUsuarioLogado(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUsuarioLogado(false);
  };

  return usuarioLogado ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <Login onLoginSucesso={() => setUsuarioLogado(true)} />
  );
}
