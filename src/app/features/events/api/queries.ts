import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { httpGet } from '@/shared/lib/http'
import { EventSchema, type Event } from '../../event/api/schema'
import { eventsKeys } from './keys'
import { EventsArraySchema, type EventList } from './schema'

async function fetchEventsTop(signal?: AbortSignal): Promise<EventList> {
    const json = await httpGet<unknown>('/events/top', signal)

    return EventsArraySchema.parse(json)
}

export type EventFilters = {
    category?: string
    date?: string
    location?: string
    search?: string
}

async function fetchEventsList(filters?: EventFilters, signal?: AbortSignal): Promise<EventList> {
    const searchParams = new URLSearchParams()
    if (filters?.category) searchParams.set('category', filters.category)
    if (filters?.date) searchParams.set('date', filters.date)
    if (filters?.location) searchParams.set('location', filters.location)
    if (filters?.search) searchParams.set('search', filters.search)

    const json = await httpGet<unknown>(`/events/all?${searchParams.toString()}`, signal)

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

export function useEventsList(filters?: EventFilters) {
    return useQuery({
        queryKey: [...eventsKeys.list(), filters],
        queryFn: ({ signal }) => fetchEventsList(filters, signal),
        placeholderData: keepPreviousData,
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

