const BASE = import.meta.env.VITE_API_URL ?? '/api';

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
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

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
