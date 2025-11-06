import type { ToastOptions } from "react-hot-toast";

const POST_REDIRECT_TOAST_KEY = "app:post-redirect-toast";

type ToastType = "success" | "error" | "loading";

export type QueuedToast = {
    type?: ToastType;
    message: string;
    options?: ToastOptions;
};

export function queueToastAfterRedirect(toast: QueuedToast) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        sessionStorage.setItem(POST_REDIRECT_TOAST_KEY, JSON.stringify(toast));
    } catch {
        // Ignore storage errors (e.g., private mode limiting sessionStorage).
    }
}

export function consumeQueuedToast(): QueuedToast | null {
    if (typeof window === "undefined") {
        return null;
    }

    const raw = sessionStorage.getItem(POST_REDIRECT_TOAST_KEY);
    if (!raw) {
        return null;
    }

    sessionStorage.removeItem(POST_REDIRECT_TOAST_KEY);

    try {
        return JSON.parse(raw) as QueuedToast;
    } catch {
        return null;
    }
}

