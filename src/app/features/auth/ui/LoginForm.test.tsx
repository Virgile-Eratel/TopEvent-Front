import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { LoginForm } from './LoginForm'
import { renderWithProviders } from '@/test/test-utils'

const mockLogin = vi.fn()
const mockAuthenticate = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

vi.mock('../api/queries', () => ({
    useLoginMutation: () => ({
        mutateAsync: mockLogin,
        isPending: false
    })
}))

vi.mock('@/app/features/auth/context/AuthContext', () => ({
    useAuth: () => ({
        login: mockAuthenticate
    })
}))

vi.mock('@/shared/lib/toast', () => ({
    queueToastAfterRedirect: vi.fn()
}))

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders login fields', () => {
        renderWithProviders(<LoginForm />)

        expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
    })

    it('submits form with valid credentials', async () => {
        const user = userEvent.setup()
        mockLogin.mockResolvedValue({ token: 'fake-token' })

        renderWithProviders(<LoginForm />)

        await user.type(screen.getByLabelText(/adresse email/i), 'test@example.com')
        await user.type(screen.getByLabelText(/mot de passe/i), 'password123')
        
        await user.click(screen.getByRole('button', { name: /se connecter/i }))

        expect(mockLogin).toHaveBeenCalledWith({
            mail: 'test@example.com',
            password: 'password123'
        })
        expect(mockAuthenticate).toHaveBeenCalledWith({ token: 'fake-token' })
    })

    it('displays error on login failure', async () => {
        const user = userEvent.setup()
        mockLogin.mockRejectedValue(new Error('Invalid credentials'))

        renderWithProviders(<LoginForm />)

        await user.type(screen.getByLabelText(/adresse email/i), 'test@example.com')
        await user.type(screen.getByLabelText(/mot de passe/i), 'password123')
        
        await user.click(screen.getByRole('button', { name: /se connecter/i }))

        expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
    })
})

