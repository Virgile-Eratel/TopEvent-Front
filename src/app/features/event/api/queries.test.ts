import { renderHook } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest'
import { useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation } from './queries'
import { TestWrapper } from '@/test/test-utils'
import { httpPost, httpPut, httpDelete } from '@/shared/lib/http'

vi.mock('@/shared/lib/http', () => ({
    httpPost: vi.fn(),
    httpPut: vi.fn(),
    httpDelete: vi.fn(),
}))

// Mock schemas to avoid Zod parsing issues in tests and simplify
vi.mock('./schema', () => ({
    EventCreateSchema: {
        parse: (v: unknown) => v 
    },
    EventSchema: {
        parse: (v: unknown) => v
    }
}))

vi.mock('@/app/features/events/api/keys', () => ({
    eventsKeys: {
        list: () => ['events'],
        adminList: () => ['admin-events'],
        detail: (id: unknown) => ['events', id]
    }
}))

describe('Event Queries', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('useCreateEventMutation calls httpPost', async () => {
        const mockData = { id: 1, name: 'Test Event' }
        ;(httpPost as unknown as Mock).mockResolvedValue(mockData)
        
        const { result } = renderHook(() => useCreateEventMutation(), {
            wrapper: TestWrapper
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = { name: 'Test Event' } as any
        const response = await result.current.mutateAsync(payload)

        expect(httpPost).toHaveBeenCalledWith('/admin/event', payload)
        expect(response).toEqual(mockData)
    })

    it('useUpdateEventMutation calls httpPut', async () => {
        const mockData = { id: 1, name: 'Updated Event' }
        ;(httpPut as unknown as Mock).mockResolvedValue(mockData)
        
        const { result } = renderHook(() => useUpdateEventMutation(), {
            wrapper: TestWrapper
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = { eventId: 1, values: { name: 'Updated Event' } as any }
        const response = await result.current.mutateAsync(payload)

        expect(httpPut).toHaveBeenCalledWith('/admin/event/1', payload.values)
        expect(response).toEqual(mockData)
    })

    it('useDeleteEventMutation calls httpDelete', async () => {
        ;(httpDelete as unknown as Mock).mockResolvedValue({})
        
        const { result } = renderHook(() => useDeleteEventMutation(), {
            wrapper: TestWrapper
        })

        await result.current.mutateAsync(1)

        expect(httpDelete).toHaveBeenCalledWith('/admin/event/1')
    })
})
