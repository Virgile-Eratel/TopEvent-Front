export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function httpGet<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(API_BASE_URL + path, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
}