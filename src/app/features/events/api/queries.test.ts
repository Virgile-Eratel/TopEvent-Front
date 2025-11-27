import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest'
import { useEventsList, useAdminEventsList, useEvent } from './queries'
import { TestWrapper } from '@/test/test-utils'
import { httpGet } from '@/shared/lib/http'

// Mock http
vi.mock('@/shared/lib/http', () => ({
    httpGet: vi.fn(),
}))

// Mock Schemas to simplify testing logic without creating complex valid objects
// But we need to respect the parsing structure.
vi.mock('./schema', () => ({
    EventsArraySchema: {
        parse: (v: unknown) => v
    }
}))

vi.mock('../../event/api/schema', () => ({
    EventSchema: {
        parse: (v: unknown) => v
    }
}))

vi.mock('./keys', () => ({
    eventsKeys: {
        list: () => ['events'],
        adminList: () => ['admin-events'],
        detail: (id: unknown) => ['events', id]
    }
}))

describe('Events Queries', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('useEventsList calls httpGet with correct params', async () => {
        const mockData = [{ id: 1, name: 'Event 1' }]
        ;(httpGet as unknown as Mock).mockResolvedValue(mockData)

        const { result } = renderHook(() => useEventsList({ search: 'test' }), {
            wrapper: TestWrapper
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(httpGet).toHaveBeenCalledWith(
            expect.stringContaining('/events/all'),
            expect.anything()
        )
        expect(httpGet).toHaveBeenCalledWith(
            expect.stringContaining('search=test'),
            expect.anything()
        )
        expect(result.current.data).toEqual(mockData)
    })

    it('useAdminEventsList calls httpGet', async () => {
        const mockData = [{ id: 1, name: 'Event 1' }]
        ;(httpGet as unknown as Mock).mockResolvedValue(mockData)

        const { result } = renderHook(() => useAdminEventsList(), {
            wrapper: TestWrapper
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(httpGet).toHaveBeenCalledWith('/admins/events/all', expect.anything())
        expect(result.current.data).toEqual(mockData)
    })

    it('useEvent calls httpGet', async () => {
        const mockData = { id: 1, name: 'Event 1' }
        ;(httpGet as unknown as Mock).mockResolvedValue(mockData)

        const { result } = renderHook(() => useEvent(1), {
            wrapper: TestWrapper
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(httpGet).toHaveBeenCalledWith('/event/1', expect.anything())
        expect(result.current.data).toEqual(mockData)
    })

    it('useEvent does not fetch if id is invalid', async () => {
        const { result } = renderHook(() => useEvent(undefined), {
            wrapper: TestWrapper
        })

        expect(result.current.isPending).toBe(true)
        expect(httpGet).not.toHaveBeenCalled()
    })
})

