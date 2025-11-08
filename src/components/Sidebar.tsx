import { type ReactNode } from "react";
import "./Sidebar.css";
import logo from "../assets/NextMindLogo.png";

interface SidebarProps {
  ativo: string;
  setAtivo: (item: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({ ativo, setAtivo, onLogout }: SidebarProps) {
  const Item = ({ id, icon, label }: { id: string; icon: ReactNode; label: string }) => (
    <li
      className={ativo === id ? "ativo sidebar-item" : "sidebar-item"}
      onClick={() => setAtivo(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setAtivo(id)}
    >
      <span className="sidebar-icon">{icon}</span>
      <span className="sidebar-label">{label}</span>
    </li>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="NextMind" width={150} />
      </div>

      <nav>
        <ul>
          <Item id="dashboard" icon={<span aria-hidden="true">📊</span>} label="Dashboard" />
          <Item id="consultas" icon={<span aria-hidden="true">📅</span>} label="Consultas" />
          <Item id="chat" icon={<span aria-hidden="true">💬</span>} label="Chat" />
          <Item id="configuracoes" icon={<span aria-hidden="true">⚙️</span>} label="Configurações" />
        </ul>
      </nav>

      {onLogout && (
        <button className="logout-btn" onClick={onLogout} aria-label="Logout">
          <span aria-hidden="true">🚪</span>
          <span>Logout</span>
        </button>
      )}
    </aside>
  );
}
