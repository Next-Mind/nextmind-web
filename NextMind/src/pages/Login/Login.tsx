import { useState, type FormEvent } from "react";
import "./Login.css";
import NextMindLogo from "../../assets/NextMindLogo.png";

interface Psicologo {
  nome: string;
  nascimento: string;
  email: string;
  crp: string;
  senha: string;
}

interface LoginProps {
  onLoginSucesso: () => void; 
}

export default function Login({ onLoginSucesso }: LoginProps) {
  const [modoCadastro, setModoCadastro] = useState(false);

  const [nome, setNome] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [crp, setCrp] = useState("");
  const [senha, setSenha] = useState("");

  const [erroNome, setErroNome] = useState("");
  const [erroNascimento, setErroNascimento] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroCrp, setErroCrp] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [mensagemGeral, setMensagemGeral] = useState("");

  const getPsicologos = (): Psicologo[] => {
    const data = localStorage.getItem("psicologos");
    return data ? JSON.parse(data) : [];
  };

  const savePsicologo = (p: Psicologo) => {
    const psicologos = getPsicologos();
    psicologos.push(p);
    localStorage.setItem("psicologos", JSON.stringify(psicologos));
  };

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const isMaior18 = (data: string) => {
    const hoje = new Date();
    const nascimento = new Date(data);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade >= 18;
  };

  
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setMensagemGeral("");

    if (!isValidEmail(email)) {
      setErroEmail("Email inválido");
      return;
    } else {
      setErroEmail("");
    }

    const psicologos = getPsicologos();
    const user = psicologos.find((p) => p.email === email && p.senha === senha);

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      onLoginSucesso(); 
    } else {
      setMensagemGeral("Usuário não encontrado. Crie uma conta.");
    }
  };

  
  const handleCadastro = (e: FormEvent) => {
    e.preventDefault();

    setErroNome("");
    setErroNascimento("");
    setErroEmail("");
    setErroCrp("");
    setErroSenha("");
    setMensagemGeral("");

    let valido = true;

    
    if (!nome) {
      setErroNome("Nome é obrigatório");
      valido = false;
    } else if (nome.length > 50) {
      setErroNome("Nome não pode ter mais de 50 caracteres");
      valido = false;
    } else if (/^\d+$/.test(nome.replace(/\s+/g, ""))) {
      setErroNome("Nome inválido");
      valido = false;
    }

    
    if (!nascimento) {
      setErroNascimento("Data de nascimento é obrigatória");
      valido = false;
    } else if (!isMaior18(nascimento)) {
      setErroNascimento("Você precisa ter 18 anos ou mais");
      valido = false;
    }

    
    if (!email) {
      setErroEmail("Email é obrigatório");
      valido = false;
    } else if (!isValidEmail(email)) {
      setErroEmail("Email inválido");
      valido = false;
    } else if (email.length > 200) {
      setErroEmail("Email muito longo");
      valido = false;
    }

    
    if (!crp) {
      setErroCrp("CRP é obrigatório");
      valido = false;
    } else if (crp.length > 10) {
      setErroCrp("CRP deve ter no máximo 10 caracteres");
      valido = false;
    }

    
    if (!senha) {
      setErroSenha("Senha é obrigatória");
      valido = false;
    } else if (senha.length > 200) {
      setErroSenha("Senha muito longa");
      valido = false;
    }

    if (!valido) return;

    
    const psicologos = getPsicologos();
    const existe = psicologos.find((p) => p.email === email);
    if (existe) {
      setErroEmail("Esse email já está cadastrado");
      return;
    }

    const novo = { nome, nascimento, email, crp, senha };
    savePsicologo(novo);
    localStorage.setItem("currentUser", JSON.stringify(novo));
    onLoginSucesso(); 
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={modoCadastro ? handleCadastro : handleLogin}>
        <img src={NextMindLogo} alt="NextMind Logo" className="login-logo" />
        <h2>{modoCadastro ? "Criar Conta" : "Login"}</h2>

        {modoCadastro && (
          <>
            <div className="input-group">
              <label htmlFor="nome">Nome Completo</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={50}
              />
              {erroNome && <span className="mensagem">{erroNome}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="nascimento">Data de Nascimento</label>
              <input
                id="nascimento"
                type="date"
                value={nascimento}
                onChange={(e) => setNascimento(e.target.value)}
              />
              {erroNascimento && <span className="mensagem">{erroNascimento}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="crp">CRP</label>
              <input
                id="crp"
                type="text"
                placeholder="00/00000"
                value={crp}
                onChange={(e) => setCrp(e.target.value)}
                maxLength={10}
              />
              {erroCrp && <span className="mensagem">{erroCrp}</span>}
            </div>
          </>
        )}

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
          />
          {erroEmail && <span className="mensagem">{erroEmail}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            maxLength={200}
          />
          {erroSenha && <span className="mensagem">{erroSenha}</span>}
        </div>

        {!modoCadastro && (
          <div className="extra-options">
            <a href="#">Esqueceu a senha?</a>
          </div>
        )}

        <button type="submit" className="btn-primary">
          {modoCadastro ? "Criar Conta" : "Entrar"}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => setModoCadastro(!modoCadastro)}
        >
          {modoCadastro ? "Voltar para Login" : "Criar Conta"}
        </button>

        {mensagemGeral && <p className="mensagem">{mensagemGeral}</p>}
      </form>
    </div>
  );
}
