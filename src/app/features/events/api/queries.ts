import { useQuery } from '@tanstack/react-query'
import { httpGet } from '@/shared/lib/http'
import { EventSchema, type Event } from '../../event/api/schema'
import { eventsKeys } from './keys'
import { EventsArraySchema, type EventList } from './schema'

async function fetchEventsTop(signal?: AbortSignal): Promise<EventList> {
    const json = await httpGet<unknown>('/events/top', signal)

    return EventsArraySchema.parse(json)
}

async function fetchEventsList(signal?: AbortSignal): Promise<EventList> {
    const json = await httpGet<unknown>('/events/all', signal)

    return EventsArraySchema.parse(json)
}

async function fetchAdminEventsList(signal?: AbortSignal): Promise<EventList> {
    const json = await httpGet<unknown>('/admins/events/all', signal)

    return EventsArraySchema.parse(json)
}

async function fetchEventById(eventId: Event['id'], signal?: AbortSignal): Promise<Event> {
    const json = await httpGet<unknown>(`/event/${eventId}`, signal)

    return EventSchema.parse(json)
}

export function useEventsList() {
    return useQuery({
        queryKey: eventsKeys.list(),
        queryFn: ({ signal }) => fetchEventsList(signal),
    })
}

export function useEventsTop() {
    return useQuery({
        queryKey: eventsKeys.list(),
        queryFn: ({ signal }) => fetchEventsTop(signal),
    })
}

export function useAdminEventsList() {
    return useQuery({
        queryKey: eventsKeys.adminList(),
        queryFn: ({ signal }) => fetchAdminEventsList(signal),
    })
}

export function useEvent(eventId: Event['id'] | null | undefined) {
    return useQuery({
        enabled: typeof eventId === 'number' && !Number.isNaN(eventId),
        queryKey: eventsKeys.detail(eventId ?? 'pending'),
        queryFn: ({ signal }) => {
            if (typeof eventId !== 'number' || Number.isNaN(eventId)) {
                throw new Error('Identifiant d\'événement invalide')
            }

            return fetchEventById(eventId, signal)
        },
    })
}

