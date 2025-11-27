import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { UserUpdateDialog } from './UserUpdateDialog'
import { renderWithProviders } from '@/test/test-utils'

const mockUpdateAccount = vi.fn()
const mockUpdateUser = vi.fn()
const mockOnOpenChange = vi.fn()

vi.mock('@/app/features/users/api/queries', () => ({
    useUpdateUserMutation: () => ({
        mutateAsync: mockUpdateAccount,
        isPending: false
    })
}))

const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    mail: 'john@example.com',
    role: 'user'
}

vi.mock('@/app/features/auth/context/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        updateUser: mockUpdateUser
    })
}))

describe('UserUpdateDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders nothing when closed', () => {
        renderWithProviders(
            <UserUpdateDialog open={false} onOpenChange={mockOnOpenChange} />
        )
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders dialog with user data when open', () => {
        renderWithProviders(
            <UserUpdateDialog open={true} onOpenChange={mockOnOpenChange} />
        )

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Modifier mon profil')).toBeInTheDocument()
        
        expect(screen.getByLabelText('Prénom')).toHaveValue('John')
        expect(screen.getByLabelText('Nom')).toHaveValue('Doe')
        expect(screen.getByLabelText('Email')).toHaveValue('john@example.com')
    })

    it('submits form with updated values', async () => {
        const user = userEvent.setup()
        mockUpdateAccount.mockResolvedValue({ ...mockUser, firstName: 'Jane' })

        renderWithProviders(
            <UserUpdateDialog open={true} onOpenChange={mockOnOpenChange} />
        )

        const firstNameInput = screen.getByLabelText('Prénom')
        await user.clear(firstNameInput)
        await user.type(firstNameInput, 'Jane')
        
        await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

        expect(mockUpdateAccount).toHaveBeenCalledWith({
            id: 1,
            values: expect.objectContaining({
                firstName: 'Jane',
                lastName: 'Doe',
                mail: 'john@example.com'
            })
        })
        expect(mockUpdateUser).toHaveBeenCalled()
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('handles error during update', async () => {
        const user = userEvent.setup()
        mockUpdateAccount.mockRejectedValue(new Error('Update failed'))

        renderWithProviders(
            <UserUpdateDialog open={true} onOpenChange={mockOnOpenChange} />
        )

        await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

        expect(mockUpdateAccount).toHaveBeenCalled()
        // Toast would show error, we could mock toast to verify but simplistic check is that modal didn't close
        expect(mockOnOpenChange).not.toHaveBeenCalledWith(false)
    })
})

