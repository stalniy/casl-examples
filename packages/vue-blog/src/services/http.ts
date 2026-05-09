import type { HttpErrorBody, HttpResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

type HttpHeaders = Record<string, string>;

interface HttpOptions extends Omit<RequestInit, 'headers' | 'body'> {
  headers?: HttpHeaders;
  data?: unknown;
}

interface HttpFunction {
  <TBody = Record<string, unknown>>(url: string, options?: HttpOptions): Promise<HttpResponse<TBody>>;
  token: string | null;
  onError: (response: HttpResponse<HttpErrorBody>) => boolean;
}

const http: HttpFunction = <TBody = Record<string, unknown>>(
  url: string,
  { headers, data, ...options }: HttpOptions = {},
) => {
  const requestHeaders: HttpHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  };

  if (http.token) {
    requestHeaders.Authorization = http.token;
  }

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers: requestHeaders,
    body: data ? JSON.stringify(data) : undefined,
  }).then(async (response) => {
    const body = await response.json().catch(() => ({} as TBody));
    const payload: HttpResponse<TBody> = {
      body,
      status: response.status,
    };

    if (response.status >= 200 && response.status < 300) {
      return payload;
    }

    if (!http.onError(payload as HttpResponse<HttpErrorBody>)) {
      const errorBody = payload.body as HttpErrorBody;
      const message = errorBody.message
        || errorBody.errors?.join('\n')
        || 'Request failed';
      throw new Error(message);
    }

    return payload;
  });
};

http.token = null;
http.onError = (_response) => false;

export default http;
