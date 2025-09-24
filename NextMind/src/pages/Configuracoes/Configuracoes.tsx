import { useState, useEffect, type ChangeEvent } from "react";
import "./Configuracoes.css";

interface Psicologo {
  nome: string;
  nascimento: string;
  email: string;
  crp: string;
  senha: string;
  fotoPerfil?: string;
}

export default function Configuracoes() {
  const [usuario, setUsuario] = useState<Psicologo | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const parsedUser: Psicologo = JSON.parse(currentUser);
      setUsuario(parsedUser);
      if (parsedUser.fotoPerfil) setFotoPreview(parsedUser.fotoPerfil);
    }
  }, []);

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFotoPreview(base64);

        if (usuario) {
          const atualizado = { ...usuario, fotoPerfil: base64 };
          setUsuario(atualizado);
          localStorage.setItem("currentUser", JSON.stringify(atualizado));

          const psicologos = localStorage.getItem("psicologos");
          if (psicologos) {
            const lista = JSON.parse(psicologos) as Psicologo[];
            const index = lista.findIndex((p) => p.email === usuario.email);
            if (index !== -1) {
              lista[index] = atualizado;
              localStorage.setItem("psicologos", JSON.stringify(lista));
            }
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!usuario) return <p>Carregando dados...</p>;

  return (
    <div className="config-container">
      <h2>Configurações</h2>

      <div className="perfil-section">
        <div className="foto-perfil">
          {fotoPreview ? (
            <img src={fotoPreview} alt="Foto de Perfil" />
          ) : (
            <div className="placeholder">Sem foto</div>
          )}
          <input type="file" accept="image/*" onChange={handleFotoChange} />
        </div>

        <div className="info-perfil">
          <p><strong>Nome:</strong> {usuario.nome}</p>
          <p><strong>Data de Nascimento:</strong> {usuario.nascimento}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>CRP:</strong> {usuario.crp}</p>
        </div>
      </div>
    </div>
  );
}
