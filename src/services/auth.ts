import { get, post } from "./httpClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: unknown;
  token: string;
  message?: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  await get("/sanctum/csrf-cookie", { parseJson: false });
  const { data } = await post<LoginResponse>("/login/web", payload);
  return data;
}
