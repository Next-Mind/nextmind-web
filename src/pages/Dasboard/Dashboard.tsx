import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import SimpleLineChart from "../../components/SimpleLineChart";
import "./Dashboard.css";
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
              icon={<span aria-hidden="true">📅</span>}
              destaque="5"
            />
            <Card
              titulo="Eventos do mês"
              descricao="3 eventos programados"
              icon={<span aria-hidden="true">📍</span>}
              destaque="3"
            />
            <Card
              titulo="Mensagens"
              descricao="Você tem 5 conversas não lidas"
              icon={<span aria-hidden="true">💬</span>}
              destaque="5"
            />
            <Card
              titulo="Notificações"
              descricao="5 notificações novas"
              icon={<span aria-hidden="true">🔔</span>}
              destaque="5"
            />
          </section>
        )}

        <section className={`painel ${ativo}`}>
          {ativo === "dashboard" && (
            <>
              <h3>Evolução Acadêmica dos Alunos</h3>
              <SimpleLineChart
                title="Evolução Acadêmica dos Alunos"
                xLabels={["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7"]}
                series={[
                  { data: [65, 72, 78, 80, 85, 90, 93], label: "Média da turma (%)", color: "#60a5fa" },
                  { data: [60, 68, 75, 77, 83, 87, 92], label: "Paciente João (%)", color: "#a78bfa" },
                ]}
              />
            </>
          )}

          {ativo === "consultas" && <Consultas />}
          {ativo === "chat" && <Chat />}
          {ativo === "configuracoes" && <Configuracoes />}
        </section>
      </main>
    </div>
  );
}
