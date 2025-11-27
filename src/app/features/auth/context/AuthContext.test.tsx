import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('provides default values', () => {
        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

        expect(result.current.user).toBeNull()
        expect(result.current.token).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
    })

    it('loads user and token from local storage', () => {
        const user = { id: 1, firstName: 'John', lastName: 'Doe', mail: 'john@example.com', role: 'user' }
        localStorage.setItem('topevent:auth_token', 'fake-token')
        localStorage.setItem('topevent:auth_user', JSON.stringify(user))

        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

        expect(result.current.user).toEqual(user)
        expect(result.current.token).toBe('fake-token')
        expect(result.current.isAuthenticated).toBe(true)
    })

    it('handles login', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
        const authResponse = {
            token: 'new-token',
            user: { id: 1, firstName: 'John', lastName: 'Doe', mail: 'john@example.com', role: 'user' }
        }

        act(() => {
            result.current.login(authResponse as any)
        })

        expect(result.current.user).toEqual(authResponse.user)
        expect(result.current.token).toBe('new-token')
        expect(result.current.isAuthenticated).toBe(true)
        expect(localStorage.getItem('topevent:auth_token')).toBe('new-token')
    })

    it('handles logout', () => {
        localStorage.setItem('topevent:auth_token', 'fake-token')
        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

        act(() => {
            result.current.logout()
        })

        expect(result.current.user).toBeNull()
        expect(result.current.token).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(localStorage.getItem('topevent:auth_token')).toBeNull()
    })
    
    it('updates user information', () => {
        const user = { id: 1, firstName: 'John', lastName: 'Doe', mail: 'john@example.com', role: 'user' }
        const updatedUser = { ...user, firstName: 'Jane' }
        
        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
        
        act(() => {
            result.current.login({ token: 'token', user: user as any })
        })
        
        act(() => {
            result.current.updateUser(updatedUser as any)
        })
        
        expect(result.current.user).toEqual(updatedUser)
        expect(JSON.parse(localStorage.getItem('topevent:auth_user')!)).toEqual(updatedUser)
    })
})

