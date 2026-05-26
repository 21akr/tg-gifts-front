import { err, log } from './lib/log';

const BASE = import.meta.env.VITE_API_URL ?? '/api';
log('API', 'base URL =', BASE);

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = options.method ?? 'GET';
  log('API', `→ ${method} ${path}`);
  const t0 = performance.now();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (netErr) {
    err('API', `✗ network error ${method} ${path}:`, netErr);
    throw netErr;
  }
  const dt = Math.round(performance.now() - t0);
  log('API', `← ${res.status} ${method} ${path} (${dt}ms)`);

  if (res.status === 204) {
    return undefined as T;
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      (body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : null) ||
      (typeof body === 'string' ? body : null) ||
      `Request failed (${res.status})`;
    err('API', `error body for ${path}:`, message);
    throw new ApiError(res.status, message);
  }

  return body as T;
}

export interface CatalogGift {
  id: string;
  stars: number;
  limited: boolean;
  soldOut: boolean;
  auction: boolean;
  availabilityRemains?: number;
  availabilityTotal?: number;
  thumbnail?: string;
}

export const api = {
  sendCode: (phoneNumber: string) =>
    request<{ authId: string }>('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    }),

  verifyCode: (authId: string, code: string) =>
    request<{
      status: 'authenticated' | 'password_required';
      sessionToken?: string;
      authId?: string;
    }>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ authId, code }),
    }),

  verifyPassword: (authId: string, password: string) =>
    request<{ sessionToken: string }>('/auth/verify-password', {
      method: 'POST',
      body: JSON.stringify({ authId, password }),
    }),

  cancelAuth: (authId: string) =>
    request<void>('/auth/cancel', {
      method: 'POST',
      body: JSON.stringify({ authId }),
    }),

  logout: (sessionToken: string) =>
    request<void>('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}` },
    }),

  listGifts: (sessionToken: string) =>
    request<{ gifts: CatalogGift[] }>('/gifts/list', {
      method: 'GET',
      headers: { Authorization: `Bearer ${sessionToken}` },
    }),

  buyGift: (
    sessionToken: string,
    body: {
      targetUser: string;
      giftId: string;
      comment?: string;
      anonymous?: boolean;
    },
  ) =>
    request<{ success: boolean; message: string }>('/gifts/buy', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify(body),
    }),
};

export { ApiError };
