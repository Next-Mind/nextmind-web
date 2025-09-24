import { useState } from "react";
import "./Chat.css";

interface Mensagem {
  de: "psicologo" | "paciente";
  texto: string;
  hora: string;
}

interface Conversa {
  id: number;
  nome: string;
  avatar?: string;
  mensagens: Mensagem[];
}

const conversasMock: Conversa[] = [
  {
    id: 1,
    nome: "João Silva",
    avatar: "https://i.pravatar.cc/150?img=1",
    mensagens: [
      { de: "paciente", texto: "Olá, doutor!", hora: "09:12" },
      { de: "psicologo", texto: "Oi João, como você está?", hora: "09:13" },
      { de: "paciente", texto: "Estou bem, obrigado!", hora: "09:15" },
    ],
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    avatar: "https://i.pravatar.cc/150?img=2",
    mensagens: [
      { de: "paciente", texto: "Bom dia!", hora: "08:00" },
      { de: "psicologo", texto: "Bom dia Maria, pronta para nossa sessão?", hora: "08:02" },
    ],
  },
];

export default function Chat() {
  const [conversaAtiva, setConversaAtiva] = useState<Conversa | null>(conversasMock[0]);

  return (
    <div className="chat-container">
      <aside className="conversas-lista">
        {conversasMock.map((c) => (
          <div
            key={c.id}
            className={`conversa-item ${conversaAtiva?.id === c.id ? "ativo" : ""}`}
            onClick={() => setConversaAtiva(c)}
          >
            <img src={c.avatar} alt={c.nome} />
            <div>
              <strong>{c.nome}</strong>
              <p>{c.mensagens[c.mensagens.length - 1].texto}</p>
            </div>
          </div>
        ))}
      </aside>

      <section className="chat-box">
        {conversaAtiva && (
          <>
            <header>
              <img src={conversaAtiva.avatar} alt={conversaAtiva.nome} />
              <h3>{conversaAtiva.nome}</h3>
            </header>
            <div className="mensagens">
              {conversaAtiva.mensagens.map((m, i) => (
                <div key={i} className={`mensagem ${m.de}`}>
                  <span>{m.texto}</span>
                  <small>{m.hora}</small>
                </div>
              ))}
            </div>
            <footer>
              <input type="text" placeholder="Digite uma mensagem..." />
              <button>Enviar</button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
