import { vi, describe, it, expect, beforeEach } from 'vitest'
import { httpGet, httpPost, httpPut, httpDelete, getAuthToken, setAuthToken, clearAuthToken } from './http'

// Mock global fetch
const globalFetch = vi.fn()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).fetch = globalFetch

describe('Http Lib', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    it('getAuthToken returns null if not set', () => {
        expect(getAuthToken()).toBeNull()
    })

    it('getAuthToken returns token if set', () => {
        setAuthToken('test-token')
        expect(getAuthToken()).toBe('test-token')
    })

    it('clearAuthToken removes token', () => {
        setAuthToken('test-token')
        clearAuthToken()
        expect(getAuthToken()).toBeNull()
    })

    it('httpGet performs fetch with correct headers', async () => {
        const mockResponse = { data: 'test' }
        globalFetch.mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(mockResponse)),
            headers: new Headers()
        })

        setAuthToken('token')
        const result = await httpGet('/test')

        expect(globalFetch).toHaveBeenCalledWith(
            expect.stringContaining('/test'),
            expect.objectContaining({
                headers: expect.any(Headers)
            })
        )
        expect(result).toEqual(mockResponse)
    })

    it('httpPost performs fetch with POST method', async () => {
        const mockResponse = { id: 1 }
        globalFetch.mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(mockResponse))
        })

        await httpPost('/test', { name: 'test' })

        expect(globalFetch).toHaveBeenCalledWith(
            expect.stringContaining('/test'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ name: 'test' })
            })
        )
    })
    
    it('httpPut performs fetch with PUT method', async () => {
        const mockResponse = { id: 1 }
        globalFetch.mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(mockResponse))
        })

        await httpPut('/test', { name: 'test' })

        expect(globalFetch).toHaveBeenCalledWith(
            expect.stringContaining('/test'),
            expect.objectContaining({
                method: 'PUT'
            })
        )
    })

    it('httpDelete performs fetch with DELETE method', async () => {
        globalFetch.mockResolvedValue({
            ok: true,
            text: () => Promise.resolve('{}')
        })

        await httpDelete('/test')

        expect(globalFetch).toHaveBeenCalledWith(
            expect.stringContaining('/test'),
            expect.objectContaining({
                method: 'DELETE'
            })
        )
    })

    it('handles 401 Unauthorized', async () => {
        // Mock window location
        const originalLocation = window.location
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).location
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.location = { ...originalLocation, href: '', pathname: '/' } as any
        
        setAuthToken('expired')
        
        globalFetch.mockResolvedValue({
            ok: false,
            status: 401,
            text: () => Promise.resolve(JSON.stringify({ message: 'Unauthorized' }))
        })

        await expect(httpGet('/test')).rejects.toThrow('Unauthorized')
        
        expect(localStorage.getItem('topevent:auth_token')).toBeNull()
        expect(window.location.href).toBe('/auth')
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.location = originalLocation as any
    })
    
    it('handles generic error', async () => {
        globalFetch.mockResolvedValue({
            ok: false,
            status: 500,
            text: () => Promise.resolve('Server Error')
        })
        
        await expect(httpGet('/test')).rejects.toThrow('HTTP 500')
    })
})
