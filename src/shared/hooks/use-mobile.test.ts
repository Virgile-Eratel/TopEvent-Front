import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useIsMobile } from './use-mobile'

describe('useIsMobile', () => {
    beforeEach(() => {
        // Default to desktop
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).innerWidth = 1024
    })

    it('returns false by default (desktop)', () => {
        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(false)
    })

    it('returns true if window width is small (mobile)', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).innerWidth = 500
        
        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(true)
    })

    it('updates when media query changes', () => {
        let changeHandler: (() => void) | null = null
        
        // Override matchMedia for this test to capture the listener
        const originalMatchMedia = window.matchMedia
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            addEventListener: (_event: string, handler: () => void) => {
                changeHandler = handler
            },
            removeEventListener: vi.fn(),
            // Add other required properties to satisfy type if needed, or use partial mock
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))

        const { result } = renderHook(() => useIsMobile())
        expect(result.current).toBe(false)

        // Simulate resize
        act(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).innerWidth = 500
            if (changeHandler) {
                changeHandler()
            }
        })

        expect(result.current).toBe(true)
        
        // Restore
        window.matchMedia = originalMatchMedia
    })
})
