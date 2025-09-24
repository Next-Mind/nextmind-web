import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import "./Dashboard.css";
import {
  FiCalendar,
  FiMapPin,
  FiMessageSquare,
  FiBell,
} from "react-icons/fi";
import { LineChart } from '@mui/x-charts/LineChart';
import Consultas from "../Consultas/Consultas";
import Chat from "../Chat/Chat";
import Configuracoes from "../Configuracoes/Configuracoes";


interface DashboardProps {
  onLogout?: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [ativo, setAtivo] = useState("dashboard");

  return (
    <div className="dashboard-container">
      <Sidebar ativo={ativo} setAtivo={setAtivo} onLogout={onLogout} />

     <main className="conteudo-principal">
  {ativo === "dashboard" && (
    <section className="cards-row" aria-label="Resumo">
      <Card
        titulo="Consultas desta semana"
        descricao="Você tem 5 consultas agendadas esta semana."
        icon={<FiCalendar />}
        destaque="5"
      />
      <Card
        titulo="Eventos do mês"
        descricao="3 eventos programados"
        icon={<FiMapPin />}
        destaque="3"
      />
      <Card
        titulo="Mensagens"
        descricao="Você tem 5 conversas não lidas"
        icon={<FiMessageSquare />}
        destaque="5"
      />
      <Card
        titulo="Notificações"
        descricao="5 notificações novas"
        icon={<FiBell />}
        destaque="5"
      />
    </section>
  )}

 <section className={`painel ${ativo}`}>
    {ativo === "dashboard" && (
      <>
        <h3>Evolução Acadêmica dos Alunos</h3>
        <LineChart
          xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7], label: "Semanas" }]}
          series={[
            { data: [65, 72, 78, 80, 85, 90, 93], label: "Média da turma (%)", color: "#ffffff" },
            { data: [60, 68, 75, 77, 83, 87, 92], label: "Paciente João (%)", color: "#ffffff" },
          ]}
          width={1500}
          height={320}
          sx={{ backgroundColor: "grey", borderRadius: 2 }}
        />
      </>
    )}

    {ativo === "consultas" && <Consultas />}
    {ativo === "chat" &&  <Chat />}
    {ativo === "configuracoes" && <Configuracoes/>}
  </section>
</main>

    </div>
  );
}
