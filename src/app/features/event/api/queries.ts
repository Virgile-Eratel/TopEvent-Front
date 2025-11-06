import { useMutation, useQueryClient } from "@tanstack/react-query";

import { httpPost } from "@/shared/lib/http";

import { eventsKeys } from "@/app/features/events/api/keys";

import { EventCreateSchema, EventSchema, type Event, type EventCreateInput } from "./schema";

async function createEventRequest(payload: EventCreateInput): Promise<Event> {
    const body = EventCreateSchema.parse(payload);
    const json = await httpPost<typeof body, unknown>("/admin/event", body);

    return EventSchema.parse(json);
}

export function useCreateEventMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createEventRequest,
        onSuccess: (createdEvent) => {
            queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
            queryClient.invalidateQueries({ queryKey: eventsKeys.detail(createdEvent.id) });
        },
    });
}

