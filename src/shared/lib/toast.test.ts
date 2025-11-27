import { describe, it, expect, beforeEach, vi } from 'vitest'
import { queueToastAfterRedirect, consumeQueuedToast } from './toast'

describe('Toast Utils', () => {
    beforeEach(() => {
        sessionStorage.clear()
        vi.clearAllMocks()
    })

    it('queueToastAfterRedirect saves toast to sessionStorage', () => {
        const toast = { message: 'Test Message', type: 'success' as const }
        queueToastAfterRedirect(toast)
        
        const stored = sessionStorage.getItem('app:post-redirect-toast')
        expect(stored).toBeTruthy()
        expect(JSON.parse(stored!)).toEqual(toast)
    })

    it('consumeQueuedToast returns null if nothing queued', () => {
        expect(consumeQueuedToast()).toBeNull()
    })

    it('consumeQueuedToast returns and clears queued toast', () => {
        const toast = { message: 'Test Message', type: 'success' as const }
        sessionStorage.setItem('app:post-redirect-toast', JSON.stringify(toast))
        
        const result = consumeQueuedToast()
        expect(result).toEqual(toast)
        expect(sessionStorage.getItem('app:post-redirect-toast')).toBeNull()
    })

    it('consumeQueuedToast handles invalid JSON', () => {
        sessionStorage.setItem('app:post-redirect-toast', 'invalid-json')
        expect(consumeQueuedToast()).toBeNull()
    })

    it('handles sessionStorage errors gracefully', () => {
        // Mock setItem to throw
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        setItem.mockImplementation(() => { throw new Error('QuotaExceeded') })
        
        const toast = { message: 'Test Message', type: 'success' as const }
        expect(() => queueToastAfterRedirect(toast)).not.toThrow()
        
        setItem.mockRestore()
    })
})

