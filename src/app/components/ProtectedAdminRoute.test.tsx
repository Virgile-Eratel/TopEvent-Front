import { screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ProtectedAdminRoute } from './ProtectedAdminRoute'
import { renderWithProviders } from '@/test/test-utils'
import { Route, Routes } from 'react-router-dom'

const mockUseAuth = vi.fn()

vi.mock('@/app/features/auth/context/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}))

describe('ProtectedAdminRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('redirects to login if not authenticated', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null })
        
        // We need to simulate being on the protected route
        window.history.pushState({}, 'Admin', '/admin')
        
        renderWithProviders(
            <Routes>
                <Route element={<ProtectedAdminRoute />}>
                    <Route path="/admin" element={<div>Admin Content</div>} />
                </Route>
                <Route path="/auth" element={<div>Login Page</div>} />
            </Routes>
        )
        
        expect(screen.getByText('Login Page')).toBeInTheDocument()
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    })

    it('redirects to home if authenticated but not admin', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'user' } })
        window.history.pushState({}, 'Admin', '/admin')
        
        renderWithProviders(
            <Routes>
                <Route element={<ProtectedAdminRoute />}>
                    <Route path="/admin" element={<div>Admin Content</div>} />
                </Route>
                <Route path="/" element={<div>Home Page</div>} />
            </Routes>
        )
        
        expect(screen.getByText('Home Page')).toBeInTheDocument()
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    })

    it('renders outlet if authenticated as admin', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'admin' } })
        window.history.pushState({}, 'Admin', '/admin')
        
        renderWithProviders(
            <Routes>
                <Route element={<ProtectedAdminRoute />}>
                    <Route path="/admin" element={<div>Admin Content</div>} />
                </Route>
            </Routes>
        )
        
        expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })
})
