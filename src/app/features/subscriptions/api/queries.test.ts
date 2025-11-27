import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest'
import { 
    useCreateSubscriptionMutation, 
    useAdminSubscriptions, 
    useUserSubscription, 
    useCancelSubscriptionMutation, 
    useUserSubscriptions 
} from './queries'
import { TestWrapper } from '@/test/test-utils'
import { httpGet, httpPost, httpDelete } from '@/shared/lib/http'

// Mock http
vi.mock('@/shared/lib/http', () => ({
    httpGet: vi.fn(),
    httpPost: vi.fn(),
    httpDelete: vi.fn(),
}))

// Mock AuthContext
const mockUseAuth = vi.fn()
vi.mock('@/app/features/auth/context/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}))

// Mock keys to avoid import issues if needed, but real keys are fine usually
vi.mock('@/app/features/events/api/keys', () => ({
    eventsKeys: {
        list: () => ['events'],
        all: ['events'],
        detail: (id: unknown) => ['events', id]
    }
}))

describe('Subscriptions Queries', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('useCreateSubscriptionMutation calls httpPost', async () => {
        const mockSub = { id: 1, userId: 1, eventId: 1, subscriptionDate: new Date().toISOString() }
        ;(httpPost as unknown as Mock).mockResolvedValue(mockSub)

        const { result } = renderHook(() => useCreateSubscriptionMutation(), {
            wrapper: TestWrapper
        })

        await result.current.mutateAsync({ eventId: 1 })

        expect(httpPost).toHaveBeenCalledWith('/user/subscription', { eventId: 1 })
    })

    it('useAdminSubscriptions calls httpGet', async () => {
        const mockSubs = [{ id: 1, userId: 1, eventId: 1, subscriptionDate: new Date().toISOString() }]
        ;(httpGet as unknown as Mock).mockResolvedValue(mockSubs)

        const { result } = renderHook(() => useAdminSubscriptions(1), {
            wrapper: TestWrapper
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(httpGet).toHaveBeenCalledWith('/admin/event/1/subscriptions', expect.anything())
        expect(result.current.data).toHaveLength(1)
    })

    it('useUserSubscription finds correct subscription', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 100 } })
        const mockSubs = [
            { id: 1, userId: 99, eventId: 1, subscriptionDate: new Date().toISOString() },
            { id: 2, userId: 100, eventId: 1, subscriptionDate: new Date().toISOString() }
        ]
        ;(httpGet as unknown as Mock).mockResolvedValue(mockSubs)

        const { result } = renderHook(() => useUserSubscription(1), {
            wrapper: TestWrapper
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(httpGet).toHaveBeenCalledWith('/user/subscription/1', expect.anything())
        expect(result.current.data?.id).toBe(2)
    })

    it('useUserSubscription returns null if not found', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 100 } })
        const mockSubs = [
            { id: 1, userId: 99, eventId: 1, subscriptionDate: new Date().toISOString() }
        ]
        ;(httpGet as unknown as Mock).mockResolvedValue(mockSubs)

        const { result } = renderHook(() => useUserSubscription(1), {
            wrapper: TestWrapper
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toBeNull()
    })
    
    it('useUserSubscription handles 404 as null', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 100 } })
        ;(httpGet as unknown as Mock).mockRejectedValue(new Error('HTTP 404'))

        const { result } = renderHook(() => useUserSubscription(1), {
            wrapper: TestWrapper
        })

        // Query retries by default, but we disabled retry in TestWrapper.
        // Wait for error or success depending on how queryFn handles it.
        // The queryFn catches 404 and returns null.
        
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toBeNull()
    })

    it('useCancelSubscriptionMutation calls httpDelete', async () => {
        ;(httpDelete as unknown as Mock).mockResolvedValue({})

        const { result } = renderHook(() => useCancelSubscriptionMutation(), {
            wrapper: TestWrapper
        })

        await result.current.mutateAsync(1)

        expect(httpDelete).toHaveBeenCalledWith('/user/subscription/1')
    })

    it('useUserSubscriptions calls httpGet', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 100 } })
        const mockSubs = [{ id: 1, userId: 100, eventId: 1, subscriptionDate: new Date().toISOString() }]
        ;(httpGet as unknown as Mock).mockResolvedValue(mockSubs)

        const { result } = renderHook(() => useUserSubscriptions(), {
            wrapper: TestWrapper
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(httpGet).toHaveBeenCalledWith('/user/subscriptions', expect.anything())
        expect(result.current.data).toHaveLength(1)
    })
})

