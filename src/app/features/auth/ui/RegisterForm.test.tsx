import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { RegisterForm } from './RegisterForm'
import { renderWithProviders } from '@/test/test-utils'

const mockRegister = vi.fn()
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
    useRegisterMutation: () => ({
        mutateAsync: mockRegister,
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

// Ensure we rely on real schema for validation logic by NOT mocking it completely
// but just ensuring it works. The previous mock broke Zod validation.
// It's better to NOT mock zod schemas if we want integration test of the form validation.
// If we mock the schema module, zodResolver will receive a mock object instead of a schema, hence "expected a Zod schema" error.

// However, we might need to mock dependencies of the schema if any.
// The schema imports UserRoleEnum from users/api/schema.
// Let's only mock the part that might be problematic or just rely on real implementation since it's pure logic.

// If we really need to mock UserRoleEnum, we should do it carefully.
// But looking at the error "expected a Zod schema", it confirms the mock was returning a plain object where a Zod schema was expected.

// Let's try REMOVING the mock for '@/app/features/users/api/schema' and let it use the real one.
// If it fails due to imports, we will fix it.

describe('RegisterForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders register fields', () => {
        renderWithProviders(<RegisterForm />)

        expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument()
        // "Nom" matches both "Nom" label and "Prénom" label (contains nom) if not careful with regex or if multiple elements match.
        // Use exact match or getByLabelText with selector options if needed.
        // Or use testid if ambiguous.
        // The error "Found multiple elements with the text of: /nom/i" means regex is too broad (matches "Prénom" and "Nom").
        expect(screen.getByLabelText(/^nom$/i)).toBeInTheDocument() 
        expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/rôle/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /créer le compte/i })).toBeInTheDocument()
    })

    it('submits form with valid data', async () => {
        const user = userEvent.setup()
        mockRegister.mockResolvedValue({ token: 'fake-token' })

        renderWithProviders(<RegisterForm />)

        await user.type(screen.getByLabelText(/prénom/i), 'John')
        await user.type(screen.getByLabelText(/^nom$/i), 'Doe')
        await user.type(screen.getByLabelText(/adresse email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/mot de passe/i), 'password123')
        
        await user.selectOptions(screen.getByLabelText(/rôle/i), 'user')
        
        await user.click(screen.getByRole('button', { name: /créer le compte/i }))

        expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            mail: 'john@example.com',
            password: 'password123',
            role: 'user'
        }))
        expect(mockAuthenticate).toHaveBeenCalledWith({ token: 'fake-token' })
    })

    it('displays error on register failure', async () => {
        const user = userEvent.setup()
        mockRegister.mockRejectedValue(new Error('Email already exists'))

        renderWithProviders(<RegisterForm />)

        await user.type(screen.getByLabelText(/prénom/i), 'John')
        await user.type(screen.getByLabelText(/^nom$/i), 'Doe')
        await user.type(screen.getByLabelText(/adresse email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/mot de passe/i), 'password123')
        
        await user.click(screen.getByRole('button', { name: /créer le compte/i }))

        expect(await screen.findByText('Email already exists')).toBeInTheDocument()
    })
})
