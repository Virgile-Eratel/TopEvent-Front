export const eventsKeys = {
    all: ['events'] as const,
    list: (params?: unknown) => [...eventsKeys.all, 'list', params] as const,
    detail: (eventId?: number | string | null) => [...eventsKeys.all, 'detail', eventId] as const,
    admin: ['events', 'admin'] as const,
    adminList: (params?: unknown) => [...eventsKeys.admin, 'list', params] as const,
}