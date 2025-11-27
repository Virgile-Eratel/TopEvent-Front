import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { httpGet, httpPost, httpDelete } from "@/shared/lib/http";
import { SubscriptionSchema, SubscriptionWithUserSchema, type Subscription, type SubscriptionWithUser } from "./schema";
import { eventsKeys } from "@/app/features/events/api/keys";
import { useAuth } from "@/app/features/auth/context/AuthContext";

type CreateSubscriptionInput = {
    eventId: number;
};

async function createSubscriptionRequest(payload: CreateSubscriptionInput): Promise<Subscription> {
    const json = await httpPost<CreateSubscriptionInput, unknown>("/user/subscription", payload);
    return SubscriptionSchema.parse(json);
}

async function fetchAdminSubscriptions(eventId: number, signal?: AbortSignal): Promise<SubscriptionWithUser[]> {
    const json = await httpGet<unknown>(`/admin/event/${eventId}/subscriptions`, signal);
    return z.array(SubscriptionWithUserSchema).parse(json);
}

export function useCreateSubscriptionMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createSubscriptionRequest,
        onSuccess: (subscription) => {
            queryClient.invalidateQueries({ queryKey: eventsKeys.detail(subscription.eventId) });
            queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
            queryClient.invalidateQueries({ queryKey: ["subscriptions", "user", subscription.eventId] });
            queryClient.invalidateQueries({ queryKey: ["subscriptions", "user"] });
            queryClient.invalidateQueries({ queryKey: eventsKeys.all });
        },
    });
}

export function useAdminSubscriptions(eventId: number | null | undefined) {
    return useQuery({
        enabled: typeof eventId === "number" && !Number.isNaN(eventId),
        queryKey: ["subscriptions", "admin", eventId],
        queryFn: ({ signal }) => {
            if (typeof eventId !== "number" || Number.isNaN(eventId)) {
                throw new Error("Identifiant d'événement invalide");
            }
            return fetchAdminSubscriptions(eventId, signal);
        },
    });
}

async function fetchUserSubscription(eventId: number, userId: number, signal?: AbortSignal): Promise<Subscription | null> {
    try {
        const json = await httpGet<unknown>(`/user/subscription/${eventId}`, signal);
        const subscriptions = z.array(SubscriptionSchema).parse(json);
        const userSubscription = subscriptions.find(sub => sub.userId === userId);
        return userSubscription ?? null;
    } catch (error) {
        if (error instanceof Error && error.message.includes("404")) {
            return null;
        }
        throw error;
    }
}

export function useUserSubscription(eventId: number | null | undefined) {
    const { user } = useAuth();
    
    return useQuery({
        enabled: typeof eventId === "number" && !Number.isNaN(eventId) && eventId > 0 && user !== null,
        queryKey: ["subscriptions", "user", eventId],
        queryFn: ({ signal }) => {
            if (typeof eventId !== "number" || Number.isNaN(eventId)) {
                throw new Error("Identifiant d'événement invalide");
            }
            if (!user) {
                throw new Error("Utilisateur non authentifié");
            }
            return fetchUserSubscription(eventId, user.id, signal);
        },
    });
}

async function cancelSubscriptionRequest(subscriptionId: number): Promise<void> {
    await httpDelete<unknown>(`/user/subscription/${subscriptionId}`);
}

export function useCancelSubscriptionMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelSubscriptionRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
            queryClient.invalidateQueries({ queryKey: ["subscriptions", "user"] });
            queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
            queryClient.invalidateQueries({ queryKey: eventsKeys.all });
        },
    });
}

async function fetchUserSubscriptions(signal?: AbortSignal): Promise<Subscription[]> {
    const json = await httpGet<unknown>("/user/subscriptions", signal);
    return z.array(SubscriptionSchema).parse(json);
}

export function useUserSubscriptions() {
    const { user } = useAuth();
    
    return useQuery({
        enabled: user !== null,
        queryKey: ["subscriptions", "user"],
        queryFn: ({ signal }) => {
            if (!user) {
                throw new Error("Utilisateur non authentifié");
            }
            return fetchUserSubscriptions(signal);
        },
    });
}

