import { get, post } from "./httpClient";

export interface PsychologistAddressPayload {
  label: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  is_primary: boolean;
}

export interface PsychologistPhonePayload {
  label: string;
  country_code: string;
  area_code: string;
  number: string;
  is_whatsapp: boolean;
  is_primary: boolean;
}

export interface RegisterPsychologistPayload {
  name: string;
  email: string;
  password: string;
  birth_date: string;
  cpf: string;
  crp: string;
  speciality: string;
  bio: string;
  address: PsychologistAddressPayload;
  phone: PsychologistPhonePayload;
}

export interface RegisterPsychologistResponse {
  data?: unknown;
  token?: string | null;
  message?: string;
}

export async function registerPsychologist(
  payload: RegisterPsychologistPayload,
): Promise<RegisterPsychologistResponse> {
  await get("/sanctum/csrf-cookie", { parseJson: false });
  const { data } = await post<RegisterPsychologistResponse>(
    "/register/psychologist",
    payload,
  );
  return data ?? {};
}

export type PsychologistDocumentKey =
  | "crp_card"
  | "id_front"
  | "id_back"
  | "proof_of_address";

export type PsychologistDocuments = Record<PsychologistDocumentKey, File>;

export interface PsychologistDocumentUploadResponse {
  message?: string;
  data?: unknown;
}

export async function uploadPsychologistDocuments(
  documents: PsychologistDocuments,
): Promise<PsychologistDocumentUploadResponse> {
  const formData = new FormData();

  (Object.entries(documents) as [PsychologistDocumentKey, File][]).forEach(
    ([key, file]) => {
      formData.append(key, file);
    },
  );

  const { data } = await post<PsychologistDocumentUploadResponse>(
    "/register/psychologist/upload",
    formData,
  );

  return data ?? {};
}
