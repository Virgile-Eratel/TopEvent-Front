import { useMutation, useQueryClient } from "@tanstack/react-query";

import { httpPost, httpPut } from "@/shared/lib/http";

import { eventsKeys } from "@/app/features/events/api/keys";

import {
    EventCreateSchema,
    EventSchema,
    type Event,
    type EventCreateInput,
} from "./schema";

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
            queryClient.invalidateQueries({ queryKey: eventsKeys.adminList() });
            queryClient.invalidateQueries({ queryKey: eventsKeys.detail(createdEvent.id) });
        },
    });
}

type UpdateEventVariables = {
    eventId: Event["id"];
    values: EventCreateInput;
};

async function updateEventRequest({ eventId, values }: UpdateEventVariables): Promise<Event> {
    const body = EventCreateSchema.parse(values);
    const json = await httpPut<typeof body, unknown>(`/admin/event/${eventId}`, body);

    return EventSchema.parse(json);
}

export function useUpdateEventMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateEventRequest,
        onSuccess: (updatedEvent) => {
            queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
            queryClient.invalidateQueries({ queryKey: eventsKeys.adminList() });
            queryClient.invalidateQueries({ queryKey: eventsKeys.detail(updatedEvent.id) });
        },
    });
}

