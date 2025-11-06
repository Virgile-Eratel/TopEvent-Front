export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const DEFAULT_HEADERS = {
    //TODO remplacer par le token stocké dans le localStorage quand on sera connecté
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYyNDIwOTAzLCJleHAiOjE3NjMwMjU3MDN9.hxI-RxTrpjQ3rcz2ZLYbgb3J5w66CodGrVD06mtTkPs',
} satisfies HeadersInit;

export async function httpGet<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(API_BASE_URL + path, {
        signal,
        headers: DEFAULT_HEADERS,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
}