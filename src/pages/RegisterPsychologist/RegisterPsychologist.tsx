import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import NextMindLogo from "../../assets/NextMindLogo.png";
import {
  registerPsychologist,
  uploadPsychologistDocuments,
  type PsychologistDocumentKey,
  type RegisterPsychologistPayload,
} from "../../services/psychologistRegistration";
import { setAuthState } from "../../stores/authStore";
import "./RegisterPsychologist.css";

const REQUIRED_DOCUMENT_KEYS: PsychologistDocumentKey[] = [
  "crp_card",
  "id_front",
  "id_back",
  "proof_of_address",
];

type Step = "form" | "documents" | "success";

type FormFieldKey =
  | "name"
  | "email"
  | "password"
  | "birth_date"
  | "cpf"
  | "crp"
  | "speciality"
  | "bio"
  | "address.label"
  | "address.postal_code"
  | "address.street"
  | "address.number"
  | "address.complement"
  | "address.neighborhood"
  | "address.city"
  | "address.state"
  | "address.country"
  | "phone.label"
  | "phone.country_code"
  | "phone.area_code"
  | "phone.number"
  | "phone.is_primary"
  | "phone.is_whatsapp"
  | "address.is_primary";

type FormErrors = Partial<Record<FormFieldKey, string>> & { general?: string };

type DocumentErrors = Partial<Record<PsychologistDocumentKey, string>> & {
  general?: string;
};

type FormValues = RegisterPsychologistPayload;

const FIELD_LABELS: Record<FormFieldKey, string> = {
  name: "Nome completo",
  email: "Email",
  password: "Senha",
  birth_date: "Data de nascimento",
  cpf: "CPF",
  crp: "CRP",
  speciality: "Especialidade",
  bio: "Biografia",
  "address.label": "Identificação do endereço",
  "address.postal_code": "CEP",
  "address.street": "Rua",
  "address.number": "Número",
  "address.complement": "Complemento",
  "address.neighborhood": "Bairro",
  "address.city": "Cidade",
  "address.state": "Estado",
  "address.country": "País",
  "address.is_primary": "Endereço principal",
  "phone.label": "Identificação do telefone",
  "phone.country_code": "Código do país",
  "phone.area_code": "DDD",
  "phone.number": "Número de telefone",
  "phone.is_primary": "Telefone principal",
  "phone.is_whatsapp": "É WhatsApp",
};

const SERVER_ERROR_FIELD_MAP: Partial<Record<string, FormFieldKey>> = {
  name: "name",
  email: "email",
  password: "password",
  birth_date: "birth_date",
  cpf: "cpf",
  crp: "crp",
  speciality: "speciality",
  bio: "bio",
  "address.label": "address.label",
  "address.postal_code": "address.postal_code",
  "address.street": "address.street",
  "address.number": "address.number",
  "address.complement": "address.complement",
  "address.neighborhood": "address.neighborhood",
  "address.city": "address.city",
  "address.state": "address.state",
  "address.country": "address.country",
  "address.is_primary": "address.is_primary",
  "phone.label": "phone.label",
  "phone.country_code": "phone.country_code",
  "phone.area_code": "phone.area_code",
  "phone.number": "phone.number",
  "phone.is_primary": "phone.is_primary",
  "phone.is_whatsapp": "phone.is_whatsapp",
};

function sanitizeNumeric(value: string): string {
  return value.replace(/\D/g, "");
}

function formatServerErrorMessage(
  field: FormFieldKey,
  message: unknown,
): string {
  const rawMessage = String(message ?? "Campo inválido");

  if (rawMessage === "validation.unique") {
    return `${FIELD_LABELS[field]} já está cadastrado.`;
  }

  return rawMessage;
}

function extractFormErrors(error: unknown): FormErrors {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    Number((error as { status?: number }).status) === 422
  ) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object" && "errors" in data) {
      const validationErrors = (data as { errors: Record<string, unknown> }).errors;
      const parsed: FormErrors = {};
      Object.entries(validationErrors).forEach(([key, value]) => {
        const targetKey = SERVER_ERROR_FIELD_MAP[key];
        if (!targetKey) {
          return;
        }

        const message = Array.isArray(value) ? value[0] : value;
        parsed[targetKey] = formatServerErrorMessage(targetKey, message);
      });
      return parsed;
    }
  }

  return { general: "Não foi possível concluir o cadastro. Tente novamente." };
}

function extractDocumentErrors(error: unknown): DocumentErrors {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    Number((error as { status?: number }).status) === 422
  ) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object" && "errors" in data) {
      const validationErrors = (data as { errors: Record<string, unknown> }).errors;
      const parsed: DocumentErrors = {};
      Object.entries(validationErrors).forEach(([key, value]) => {
        if (!REQUIRED_DOCUMENT_KEYS.includes(key as PsychologistDocumentKey)) {
          return;
        }
        const message = Array.isArray(value) ? value[0] : value;
        parsed[key as PsychologistDocumentKey] = String(message ?? "Arquivo inválido");
      });
      return parsed;
    }
  }

  return { general: "Não foi possível enviar os documentos. Tente novamente." };
}

function getInitialFormValues(): FormValues {
  return {
    name: "",
    email: "",
    password: "",
    birth_date: "",
    cpf: "",
    crp: "",
    speciality: "",
    bio: "",
    address: {
      label: "Casa",
      postal_code: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      country: "BR",
      is_primary: true,
    },
    phone: {
      label: "Celular",
      country_code: "55",
      area_code: "",
      number: "",
      is_whatsapp: true,
      is_primary: true,
    },
  };
}

export default function RegisterPsychologist() {
  const [step, setStep] = useState<Step>("form");
  const [formValues, setFormValues] = useState<FormValues>(getInitialFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [documentErrors, setDocumentErrors] = useState<DocumentErrors>({});
  const [documents, setDocuments] = useState<
    Partial<Record<PsychologistDocumentKey, File | null>>
  >({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const hasAnyFormError = useMemo(
    () => Object.keys(formErrors).length > (formErrors.general ? 1 : 0),
    [formErrors],
  );

  const hasAnyDocumentError = useMemo(
    () => Object.keys(documentErrors).length > (documentErrors.general ? 1 : 0),
    [documentErrors],
  );

  const handleFieldChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target =
      event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;
    const isCheckbox =
      target instanceof HTMLInputElement && target.type === "checkbox";
    const nextValue = isCheckbox ? target.checked : value;

    setFormValues((previous) => {
      if (name.startsWith("address.")) {
        const field = name.replace("address.", "") as keyof FormValues["address"];
        return {
          ...previous,
          address: {
            ...previous.address,
            [field]: nextValue,
          },
        };
      }

      if (name.startsWith("phone.")) {
        const field = name.replace("phone.", "") as keyof FormValues["phone"];
        return {
          ...previous,
          phone: {
            ...previous.phone,
            [field]: nextValue,
          },
        };
      }

      return {
        ...previous,
        [name]: nextValue,
      } as FormValues;
    });
  };

  const handleDocumentChange = (
    key: PsychologistDocumentKey,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setDocuments((previous) => ({
      ...previous,
      [key]: file,
    }));
  };

  const validateForm = (values: FormValues): FormErrors => {
    const errors: FormErrors = {};

    if (!values.name.trim()) {
      errors.name = "Nome é obrigatório.";
    }

    if (!values.email.trim()) {
      errors.email = "Email é obrigatório.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.email)) {
      errors.email = "Email inválido.";
    }

    if (!values.password || values.password.length < 8) {
      errors.password = "Senha deve ter no mínimo 8 caracteres.";
    }

    if (!values.birth_date) {
      errors.birth_date = "Data de nascimento é obrigatória.";
    }

    const cpf = sanitizeNumeric(values.cpf);
    if (cpf.length !== 11) {
      errors.cpf = "CPF deve conter 11 dígitos.";
    }

    if (!values.crp.trim()) {
      errors.crp = "CRP é obrigatório.";
    }

    if (!values.speciality.trim()) {
      errors.speciality = "Especialidade é obrigatória.";
    }

    if (!values.bio.trim()) {
      errors.bio = "Biografia é obrigatória.";
    }

    if (!values.address.label.trim()) {
      errors["address.label"] = "Identifique o endereço.";
    }

    if (sanitizeNumeric(values.address.postal_code).length !== 8) {
      errors["address.postal_code"] = "CEP deve conter 8 dígitos.";
    }

    if (!values.address.street.trim()) {
      errors["address.street"] = "Rua é obrigatória.";
    }

    if (!values.address.number.trim()) {
      errors["address.number"] = "Número é obrigatório.";
    }

    if (!values.address.neighborhood.trim()) {
      errors["address.neighborhood"] = "Bairro é obrigatório.";
    }

    if (!values.address.city.trim()) {
      errors["address.city"] = "Cidade é obrigatória.";
    }

    if (!values.address.state.trim()) {
      errors["address.state"] = "Estado é obrigatório.";
    }

    if (!values.address.country.trim()) {
      errors["address.country"] = "País é obrigatório.";
    }

    if (!values.phone.label.trim()) {
      errors["phone.label"] = "Identifique o telefone.";
    }

    if (!values.phone.country_code.trim()) {
      errors["phone.country_code"] = "Código do país é obrigatório.";
    }

    if (!values.phone.area_code.trim()) {
      errors["phone.area_code"] = "DDD é obrigatório.";
    }

    const phoneNumber = sanitizeNumeric(values.phone.number);
    if (phoneNumber.length < 8) {
      errors["phone.number"] = "Número de telefone inválido.";
    }

    return errors;
  };

  const validateDocuments = (): DocumentErrors => {
    const errors: DocumentErrors = {};

    REQUIRED_DOCUMENT_KEYS.forEach((key) => {
      const file = documents[key] ?? null;
      if (!file) {
        errors[key] = "Selecione um arquivo PDF.";
        return;
      }

      if (file.type !== "application/pdf") {
        errors[key] = "Apenas arquivos PDF são aceitos.";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        errors[key] = "O arquivo deve ter no máximo 5MB.";
      }
    });

    return errors;
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmittingForm) {
      return;
    }

    const validationErrors = validateForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmittingForm(true);
    setFormErrors({});
    setStatusMessage(null);

    const payload: RegisterPsychologistPayload = {
      ...formValues,
      cpf: sanitizeNumeric(formValues.cpf),
      address: {
        ...formValues.address,
        postal_code: sanitizeNumeric(formValues.address.postal_code),
      },
      phone: {
        ...formValues.phone,
        number: sanitizeNumeric(formValues.phone.number),
        area_code: sanitizeNumeric(formValues.phone.area_code),
        country_code: sanitizeNumeric(formValues.phone.country_code),
      },
    };

    try {
      const response = await registerPsychologist(payload);

      if (response?.token || response?.data) {
        setAuthState({ token: response.token ?? null, data: response.data ?? null });
      }

      setStatusMessage(response?.message ?? "Cadastro realizado com sucesso!");
      setStep("documents");
    } catch (error) {
      const parsedErrors = extractFormErrors(error);
      setFormErrors(parsedErrors);
      if (parsedErrors.general) {
        setStatusMessage(parsedErrors.general);
      }
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDocumentsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUploadingDocuments) {
      return;
    }

    const validationErrors = validateDocuments();
    if (Object.keys(validationErrors).length > 0) {
      setDocumentErrors(validationErrors);
      return;
    }

    setIsUploadingDocuments(true);
    setDocumentErrors({});
    setStatusMessage(null);

    try {
      const files = REQUIRED_DOCUMENT_KEYS.reduce((acc, key) => {
        const file = documents[key];
        if (file) {
          acc[key] = file;
        }
        return acc;
      }, {} as Record<PsychologistDocumentKey, File>);

      const response = await uploadPsychologistDocuments(files);
      setStatusMessage(response?.message ?? "Documentos enviados com sucesso!");
      setStep("success");
    } catch (error) {
      const parsedErrors = extractDocumentErrors(error);
      setDocumentErrors(parsedErrors);
      if (parsedErrors.general) {
        setStatusMessage(parsedErrors.general);
      }
    } finally {
      setIsUploadingDocuments(false);
    }
  };

  const handleGoToLogin = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <header className="register-header">
          <img src={NextMindLogo} alt="NextMind" />
          <h1>Cadastro de Psicólogo</h1>
          <p>
            Realize o cadastro preenchendo os dados abaixo e envie os documentos
            obrigatórios para validação profissional.
          </p>
        </header>

        <div className="step-indicator">
          <span className={step === "form" ? "active" : ""}>
            1. Dados profissionais
          </span>
          <span className={step === "documents" ? "active" : ""}>
            2. Documentos
          </span>
          <span className={step === "success" ? "active" : ""}>
            3. Confirmação
          </span>
        </div>

        {step === "form" && (
          <form onSubmit={handleFormSubmit} noValidate>
            <div className="form-grid">
              <div className="field-group full-width">
                <label htmlFor="name">{FIELD_LABELS.name}</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formValues.name}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors.name)}
                  aria-describedby={formErrors.name ? "error-name" : undefined}
                  placeholder="Nome completo"
                />
                {formErrors.name && (
                  <span id="error-name" className="error-message">
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="email">{FIELD_LABELS.email}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors.email)}
                  aria-describedby={formErrors.email ? "error-email" : undefined}
                  placeholder="email@exemplo.com"
                />
                {formErrors.email && (
                  <span id="error-email" className="error-message">
                    {formErrors.email}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="password">{FIELD_LABELS.password}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formValues.password}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors.password)}
                  aria-describedby={
                    formErrors.password ? "error-password" : undefined
                  }
                  placeholder="Crie uma senha"
                />
                <span className="helper-text">
                  Mínimo de 8 caracteres com letras e números.
                </span>
                {formErrors.password && (
                  <span id="error-password" className="error-message">
                    {formErrors.password}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="birth_date">{FIELD_LABELS.birth_date}</label>
                <input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formValues.birth_date}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors.birth_date)}
                  aria-describedby={
                    formErrors.birth_date ? "error-birth_date" : undefined
                  }
                />
                {formErrors.birth_date && (
                  <span id="error-birth_date" className="error-message">
                    {formErrors.birth_date}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="cpf">{FIELD_LABELS.cpf}</label>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  value={formValues.cpf}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors.cpf)}
                  aria-describedby={formErrors.cpf ? "error-cpf" : undefined}
                  placeholder="Somente números"
                />
                {formErrors.cpf && (
                  <span id="error-cpf" className="error-message">
                    {formErrors.cpf}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="crp">{FIELD_LABELS.crp}</label>
                <input
                  id="crp"
                  name="crp"
                  type="text"
                  value={formValues.crp}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors.crp)}
                  aria-describedby={formErrors.crp ? "error-crp" : undefined}
                  placeholder="Número do CRP"
                />
                {formErrors.crp && (
                  <span id="error-crp" className="error-message">
                    {formErrors.crp}
                  </span>
                )}
              </div>

              <div className="field-group full-width">
                <label htmlFor="speciality">{FIELD_LABELS.speciality}</label>
                <input
                  id="speciality"
                  name="speciality"
                  type="text"
                  value={formValues.speciality}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors.speciality)}
                  aria-describedby={
                    formErrors.speciality ? "error-speciality" : undefined
                  }
                  placeholder="Área de atuação"
                />
                {formErrors.speciality && (
                  <span id="error-speciality" className="error-message">
                    {formErrors.speciality}
                  </span>
                )}
              </div>

              <div className="field-group full-width">
                <label htmlFor="bio">{FIELD_LABELS.bio}</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formValues.bio}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors.bio)}
                  aria-describedby={formErrors.bio ? "error-bio" : undefined}
                  placeholder="Compartilhe sua experiência e público atendido"
                />
                {formErrors.bio && (
                  <span id="error-bio" className="error-message">
                    {formErrors.bio}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="address.label">{FIELD_LABELS["address.label"]}</label>
                <input
                  id="address.label"
                  name="address.label"
                  type="text"
                  value={formValues.address.label}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["address.label"])}
                  aria-describedby={
                    formErrors["address.label"] ? "error-address.label" : undefined
                  }
                />
                {formErrors["address.label"] && (
                  <span id="error-address.label" className="error-message">
                    {formErrors["address.label"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="address.postal_code">
                  {FIELD_LABELS["address.postal_code"]}
                </label>
                <input
                  id="address.postal_code"
                  name="address.postal_code"
                  type="text"
                  value={formValues.address.postal_code}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["address.postal_code"])}
                  aria-describedby={
                    formErrors["address.postal_code"]
                      ? "error-address.postal_code"
                      : undefined
                  }
                  placeholder="00000000"
                />
                {formErrors["address.postal_code"] && (
                  <span id="error-address.postal_code" className="error-message">
                    {formErrors["address.postal_code"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="address.street">
                  {FIELD_LABELS["address.street"]}
                </label>
                <input
                  id="address.street"
                  name="address.street"
                  type="text"
                  value={formValues.address.street}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["address.street"])}
                  aria-describedby={
                    formErrors["address.street"]
                      ? "error-address.street"
                      : undefined
                  }
                />
                {formErrors["address.street"] && (
                  <span id="error-address.street" className="error-message">
                    {formErrors["address.street"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="address.number">
                  {FIELD_LABELS["address.number"]}
                </label>
                <input
                  id="address.number"
                  name="address.number"
                  type="text"
                  value={formValues.address.number}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["address.number"])}
                  aria-describedby={
                    formErrors["address.number"]
                      ? "error-address.number"
                      : undefined
                  }
                />
                {formErrors["address.number"] && (
                  <span id="error-address.number" className="error-message">
                    {formErrors["address.number"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="address.complement">
                  {FIELD_LABELS["address.complement"]}
                </label>
                <input
                  id="address.complement"
                  name="address.complement"
                  type="text"
                  value={formValues.address.complement}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["address.complement"])}
                  aria-describedby={
                    formErrors["address.complement"]
                      ? "error-address.complement"
                      : undefined
                  }
                  placeholder="Opcional"
                />
                {formErrors["address.complement"] && (
                  <span id="error-address.complement" className="error-message">
                    {formErrors["address.complement"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="address.neighborhood">
                  {FIELD_LABELS["address.neighborhood"]}
                </label>
                <input
                  id="address.neighborhood"
                  name="address.neighborhood"
                  type="text"
                  value={formValues.address.neighborhood}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["address.neighborhood"])}
                  aria-describedby={
                    formErrors["address.neighborhood"]
                      ? "error-address.neighborhood"
                      : undefined
                  }
                />
                {formErrors["address.neighborhood"] && (
                  <span id="error-address.neighborhood" className="error-message">
                    {formErrors["address.neighborhood"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="address.city">
                  {FIELD_LABELS["address.city"]}
                </label>
                <input
                  id="address.city"
                  name="address.city"
                  type="text"
                  value={formValues.address.city}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["address.city"])}
                  aria-describedby={
                    formErrors["address.city"]
                      ? "error-address.city"
                      : undefined
                  }
                />
                {formErrors["address.city"] && (
                  <span id="error-address.city" className="error-message">
                    {formErrors["address.city"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="address.state">
                  {FIELD_LABELS["address.state"]}
                </label>
                <input
                  id="address.state"
                  name="address.state"
                  type="text"
                  value={formValues.address.state}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["address.state"])}
                  aria-describedby={
                    formErrors["address.state"]
                      ? "error-address.state"
                      : undefined
                  }
                />
                {formErrors["address.state"] && (
                  <span id="error-address.state" className="error-message">
                    {formErrors["address.state"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="address.country">
                  {FIELD_LABELS["address.country"]}
                </label>
                <input
                  id="address.country"
                  name="address.country"
                  type="text"
                  value={formValues.address.country}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["address.country"])}
                  aria-describedby={
                    formErrors["address.country"]
                      ? "error-address.country"
                      : undefined
                  }
                />
                {formErrors["address.country"] && (
                  <span id="error-address.country" className="error-message">
                    {formErrors["address.country"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="phone.label">{FIELD_LABELS["phone.label"]}</label>
                <input
                  id="phone.label"
                  name="phone.label"
                  type="text"
                  value={formValues.phone.label}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["phone.label"])}
                  aria-describedby={
                    formErrors["phone.label"] ? "error-phone.label" : undefined
                  }
                />
                {formErrors["phone.label"] && (
                  <span id="error-phone.label" className="error-message">
                    {formErrors["phone.label"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="phone.country_code">
                  {FIELD_LABELS["phone.country_code"]}
                </label>
                <input
                  id="phone.country_code"
                  name="phone.country_code"
                  type="text"
                  value={formValues.phone.country_code}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["phone.country_code"])}
                  aria-describedby={
                    formErrors["phone.country_code"]
                      ? "error-phone.country_code"
                      : undefined
                  }
                />
                {formErrors["phone.country_code"] && (
                  <span id="error-phone.country_code" className="error-message">
                    {formErrors["phone.country_code"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="phone.area_code">
                  {FIELD_LABELS["phone.area_code"]}
                </label>
                <input
                  id="phone.area_code"
                  name="phone.area_code"
                  type="text"
                  value={formValues.phone.area_code}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["phone.area_code"])}
                  aria-describedby={
                    formErrors["phone.area_code"] ? "error-phone.area_code" : undefined
                  }
                />
                {formErrors["phone.area_code"] && (
                  <span id="error-phone.area_code" className="error-message">
                    {formErrors["phone.area_code"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="phone.number">{FIELD_LABELS["phone.number"]}</label>
                <input
                  id="phone.number"
                  name="phone.number"
                  type="text"
                  value={formValues.phone.number}
                  onChange={handleFieldChange}
                  aria-invalid={Boolean(formErrors["phone.number"])}
                  aria-describedby={
                    formErrors["phone.number"] ? "error-phone.number" : undefined
                  }
                  placeholder="Somente números"
                />
                {formErrors["phone.number"] && (
                  <span id="error-phone.number" className="error-message">
                    {formErrors["phone.number"]}
                  </span>
                )}
              </div>

              <div className="field-group">
                <span>Preferências</span>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    name="address.is_primary"
                    checked={formValues.address.is_primary}
                    onChange={handleFieldChange}
                  />
                  {FIELD_LABELS["address.is_primary"]}
                </label>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    name="phone.is_primary"
                    checked={formValues.phone.is_primary}
                    onChange={handleFieldChange}
                  />
                  {FIELD_LABELS["phone.is_primary"]}
                </label>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    name="phone.is_whatsapp"
                    checked={formValues.phone.is_whatsapp}
                    onChange={handleFieldChange}
                  />
                  {FIELD_LABELS["phone.is_whatsapp"]}
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmittingForm}
              >
                {isSubmittingForm ? "Enviando..." : "Salvar e continuar"}
              </button>
            </div>

            {statusMessage && (
              <p
                className={`status-message ${
                  formErrors.general ? "error" : "success"
                }`}
              >
                {statusMessage}
              </p>
            )}

            {hasAnyFormError && !formErrors.general && (
              <p className="status-message error">
                Revise os campos destacados para prosseguir.
              </p>
            )}
          </form>
        )}

        {step === "documents" && (
          <form onSubmit={handleDocumentsSubmit} noValidate>
            <div className="documents-grid">
              {REQUIRED_DOCUMENT_KEYS.map((key) => (
                <label key={key} className="file-input">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => handleDocumentChange(key, event)}
                  />
                  <div className="file-label">
                    <strong>{FIELD_LABELS_MAP_DOCUMENTS[key]}</strong>
                    <span>PDF até 5MB</span>
                    <span className="file-name">
                      {documents[key]?.name ?? "Nenhum arquivo selecionado"}
                    </span>
                    {documentErrors[key] && (
                      <span className="error-message">{documentErrors[key]}</span>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep("form")}
              >
                Voltar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploadingDocuments}
              >
                {isUploadingDocuments ? "Enviando..." : "Concluir cadastro"}
              </button>
            </div>

            {statusMessage && (
              <p
                className={`status-message ${
                  documentErrors.general ? "error" : "success"
                }`}
              >
                {statusMessage}
              </p>
            )}

            {hasAnyDocumentError && !documentErrors.general && (
              <p className="status-message error">
                Corrija os arquivos destacados para continuar.
              </p>
            )}
          </form>
        )}

        {step === "success" && (
          <div className="success-panel">
            <h2>Cadastro enviado!</h2>
            <p>
              Seus dados foram recebidos. Nossa equipe irá validar as informações
              e retornaremos em breve pelo email cadastrado.
            </p>
            {statusMessage && (
              <p className="status-message success">{statusMessage}</p>
            )}
            <button type="button" className="btn btn-primary" onClick={handleGoToLogin}>
              Ir para o login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const FIELD_LABELS_MAP_DOCUMENTS: Record<PsychologistDocumentKey, string> = {
  crp_card: "Carteira do CRP",
  id_front: "Documento de identidade (frente)",
  id_back: "Documento de identidade (verso)",
  proof_of_address: "Comprovante de endereço",
};
