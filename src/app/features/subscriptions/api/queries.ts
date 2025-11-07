import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { httpGet, httpPost } from "@/shared/lib/http";
import { SubscriptionSchema, SubscriptionWithUserSchema, type Subscription, type SubscriptionWithUser } from "./schema";
import { eventsKeys } from "@/app/features/events/api/keys";

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

