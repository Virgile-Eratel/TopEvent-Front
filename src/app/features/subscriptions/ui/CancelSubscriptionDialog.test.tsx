import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog'
import { renderWithProviders } from '@/test/test-utils'

const mockCancelSubscription = vi.fn()
const mockOnOpenChange = vi.fn()
const mockOnSuccess = vi.fn()

vi.mock('@/app/features/subscriptions/api/queries', () => ({
    useCancelSubscriptionMutation: () => ({
        mutateAsync: mockCancelSubscription,
        isPending: false
    })
}))

const mockSubscription = {
    id: 123,
    eventId: 456,
    userId: 789,
    subscriptionDate: new Date().toISOString()
}

describe('CancelSubscriptionDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders confirmation dialog when open', () => {
        renderWithProviders(
            <CancelSubscriptionDialog 
                subscription={mockSubscription as any} 
                open={true} 
                onOpenChange={mockOnOpenChange} 
            />
        )

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText(/Se désinscrire de l'événement/i)).toBeInTheDocument()
        expect(screen.getByText(/Êtes-vous sûr de vouloir vous désinscrire/i)).toBeInTheDocument()
    })

    it('calls cancel mutation on confirmation', async () => {
        const user = userEvent.setup()
        mockCancelSubscription.mockResolvedValue({})

        renderWithProviders(
            <CancelSubscriptionDialog 
                subscription={mockSubscription as any} 
                open={true} 
                onOpenChange={mockOnOpenChange}
                onSuccess={mockOnSuccess}
            />
        )

        await user.click(screen.getByRole('button', { name: 'Se désinscrire' }))

        expect(mockCancelSubscription).toHaveBeenCalledWith(123)
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
        expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('closes dialog on cancel button click', async () => {
        const user = userEvent.setup()
        
        renderWithProviders(
            <CancelSubscriptionDialog 
                subscription={mockSubscription as any} 
                open={true} 
                onOpenChange={mockOnOpenChange} 
            />
        )

        await user.click(screen.getByRole('button', { name: 'Annuler' }))

        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
        expect(mockCancelSubscription).not.toHaveBeenCalled()
    })
})

