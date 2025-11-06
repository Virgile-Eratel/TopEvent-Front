import { useQuery } from '@tanstack/react-query'
import { eventsKeys } from './keys'
import { EventsArraySchema, type EventList } from './schema'

async function fetchEventsList(): Promise<EventList> {
    const response = await fetch('http://localhost:3000/events/all')

    if (!response.ok) {
        throw new Error('Impossible de récupérer les événements')
    }

    const json = await response.json()

    return EventsArraySchema.parse(json)
}

export function useEventsList() {
    return useQuery({
        queryKey: eventsKeys.list(),
        queryFn: fetchEventsList,
    })
}

