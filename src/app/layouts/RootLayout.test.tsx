import { screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import RootLayout from './RootLayout'
import { renderWithProviders } from '@/test/test-utils'
import { consumeQueuedToast } from '@/shared/lib/toast'

// Mock toast lib
vi.mock('@/shared/lib/toast', () => ({
    consumeQueuedToast: vi.fn()
}))

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        loading: vi.fn()
    }
}))

// Mock AuthContext
const mockLogout = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('@/app/features/auth/context/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}))

// Mock UserUpdateDialog
vi.mock('@/app/features/users/ui/UserUpdateDialog', () => ({
    UserUpdateDialog: ({ open }: { open: boolean }) => open ? <div data-testid="user-update-dialog">User Update Dialog</div> : null
}))

describe('RootLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Default auth state
        mockUseAuth.mockReturnValue({ 
            isAuthenticated: false, 
            user: null, 
            logout: mockLogout 
        })
    })

    it('renders sidebar and navigation', () => {
        renderWithProviders(<RootLayout />)
        
        expect(screen.getByText('TopEvent')).toBeInTheDocument()
        expect(screen.getByText('Accueil')).toBeInTheDocument()
        expect(screen.getByText('Événements')).toBeInTheDocument()
        expect(screen.getByText('Inscriptions')).toBeInTheDocument()
    })

    it('shows login button when not authenticated', () => {
        renderWithProviders(<RootLayout />)
        
        expect(screen.getByText('Se connecter')).toBeInTheDocument()
    })

    it('shows user info and logout button when authenticated as user', () => {
        mockUseAuth.mockReturnValue({ 
            isAuthenticated: true, 
            user: { firstName: 'John', lastName: 'Doe', mail: 'john@example.com', role: 'user' },
            logout: mockLogout 
        })

        renderWithProviders(<RootLayout />)
        
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('john@example.com')).toBeInTheDocument()
        expect(screen.getByText('Rôle : Utilisateur')).toBeInTheDocument()
        expect(screen.getByText('Se déconnecter')).toBeInTheDocument()
        
        // Admin links should NOT be present
        expect(screen.queryByText('Créer un événement')).not.toBeInTheDocument()
    })

    it('shows admin links when authenticated as admin', () => {
        mockUseAuth.mockReturnValue({ 
            isAuthenticated: true, 
            user: { firstName: 'Admin', lastName: 'User', role: 'admin' },
            logout: mockLogout 
        })

        renderWithProviders(<RootLayout />)
        
        expect(screen.getByText('Rôle : Organisateur')).toBeInTheDocument()
        expect(screen.getByText('Créer un événement')).toBeInTheDocument()
        expect(screen.getByText('Gestion de mes événements')).toBeInTheDocument()
    })

    it('calls logout on button click', () => {
        mockUseAuth.mockReturnValue({ 
            isAuthenticated: true, 
            user: { role: 'user' },
            logout: mockLogout 
        })

        renderWithProviders(<RootLayout />)
        
        fireEvent.click(screen.getByText('Se déconnecter'))
        expect(mockLogout).toHaveBeenCalled()
    })

    it('opens profile dialog on settings click', () => {
        mockUseAuth.mockReturnValue({ 
            isAuthenticated: true, 
            user: { role: 'user' },
            logout: mockLogout 
        })

        renderWithProviders(<RootLayout />)
        
        expect(screen.queryByTestId('user-update-dialog')).not.toBeInTheDocument()
        
        fireEvent.click(screen.getByLabelText('Paramètres profil'))
        
        expect(screen.getByTestId('user-update-dialog')).toBeInTheDocument()
    })

    it('consumes queued toast on mount', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (consumeQueuedToast as any).mockReturnValue({ message: 'Success!', type: 'success' })
        
        renderWithProviders(<RootLayout />)
        
        expect(consumeQueuedToast).toHaveBeenCalled()
    })
})

