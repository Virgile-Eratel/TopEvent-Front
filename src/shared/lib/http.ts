export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const AUTH_TOKEN_STORAGE_KEY = "topevent:auth_token";

export function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

function buildHeaders(init?: HeadersInit): Headers {
    const headers = new Headers(init);
    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    const token = getAuthToken();
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
    const rawText = await response.text();
    let data: unknown = null;

    if (rawText) {
        try {
            data = JSON.parse(rawText);
        } catch {
            data = rawText;
        }
    }

    if (!response.ok) {
        if (response.status === 401) {
            if (typeof window !== "undefined") {
                clearAuthToken();
                if (window.location.pathname !== "/auth") {
                    window.location.href = "/auth";
                }
            }
        }
        const message =
            typeof data === "object" && data !== null && "message" in data && typeof (data as { message?: unknown }).message === "string"
                ? (data as { message: string }).message
                : `HTTP ${response.status}`;
        throw new Error(message);
    }

    return data as T;
}

export async function httpGet<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(API_BASE_URL + path, {
        signal,
        headers: buildHeaders(),
    });

    return parseResponse<T>(res);
}

export async function httpPost<TBody, TResult>(path: string, body?: TBody, signal?: AbortSignal): Promise<TResult> {
    const res = await fetch(API_BASE_URL + path, {
        method: "POST",
        signal,
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return parseResponse<TResult>(res);
}

export async function httpPut<TBody, TResult>(path: string, body?: TBody, signal?: AbortSignal): Promise<TResult> {
    const res = await fetch(API_BASE_URL + path, {
        method: "PUT",
        signal,
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return parseResponse<TResult>(res);
}