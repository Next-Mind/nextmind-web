import { getAuthState } from "../stores/authStoreBase";

const API_BASE_URL = "https://api.nextmind.sbs";

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  parseJson?: boolean;
  headers?: HeadersInit;
  body?: unknown;
};

export interface HttpError extends Error {
  status: number;
  data: unknown;
}

interface HttpResponse<T> {
  data: T;
  response: Response;
}

async function handleResponse<T>(response: Response, parseJson: boolean): Promise<HttpResponse<T>> {
  if (response.status === 204) {
    return { data: null as T, response };
  }

  const contentType = response.headers.get("content-type") ?? "";
  const shouldParseJson = parseJson || contentType.includes("application/json");
  let body: unknown = null;

  if (shouldParseJson) {
    try {
      body = await response.json();
    } catch (error) {
      if (parseJson) {
        if (error instanceof SyntaxError) {
          body = null;
        } else {
          throw createHttpError(response, error);
        }
      }
    }
  } else if (parseJson) {
    body = await response.text();
  }

  if (!response.ok) {
    throw createHttpError(response, body);
  }

  return { data: body as T, response };
}

function createHttpError(response: Response, data: unknown): HttpError {
  const error = new Error(
    typeof data === "object" && data !== null && "message" in data
      ? String((data as { message: unknown }).message)
      : response.statusText,
  ) as HttpError;

  error.status = response.status;
  error.data = data;

  return error;
}

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
  const token = getAuthState().token;
  const { parseJson = true, headers, body, ...rest } = options;

  const finalHeaders = new Headers(headers ?? {});

  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  const xsrf = getCookie('XSRF-TOKEN');
  if (xsrf && !finalHeaders.has('X-XSRF-TOKEN')) {
    finalHeaders.set('X-XSRF-TOKEN', xsrf);
  }

  if (parseJson && body !== undefined && !(body instanceof FormData)) {
    if (!finalHeaders.has("Content-Type")) {
      finalHeaders.set("Content-Type", "application/json");
    }
  }

  if (!finalHeaders.has("Accept")) {
    finalHeaders.set("Accept", "application/json");
  }

  if (!finalHeaders.has("X-Requested-With")) {
  finalHeaders.set("X-Requested-With", "XMLHttpRequest");
  }

  if (!finalHeaders.has("X-Client")) {
    finalHeaders.set("X-Client", "spa");
  }

  if (token && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const finalBody: BodyInit | null | undefined =
    parseJson && body !== undefined && typeof body !== "string" && !(body instanceof FormData)
      ? JSON.stringify(body)
      : (body as BodyInit | null | undefined);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    body: finalBody,
    headers: finalHeaders,
    credentials: "include",
  });

  return handleResponse<T>(response, parseJson);
}

export function get(path: string, options?: RequestOptions) {
  return httpRequest(path, { ...options, method: "GET" });
}

export function post<T>(path: string, body: unknown, options?: RequestOptions) {
  return httpRequest<T>(path, { ...options, method: "POST", body });
}
