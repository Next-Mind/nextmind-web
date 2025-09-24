
import type { ReactNode } from "react";
import "./Card.css";

interface CardProps {
  titulo: string;
  descricao?: string;
  destaque?: string;
  icon?: ReactNode;
}

export default function Card({ titulo, descricao, destaque, icon }: CardProps) {
  return (
    <div className="card">
      <div className="card-left">
        <div className="card-icon">{icon}</div>
      </div>

      <div className="card-right">
        <div className="card-header">
          <h3 className="card-title">{titulo}</h3>
          {destaque && <span className="card-dot">{destaque}</span>}
        </div>
        {descricao && <p className="card-desc">{descricao}</p>}
      </div>
    </div>
  );
}
