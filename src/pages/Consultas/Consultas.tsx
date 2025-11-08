import { useState } from "react";
import "./Consultas.css";
import Card from "../../components/Card";

interface Consulta {
  paciente: string;
  data: string;
}

interface Evento {
  titulo: string;
  data: string;
}

export default function Consultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([
    { paciente: "João Silva", data: "25/09/2025" },
    { paciente: "Maria Oliveira", data: "26/09/2025" },
    { paciente: "Lucas Santos", data: "27/09/2025" },
  ]);

  const [eventos] = useState<Evento[]>([
    { titulo: "Workshop de Psicologia", data: "30/09/2025" },
    { titulo: "Reunião com Escola ABC", data: "05/10/2025" },
  ]);

  const marcarConsulta = () => {
    const paciente = prompt("Nome do paciente:");
    const data = prompt("Data da consulta (DD/MM/AAAA):");
    if (paciente && data) {
      setConsultas([...consultas, { paciente, data }]);
    }
  };

  return (
    <div className="consultas-container">
      <section className="cards-row">
        <Card
          titulo="Consultas desta semana"
          descricao={`Você tem ${consultas.length} consultas`}
          icon={<span aria-hidden="true">📅</span>}
          destaque={String(consultas.length)}
        />
        <Card
          titulo="Eventos do mês"
          descricao={`${eventos.length} eventos`}
          icon={<span aria-hidden="true">📍</span>}
          destaque={String(eventos.length)}
        />
      </section>

      <section className="painel-consultas">
        <h3>Consultas Marcadas</h3>
        <button className="btn-primary" onClick={marcarConsulta}>
          Marcar Consulta
        </button>
        <ul className="lista-consultas">
          {consultas.map((c, i) => (
            <li key={i}>
              <strong>{c.paciente}</strong> - {c.data}
            </li>
          ))}
        </ul>

        <h3>Eventos do Mês</h3>
        <ul className="lista-eventos">
          {eventos.map((e, i) => (
            <li key={i}>
              <strong>{e.titulo}</strong> - {e.data}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
