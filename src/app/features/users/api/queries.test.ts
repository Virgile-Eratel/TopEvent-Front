import { renderHook } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest'
import { useUpdateUserMutation } from './queries'
import { TestWrapper } from '@/test/test-utils'
import { httpPatch } from '@/shared/lib/http'

// Mock http
vi.mock('@/shared/lib/http', () => ({
    httpPatch: vi.fn(),
}))

describe('Users Queries', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('useUpdateUserMutation calls httpPatch and returns updated user', async () => {
        const mockUser = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            mail: 'john@example.com',
            password: 'pass',
            role: 'user',
            subscriptions: []
        }
        const mockResponse = { data: mockUser }
        ;(httpPatch as unknown as Mock).mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useUpdateUserMutation(), {
            wrapper: TestWrapper
        })

        const payload = {
            id: 1,
            values: {
                firstName: 'John',
                lastName: 'Doe',
                mail: 'john@example.com'
            }
        }

        const response = await result.current.mutateAsync(payload)

        expect(httpPatch).toHaveBeenCalledWith('/user/1', payload.values)
        expect(response).toEqual(mockUser)
    })
})

