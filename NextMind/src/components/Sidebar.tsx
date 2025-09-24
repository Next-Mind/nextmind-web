import "./Sidebar.css";
import {
  FiCalendar,
  FiMapPin,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

interface SidebarProps {
  ativo: string;
  setAtivo: (item: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({ ativo, setAtivo, onLogout }: SidebarProps) {
  const Item = ({ id, icon, label }: { id: string; icon: any; label: string }) => (
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
        <h2><img src="\src\assets\NextMindLogo.png" alt="NextMind" width={150} /></h2>
      </div>

      <nav>
        <ul>
          <Item id="dashboard" icon={<FiCalendar />} label="Dashboard" />
          <Item id="consultas" icon={<FiMapPin />} label="Consultas" />
          <Item id="chat" icon={<FiMessageSquare />} label="Chat" />
          <Item id="configuracoes" icon={<FiSettings />} label="Configurações" />
        </ul>
      </nav>

      {onLogout && (
        <button className="logout-btn" onClick={onLogout} aria-label="Logout">
          <FiLogOut />
          <span>Logout</span>
        </button>
      )}
    </aside>
  );
}
