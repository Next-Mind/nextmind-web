import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import NextMindLogo from "../../assets/NextMindLogo.png";
import { login } from "../../services/auth";
import { setAuthState } from "../../stores/authStore";
import "./Login.css";

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const validation: ValidationErrors = {};

    if (!email.trim()) {
      validation.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validation.email = "Email inválido";
    }

    if (!password.trim()) {
      validation.password = "Senha é obrigatória";
    }

    setErrors(validation);

    return Object.keys(validation).length === 0;
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await login({ email, password });
      setAuthState({ data: response.data, token: response.token });
    } catch (error) {
      if (typeof error === "object" && error !== null && "status" in error) {
        const status = Number((error as { status?: number }).status);
        const message =
          typeof (error as { message?: unknown }).message === "string"
            ? ((error as { message?: string }).message as string)
            : undefined;

        if (status === 401) {
          setErrors({ general: message ?? "Credenciais inválidas" });
        } else {
          setErrors({ general: message ?? "Não foi possível realizar o login." });
        }
      } else {
        setErrors({ general: "Erro inesperado. Tente novamente." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit} noValidate>
        <img src={NextMindLogo} alt="NextMind Logo" className="login-logo" />
        <h2>Login</h2>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-erro" : undefined}
          />
          {errors.email && (
            <span id="email-erro" className="mensagem">
              {errors.email}
            </span>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-erro" : undefined}
          />
          {errors.password && (
            <span id="password-erro" className="mensagem">
              {errors.password}
            </span>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>

        <div className="extra-options">
          <a href="/register/psychologist">Cadastre-se como psicólogo</a>
        </div>

        {errors.general && <p className="mensagem">{errors.general}</p>}
      </form>
    </div>
  );
}
